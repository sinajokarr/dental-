from django.conf import settings
from django.test import TestCase


class AdminPathTests(TestCase):
    def test_login_page_is_served_on_the_configured_path(self):
        self.assertEqual(self.client.get(f"/{settings.ADMIN_PATH}/login/").status_code, 200)

    def test_default_admin_path_is_not_served(self):
        # The admin lives on a non-default path from env (D-044); /admin/ must stay a 404.
        self.assertEqual(self.client.get("/admin/login/").status_code, 404)
