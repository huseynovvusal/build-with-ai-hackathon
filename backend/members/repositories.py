from __future__ import annotations

from typing import Iterable

from django.db.models import QuerySet

from members.models import Member, ProjectProposal, TeamAssignment, Project, ProjectMember


class MemberRepository:
    @staticmethod
    def list_members() -> QuerySet[Member]:
        return Member.objects.all()

    @staticmethod
    def upsert_member(
        *,
        github_id: int,
        name: str,
        bio: str,
        avatar_url: str,
        company: str = "",
        organization_login: str = "",
        role: str = "",
        roles: list[str] | None = None,
        top_skills: list[str],
        impact_score: float,
    ) -> Member:
        if roles is None:
            roles = [role] if role else []

        member, _ = Member.objects.update_or_create(
            github_id=github_id,
            defaults={
                "name": name,
                "bio": bio,
                "avatar_url": avatar_url,
                "company": company,
                "organization_login": organization_login,
                "role": role,
                "roles": roles,
                "top_skills": top_skills,
                "impact_score": impact_score,
            },
        )
        return member


class ProjectProposalRepository:
    @staticmethod
    def list_proposals() -> QuerySet[ProjectProposal]:
        return ProjectProposal.objects.prefetch_related("team_assignments__member")

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


class ProjectRepository:
    @staticmethod
    def list_projects() -> QuerySet[Project]:
        return Project.objects.prefetch_related("project_members__member", "creator")

    @staticmethod
    def create_project(
        *,
        title: str,
        description: str,
        required_skills: list[str],
        creator: Member | None = None,
    ) -> Project:
        return Project.objects.create(
            title=title,
            description=description,
            required_skills=required_skills,
            creator=creator,
        )
