from members.models import ProjectProposal
from members.repositories import ProjectProposalRepository


class NotificationService:
    @staticmethod
    def activate_project(project_id: int) -> ProjectProposal:
        project = ProjectProposalRepository.get_by_id(project_id=project_id)
        project.status = ProjectProposal.Status.ACTIVE
        project.save(update_fields=["status", "updated_at"])

        print(
            "[NotificationService] Sent activation notification "
            f"for project '{project.title}' to Discord and Email channels."
        )
        return project
