from rest_framework import serializers

from members.models import Member, ProjectProposal, TeamAssignment, Project, ProjectMember


class MemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = [
            "id",
            "github_id",
            "name",
            "bio",
            "avatar_url",
            "company",
            "organization_login",
            "role",
            "roles",
            "top_skills",
            "impact_score",
            "commits_count",
            "prs_merged_count",
            "issues_count",
            "reviews_count",
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
            "initiatives",
            "technical_tips",
            "overall_strategy",
            "required_dna",
            "status",
            "team_assignments",
            "created_at",
        ]


class ProjectMemberSerializer(serializers.ModelSerializer):
    member = MemberSerializer(read_only=True)

    class Meta:
        model = ProjectMember
        fields = ["id", "member", "role", "ai_reasoning", "assigned_at"]


class ProjectSerializer(serializers.ModelSerializer):
    project_members = ProjectMemberSerializer(many=True, read_only=True)
    creator = MemberSerializer(read_only=True)

    class Meta:
        model = Project
        fields = [
            "id",
            "title",
            "description",
            "required_skills",
            "status",
            "creator",
            "ai_team_reasoning",
            "project_members",
            "created_at",
        ]


class ProjectCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ["title", "description", "required_skills"]
