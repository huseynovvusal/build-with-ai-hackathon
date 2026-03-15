from django.contrib.auth.models import User
from django.db import models


class Member(models.Model):
    user = models.OneToOneField(
        User, null=True, blank=True, on_delete=models.SET_NULL, related_name="member"
    )
    github_id = models.PositiveBigIntegerField(unique=True)
    name = models.CharField(max_length=255)
    bio = models.TextField(blank=True)
    avatar_url = models.URLField(max_length=500, blank=True)
    company = models.CharField(max_length=255, blank=True)
    organization_login = models.CharField(max_length=255, blank=True)
    role = models.CharField(max_length=255, blank=True)
    roles = models.JSONField(default=list, blank=True)
    top_skills = models.JSONField(default=list, blank=True)
    impact_score = models.FloatField(default=0.0)
    commits_count = models.PositiveIntegerField(default=0)
    prs_merged_count = models.PositiveIntegerField(default=0)
    issues_count = models.PositiveIntegerField(default=0)
    reviews_count = models.PositiveIntegerField(default=0)
    github_token = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return f"{self.name} ({self.github_id})"


class ProjectProposal(models.Model):
    """AI-generated org-wide proposals (admin created via /api/sync/)."""

    class Status(models.TextChoices):
        DRAFT = "DRAFT", "Draft"
        ACTIVE = "ACTIVE", "Active"
        ARCHIVED = "ARCHIVED", "Archived"

    title = models.CharField(max_length=255)
    description = models.TextField()
    ai_reasoning = models.TextField()
    initiatives = models.JSONField(default=list, blank=True)
    technical_tips = models.JSONField(default=list, blank=True)
    overall_strategy = models.JSONField(default=list, blank=True)
    required_dna = models.JSONField(default=list, blank=True)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.title


class TeamAssignment(models.Model):
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name="team_assignments")
    project_proposal = models.ForeignKey(
        ProjectProposal,
        on_delete=models.CASCADE,
        related_name="team_assignments",
    )
    role = models.CharField(max_length=255, blank=True)
    assigned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("member", "project_proposal")
        ordering = ["project_proposal_id", "member_id"]

    def __str__(self) -> str:
        return f"{self.member.name} -> {self.project_proposal.title}"


class Project(models.Model):
    """User-created projects with AI team suggestions."""

    class Status(models.TextChoices):
        DRAFT = "DRAFT", "Draft"
        OPEN = "OPEN", "Open (Recruiting)"
        ACTIVE = "ACTIVE", "Active"
        DONE = "DONE", "Done"

    title = models.CharField(max_length=255)
    description = models.TextField()
    required_skills = models.JSONField(default=list, blank=True)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.OPEN,
    )
    creator = models.ForeignKey(
        Member, null=True, blank=True, on_delete=models.SET_NULL, related_name="created_projects"
    )
    ai_team_reasoning = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.title


class ProjectMember(models.Model):
    """Team assignments for user-created Projects."""

    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name="project_memberships")
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="project_members")
    role = models.CharField(max_length=255, blank=True)
    ai_reasoning = models.TextField(blank=True)
    assigned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("member", "project")
        ordering = ["project_id", "member_id"]

    def __str__(self) -> str:
        return f"{self.member.name} -> {self.project.title}"
