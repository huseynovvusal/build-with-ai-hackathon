from django.db import models


class Member(models.Model):
    github_id = models.PositiveBigIntegerField(unique=True)
    name = models.CharField(max_length=255)
    bio = models.TextField(blank=True)
    avatar_url = models.URLField(max_length=500, blank=True)
    top_skills = models.JSONField(default=list, blank=True)
    impact_score = models.FloatField(default=0.0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return f"{self.name} ({self.github_id})"


class ProjectProposal(models.Model):
    class Status(models.TextChoices):
        DRAFT = "DRAFT", "Draft"
        ACTIVE = "ACTIVE", "Active"
        ARCHIVED = "ARCHIVED", "Archived"

    title = models.CharField(max_length=255)
    description = models.TextField()
    ai_reasoning = models.TextField()
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
