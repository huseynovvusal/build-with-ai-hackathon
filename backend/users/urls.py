from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from users.views import GitHubCallbackView, MeView, MeStreamView

urlpatterns = [
    path("github/", GitHubCallbackView.as_view(), name="github-callback"),
    path("me/", MeView.as_view(), name="auth-me"),
    path("stream/", MeStreamView.as_view(), name="auth-me-stream"),
    path("refresh/", TokenRefreshView.as_view(), name="token-refresh"),
]
