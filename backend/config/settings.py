"""Django settings for JOKAR DENTAL.

Every environment-specific value comes from environment variables (template: /.env.example).
For local development they are read from the repository-root .env; real environment variables win.
"""

import os
from datetime import timedelta
from pathlib import Path

from django.core.exceptions import ImproperlyConfigured

BASE_DIR = Path(__file__).resolve().parent.parent


def _load_dotenv(path: Path) -> None:
    # ponytail: minimal KEY=value reader (no inline comments); swap for a library only if .env grows complex.
    if not path.is_file():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            key, _, value = line.partition("=")
            os.environ.setdefault(key.strip(), value.strip().strip("\"'"))


_load_dotenv(BASE_DIR.parent / ".env")


def env(name: str, default: str | None = None) -> str:
    value = os.environ.get(name, default)
    if not value:
        raise ImproperlyConfigured(f"Missing required environment variable: {name} (see .env.example)")
    return value


SECRET_KEY = env("DJANGO_SECRET_KEY")
DEBUG = env("DJANGO_DEBUG", "false").lower() == "true"
ALLOWED_HOSTS = [host.strip() for host in env("DJANGO_ALLOWED_HOSTS").split(",") if host.strip()]
ADMIN_PATH = env("DJANGO_ADMIN_PATH").strip("/")
if ADMIN_PATH in ("", "admin"):
    raise ImproperlyConfigured("DJANGO_ADMIN_PATH must be a non-default, non-empty path (D-044)")
# Staff sign in with a TOTP device (django-otp). Default ON; set DJANGO_ADMIN_2FA=false only for local development.
ADMIN_REQUIRE_2FA = os.environ.get("DJANGO_ADMIN_2FA", "true").lower() != "false"
INTERNAL_API_TOKEN = env("INTERNAL_API_TOKEN")  # shared secret: Next.js Server Action → lead API (D-033)

# Telegram lead notifications (optional until the bot exists, Q5): without both, leads stay "pending".
TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID", "")
ADMIN_BASE_URL = os.environ.get("ADMIN_BASE_URL", "http://localhost:8000")  # for the "Open in admin" link

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django_otp",
    "django_otp.plugins.otp_totp",
    "django_otp.plugins.otp_static",
    "axes",
    "rest_framework",
    "leads",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django_otp.middleware.OTPMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "axes.middleware.AxesMiddleware",  # must stay last
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": env("POSTGRES_DB"),
        "USER": env("POSTGRES_USER"),
        "PASSWORD": env("POSTGRES_PASSWORD"),
        "HOST": env("POSTGRES_HOST", "localhost"),
        "PORT": env("POSTGRES_PORT", "5432"),
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# Brute-force protection (django-axes): 5 failures per username + IP → locked for 30 minutes.
AUTHENTICATION_BACKENDS = ["axes.backends.AxesStandaloneBackend", "django.contrib.auth.backends.ModelBackend"]
AXES_FAILURE_LIMIT = 5
AXES_COOLOFF_TIME = timedelta(minutes=30)
AXES_LOCKOUT_PARAMETERS = [["username", "ip_address"]]
AXES_RESET_ON_SUCCESS = True
AXES_IPWARE_PROXY_COUNT = 1  # behind Caddy: the client IP is the first X-Forwarded-For entry
AXES_IPWARE_META_PRECEDENCE_ORDER = ["HTTP_X_FORWARDED_FOR", "REMOTE_ADDR"]

SESSION_COOKIE_AGE = 8 * 3600  # staff sessions end after a working day
X_FRAME_OPTIONS = "DENY"
CSRF_TRUSTED_ORIGINS = [o.strip() for o in os.environ.get("DJANGO_CSRF_TRUSTED_ORIGINS", "").split(",") if o.strip()]
if not DEBUG:
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    SECURE_SSL_REDIRECT = True
    SECURE_REDIRECT_EXEMPT = [r"^api/"]  # the internal API is reached over the private network (D-033)
    SESSION_COOKIE_SECURE = CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = 31_536_000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True

LANGUAGE_CODE = "en-us"
TIME_ZONE = "Europe/Istanbul"
USE_I18N = True
USE_TZ = True

STATIC_URL = "/django-static/"  # avoids any clash with Next.js /_next/static (ARCHITECTURE.md §5)
STATIC_ROOT = BASE_DIR / "staticfiles"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# Database-backed cache: enough for the lead throttle, no Redis (D-032). Create with: manage.py createcachetable
CACHES = {"default": {"BACKEND": "django.core.cache.backends.db.DatabaseCache", "LOCATION": "cache"}}

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [],
    "DEFAULT_PERMISSION_CLASSES": [],
    "UNAUTHENTICATED_USER": None,
    "DEFAULT_RENDERER_CLASSES": ["rest_framework.renderers.JSONRenderer"],
    "DEFAULT_PARSER_CLASSES": ["rest_framework.parsers.JSONParser"],
    "DEFAULT_THROTTLE_RATES": {"lead_hour": "10/hour", "lead_day": "30/day"},  # D-047: CGNAT-tolerant
}
