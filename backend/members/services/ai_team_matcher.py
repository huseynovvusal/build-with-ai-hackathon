from __future__ import annotations

import json
import os
from typing import Any

from members.models import Member, Project, ProjectMember


GEMINI_PROMPT_TEMPLATE = """
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
    def match_team(project: Project) -> list[dict[str, Any]]:
        """
        Call Gemini API to suggest team members for a project.
        Returns list of { member_id, role, reasoning }.
        Falls back to top-3 by impact_score if AI fails or key is missing.
        """
        api_key = os.getenv("GEMINI_API_KEY", "")
        members = list(Member.objects.all())

        if not members:
            return []

        if not api_key:
            return AITeamMatcherService._fallback_match(project, members)

        members_list = "\n".join(
            f"- ID {m.id}: {m.name} | Skills: {', '.join(m.top_skills)} | "
            f"Impact Score: {m.impact_score} | Bio: {m.bio[:120]}"
            for m in members
        )

        prompt = GEMINI_PROMPT_TEMPLATE.format(
            title=project.title,
            description=project.description,
            required_skills=", ".join(project.required_skills),
            members_list=members_list,
        )

        try:
            from google import genai  # type: ignore
            client = genai.Client(api_key=api_key)
            response = client.models.generate_content(
                model="gemini-2.0-flash",
                contents=prompt,
            )
            text = response.text.strip()
            # Strip possible markdown code fences
            if text.startswith("```"):
                text = text.split("```")[1]
                if text.startswith("json"):
                    text = text[4:]
                text = text.strip()
            suggestions = json.loads(text)
            return suggestions
        except Exception as exc:
            print(f"[AITeamMatcherService] Gemini call failed: {exc}. Using fallback.")
            return AITeamMatcherService._fallback_match(project, members)

    @staticmethod
    def _fallback_match(project: Project, members: list[Member]) -> list[dict]:
        """Simple skill-based fallback: sort by matching skills + impact score."""
        required = set(s.lower() for s in project.required_skills)

        def score(m: Member) -> float:
            skill_match = len(required & set(s.lower() for s in m.top_skills))
            return skill_match * 20 + m.impact_score

        ranked = sorted(members, key=score, reverse=True)[:3]
        return [
            {
                "member_id": m.id,
                "role": "Core Contributor",
                "reasoning": f"{m.name} has {m.impact_score} impact score with relevant skills.",
            }
            for m in ranked
        ]

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
