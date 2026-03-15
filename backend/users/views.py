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
from members.services import GithubSyncService
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
        company = gh_profile.get("company") or ""

        # 2.1 Fetch organizations and pick the first available org
        organization_login = ""
        try:
            orgs = GitHubOAuthService.get_user_orgs(gh_token)
            if orgs:
                organization_login = orgs[0].get("login", "")
        except Exception as exc:
            print(f"DEBUG [Auth]: Could not fetch organizations: {exc}")

        # 3. Scrape repos for skills + impact score
        scraped = GitHubScraperService.scrape(
            username=github_login,
            access_token=gh_token,
            organization_login=organization_login or None,
        )
        top_skills = scraped["top_skills"]
        impact_score = scraped["impact_score"]
        commits_count = int(scraped.get("commits_count", 0) or 0)
        prs_merged_count = int(scraped.get("prs_merged_count", 0) or 0)
        issues_count = int(scraped.get("issues_count", 0) or 0)
        reviews_count = int(scraped.get("reviews_count", 0) or 0)

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
                    "company": company,
                    "organization_login": organization_login,
                    "top_skills": top_skills,
                    "roles": [gh_profile.get("type", "Contributor")],
                    "impact_score": impact_score,
                    "commits_count": commits_count,
                    "prs_merged_count": prs_merged_count,
                    "issues_count": issues_count,
                    "reviews_count": reviews_count,
                    "github_token": gh_token,
                },
            )

        # 4.1 Sync all members from the same organization, if available
        if organization_login:
            try:
                GithubSyncService.sync_organization(org_name=organization_login, access_token=gh_token)
                # Reload self member after org sync in case upsert updated it
                member = Member.objects.get(github_id=github_id)
            except Exception as exc:
                print(f"DEBUG [Auth]: Organization sync failed for {organization_login}: {exc}")

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

    def put(self, request: Request) -> Response:
        try:
            member = Member.objects.get(user=request.user)
        except Member.DoesNotExist:
            return Response({"error": "Member profile not found"}, status=status.HTTP_404_NOT_FOUND)

        member.name = request.data.get("name", member.name)
        member.bio = request.data.get("bio", member.bio)
        member.company = request.data.get("company", member.company)
        member.role = request.data.get("role", member.role)
        member.organization_login = request.data.get("organization_login", member.organization_login)
        
        if "top_skills" in request.data:
            skills = request.data.get("top_skills") or []
            if isinstance(skills, list):
                member.top_skills = [str(skill).strip() for skill in skills if str(skill).strip()]

        if "roles" in request.data:
            roles = request.data.get("roles") or []
            if isinstance(roles, list):
                member.roles = [str(role).strip() for role in roles if str(role).strip()]
                if member.roles and not member.role:
                    member.role = member.roles[0]
            
        member.save()

        serializer = MemberSerializer(member)
        return Response(serializer.data, status=status.HTTP_200_OK)
