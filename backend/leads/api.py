"""Internal lead API (API_SPEC.md) — called only by the Next.js Server Action over the private network (D-033)."""

import hmac

import phonenumbers
from django.conf import settings
from django.core.exceptions import ValidationError as InvalidValue
from django.db import DatabaseError, IntegrityError, connection, transaction
from django.http import JsonResponse
from django.utils import timezone
from rest_framework import serializers
from rest_framework.exceptions import ErrorDetail, Throttled
from rest_framework.response import Response
from rest_framework.throttling import SimpleRateThrottle
from rest_framework.views import APIView

from .models import Lead
from .notifications import notify_in_background

UTM_KEYS = ("source", "medium", "campaign", "term", "content")


class LeadSerializer(serializers.ModelSerializer):
    submission_id = serializers.UUIDField()
    full_name = serializers.CharField(min_length=2, max_length=120)
    phone = serializers.CharField(write_only=True, max_length=32)
    country = serializers.ChoiceField(choices=sorted(phonenumbers.SUPPORTED_REGIONS))
    consent = serializers.BooleanField(write_only=True)

    class Meta:
        model = Lead
        fields = [
            "submission_id", "full_name", "phone", "email", "country", "treatment", "preferred_contact",
            "preferred_city", "preferred_language", "site_locale", "message", "consent", "consent_version",
            "source_page", "utm",
        ]

    def to_internal_value(self, data):
        unknown = set(data) - set(self.fields)
        if unknown:
            raise serializers.ValidationError({name: [ErrorDetail("Unknown field.", code="unknown_field")] for name in unknown})
        return super().to_internal_value(data)

    def validate_phone(self, value: str) -> str:
        try:
            number = phonenumbers.parse(value, None)
        except phonenumbers.NumberParseException:
            number = None
        if number is None or not phonenumbers.is_valid_number(number):
            raise serializers.ValidationError("Invalid phone number.", code="invalid_phone")
        return phonenumbers.format_number(number, phonenumbers.PhoneNumberFormat.E164)

    def validate_consent(self, value: bool) -> bool:
        if value is not True:
            raise serializers.ValidationError("Consent is required.", code="consent_required")
        return value

    def validate_utm(self, value) -> dict:
        if not isinstance(value, dict):
            return {}
        return {key: str(value[key])[:100] for key in UTM_KEYS if value.get(key)}

    def validate(self, attrs: dict) -> dict:
        if attrs.get("preferred_contact") == Lead.Contact.EMAIL and not attrs.get("email"):
            raise serializers.ValidationError({"email": ErrorDetail("Email is required for email contact.", code="email_required")})
        return attrs

    def create(self, validated: dict) -> Lead:
        validated.pop("consent")
        validated["phone_e164"] = validated.pop("phone")
        validated["consent_at"] = timezone.now()
        return Lead.objects.create(**validated)


# DRF's built-in codes → the form's error codes (LEAD_MANAGEMENT_AND_FORM_SPEC §4).
CODES = {"blank": "required", "null": "required", "min_length": "too_short", "max_length": "too_long"}


def error_codes(errors: dict) -> dict:
    def code(field: str, error: ErrorDetail) -> str:
        if field == "email" and error.code == "invalid":
            return "invalid_email"
        return CODES.get(error.code, error.code)

    return {field: [code(field, error) for error in field_errors] for field, field_errors in errors.items()}


class ClientIPThrottle(SimpleRateThrottle):
    """Per visitor IP, forwarded by Next.js as X-Client-IP (trusted: the API is not reachable from outside)."""

    def get_cache_key(self, request, view):
        ident = request.headers.get("X-Client-IP") or request.META.get("REMOTE_ADDR")
        return self.cache_format % {"scope": self.scope, "ident": ident}


class HourlyThrottle(ClientIPThrottle):
    scope = "lead_hour"


class DailyThrottle(ClientIPThrottle):
    scope = "lead_day"


def _authorized(request) -> bool:
    expected = f"Bearer {settings.INTERNAL_API_TOKEN}"
    return hmac.compare_digest(request.headers.get("Authorization", ""), expected)


def _replay(submission_id) -> Response | None:
    try:
        lead = Lead.objects.filter(submission_id=submission_id).only("reference").first()
    except (ValueError, InvalidValue):  # not a UUID — the serializer reports it
        return None
    return Response({"reference": lead.reference, "created": False}) if lead else None


class LeadCreateView(APIView):
    authentication_classes = []
    permission_classes = []
    throttle_classes = [HourlyThrottle, DailyThrottle]

    def post(self, request):
        if not _authorized(request):
            return Response({"error": "unauthorized"}, status=401)
        if replay := _replay(request.data.get("submission_id")):
            return replay
        serializer = LeadSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"errors": error_codes(serializer.errors)}, status=400)
        for _ in range(3):  # a reference collision just draws a new random reference
            try:
                with transaction.atomic():
                    lead = serializer.save()
                break
            except IntegrityError:
                if replay := _replay(serializer.validated_data["submission_id"]):  # concurrent double submit
                    return replay
        else:
            raise IntegrityError("could not allocate a unique reference")
        transaction.on_commit(lambda: notify_in_background(lead.pk))  # Telegram never delays the patient
        return Response({"reference": lead.reference, "created": True}, status=201)

    def handle_exception(self, exc):
        if isinstance(exc, Throttled):
            return Response({"error": "rate_limited", "retry_after": int(exc.wait or 0)}, status=429)
        return super().handle_exception(exc)


def health(request):
    try:
        connection.ensure_connection()
    except DatabaseError:
        return JsonResponse({"status": "error", "db": "error"}, status=503)
    return JsonResponse({"status": "ok", "db": "ok"})
