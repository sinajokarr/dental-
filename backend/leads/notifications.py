"""Internal Telegram notification for new leads (WHATSAPP_TELEGRAM_INTEGRATION.md §B).

Minimal data only — reference, language, country, treatment, city and an admin link; never the patient's
name, phone, email or message (D-009, D-045). The lead is saved before any send attempt, so Telegram being
down never loses a lead; the outbox fields on Lead drive retries (no Celery/Redis, D-032).
"""

import html
import json
import logging
import threading
import urllib.error
import urllib.request
from datetime import timedelta

from django.conf import settings
from django.db import connection
from django.db.models import Q
from django.utils import timezone

from .models import Lead

log = logging.getLogger(__name__)
BACKOFF_MINUTES = (1, 2, 4, 8, 16, 32, 60, 60)  # one entry per attempt → at most 8 attempts
STALE_CLAIM = timedelta(minutes=5)
RETRYABLE = (Lead.Notification.PENDING, Lead.Notification.FAILED)


class TelegramError(Exception):
    def __init__(self, description: str, retry_after: int | None = None):
        super().__init__(description)
        self.retry_after = retry_after


def configured() -> bool:
    return bool(settings.TELEGRAM_BOT_TOKEN and settings.TELEGRAM_CHAT_ID)


def admin_url(lead: Lead) -> str:
    return f"{settings.ADMIN_BASE_URL.rstrip('/')}/{settings.ADMIN_PATH}/leads/lead/{lead.pk}/change/"


def message(lead: Lead) -> dict:
    text = "\n".join(
        [
            "🦷 <b>New consultation request</b>",
            f"Ref: <code>{html.escape(lead.reference)}</code>",
            f"Language: {html.escape(lead.preferred_language.upper())} · Country: {html.escape(lead.country)}",
            f"Treatment: {html.escape(lead.get_treatment_display())} · City: {html.escape(lead.get_preferred_city_display())}",
        ]
    )
    return {
        "chat_id": settings.TELEGRAM_CHAT_ID,
        "text": text,
        "parse_mode": "HTML",
        "reply_markup": {"inline_keyboard": [[{"text": "Open in admin", "url": admin_url(lead)}]]},
    }


def send(payload: dict) -> None:
    """POST to the Bot API with the standard library. Errors never include the URL: it contains the token."""
    request = urllib.request.Request(
        f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/sendMessage",
        data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(request, timeout=5) as response:
            body = json.load(response)
    except urllib.error.HTTPError as error:  # Telegram explains errors in a JSON body
        try:
            body = json.load(error)
        except ValueError:
            body = {}
        retry_after = (body.get("parameters") or {}).get("retry_after")
        raise TelegramError(body.get("description") or f"HTTP {error.code}", retry_after) from None
    except (urllib.error.URLError, TimeoutError, OSError) as error:
        raise TelegramError(f"network error ({type(error).__name__})") from None
    if not body.get("ok"):
        raise TelegramError(body.get("description") or "Telegram rejected the message")


def _due() -> Q:
    return Q(notification_next_at__isnull=True) | Q(notification_next_at__lte=timezone.now())


def deliver(lead_id: int) -> bool:
    """Send one lead's notification if it is due. An atomic claim makes concurrent senders a no-op."""
    if not configured():
        return False
    claimed = (
        Lead.objects.filter(pk=lead_id, notification_status__in=RETRYABLE, notification_attempts__lt=len(BACKOFF_MINUTES))
        .filter(_due())
        .update(notification_status=Lead.Notification.SENDING, updated_at=timezone.now())
    )
    if claimed != 1:
        return False
    lead = Lead.objects.get(pk=lead_id)
    try:
        send(message(lead))
    except TelegramError as error:
        attempts = lead.notification_attempts + 1
        wait = timedelta(seconds=error.retry_after) if error.retry_after else timedelta(minutes=BACKOFF_MINUTES[attempts - 1])
        Lead.objects.filter(pk=lead_id).update(
            notification_status=Lead.Notification.FAILED,
            notification_attempts=attempts,
            notification_next_at=timezone.now() + wait,
            notification_error=str(error)[:300],
        )
        log.warning("Telegram notification for %s failed (attempt %s): %s", lead.reference, attempts, error)
        return False
    Lead.objects.filter(pk=lead_id).update(notification_status=Lead.Notification.SENT, notified_at=timezone.now(), notification_error="")
    return True


def deliver_due() -> int:
    """Worker body (manage.py deliver_pending_notifications): release stale claims, send everything due."""
    Lead.objects.filter(notification_status=Lead.Notification.SENDING, updated_at__lt=timezone.now() - STALE_CLAIM).update(
        notification_status=Lead.Notification.FAILED
    )
    due = (
        Lead.objects.filter(notification_status__in=RETRYABLE, notification_attempts__lt=len(BACKOFF_MINUTES))
        .filter(_due())
        .values_list("pk", flat=True)
    )
    return sum(deliver(pk) for pk in due)


def notify_in_background(lead_id: int) -> None:
    """Called on commit: the patient gets the answer immediately; the send happens in a daemon thread."""

    def run():
        try:
            deliver(lead_id)
        except Exception:  # the worker retries; never let a notification crash anything
            log.exception("notification thread failed for lead %s", lead_id)
        finally:
            connection.close()

    threading.Thread(target=run, daemon=True).start()
