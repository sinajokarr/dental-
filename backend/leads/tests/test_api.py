import uuid

from django.core.cache import cache
from django.test import override_settings
from rest_framework.test import APITestCase

from leads.models import Lead

TOKEN = "test-internal-token"


def payload(**overrides):
    data = {
        "submission_id": str(uuid.uuid4()),
        "full_name": "Max Mustermann",
        "country": "DE",
        "phone": "+49 151 12345678",
        "email": "",
        "treatment": "implants",
        "preferred_contact": "whatsapp",
        "preferred_city": "no_preference",
        "preferred_language": "de",
        "site_locale": "de",
        "message": "",
        "consent": True,
        "consent_version": "draft-1",
        "source_page": "/de/zahnimplantate",
        "utm": {},
    }
    return data | overrides


@override_settings(INTERNAL_API_TOKEN=TOKEN)
class LeadApiTests(APITestCase):
    url = "/api/v1/leads/"

    def setUp(self):
        cache.clear()

    def post(self, data, ip="203.0.113.7", token=TOKEN):
        return self.client.post(self.url, data, format="json", HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_CLIENT_IP=ip)

    def test_creates_lead_with_e164_phone_and_consent_time(self):
        response = self.post(payload())
        self.assertEqual(response.status_code, 201, response.content)
        self.assertTrue(response.json()["created"])
        lead = Lead.objects.get(reference=response.json()["reference"])
        self.assertEqual(lead.phone_e164, "+4915112345678")
        self.assertIsNotNone(lead.consent_at)

    def test_replaying_a_submission_returns_the_same_lead(self):
        data = payload()
        first, second = self.post(data), self.post(data)
        self.assertEqual(second.status_code, 200)
        self.assertEqual(second.json(), {"reference": first.json()["reference"], "created": False})
        self.assertEqual(Lead.objects.count(), 1)

    def test_validation_errors_are_machine_codes(self):
        cases = [
            ({"full_name": ""}, "full_name", "required"),
            ({"full_name": "M"}, "full_name", "too_short"),
            ({"phone": "+49 123"}, "phone", "invalid_phone"),
            ({"country": "XX"}, "country", "invalid_choice"),
            ({"treatment": "whitening"}, "treatment", "invalid_choice"),
            ({"consent": False}, "consent", "consent_required"),
            ({"preferred_contact": "email", "email": ""}, "email", "email_required"),
            ({"email": "not-an-email"}, "email", "invalid_email"),
            ({"message": "x" * 1001}, "message", "too_long"),
            ({"unexpected": "x"}, "unexpected", "unknown_field"),
        ]
        for change, field, code in cases:
            with self.subTest(field=field, code=code):
                response = self.post(payload(**change))
                self.assertEqual(response.status_code, 400, response.content)
                self.assertIn(code, response.json()["errors"][field])

    def test_rejects_a_missing_or_wrong_token(self):
        self.assertEqual(self.post(payload(), token="wrong").status_code, 401)
        self.assertEqual(self.client.post(self.url, payload(), format="json").status_code, 401)

    def test_rate_limit_is_per_client_ip(self):
        for _ in range(10):
            self.assertEqual(self.post(payload()).status_code, 201)
        limited = self.post(payload())
        self.assertEqual(limited.status_code, 429)
        self.assertEqual(limited.json()["error"], "rate_limited")
        self.assertEqual(self.post(payload(), ip="198.51.100.9").status_code, 201)

    def test_health_reports_the_database(self):
        self.assertEqual(self.client.get("/api/v1/health/").json(), {"status": "ok", "db": "ok"})
