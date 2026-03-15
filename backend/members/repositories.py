from __future__ import annotations

from collections.abc import Iterable

from members.models import Member, ProjectProposal, TeamAssignment


class MemberRepository:
    @staticmethod
    def list_members() -> list[Member]:
        return list(Member.objects.all())

    @staticmethod
    def upsert_member(
        *,
        github_id: int,
        name: str,
        bio: str,
        avatar_url: str,
        top_skills: list[str],
        impact_score: float,
    ) -> Member:
        member, _ = Member.objects.update_or_create(
            github_id=github_id,
            defaults={
                "name": name,
                "bio": bio,
                "avatar_url": avatar_url,
                "top_skills": top_skills,
                "impact_score": impact_score,
            },
        )
        return member


class ProjectProposalRepository:
    @staticmethod
    def list_proposals() -> list[ProjectProposal]:
        return list(ProjectProposal.objects.prefetch_related("team_assignments__member"))

    @staticmethod
    def upsert_proposal(*, title: str, description: str, ai_reasoning: str) -> ProjectProposal:
        proposal, _ = ProjectProposal.objects.update_or_create(
            title=title,
            defaults={
                "description": description,
                "ai_reasoning": ai_reasoning,
            },
        )
        return proposal

    @staticmethod
    def get_by_id(project_id: int) -> ProjectProposal:
        return ProjectProposal.objects.get(id=project_id)


class TeamAssignmentRepository:
    @staticmethod
    def ensure_assignments(
        *,
        members: Iterable[Member],
        project: ProjectProposal,
        role: str,
    ) -> None:
        for member in members:
            TeamAssignment.objects.get_or_create(
                member=member,
                project_proposal=project,
                defaults={"role": role},
            )
