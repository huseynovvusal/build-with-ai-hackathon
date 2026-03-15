from __future__ import annotations

import json
import os
import random
from collections import Counter
from django.db import transaction

from members.models import ProjectProposal
from members.repositories import (
    MemberRepository,
    ProjectProposalRepository,
    TeamAssignmentRepository,
)


class ProjectGeneratorService:
    @staticmethod
    @transaction.atomic
    def generate_proposals(refresh: bool = False) -> list[ProjectProposal]:
        members = list(MemberRepository.list_members())
        if not members:
            return []

        if refresh:
            ProjectProposal.objects.all().delete()

        proposal_payloads = ProjectGeneratorService._generate_payloads_with_ai(members)
        if not proposal_payloads:
            proposal_payloads = ProjectGeneratorService._fallback_payloads(members)

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

        team_candidates = members[:3]
        for proposal in created_proposals:
            TeamAssignmentRepository.ensure_assignments(
                members=team_candidates,
                project=proposal,
                role="Core Contributor",
            )

        return created_proposals

    @staticmethod
    def _generate_payloads_with_ai(members: list) -> list[dict]:
        api_key = os.getenv("GEMINI_API_KEY", "")
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
            from google import genai  # type: ignore

            client = genai.Client(api_key=api_key)
            response = client.models.generate_content(
                model="gemini-2.0-flash",
                contents=prompt,
            )
            text = (response.text or "").strip()
            if text.startswith("```"):
                text = text.split("```")[1]
                if text.startswith("json"):
                    text = text[4:]
                text = text.strip()

            data = json.loads(text)
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
                return cleaned
        except Exception as exc:
            print(f"[ProjectGeneratorService] AI generation failed: {exc}")

        return []

    @staticmethod
    def _fallback_payloads(members: list) -> list[dict]:
        skill_pool: list[str] = []
        for m in members:
            skill_pool.extend(m.top_skills)

        top_skills = [skill for skill, _ in Counter(skill_pool).most_common(6)]
        if not top_skills:
            top_skills = ["Engineering", "Automation", "AI"]

        focus_a, focus_b = random.sample(top_skills, 2) if len(top_skills) >= 2 else (top_skills[0], top_skills[0])
        dna = top_skills[:6]

        return [
            {
                "title": f"{focus_a} Contribution Copilot",
                "description": f"Automate contribution workflows and insights for {focus_a}-heavy repositories.",
                "ai_reasoning": "Generated from current contributor skill concentration and activity metrics.",
                "initiatives": [
                    "Build contributor activity ingestion pipeline from GitHub APIs.",
                    "Create role-aware dashboards for maintainers and contributors.",
                    "Automate contribution quality signals and weekly digest generation.",
                ],
                "technical_tips": [
                    "Use incremental sync with idempotent upserts for API data.",
                    "Store normalized events so scoring logic can evolve without re-fetching.",
                    "Add caching/rate-limit handling to avoid GitHub API throttling.",
                ],
                "overall_strategy": [
                    "Start with one pilot repo and validate insight usefulness.",
                    "Align score weights with maintainer feedback each sprint.",
                    "Scale from dashboards to workflow automation after adoption.",
                ],
                "required_dna": dna,
            },
            {
                "title": f"{focus_b} Delivery Intelligence",
                "description": f"Use contribution data to predict blockers and improve {focus_b} project throughput.",
                "ai_reasoning": "Built to improve reliability using observed PR, review, and issue trends.",
                "initiatives": [
                    "Model PR cycle times and reviewer bottlenecks by repository.",
                    "Detect issue clusters likely to delay milestone completion.",
                    "Auto-suggest reviewer assignments from skill and availability signals.",
                ],
                "technical_tips": [
                    "Track lead/cycle time metrics with clear event timestamps.",
                    "Use a feature store for contribution and skill vectors.",
                    "Add confidence scores to predictions to avoid over-automation.",
                ],
                "overall_strategy": [
                    "Focus first on transparency, then predictive recommendations.",
                    "Run A/B checks with team leads before enforcing workflow changes.",
                    "Measure outcomes by reduced PR latency and improved merge rate.",
                ],
                "required_dna": dna,
            },
            {
                "title": "Org Collaboration Graph",
                "description": "Visualize cross-repo collaboration and recommend high-impact team pairings.",
                "ai_reasoning": "Targets org-wide productivity by surfacing hidden collaboration opportunities.",
                "initiatives": [
                    "Build graph model from commits, PR reviews, and issue collaboration.",
                    "Recommend cross-team pairings for high-priority initiatives.",
                    "Highlight underutilized experts by skill and domain.",
                ],
                "technical_tips": [
                    "Represent collaboration as weighted bipartite graphs.",
                    "Use community detection to find natural working groups.",
                    "Cache graph snapshots to support fast dashboard rendering.",
                ],
                "overall_strategy": [
                    "Pilot with one organization program and gather manager feedback.",
                    "Iteratively tune recommendation precision using acceptance rates.",
                    "Integrate pairing insights into planning and staffing rituals.",
                ],
                "required_dna": dna,
            },
        ]
