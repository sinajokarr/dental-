from django.conf import settings
from django.contrib.auth import get_user_model
from django.test import TestCase

from leads.models import Lead, LeadActivity
from leads.tests.test_models import make_lead

ADMIN = f"/{settings.ADMIN_PATH}/leads/lead/"


class LeadAdminTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_superuser("staff", "staff@example.invalid", "s3cret-pass-123")
        self.client.force_login(self.user)
        self.lead = make_lead()

    def form_data(self, **overrides):
        lead = self.lead
        data = {
            "full_name": lead.full_name, "phone_e164": lead.phone_e164, "email": lead.email, "country": lead.country,
            "preferred_language": lead.preferred_language, "site_locale": lead.site_locale, "treatment": lead.treatment,
            "preferred_city": lead.preferred_city, "preferred_contact": lead.preferred_contact, "message": lead.message,
            "status": lead.status, "assigned_to": "",
            "activities-TOTAL_FORMS": "1", "activities-INITIAL_FORMS": "0", "activities-MIN_NUM_FORMS": "0",
            "activities-MAX_NUM_FORMS": "1000", "activities-0-text": "",
        }
        return data | overrides

    def test_changelist_lists_and_filters_leads(self):
        response = self.client.get(ADMIN, {"status__exact": "new", "treatment__exact": "implants"})
        self.assertContains(response, self.lead.reference)
        self.assertNotContains(self.client.get(ADMIN, {"status__exact": "lost"}), self.lead.reference)

    def test_search_by_phone(self):
        self.assertContains(self.client.get(ADMIN, {"q": "+4915112345678"}), self.lead.reference)

    def test_change_page_offers_one_click_contact(self):
        response = self.client.get(f"{ADMIN}{self.lead.pk}/change/")
        self.assertContains(response, 'href="https://wa.me/4915112345678"')
        self.assertContains(response, 'href="tel:+4915112345678"')

    def test_status_change_is_logged_with_author(self):
        response = self.client.post(f"{ADMIN}{self.lead.pk}/change/", self.form_data(status="contacted"))
        self.assertEqual(response.status_code, 302, response.content[:500])
        activity = LeadActivity.objects.get(lead=self.lead, kind=LeadActivity.Kind.STATUS)
        self.assertEqual((activity.old_value, activity.new_value, activity.author), ("new", "contacted", self.user))

    def test_note_gets_its_author(self):
        self.client.post(f"{ADMIN}{self.lead.pk}/change/", self.form_data(**{"activities-0-text": "Called, prefers Istanbul."}))
        note = LeadActivity.objects.get(lead=self.lead, kind=LeadActivity.Kind.NOTE)
        self.assertEqual((note.text, note.author), ("Called, prefers Istanbul.", self.user))

    def test_actions_mark_contacted_and_assign_to_me(self):
        for action in ("mark_contacted", "assign_to_me"):
            self.client.post(ADMIN, {"action": action, "_selected_action": [self.lead.pk]})
        self.lead.refresh_from_db()
        self.assertEqual((self.lead.status, self.lead.assigned_to), (Lead.Status.CONTACTED, self.user))
        self.assertEqual(self.lead.activities.count(), 2)
