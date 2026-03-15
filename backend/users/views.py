from __future__ import annotations

from django.contrib.auth.models import User
from django.db import transaction
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from members.models import Member
from users.github_oauth import GitHubOAuthService
from users.github_scraper import GitHubScraperService
from users.serializers import MemberSerializer, AuthResponseSerializer


def _get_tokens_for_user(user: User) -> dict:
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }


class GitHubCallbackView(APIView):
    """
    POST /api/auth/github/
    Body: { "code": "<github_oauth_code>" }
    Returns: { "access": "...", "refresh": "...", "member": {...} }
    """

    permission_classes = [AllowAny]

    def post(self, request: Request) -> Response:
        code = request.data.get("code")
        print(f"DEBUG [Auth]: Received request data: {request.data}")
        if not code:
            print("DEBUG [Auth]: Missing code in request")
            return Response({"error": "code is required"}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Exchange code for GH access token
        try:
            print(f"DEBUG [Auth]: Exchanging code: {code}")
            token_data = GitHubOAuthService.exchange_code(code)
            print(f"DEBUG [Auth]: Token exchange successful")
        except Exception as exc:
            import traceback
            traceback.print_exc()
            print(f"DEBUG [Auth]: Exception during token exchange: {exc}")
            print(f"DEBUG: Exception exchanging code: {exc}")
            return Response({"error": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        gh_token = token_data.get("access_token", "")

        # 2. Fetch GitHub profile
        try:
            print("DEBUG [Auth]: Fetching GitHub profile")
            gh_profile = GitHubOAuthService.get_user_profile(gh_token)
            print("DEBUG [Auth]: Profile fetch successful")
        except Exception as exc:
            import traceback
            traceback.print_exc()
            print(f"DEBUG [Auth]: Exception during profile fetch: {exc}")
            return Response({"error": f"Failed to fetch GitHub profile: {exc}"}, status=status.HTTP_400_BAD_REQUEST)

        github_id = gh_profile.get("id")
        github_login = gh_profile.get("login", "")
        name = gh_profile.get("name") or github_login
        bio = gh_profile.get("bio") or ""
        avatar_url = gh_profile.get("avatar_url", "")

        # 3. Scrape repos for skills + impact score
        scraped = GitHubScraperService.scrape(username=github_login, access_token=gh_token)
        top_skills = scraped["top_skills"]
        impact_score = scraped["impact_score"]

        # 4. Upsert Django User + Member (atomic)
        with transaction.atomic():
            user, _ = User.objects.get_or_create(
                username=f"gh_{github_id}",
                defaults={"first_name": name},
            )
            member, _ = Member.objects.update_or_create(
                github_id=github_id,
                defaults={
                    "user": user,
                    "name": name,
                    "bio": bio,
                    "avatar_url": avatar_url,
                    "top_skills": top_skills,
                    "impact_score": impact_score,
                },
            )

        # 5. Issue JWT
        tokens = _get_tokens_for_user(user)
        serializer = MemberSerializer(member)

        return Response(
            {
                "access": tokens["access"],
                "refresh": tokens["refresh"],
                "member": serializer.data,
            },
            status=status.HTTP_200_OK,
        )


class MeView(APIView):
    """
    GET /api/auth/me/
    Returns current authenticated user's member profile.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request: Request) -> Response:
        try:
            member = Member.objects.get(user=request.user)
        except Member.DoesNotExist:
            return Response({"error": "Member profile not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = MemberSerializer(member)
        return Response(serializer.data, status=status.HTTP_200_OK)
