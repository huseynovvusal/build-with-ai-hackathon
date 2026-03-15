from __future__ import annotations

import json
import time
from django.contrib.auth.models import User
from django.db import transaction
from django.http import StreamingHttpResponse
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.tokens import RefreshToken

from members.models import Member
from users.analysis_worker import start_member_analysis_async
from users.github_oauth import GitHubOAuthService
from users.serializers import MemberSerializer


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

        # 3. Fast upsert Django User + Member (defer heavy sync/analysis to background)
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
                    "top_skills": [],
                    "roles": [gh_profile.get("type", "Contributor")],
                    "impact_score": 0.0,
                    "commits_count": 0,
                    "prs_merged_count": 0,
                    "issues_count": 0,
                    "reviews_count": 0,
                    "github_token": gh_token,
                    "is_analyzing": True,
                    "analysis_status": Member.AnalysisStatus.RUNNING,
                    "analysis_progress": 1,
                    "analysis_message": "Authentication complete. Starting analysis...",
                },
            )

        # 3.1 Start background analysis/sync without blocking login UX
        start_member_analysis_async(
            member_id=member.id,
            github_login=github_login,
            access_token=gh_token,
            organization_login=organization_login,
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


class MeStreamView(APIView):
    """
    GET /api/auth/stream/?token=<access_token>
    Streams current member profile updates as Server-Sent Events.
    """

    permission_classes = [AllowAny]

    def get(self, request: Request) -> Response:
        token = request.query_params.get("token")
        if not token:
            return Response({"error": "token is required"}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            access = AccessToken(token)
            user_id = access.get("user_id")
            user = User.objects.get(id=user_id)
        except Exception:
            return Response({"error": "invalid token"}, status=status.HTTP_401_UNAUTHORIZED)

        def event_stream():
            last_payload = ""
            try:
                while True:
                    try:
                        member = Member.objects.get(user=user)
                        payload = MemberSerializer(member).data
                    except Member.DoesNotExist:
                        payload = {
                            "is_analyzing": True,
                            "analysis_status": "PENDING",
                            "analysis_progress": 0,
                            "analysis_message": "Waiting for member profile...",
                        }

                    data = json.dumps(payload)
                    if data != last_payload:
                        yield f"event: member_update\ndata: {data}\n\n"
                        last_payload = data

                    time.sleep(2)
            except GeneratorExit:
                return

        response = StreamingHttpResponse(event_stream(), content_type="text/event-stream")
        response["Cache-Control"] = "no-cache"
        response["X-Accel-Buffering"] = "no"
        return response

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
