import os
import subprocess
import sys
from pathlib import Path

from django.test import SimpleTestCase

BACKEND_DIR = Path(__file__).resolve().parents[2]


class RequiredEnvTests(SimpleTestCase):
    def test_missing_required_variable_stops_startup_and_names_it(self):
        result = subprocess.run(
            [sys.executable, "manage.py", "check"],
            cwd=BACKEND_DIR,
            env={**os.environ, "DJANGO_SECRET_KEY": ""},
            capture_output=True,
            text=True,
        )
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("Missing required environment variable: DJANGO_SECRET_KEY", result.stderr)
