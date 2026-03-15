from __future__ import annotations

from django.contrib.auth.models import User
from rest_framework import serializers

from members.models import Member


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


class AuthResponseSerializer(serializers.Serializer):
    access = serializers.CharField()
    refresh = serializers.CharField()
    member = MemberSerializer()
