from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from users.views import GitHubCallbackView, MeView

urlpatterns = [
    path("github/", GitHubCallbackView.as_view(), name="github-callback"),
    path("me/", MeView.as_view(), name="auth-me"),
    path("refresh/", TokenRefreshView.as_view(), name="token-refresh"),
]
