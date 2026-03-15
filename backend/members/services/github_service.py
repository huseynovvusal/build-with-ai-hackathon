from typing import Any

import requests
from django.db import transaction

from members.models import Member
from members.repositories import MemberRepository
from users.github_scraper import GitHubScraperService


class GithubSyncService:
    _sync_logs: list[str] = []

    @classmethod
    def get_sync_logs(cls) -> list[str]:
        return cls._sync_logs

    @classmethod
    def sync_organization(cls, org_name: str, access_token: str | None = None) -> list[Member]:
        cls._sync_logs = [
            f"Starting sync for organization: {org_name}",
            "Fetching members from GitHub API...",
        ]

        headers = {"Accept": "application/vnd.github+json"}
        if access_token:
            headers["Authorization"] = f"Bearer {access_token}"
        
        try:
            # 1. Fetch org members
            org_members: list[dict[str, Any]] = []
            page = 1
            while True:
                members_resp = requests.get(
                    f"https://api.github.com/orgs/{org_name}/members",
                    headers=headers,
                    params={"per_page": 100, "page": page},
                    timeout=10,
                )
                members_resp.raise_for_status()
                page_members = members_resp.json()
                if not isinstance(page_members, list):
                    break
                if not page_members:
                    break
                org_members.extend(page_members)
                if len(page_members) < 100:
                    break
                page += 1
        except requests.exceptions.RequestException as e:
            cls._sync_logs.append(f"Failed to fetch org members: {e}")
            return []

        if not isinstance(org_members, list):
            cls._sync_logs.append("Invalid response format from GitHub API.")
            return []

        cls._sync_logs.append(f"Found {len(org_members)} members. Fetching full profiles and scraping repos...")

        synced_members: list[Member] = []
        with transaction.atomic():
            for m in org_members:
                username = m.get("login")
                if not username:
                    continue
                
                # Fetch full profile to get name, bio, company
                try:
                    profile_resp = requests.get(
                        f"https://api.github.com/users/{username}",
                        headers=headers,
                        timeout=10,
                    )
                    profile_resp.raise_for_status()
                    profile = profile_resp.json()
                except Exception as e:
                    cls._sync_logs.append(f"Failed to fetch profile for {username}: {e}")
                    continue

                github_id = profile.get("id")
                name = profile.get("name") or username
                bio = profile.get("bio") or ""
                avatar_url = profile.get("avatar_url", "")
                company = profile.get("company") or ""
                primary_role = profile.get("type") or "Contributor"
                
                # Scrape languages/impact score
                scraped = GitHubScraperService.scrape(username=username, access_token=access_token)

                member = MemberRepository.upsert_member(
                    github_id=github_id,
                    name=name,
                    bio=bio,
                    avatar_url=avatar_url,
                    company=company,
                    organization_login=org_name,
                    role=primary_role,
                    roles=[primary_role],
                    top_skills=scraped["top_skills"],
                    impact_score=scraped["impact_score"],
                )
                synced_members.append(member)
                cls._sync_logs.append(f"Synced member: {name} ({username})")

        cls._sync_logs.extend(
            [
                f"Successfully synced {len(synced_members)} members.",
                "Sync completed successfully.",
            ]
        )
        return synced_members
