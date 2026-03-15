from __future__ import annotations

from collections import Counter

import requests


class GitHubScraperService:
    """Scrape a GitHub user's public repos to derive skills and impact score."""

    REPOS_URL = "https://api.github.com/users/{username}/repos"
    EVENTS_URL = "https://api.github.com/users/{username}/events/public"

    @classmethod
    def scrape(cls, username: str, access_token: str | None = None) -> dict:
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
        try:
            repos_resp = requests.get(
                cls.REPOS_URL.format(username=username),
                headers=headers,
                params={"per_page": 100, "sort": "updated"},
                timeout=10,
            )
            repos_resp.raise_for_status()
            repos = repos_resp.json()
        except Exception:
            return {"top_skills": [], "impact_score": 0.0}

        if not isinstance(repos, list):
            return {"top_skills": [], "impact_score": 0.0}

        # Aggregate languages from repo language field
        lang_counter: Counter = Counter()
        total_stars = 0
        total_forks = 0
        for repo in repos:
            if repo.get("fork"):
                continue  # skip forked repos for accuracy
            lang = repo.get("language")
            if lang:
                lang_counter[lang] += 1
            total_stars += repo.get("stargazers_count", 0)
            total_forks += repo.get("forks_count", 0)

        top_skills = [lang for lang, _ in lang_counter.most_common(5)]

        # Simple impact score formula (0-100)
        repo_count = len([r for r in repos if not r.get("fork")])
        impact_score = min(
            100.0,
            round(
                (repo_count * 2)
                + (total_stars * 3)
                + (total_forks * 2),
                1,
            ),
        )

        return {
            "top_skills": top_skills,
            "impact_score": impact_score,
        }
