from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from rest_framework.permissions import IsAuthenticatedOrReadOnly

from members.serializers import (
    MemberSerializer,
    ProjectProposalSerializer,
    ProjectSerializer,
    ProjectCreateSerializer,
)
from members.services import (
    GithubSyncService,
    NotificationService,
    ProjectGeneratorService,
    QueryService,
)
from members.models import Member
from members.services.ai_team_matcher import AITeamMatcherService
from members.repositories import ProjectRepository


class SyncOrganizationView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def post(self, request: Request) -> Response:
        org_name = request.data.get("org_name") or "communa-ai"
        access_token = None
        current_member = None
        if request.user.is_authenticated:
            try:
                current_member = Member.objects.get(user=request.user)
                access_token = current_member.github_token or None
                current_member.is_analyzing = True
                current_member.analysis_status = Member.AnalysisStatus.RUNNING
                current_member.analysis_progress = 1
                current_member.analysis_message = f"Starting organization sync for {org_name}..."
                current_member.save(
                    update_fields=[
                        "is_analyzing",
                        "analysis_status",
                        "analysis_progress",
                        "analysis_message",
                        "updated_at",
                    ]
                )
            except Member.DoesNotExist:
                pass

        def _sync_progress(processed: int, total: int, current_username: str) -> None:
            if not current_member:
                return
            try:
                cm = Member.objects.get(id=current_member.id)
                cm.analysis_progress = min(90, int((processed / total) * 90)) if total > 0 else 10
                cm.analysis_message = f"Syncing members ({processed}/{total})... {current_username}"
                cm.save(update_fields=["analysis_progress", "analysis_message", "updated_at"])
            except Exception:
                pass

        synced_members = GithubSyncService.sync_organization(
            org_name=org_name,
            access_token=access_token,
            progress_callback=_sync_progress if current_member else None,
        )
        try:
            proposals = ProjectGeneratorService.generate_proposals()
        except ValueError as exc:
            if current_member:
                cm = Member.objects.get(id=current_member.id)
                cm.is_analyzing = False
                cm.analysis_status = Member.AnalysisStatus.FAILED
                cm.analysis_message = str(exc)
                cm.save(update_fields=["is_analyzing", "analysis_status", "analysis_message", "updated_at"])
            return Response(
                {
                    "message": str(exc),
                    "members_synced": len(synced_members),
                    "proposals_generated": 0,
                    "logs": GithubSyncService.get_sync_logs(),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        logs = GithubSyncService.get_sync_logs()
        status_code = status.HTTP_200_OK
        if len(synced_members) == 0 and any(
            (
                "Failed to fetch org members" in log
                or "No members returned by GitHub API" in log
            )
            for log in logs
        ):
            status_code = status.HTTP_400_BAD_REQUEST

        if current_member:
            cm = Member.objects.get(id=current_member.id)
            cm.is_analyzing = False
            cm.analysis_status = Member.AnalysisStatus.READY if status_code == status.HTTP_200_OK else Member.AnalysisStatus.FAILED
            cm.analysis_progress = 100 if status_code == status.HTTP_200_OK else cm.analysis_progress
            cm.analysis_message = (
                f"Organization sync complete. {len(synced_members)} members synced."
                if status_code == status.HTTP_200_OK
                else (logs[-1] if logs else "Organization sync failed.")
            )
            cm.save(
                update_fields=[
                    "is_analyzing",
                    "analysis_status",
                    "analysis_progress",
                    "analysis_message",
                    "updated_at",
                ]
            )

        return Response(
            {
                "message": "Organization sync completed.",
                "members_synced": len(synced_members),
                "proposals_generated": len(proposals),
                "logs": logs,
            },
            status=status_code,
        )


class SyncLogsView(APIView):
    def get(self, request: Request) -> Response:
        logs = GithubSyncService.get_sync_logs()
        return Response({"logs": logs}, status=status.HTTP_200_OK)


class MemberListView(APIView):
    def get(self, request: Request) -> Response:
        members = QueryService.list_members()
        serializer = MemberSerializer(members, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ProposalListView(APIView):
    def get(self, request: Request) -> Response:
        proposals = QueryService.list_proposals()
        serializer = ProjectProposalSerializer(proposals, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ProposalRefreshView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def post(self, request: Request) -> Response:
        try:
            proposals = ProjectGeneratorService.generate_proposals(refresh=True)
        except ValueError as exc:
            return Response({"error": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        serializer = ProjectProposalSerializer(proposals, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ActivateProposalView(APIView):
    def post(self, request: Request, proposal_id: int) -> Response:
        project = NotificationService.activate_project(project_id=proposal_id)
        serializer = ProjectProposalSerializer(project)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ProjectListView(APIView):
    def get(self, request: Request) -> Response:
        projects = ProjectRepository.list_projects()
        serializer = ProjectSerializer(projects, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ProjectCreateView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def post(self, request: Request) -> Response:
        serializer = ProjectCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Get creator if authenticated
        creator = None
        if request.user.is_authenticated:
            try:
                creator = Member.objects.get(user=request.user)
            except Member.DoesNotExist:
                pass

        # Create project
        project = ProjectRepository.create_project(
            title=serializer.validated_data["title"],
            description=serializer.validated_data["description"],
            required_skills=serializer.validated_data.get("required_skills", []),
            creator=creator,
        )

        # Match team using AI
        try:
            suggestions = AITeamMatcherService.match_team(project)
        except ValueError as exc:
            project.delete()
            return Response({"error": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        if not suggestions:
            project.delete()
            return Response({"error": "AI did not return team members for this project."}, status=status.HTTP_400_BAD_REQUEST)

        AITeamMatcherService.apply_team(project, suggestions)

        # Refresh project to get assignments
        project = ProjectRepository.list_projects().get(id=project.id)
        return Response(ProjectSerializer(project).data, status=status.HTTP_201_CREATED)
