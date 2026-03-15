from __future__ import annotations

import threading

from members.models import Member
from members.services import GithubSyncService, ProjectGeneratorService
from users.github_scraper import GitHubScraperService


def _run_member_analysis(member_id: int, github_login: str, access_token: str, organization_login: str) -> None:
    try:
        member = Member.objects.get(id=member_id)
        member.is_analyzing = True
        member.analysis_status = Member.AnalysisStatus.RUNNING
        member.analysis_progress = 5
        member.analysis_message = "Collecting GitHub profile and contribution data..."
        member.save(update_fields=["is_analyzing", "analysis_status", "analysis_progress", "analysis_message", "updated_at"])

        scraped = GitHubScraperService.scrape(
            username=github_login,
            access_token=access_token,
            organization_login=organization_login or None,
        )

        member = Member.objects.get(id=member_id)
        member.top_skills = scraped.get("top_skills", [])
        member.impact_score = float(scraped.get("impact_score", 0.0) or 0.0)
        member.commits_count = int(scraped.get("commits_count", 0) or 0)
        member.prs_merged_count = int(scraped.get("prs_merged_count", 0) or 0)
        member.issues_count = int(scraped.get("issues_count", 0) or 0)
        member.reviews_count = int(scraped.get("reviews_count", 0) or 0)
        member.analysis_progress = 45
        member.analysis_message = "Base profile analyzed. Syncing organization members..."
        member.save(
            update_fields=[
                "top_skills",
                "impact_score",
                "commits_count",
                "prs_merged_count",
                "issues_count",
                "reviews_count",
                "analysis_progress",
                "analysis_message",
                "updated_at",
            ]
        )

        if organization_login:
            def _on_org_sync(processed: int, total: int, current_username: str) -> None:
                try:
                    member_local = Member.objects.get(id=member_id)
                    span_start = 45
                    span_end = 80
                    pct = int((processed / total) * (span_end - span_start)) if total > 0 else 0
                    member_local.analysis_progress = min(span_end, span_start + pct)
                    member_local.analysis_message = (
                        f"Syncing organization members ({processed}/{total})... {current_username}"
                    )
                    member_local.save(update_fields=["analysis_progress", "analysis_message", "updated_at"])
                except Exception:
                    pass

            GithubSyncService.sync_organization(
                org_name=organization_login,
                access_token=access_token,
                progress_callback=_on_org_sync,
            )

        member = Member.objects.get(id=member_id)
        member.analysis_progress = 80
        member.analysis_message = "Generating AI project ideas and team matches..."
        member.save(update_fields=["analysis_progress", "analysis_message", "updated_at"])

        ProjectGeneratorService.generate_proposals(refresh=True)

        member = Member.objects.get(id=member_id)
        member.is_analyzing = False
        member.analysis_status = Member.AnalysisStatus.READY
        member.analysis_progress = 100
        member.analysis_message = "Analysis complete. Dashboard is fully up to date."
        member.save(update_fields=["is_analyzing", "analysis_status", "analysis_progress", "analysis_message", "updated_at"])
    except Exception as exc:
        try:
            member = Member.objects.get(id=member_id)
            member.is_analyzing = False
            member.analysis_status = Member.AnalysisStatus.FAILED
            member.analysis_message = f"Analysis failed: {str(exc)[:200]}"
            member.save(update_fields=["is_analyzing", "analysis_status", "analysis_message", "updated_at"])
        except Exception:
            pass


def start_member_analysis_async(member_id: int, github_login: str, access_token: str, organization_login: str) -> None:
    thread = threading.Thread(
        target=_run_member_analysis,
        args=(member_id, github_login, access_token, organization_login),
        daemon=True,
    )
    thread.start()
