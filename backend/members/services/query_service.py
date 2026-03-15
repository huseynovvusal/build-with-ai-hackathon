from members.models import Member, ProjectProposal
from members.repositories import MemberRepository, ProjectProposalRepository


class QueryService:
    @staticmethod
    def list_members() -> list[Member]:
        return MemberRepository.list_members()

    @staticmethod
    def list_proposals() -> list[ProjectProposal]:
        return ProjectProposalRepository.list_proposals()
