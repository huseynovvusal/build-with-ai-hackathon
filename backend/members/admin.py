from django.contrib import admin

from members.models import Member, ProjectProposal, TeamAssignment

admin.site.register(Member)
admin.site.register(ProjectProposal)
admin.site.register(TeamAssignment)
