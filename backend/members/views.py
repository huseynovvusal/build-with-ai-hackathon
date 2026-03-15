from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from members.serializers import MemberSerializer, ProjectProposalSerializer
from members.services import (
    GithubSyncService,
    NotificationService,
    ProjectGeneratorService,
    QueryService,
)


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
