"""Consultation requests (LEAD_MANAGEMENT_AND_FORM_SPEC §7). No IP address is ever stored (D-047)."""

import secrets

from django.conf import settings
from django.db import models

CROCKFORD = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"  # base32 without I, L, O, U — easy to read aloud


def new_reference() -> str:
    """Random, non-sequential patient-facing code, e.g. JD-7K3Q9P (D-046)."""
    return "JD-" + "".join(secrets.choice(CROCKFORD) for _ in range(6))


class Lead(models.Model):
    class Status(models.TextChoices):
        NEW = "new", "New"
        CONTACTED = "contacted", "Contacted"
        QUALIFIED = "qualified", "Qualified"
        CONSULTATION_SCHEDULED = "consultation_scheduled", "Consultation scheduled"
        APPOINTMENT_CONFIRMED = "appointment_confirmed", "Appointment confirmed"
        CLOSED = "closed", "Closed"
        LOST = "lost", "Lost"

    class Language(models.TextChoices):
        FA = "fa", "Persian"
        EN = "en", "English"
        DE = "de", "German"
        TR = "tr", "Turkish"

    class Treatment(models.TextChoices):
        IMPLANTS = "implants", "Dental implants"
        VENEERS = "veneers", "Dental veneers"
        SMILE_DESIGN = "smile_design", "Smile design"
        NOT_SURE = "not_sure", "Not sure"

    class City(models.TextChoices):
        ANTALYA = "antalya", "Antalya"
        ISTANBUL = "istanbul", "Istanbul"
        NO_PREFERENCE = "no_preference", "No preference"

    class Contact(models.TextChoices):
        WHATSAPP = "whatsapp", "WhatsApp"
        PHONE = "phone", "Phone call"
        EMAIL = "email", "Email"

    class Notification(models.TextChoices):
        PENDING = "pending", "Pending"
        SENDING = "sending", "Sending"
        SENT = "sent", "Sent"
        FAILED = "failed", "Failed"

    reference = models.CharField(max_length=9, unique=True, default=new_reference, editable=False)
    submission_id = models.UUIDField(unique=True, editable=False)  # idempotency key from the form
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    full_name = models.CharField(max_length=120)
    phone_e164 = models.CharField("phone", max_length=16)
    email = models.EmailField(blank=True)
    country = models.CharField("country of residence", max_length=2)
    preferred_language = models.CharField(max_length=2, choices=Language.choices)
    site_locale = models.CharField("site language", max_length=2, choices=Language.choices)
    treatment = models.CharField(max_length=16, choices=Treatment.choices)
    preferred_city = models.CharField(max_length=16, choices=City.choices, default=City.NO_PREFERENCE)
    preferred_contact = models.CharField(max_length=10, choices=Contact.choices, default=Contact.WHATSAPP)
    message = models.TextField(max_length=1000, blank=True)

    source_page = models.CharField(max_length=200, blank=True)
    utm = models.JSONField(default=dict, blank=True)
    consent_version = models.CharField(max_length=20)
    consent_at = models.DateTimeField()

    status = models.CharField(max_length=24, choices=Status.choices, default=Status.NEW, db_index=True)
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="assigned_leads"
    )

    notification_status = models.CharField(max_length=8, choices=Notification.choices, default=Notification.PENDING)
    notification_attempts = models.PositiveSmallIntegerField(default=0)
    notification_next_at = models.DateTimeField(null=True, blank=True)
    notified_at = models.DateTimeField(null=True, blank=True)
    notification_error = models.CharField(max_length=300, blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status", "created_at"]),
            models.Index(fields=["country"]),
            models.Index(fields=["treatment"]),
            models.Index(fields=["preferred_language"]),
            models.Index(fields=["notification_status", "notification_next_at"]),
        ]

    def __str__(self) -> str:
        return f"{self.reference} · {self.full_name}"


class LeadActivity(models.Model):
    """Audit trail per lead: staff notes and every status / assignment change (who, when, from → to)."""

    class Kind(models.TextChoices):
        NOTE = "note", "Note"
        STATUS = "status", "Status change"
        ASSIGNMENT = "assignment", "Assignment"

    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name="activities")
    author = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)
    kind = models.CharField(max_length=12, choices=Kind.choices, default=Kind.NOTE)
    text = models.TextField(blank=True)
    old_value = models.CharField(max_length=64, blank=True)
    new_value = models.CharField(max_length=64, blank=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name_plural = "activities"

    def __str__(self) -> str:
        return f"{self.get_kind_display()} · {self.created_at:%Y-%m-%d %H:%M}"
