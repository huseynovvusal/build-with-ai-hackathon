from __future__ import annotations

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
    def generate_proposals() -> list[ProjectProposal]:
        members = MemberRepository.list_members()
        if not members:
            return []

        proposal_payloads = [
            {
                "title": "Communa Skill Radar",
                "description": "A live dashboard that maps organization talent clusters and growth trends.",
                "ai_reasoning": (
                    "Team composition shows strong backend + data depth. "
                    "A skill radar project creates immediate value by visualizing hidden expertise."
                ),
            },
            {
                "title": "AI Mentor Match",
                "description": "Recommend mentor-mentee pairings based on contribution history and skill goals.",
                "ai_reasoning": (
                    "Members demonstrate complementary strengths across frontend, backend, and DevOps. "
                    "Pairing them through mentorship can accelerate onboarding and upskilling."
                ),
            },
            {
                "title": "Hackathon Auto-Team Builder",
                "description": "Generate balanced hackathon teams from skill vectors and preferred domains.",
                "ai_reasoning": (
                    "Member skill vectors indicate broad coverage with enough overlap for resilience. "
                    "Automated team assembly can maximize project delivery speed and quality."
                ),
            },
        ]

        created_proposals: list[ProjectProposal] = []
        for payload in proposal_payloads:
            proposal = ProjectProposalRepository.upsert_proposal(
                title=payload["title"],
                description=payload["description"],
                ai_reasoning=payload["ai_reasoning"],
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
