from django.db import connection
from django.test import TestCase


class DatabaseTests(TestCase):
    def test_runs_on_postgresql_18(self):
        self.assertEqual(connection.vendor, "postgresql")
        self.assertEqual(connection.pg_version // 10000, 18)
