import os
import subprocess
import sys
from pathlib import Path

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.test import TestCase

from leads.tests.test_models import make_lead

BACKEND_DIR = Path(__file__).resolve().parents[2]
LEADS = f"/{settings.ADMIN_PATH}/leads/lead/"


def run(*args: str, **env: str) -> subprocess.CompletedProcess:
    return subprocess.run([sys.executable, "manage.py", *args], cwd=BACKEND_DIR, env={**os.environ, **env}, capture_output=True, text=True)


class StaffGroupTests(TestCase):
    def staff(self, group: str):
        user = get_user_model().objects.create_user(group.lower().replace(" ", "-"), password="s3cret-pass-123", is_staff=True)
        user.groups.add(Group.objects.get(name=group))
        self.client.force_login(user)
        return user

    def test_coordinator_works_leads_but_cannot_delete(self):
        lead = make_lead()
        user = self.staff("Coordinator")
        self.assertEqual(self.client.get(LEADS).status_code, 200)
        self.assertTrue(user.has_perm("leads.change_lead"))
        self.assertFalse(user.has_perm("leads.delete_lead"))
        self.assertEqual(self.client.post(f"{LEADS}{lead.pk}/delete/", {"post": "yes"}).status_code, 403)

    def test_clinic_admin_may_delete_spam(self):
        self.assertTrue(self.staff("Clinic Admin").has_perm("leads.delete_lead"))


class LoginProtectionTests(TestCase):
    def test_five_failed_logins_lock_the_account(self):
        get_user_model().objects.create_superuser("owner", "owner@example.invalid", "correct-horse-battery")
        login = f"/{settings.ADMIN_PATH}/login/"
        for _ in range(5):
            self.client.post(login, {"username": "owner", "password": "wrong"})
        self.client.post(login, {"username": "owner", "password": "correct-horse-battery"})
        self.assertNotIn("_auth_user_id", self.client.session)


class ConfigurationTests(TestCase):
    def test_two_factor_admin_is_the_default(self):
        result = run("shell", "-c", "from django.contrib import admin; import config.urls; print(admin.site.__class__.__name__)", DJANGO_ADMIN_2FA="")
        self.assertEqual(result.stdout.strip().splitlines()[-1], "OTPAdminSite", result.stderr[-500:])

    def test_default_admin_path_is_refused(self):
        for bad in ("admin", "/", ""):
            with self.subTest(path=bad):
                result = run("check", DJANGO_ADMIN_PATH=bad)
                self.assertNotEqual(result.returncode, 0)
                self.assertIn("DJANGO_ADMIN_PATH", result.stderr)

    def test_production_settings_pass_the_deploy_check(self):
        result = run(
            "check", "--deploy", "--fail-level", "WARNING",
            DJANGO_DEBUG="false", DJANGO_ADMIN_2FA="true", DJANGO_CSRF_TRUSTED_ORIGINS="https://clinic.example",
            DJANGO_SECRET_KEY="x" * 60 + "-production-like-secret-key-with-enough-entropy",
        )
        self.assertEqual(result.returncode, 0, result.stdout[-1500:] + result.stderr[-1500:])
