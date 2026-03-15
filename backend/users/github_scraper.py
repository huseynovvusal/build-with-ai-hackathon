from __future__ import annotations

from collections import Counter
from typing import Any

import requests


class GitHubScraperService:
    """Scrape GitHub data to derive skills and an impact score from repo + contribution activity."""

    REPOS_URL = "https://api.github.com/users/{username}/repos"
    EVENTS_URL = "https://api.github.com/users/{username}/events/public"
    SEARCH_ISSUES_URL = "https://api.github.com/search/issues"
    SEARCH_COMMITS_URL = "https://api.github.com/search/commits"

    @staticmethod
    def _search_total_count(url: str, headers: dict[str, str], query: str) -> int:
        try:
            resp = requests.get(
                url,
                headers=headers,
                params={"q": query, "per_page": 1},
                timeout=15,
            )
            resp.raise_for_status()
            data = resp.json()
            return int(data.get("total_count", 0) or 0)
        except Exception:
            return 0

    @classmethod
    def scrape(
        cls,
        username: str,
        access_token: str | None = None,
        organization_login: str | None = None,
    ) -> dict:
        """
        Returns:
            {
                "top_skills": ["Python", "TypeScript", "Go"],  # top 3 languages
                "impact_score": 74.5,                          # computed 0-100
            }
        """
        headers = {"Accept": "application/vnd.github+json"}
        if access_token:
            headers["Authorization"] = f"Bearer {access_token}"

        # Fetch public repos (up to 100)
        repos: list[dict[str, Any]] = []
        try:
            repos_resp = requests.get(
                cls.REPOS_URL.format(username=username),
                headers=headers,
                params={"per_page": 100, "sort": "updated"},
                timeout=10,
            )
            repos_resp.raise_for_status()
            repos_data = repos_resp.json()
            if isinstance(repos_data, list):
                repos = repos_data
        except Exception:
            repos = []

        # Fetch public events (up to 300: API limitation)
        events: list[dict[str, Any]] = []
        page = 1
        while page <= 3:
            try:
                events_resp = requests.get(
                    cls.EVENTS_URL.format(username=username),
                    headers=headers,
                    params={"per_page": 100, "page": page},
                    timeout=10,
                )
                events_resp.raise_for_status()
                page_events = events_resp.json()
                if not isinstance(page_events, list) or not page_events:
                    break
                events.extend(page_events)
                if len(page_events) < 100:
                    break
                page += 1
            except Exception:
                break

        # Aggregate languages from repo language field
        lang_counter: Counter = Counter()
        total_stars = 0.0
        total_forks = 0.0
        repo_count = 0
        for repo in repos:
            if repo.get("fork"):
                continue  # skip forked repos for accuracy
            repo_count += 1
            lang = repo.get("language")
            if lang:
                lang_counter[lang] += 1
            total_stars += float(repo.get("stargazers_count", 0) or 0)
            total_forks += float(repo.get("forks_count", 0) or 0)

        top_skills = [lang for lang, _ in lang_counter.most_common(5)]

        # Contribution activity from events (commits/PRs/issues/reviews)
        pushed_commits = 0
        prs_opened = 0
        prs_merged = 0
        issues_opened = 0
        reviews_submitted = 0
        org_repo_touches: set[str] = set()

        org_prefix = f"{organization_login.lower()}/" if organization_login else None
        for event in events:
            event_type = event.get("type", "")
            repo_name = (event.get("repo") or {}).get("name", "")
            payload = event.get("payload") or {}

            if org_prefix and isinstance(repo_name, str) and repo_name.lower().startswith(org_prefix):
                org_repo_touches.add(repo_name)

            if event_type == "PushEvent":
                pushed_commits += int(payload.get("size") or 0)
            elif event_type == "PullRequestEvent":
                prs_opened += 1
                if (payload.get("pull_request") or {}).get("merged"):
                    prs_merged += 1
            elif event_type == "IssuesEvent" and payload.get("action") == "opened":
                issues_opened += 1
            elif event_type == "PullRequestReviewEvent" and payload.get("action") == "submitted":
                reviews_submitted += 1

        # Org-wide counters (more accurate for leaderboard when org provided)
        if organization_login:
            org = organization_login
            search_headers = dict(headers)

            # Commit search requires special accept header on some GitHub deployments
            commit_headers = dict(search_headers)
            commit_headers["Accept"] = "application/vnd.github.cloak-preview+json"

            commits_q = f"org:{org} author:{username}"
            merged_prs_q = f"type:pr org:{org} author:{username} is:merged"
            issues_q = f"type:issue org:{org} author:{username}"
            reviews_q = f"type:pr org:{org} reviewed-by:{username}"

            commits_from_search = cls._search_total_count(cls.SEARCH_COMMITS_URL, commit_headers, commits_q)
            merged_prs_from_search = cls._search_total_count(cls.SEARCH_ISSUES_URL, search_headers, merged_prs_q)
            issues_from_search = cls._search_total_count(cls.SEARCH_ISSUES_URL, search_headers, issues_q)
            reviews_from_search = cls._search_total_count(cls.SEARCH_ISSUES_URL, search_headers, reviews_q)

            # Use max to keep non-zero event-based values when search is limited.
            pushed_commits = max(pushed_commits, commits_from_search)
            prs_merged = max(prs_merged, merged_prs_from_search)
            issues_opened = max(issues_opened, issues_from_search)
            reviews_submitted = max(reviews_submitted, reviews_from_search)

        # Weighted impact score (0-100)
        repo_impact = (repo_count * 1.5) + (total_stars * 2.0) + (total_forks * 1.5)
        contribution_impact = (
            (pushed_commits * 0.25)
            + (prs_opened * 3.0)
            + (prs_merged * 8.0)
            + (issues_opened * 3.0)
            + (reviews_submitted * 4.0)
            + (len(org_repo_touches) * 2.0)
        )

        impact_score = min(
            100.0,
            round(repo_impact + contribution_impact, 1),
        )

        return {
            "top_skills": top_skills,
            "impact_score": impact_score,
            "commits_count": pushed_commits,
            "prs_merged_count": prs_merged,
            "issues_count": issues_opened,
            "reviews_count": reviews_submitted,
        }
