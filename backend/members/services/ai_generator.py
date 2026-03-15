from __future__ import annotations

import json
import os
from typing import Any

from django.db import transaction

from members.models import Member, ProjectProposal
from members.repositories import (
    MemberRepository,
    ProjectProposalRepository,
    TeamAssignmentRepository,
)
from members.services.ai_client import deepseek_chat


class ProjectGeneratorService:
    @staticmethod
    def _log_ai_raw(tag: str, text: str) -> None:
        preview = (text or "")[:12000]
        print(f"[DEEPSEEK_RAW::{tag}] {preview}")

    @staticmethod
    @transaction.atomic
    def generate_proposals(refresh: bool = False) -> list[ProjectProposal]:
        members = list(MemberRepository.list_members())
        if not members:
            return []

        api_key = os.getenv("DEEPSEEK_API_KEY", "")
        if not api_key:
            raise ValueError("DEEPSEEK_API_KEY is required for AI-only proposal generation.")

        if refresh:
            ProjectProposal.objects.all().delete()

        proposal_payloads = ProjectGeneratorService._generate_payloads_with_ai(members)
        if not proposal_payloads:
            raise ValueError("DeepSeek did not return valid project ideas.")

        created_proposals: list[ProjectProposal] = []
        for payload in proposal_payloads:
            proposal = ProjectProposalRepository.upsert_proposal(
                title=payload["title"],
                description=payload["description"],
                ai_reasoning=payload["ai_reasoning"],
                initiatives=payload.get("initiatives") or [],
                technical_tips=payload.get("technical_tips") or [],
                overall_strategy=payload.get("overall_strategy") or [],
                required_dna=payload.get("required_dna") or [],
            )
            created_proposals.append(proposal)

        for proposal in created_proposals:
            ai_team = ProjectGeneratorService._generate_team_with_ai(
                members=members,
                proposal=proposal,
            )

            if not ai_team:
                raise ValueError(f"DeepSeek did not return valid team assignments for '{proposal.title}'.")

            grouped: dict[str, list[Member]] = {}
            for item in ai_team:
                role = item["role"]
                grouped.setdefault(role, []).append(item["member"])

            for role, role_members in grouped.items():
                TeamAssignmentRepository.ensure_assignments(
                    members=role_members,
                    project=proposal,
                    role=role,
                )

        return created_proposals

    @staticmethod
    def _generate_payloads_with_ai(members: list) -> list[dict]:
        api_key = os.getenv("DEEPSEEK_API_KEY", "")
        if not api_key:
            return []

        members_text = "\n".join(
            f"- {m.name}: skills={', '.join(m.top_skills[:5])}, impact={m.impact_score}"
            for m in members[:50]
        )

        prompt = f"""
    Generate 3 software project ideas for this organization with detailed planning.
    Use member skills and impact data to keep ideas relevant and actionable.

MEMBERS:
{members_text}

Return ONLY valid JSON array with objects in this exact schema:
[
    {{
        "title": "...",
        "description": "...",
        "ai_reasoning": "...",
        "initiatives": ["..."] ,
        "technical_tips": ["..."],
        "overall_strategy": ["..."],
        "required_dna": ["..."]
    }}
]
""".strip()

        try:
            for _ in range(2):
                text = deepseek_chat(prompt, temperature=0.35)
                ProjectGeneratorService._log_ai_raw("PROPOSALS", text)
                data = ProjectGeneratorService._safe_parse_json_array(text)
                if isinstance(data, list):
                    cleaned: list[dict] = []
                    for item in data[:3]:
                        if not isinstance(item, dict):
                            continue
                        title = str(item.get("title", "")).strip()
                        description = str(item.get("description", "")).strip()
                        reasoning = str(item.get("ai_reasoning", "")).strip()
                        initiatives = [str(x).strip() for x in (item.get("initiatives") or []) if str(x).strip()]
                        technical_tips = [str(x).strip() for x in (item.get("technical_tips") or []) if str(x).strip()]
                        overall_strategy = [str(x).strip() for x in (item.get("overall_strategy") or []) if str(x).strip()]
                        required_dna = [str(x).strip() for x in (item.get("required_dna") or []) if str(x).strip()]
                        if title and description and reasoning:
                            cleaned.append(
                                {
                                    "title": title,
                                    "description": description,
                                    "ai_reasoning": reasoning,
                                    "initiatives": initiatives[:6],
                                    "technical_tips": technical_tips[:6],
                                    "overall_strategy": overall_strategy[:6],
                                    "required_dna": required_dna[:8],
                                }
                            )
                    if cleaned:
                        return cleaned
        except Exception as exc:
            print(f"[ProjectGeneratorService] DeepSeek generation failed: {exc}")

        return []

    @staticmethod
    def _safe_parse_json_array(text: str) -> list[Any] | None:
        raw = text.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
            raw = raw.strip()

        try:
            parsed = json.loads(raw)
            if isinstance(parsed, list):
                return parsed
        except Exception:
            pass

        first = raw.find("[")
        last = raw.rfind("]")
        if first != -1 and last != -1 and last > first:
            snippet = raw[first:last + 1]
            try:
                parsed = json.loads(snippet)
                if isinstance(parsed, list):
                    return parsed
            except Exception:
                return None

        return None

    @staticmethod
    def _generate_team_with_ai(
        *,
        members: list[Member],
        proposal: ProjectProposal,
    ) -> list[dict[str, Any]]:
        members_list = "\n".join(
            f"- ID {m.id}: {m.name} | Skills: {', '.join(m.top_skills)} | Impact: {m.impact_score}"
            for m in members
        )

        prompt = f"""
You are assigning the best team for a project proposal.

PROJECT:
Title: {proposal.title}
Description: {proposal.description}
AI Reasoning: {proposal.ai_reasoning}
Required DNA: {', '.join(proposal.required_dna or [])}

MEMBERS:
{members_list}

Return ONLY valid JSON array with this schema:
[
  {{"member_id": <int>, "role": "<role>"}}
]

Rules:
- Select exactly 3 to 5 members
- Roles must be specific and relevant
- Use skills and impact data only
""".strip()

        try:
            text = deepseek_chat(prompt, temperature=0.2)
            ProjectGeneratorService._log_ai_raw("TEAM_MATCH", text)
            if text.startswith("```"):
                text = text.split("```")[1]
                if text.startswith("json"):
                    text = text[4:]
                text = text.strip()

            raw = json.loads(text)
            if not isinstance(raw, list):
                return []

            member_map = {m.id: m for m in members}
            parsed: list[dict[str, Any]] = []
            seen: set[int] = set()
            for item in raw:
                if not isinstance(item, dict):
                    continue
                mid = item.get("member_id")
                role = str(item.get("role", "")).strip() or "Contributor"
                if not isinstance(mid, int):
                    continue
                if mid in seen or mid not in member_map:
                    continue
                seen.add(mid)
                parsed.append({"member": member_map[mid], "role": role})

            return parsed[:5]
        except Exception as exc:
            print(f"[ProjectGeneratorService] DeepSeek team generation failed for {proposal.title}: {exc}")
            return []
