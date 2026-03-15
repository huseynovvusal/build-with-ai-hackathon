import time
from typing import Any

from django.db import transaction

from members.models import Member
from members.repositories import MemberRepository


class GithubSyncService:
    _sync_logs: list[str] = []

    MOCK_MEMBERS: list[dict[str, Any]] = [
        {
            "github_id": 1001,
            "name": "Vusal",
            "bio": "Backend-focused builder with systems design mindset.",
            "avatar_url": "https://avatars.githubusercontent.com/u/1001?v=4",
            "top_skills": ["Python", "Django", "PostgreSQL", "Architecture"],
            "impact_score": 92.5,
        },
        {
            "github_id": 1002,
            "name": "Isa",
            "bio": "Full-stack engineer passionate about AI-assisted products.",
            "avatar_url": "https://avatars.githubusercontent.com/u/1002?v=4",
            "top_skills": ["TypeScript", "React", "Node.js", "Prompt Engineering"],
            "impact_score": 88.0,
        },
        {
            "github_id": 1003,
            "name": "Nazrin",
            "bio": "Product-minded developer with strong UX and API integration skills.",
            "avatar_url": "https://avatars.githubusercontent.com/u/1003?v=4",
            "top_skills": ["Product", "API Integration", "Design Thinking"],
            "impact_score": 84.2,
        },
        {
            "github_id": 1004,
            "name": "Aysel",
            "bio": "Data and ML enthusiast building practical AI workflows.",
            "avatar_url": "https://avatars.githubusercontent.com/u/1004?v=4",
            "top_skills": ["Machine Learning", "Data Analysis", "Python"],
            "impact_score": 86.7,
        },
        {
            "github_id": 1005,
            "name": "Murad",
            "bio": "DevOps and cloud automation specialist.",
            "avatar_url": "https://avatars.githubusercontent.com/u/1005?v=4",
            "top_skills": ["Docker", "CI/CD", "AWS", "Kubernetes"],
            "impact_score": 89.1,
        },
    ]

    @classmethod
    def get_sync_logs(cls) -> list[str]:
        return cls._sync_logs.copy()

    @classmethod
    def sync_organization(cls, org_name: str) -> list[Member]:
        cls._sync_logs = [
            f"Starting sync for organization: {org_name}",
            "Authenticating with GitHub API...",
            "Scanning repos and contributors...",
            "Aggregating member profiles...",
        ]

        time.sleep(5)

        synced_members: list[Member] = []
        with transaction.atomic():
            for member_payload in cls.MOCK_MEMBERS:
                member = MemberRepository.upsert_member(
                    github_id=member_payload["github_id"],
                    name=member_payload["name"],
                    bio=member_payload["bio"],
                    avatar_url=member_payload["avatar_url"],
                    top_skills=member_payload["top_skills"],
                    impact_score=member_payload["impact_score"],
                )
                synced_members.append(member)

        cls._sync_logs.extend(
            [
                f"Synced {len(synced_members)} members.",
                "Sync completed successfully.",
            ]
        )
        return synced_members
