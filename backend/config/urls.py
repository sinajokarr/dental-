from django.conf import settings
from django.contrib import admin
from django.urls import path
from django_otp.admin import OTPAdminSite

from leads.api import LeadCreateView, health

if settings.ADMIN_REQUIRE_2FA:
    admin.site.__class__ = OTPAdminSite  # staff must verify a TOTP device (D-044)

urlpatterns = [
    path(f"{settings.ADMIN_PATH}/", admin.site.urls),  # non-default admin path from env (D-044)
    # Internal API — the reverse proxy never exposes /api (D-033).
    path("api/v1/leads/", LeadCreateView.as_view()),
    path("api/v1/health/", health),
]
