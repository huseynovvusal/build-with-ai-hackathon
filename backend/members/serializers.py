from rest_framework import serializers

from members.models import Member, ProjectProposal, TeamAssignment


class MemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = [
            "id",
            "github_id",
            "name",
            "bio",
            "avatar_url",
            "top_skills",
            "impact_score",
        ]


class TeamAssignmentSerializer(serializers.ModelSerializer):
    member = MemberSerializer(read_only=True)

    class Meta:
        model = TeamAssignment
        fields = ["id", "member", "role", "assigned_at"]


class ProjectProposalSerializer(serializers.ModelSerializer):
    team_assignments = TeamAssignmentSerializer(many=True, read_only=True)

    class Meta:
        model = ProjectProposal
        fields = [
            "id",
            "title",
            "description",
            "ai_reasoning",
            "status",
            "team_assignments",
        ]
