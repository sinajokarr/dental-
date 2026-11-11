import io
import json
import urllib.error
from datetime import timedelta
from unittest import mock

from django.test import TestCase, override_settings
from django.utils import timezone

from leads import notifications
from leads.models import Lead
from leads.tests.test_models import make_lead

TOKEN = "123456:SECRET-BOT-TOKEN"
URLOPEN = "leads.notifications.urllib.request.urlopen"


def ok_response():
    response = mock.MagicMock()
    response.__enter__.return_value = io.BytesIO(json.dumps({"ok": True}).encode())
    return response


def http_error(code, body):
    return urllib.error.HTTPError(f"https://api.telegram.org/bot{TOKEN}/sendMessage", code, "err", {}, io.BytesIO(json.dumps(body).encode()))


@override_settings(TELEGRAM_BOT_TOKEN=TOKEN, TELEGRAM_CHAT_ID="-1001", ADMIN_BASE_URL="https://clinic.example", ADMIN_PATH="staff-x")
class TelegramNotificationTests(TestCase):
    def setUp(self):
        self.lead = make_lead(message="<script>private medical details</script>", email="max@example.invalid")

    def test_message_is_minimal_and_links_to_admin(self):
        payload = notifications.message(self.lead)
        text = payload["text"]
        for present in (self.lead.reference, "DE", "Dental implants", "No preference"):
            self.assertIn(present, text)
        for absent in ("Mustermann", "+4915112345678", "max@example.invalid", "private medical"):
            self.assertNotIn(absent, text)
        url = payload["reply_markup"]["inline_keyboard"][0][0]["url"]
        self.assertEqual(url, f"https://clinic.example/staff-x/leads/lead/{self.lead.pk}/change/")

    def test_success_marks_sent(self):
        with mock.patch(URLOPEN, return_value=ok_response()) as urlopen:
            self.assertTrue(notifications.deliver(self.lead.pk))
        self.assertIn("sendMessage", urlopen.call_args.args[0].full_url)
        self.lead.refresh_from_db()
        self.assertEqual(self.lead.notification_status, Lead.Notification.SENT)
        self.assertIsNotNone(self.lead.notified_at)

    def test_failure_backs_off_and_never_records_the_token(self):
        with mock.patch(URLOPEN, side_effect=http_error(500, {"ok": False, "description": "Internal Server Error"})):
            self.assertFalse(notifications.deliver(self.lead.pk))
        self.lead.refresh_from_db()
        self.assertEqual((self.lead.notification_status, self.lead.notification_attempts), (Lead.Notification.FAILED, 1))
        self.assertAlmostEqual((self.lead.notification_next_at - timezone.now()).total_seconds(), 60, delta=5)
        self.assertNotIn("SECRET", self.lead.notification_error)

    def test_network_error_text_never_leaks_the_url(self):
        error = urllib.error.URLError(f"cannot reach https://api.telegram.org/bot{TOKEN}/sendMessage")
        with mock.patch(URLOPEN, side_effect=error):
            notifications.deliver(self.lead.pk)
        self.lead.refresh_from_db()
        self.assertNotIn("SECRET", self.lead.notification_error)

    def test_rate_limit_waits_as_telegram_asks(self):
        with mock.patch(URLOPEN, side_effect=http_error(429, {"ok": False, "description": "Too Many Requests", "parameters": {"retry_after": 30}})):
            notifications.deliver(self.lead.pk)
        self.lead.refresh_from_db()
        self.assertAlmostEqual((self.lead.notification_next_at - timezone.now()).total_seconds(), 30, delta=5)

    def test_not_due_or_already_claimed_or_sent_is_not_sent_again(self):
        with mock.patch(URLOPEN, return_value=ok_response()) as urlopen:
            Lead.objects.filter(pk=self.lead.pk).update(notification_status=Lead.Notification.FAILED, notification_next_at=timezone.now() + timedelta(minutes=5))
            self.assertFalse(notifications.deliver(self.lead.pk))
            Lead.objects.filter(pk=self.lead.pk).update(notification_status=Lead.Notification.SENDING, notification_next_at=None)
            self.assertFalse(notifications.deliver(self.lead.pk))
            Lead.objects.filter(pk=self.lead.pk).update(notification_status=Lead.Notification.SENT)
            self.assertFalse(notifications.deliver(self.lead.pk))
            urlopen.assert_not_called()

    def test_gives_up_after_eight_attempts(self):
        Lead.objects.filter(pk=self.lead.pk).update(notification_status=Lead.Notification.FAILED, notification_attempts=8)
        with mock.patch(URLOPEN, return_value=ok_response()) as urlopen:
            self.assertEqual(notifications.deliver_due(), 0)
            urlopen.assert_not_called()

    def test_worker_releases_stale_claims_and_delivers(self):
        Lead.objects.filter(pk=self.lead.pk).update(notification_status=Lead.Notification.SENDING, updated_at=timezone.now() - timedelta(minutes=10))
        with mock.patch(URLOPEN, return_value=ok_response()):
            self.assertEqual(notifications.deliver_due(), 1)

    @override_settings(TELEGRAM_BOT_TOKEN="")
    def test_unconfigured_bot_leaves_lead_pending(self):
        with mock.patch(URLOPEN) as urlopen:
            self.assertFalse(notifications.deliver(self.lead.pk))
            urlopen.assert_not_called()
        self.lead.refresh_from_db()
        self.assertEqual(self.lead.notification_status, Lead.Notification.PENDING)
