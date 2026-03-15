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
    def sync_organization(
        cls,
        org_name: str,
        access_token: str | None = None,
        progress_callback: Any | None = None,
    ) -> list[Member]:
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

        if len(org_members) == 0:
            cls._sync_logs.append(
                "No members returned by GitHub API. Organization may be private or membership is hidden."
            )
            return []

        cls._sync_logs.append(f"Found {len(org_members)} members. Fetching full profiles and scraping repos...")
        if callable(progress_callback):
            progress_callback(0, len(org_members), "starting")

        synced_members: list[Member] = []
        with transaction.atomic():
            for idx, m in enumerate(org_members, start=1):
                username = m.get("login")
                if not username:
                    if callable(progress_callback):
                        progress_callback(idx, len(org_members), "skipped")
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
                    if callable(progress_callback):
                        progress_callback(idx, len(org_members), username)
                    continue

                github_id = profile.get("id")
                name = profile.get("name") or username
                bio = profile.get("bio") or ""
                avatar_url = profile.get("avatar_url", "")
                company = profile.get("company") or ""
                primary_role = profile.get("type") or "Contributor"
                
                # Scrape languages/impact score
                scraped = GitHubScraperService.scrape(
                    username=username,
                    access_token=access_token,
                    organization_login=org_name,
                )

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
                    commits_count=int(scraped.get("commits_count", 0) or 0),
                    prs_merged_count=int(scraped.get("prs_merged_count", 0) or 0),
                    issues_count=int(scraped.get("issues_count", 0) or 0),
                    reviews_count=int(scraped.get("reviews_count", 0) or 0),
                )
                synced_members.append(member)
                cls._sync_logs.append(f"Synced member: {name} ({username})")
                if callable(progress_callback):
                    progress_callback(idx, len(org_members), username)

        cls._sync_logs.extend(
            [
                f"Successfully synced {len(synced_members)} members.",
                "Sync completed successfully.",
            ]
        )
        return synced_members
