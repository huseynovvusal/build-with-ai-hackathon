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
    NotificationService,
    ProjectGeneratorService,
    QueryService,
)
from members.models import Member
from members.services.ai_team_matcher import AITeamMatcherService
from members.repositories import ProjectRepository


class SyncOrganizationView(APIView):
    def post(self, request: Request) -> Response:
        org_name = request.data.get("org_name") or "communa-ai"
        synced_members = GithubSyncService.sync_organization(org_name=org_name)
        proposals = ProjectGeneratorService.generate_proposals()

        return Response(
            {
                "message": "Organization sync completed.",
                "members_synced": len(synced_members),
                "proposals_generated": len(proposals),
            },
            status=status.HTTP_200_OK,
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
        suggestions = AITeamMatcherService.match_team(project)
        AITeamMatcherService.apply_team(project, suggestions)

        # Refresh project to get assignments
        project = ProjectRepository.list_projects().get(id=project.id)
        return Response(ProjectSerializer(project).data, status=status.HTTP_201_CREATED)
