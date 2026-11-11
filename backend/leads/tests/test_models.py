import re
import uuid

from django.db import IntegrityError
from django.test import TestCase
from django.utils import timezone

from leads.models import Lead, LeadActivity

REFERENCE = re.compile(r"^JD-[0-9ABCDEFGHJKMNPQRSTVWXYZ]{6}$")  # Crockford base32: no I, L, O, U


def make_lead(**overrides) -> Lead:
    data = {
        "submission_id": uuid.uuid4(),
        "full_name": "Max Mustermann",
        "phone_e164": "+4915112345678",
        "country": "DE",
        "preferred_language": "de",
        "site_locale": "de",
        "treatment": "implants",
        "consent_version": "draft-1",
        "consent_at": timezone.now(),
    }
    return Lead.objects.create(**(data | overrides))


class LeadModelTests(TestCase):
    def test_reference_is_random_crockford_and_unique(self):
        refs = {make_lead().reference for _ in range(20)}
        self.assertEqual(len(refs), 20)
        for ref in refs:
            self.assertRegex(ref, REFERENCE)

    def test_new_lead_defaults(self):
        lead = make_lead()
        self.assertEqual(lead.status, Lead.Status.NEW)
        self.assertEqual(lead.notification_status, Lead.Notification.PENDING)
        self.assertEqual(lead.preferred_city, Lead.City.NO_PREFERENCE)
        self.assertEqual(lead.preferred_contact, Lead.Contact.WHATSAPP)

    def test_submission_id_is_unique(self):
        submission = uuid.uuid4()
        make_lead(submission_id=submission)
        with self.assertRaises(IntegrityError):
            make_lead(submission_id=submission)

    def test_no_ip_address_is_stored(self):
        self.assertFalse([f.name for f in Lead._meta.get_fields() if "ip" in f.name.split("_")])

    def test_activity_log_belongs_to_lead(self):
        lead = make_lead()
        LeadActivity.objects.create(lead=lead, kind=LeadActivity.Kind.STATUS, old_value="new", new_value="contacted")
        self.assertEqual(lead.activities.get().new_value, "contacted")
