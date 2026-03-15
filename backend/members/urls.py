from django.urls import path

from members.views import (
    ActivateProposalView,
    MemberListView,
    ProposalListView,
    SyncLogsView,
    SyncOrganizationView,
    ProjectListView,
    ProjectCreateView,
)

urlpatterns = [
    path("sync/", SyncOrganizationView.as_view(), name="sync-organization"),
    path("sync/logs/", SyncLogsView.as_view(), name="sync-logs"),
    path("members/", MemberListView.as_view(), name="member-list"),
    path("proposals/", ProposalListView.as_view(), name="proposal-list"),
    path(
        "proposals/<int:proposal_id>/activate/",
        ActivateProposalView.as_view(),
        name="activate-proposal",
    ),
    path("projects/", ProjectListView.as_view(), name="project-list-all"),
    path("projects/create/", ProjectCreateView.as_view(), name="project-create"),
]
