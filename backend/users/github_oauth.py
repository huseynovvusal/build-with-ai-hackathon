from __future__ import annotations

import requests
from django.conf import settings


class GitHubOAuthService:
    """Exchange GitHub OAuth code for token and fetch user profile."""

    TOKEN_URL = "https://github.com/login/oauth/access_token"
    USER_URL = "https://api.github.com/user"
    USER_ORGS_URL = "https://api.github.com/user/orgs"

    @classmethod
    def exchange_code(cls, code: str) -> dict:
        """Exchange OAuth code for access token. Returns token dict."""
        response = requests.post(
            cls.TOKEN_URL,
            headers={"Accept": "application/json"},
            data={
                "client_id": settings.GITHUB_CLIENT_ID,
                "client_secret": settings.GITHUB_CLIENT_SECRET,
                "code": code,
            },
            timeout=10,
        )
        response.raise_for_status()
        data = response.json()
        if "error" in data:
            raise ValueError(f"GitHub OAuth error: {data.get('error_description', data['error'])}")
        return data  # has "access_token", "token_type", "scope"

    @classmethod
    def get_user_profile(cls, access_token: str) -> dict:
        """Fetch GitHub user profile using access token."""
        response = requests.get(
            cls.USER_URL,
            headers={
                "Authorization": f"Bearer {access_token}",
                "Accept": "application/vnd.github+json",
            },
            timeout=10,
        )
        response.raise_for_status()
        return response.json()
        # Returns: id, login, name, bio, avatar_url, public_repos, followers, etc.

    @classmethod
    def get_user_orgs(cls, access_token: str) -> list[dict]:
        """Fetch organizations for authenticated GitHub user."""
        response = requests.get(
            cls.USER_ORGS_URL,
            headers={
                "Authorization": f"Bearer {access_token}",
                "Accept": "application/vnd.github+json",
            },
            params={"per_page": 100},
            timeout=10,
        )
        response.raise_for_status()
        data = response.json()
        return data if isinstance(data, list) else []
