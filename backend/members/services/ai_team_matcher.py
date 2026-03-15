from __future__ import annotations

import json
import os
from typing import Any

from members.models import Member, Project, ProjectMember
from members.services.ai_client import deepseek_chat


AI_TEAM_PROMPT_TEMPLATE = """
You are an expert engineering team builder. Given a project and a pool of available developers,
suggest the best 3-5 team members and explain why each person is a good fit.

PROJECT:
Title: {title}
Description: {description}
Required Skills: {required_skills}

AVAILABLE MEMBERS:
{members_list}

Return a valid JSON array (no markdown, no explanation outside the array) in this exact format:
[
  {{
    "member_id": <integer id>,
    "role": "<suggested role e.g. 'Tech Lead', 'Backend Engineer'>",
    "reasoning": "<1-2 sentence explanation of why this member fits>"
  }}
]

Select 3 to 5 members. Only include members whose skills are relevant to the project.
"""


class AITeamMatcherService:
    @staticmethod
    def _log_ai_raw(tag: str, text: str) -> None:
        preview = (text or "")[:12000]
        print(f"[DEEPSEEK_RAW::{tag}] {preview}")

    @staticmethod
    def match_team(project: Project) -> list[dict[str, Any]]:
        """
        Call DeepSeek API to suggest team members for a project.
        Returns list of { member_id, role, reasoning }.
        AI-only mode: requires DeepSeek key and valid AI response.
        """
        api_key = os.getenv("DEEPSEEK_API_KEY", "")
        members = list(Member.objects.all())

        if not members:
            return []

        if not api_key:
            raise ValueError("DEEPSEEK_API_KEY is required for AI-only team matching.")

        members_list = "\n".join(
            f"- ID {m.id}: {m.name} | Skills: {', '.join(m.top_skills)} | "
            f"Impact Score: {m.impact_score} | Bio: {m.bio[:120]}"
            for m in members
        )

        prompt = AI_TEAM_PROMPT_TEMPLATE.format(
            title=project.title,
            description=project.description,
            required_skills=", ".join(project.required_skills),
            members_list=members_list,
        )

        try:
            text = deepseek_chat(prompt, temperature=0.2)
            AITeamMatcherService._log_ai_raw("TEAM_MATCH", text)
            # Strip possible markdown code fences
            if text.startswith("```"):
                text = text.split("```")[1]
                if text.startswith("json"):
                    text = text[4:]
                text = text.strip()

            try:
                suggestions = json.loads(text)
            except Exception:
                first = text.find("[")
                last = text.rfind("]")
                if first == -1 or last == -1 or last <= first:
                    return []
                suggestions = json.loads(text[first:last + 1])

            if not isinstance(suggestions, list):
                return []
            return suggestions
        except Exception as exc:
            raise ValueError(f"DeepSeek team matching failed: {exc}")

    @staticmethod
    def apply_team(project: Project, suggestions: list[dict[str, Any]]) -> None:
        """Persist team assignments to the database."""
        member_map = {m.id: m for m in Member.objects.all()}
        for suggestion in suggestions:
            mid = suggestion.get("member_id")
            if mid and mid in member_map:
                ProjectMember.objects.get_or_create(
                    member=member_map[mid],
                    project=project,
                    defaults={
                        "role": suggestion.get("role", "Contributor"),
                        "ai_reasoning": suggestion.get("reasoning", ""),
                    },
                )
