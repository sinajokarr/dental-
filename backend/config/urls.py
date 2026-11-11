from django.conf import settings
from django.contrib import admin
from django.urls import path

urlpatterns = [
    path(f"{settings.ADMIN_PATH}/", admin.site.urls),  # non-default admin path from env (D-044)
]
