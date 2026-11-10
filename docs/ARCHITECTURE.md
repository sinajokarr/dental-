# ARCHITECTURE — JOKAR DENTAL

> نسخه: 1.0 · تاریخ: 2026-11-11 · وضعیت: پیش‌نویس
> مرجع‌ها: `API_SPEC.md` · `SECURITY_PERFORMANCE_QA.md` · `MULTILINGUAL_SEO_ARCHITECTURE.md`

## ۱. نمای کلی

```text
                 ┌──────────────────────────── VPS · Docker Compose ─────────────────────────────┐
                 │                                                                               │
 Browser ─HTTPS─►│ caddy (TLS خودکار، هدرهای امنیتی، فشرده‌سازی)                                  │
                 │   ├── /{ADMIN_PATH}/* , /django-static/* ──► api   Django 5.2 + Gunicorn ─┐    │
                 │   └── /* (همه صفحات) ─────────────────────► web   Next.js 16 (standalone) │    │
                 │                                               │                           ▼    │
                 │                                               └─ Server Action ──► api ──► db  PostgreSQL 18
                 │                                                  (شبکه داخلی؛ /api منتشر نمی‌شود)  │
                 │ worker (همان image ‏api): هر ۶۰ ثانیه deliver_pending_notifications ──► Telegram Bot API
                 └───────────────────────────────────────────────────────────────────────────────┘
```

| سرویس | مسئولیت | پورت عمومی |
|---|---|---|
| `caddy` | HTTPS خودکار (Let's Encrypt)، routing، هدرهای امنیتی، gzip و zstd | 80 و 443 |
| `web` | همه صفحات (SSG)، Server Action فرم | — |
| `api` | Lead API، Django Admin، WhiteNoise برای static ادمین | — |
| `worker` | ارسال و retry اعلان Telegram (outbox) | — |
| `db` | PostgreSQL | — (هرگز عمومی) |

## ۲. Stack و نسخه‌ها

نسخه‌ها در تاریخ 2026-11-11 از npm و PyPI استعلام شده‌اند. پیش از شروع کار، در A01 دوباره بررسی می‌شوند.

| لایه | فناوری | نسخه | یادداشت |
|---|---|---|---|
| Runtime | Node.js | **24 LTS** در Docker | روی سیستم شما Node 25 نصب است که برای توسعه مناسب است |
| Framework | Next.js (App Router) | 16.4.x | `proxy.ts` جایگزین `middleware.ts` شده است |
| UI | React | 19.3.x | — |
| Styling | Tailwind CSS | 4.3.x | D-017 |
| i18n | next-intl | 4.14.x | D-018 |
| 3D | three · @react-three/fiber · @react-three/drei | 0.187 · 9.8 · 10.7 | — |
| Animation | gsap · @gsap/react | 3.15 · 2.1 | فقط lazy (D-039) |
| تست Frontend | `node:test` (داخلی Node) · Playwright · @axe-core/playwright | — · 1.65 · 4.14 | D-043 |
| زبان Backend | Python | 3.13 | روی سیستم شما نصب است |
| Backend | **Django 5.2 LTS** | پشتیبانی تا آوریل ۲۰۲۸ | DRF و axes نسخه 5.2 را رسماً پشتیبانی می‌کنند، ولی WhiteNoise هنوز Django 6.1 را اعلام نکرده است. ارتقا به 6.2 LTS در ۲۰۲۷ |
| API | djangorestframework | 3.18.x | خواسته صریح کارفرما |
| DB driver | psycopg | 3.3.x | — |
| تلفن | phonenumberslite | 9.0.x | نسخه lite، بدون داده geocoding و سبک‌تر |
| 2FA | django-otp | 1.7.x | — |
| Brute-force | django-axes | 9.0.x | — |
| Static ادمین | whitenoise | 6.12.x | — |
| WSGI | gunicorn | 27.x | — |
| Database | PostgreSQL | **18** | پشتیبانی تا نوامبر ۲۰۳۰ |
| Proxy | Caddy | 2.x | HTTPS خودکار با یک خط تنظیم |
| Container | Docker Compose | — | Docker 29 روی سیستم شما نصب است |

**عمداً حذف شده‌اند:** Celery و Redis (D-032)، django-environ (از `os.environ` استفاده می‌شود)، zod (یک تابع اعتبارسنجی ساده کافی است)، Motion (D-014)، Lenis، کتابخانه‌های UI آماده و CMS (D-036).

---

## ۳. ساختار Repository

```text
jokar-dental/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── [locale]/
│   │   │   │   ├── layout.tsx                  # <html lang dir>، preload فونت هر زبان، Nav، Footer
│   │   │   │   ├── page.tsx                    # Home
│   │   │   │   ├── dental-implants/page.tsx    # اسلاگ‌ها با pathnames محلی می‌شوند
│   │   │   │   ├── dental-veneers/page.tsx
│   │   │   │   ├── smile-design/page.tsx
│   │   │   │   ├── international-patients/page.tsx
│   │   │   │   ├── free-consultation/page.tsx
│   │   │   │   ├── about/page.tsx
│   │   │   │   ├── privacy/ · kvkk/ · legal-notice/
│   │   │   │   └── not-found.tsx
│   │   │   ├── sitemap.ts · robots.ts
│   │   ├── components/
│   │   │   ├── ui/          # Button, GlassPanel, SectionHeader, Field, Accordion …
│   │   │   ├── layout/      # Nav, MobileMenu, LanguageSwitcher, StickyCta, Footer
│   │   │   ├── sections/    # Hero, TrustStrip, Treatments, WhyJokar, Journey, Faq, Consultation, Finale, TreatmentTemplate
│   │   │   ├── forms/       # ConsultationForm.tsx + actions.ts (Server Action)
│   │   │   └── three/hero-tooth/
│   │   ├── i18n/            # routing.ts (pathnames) · request.ts · navigation.ts
│   │   ├── lib/             # whatsapp.ts · validate-lead.ts · countries.ts · reveal.ts · motion.ts · content-flags.ts
│   │   ├── styles/globals.css   # Tailwind @theme = توکن‌های DESIGN_SYSTEM
│   │   └── proxy.ts         # تشخیص زبان next-intl (در Next 16 جایگزین middleware.ts)
│   ├── messages/            # fa.json · en.json · de.json · tr.json
│   ├── public/              # fonts/ · models/ · images/
│   └── tests/               # unit/ (node:test) · e2e/ (Playwright)
├── backend/
│   ├── config/              # settings.py (یک فایل، وابسته به env) · urls.py · wsgi.py
│   ├── leads/               # models · admin · api.py · notifications.py · management/commands/ · tests/
│   ├── manage.py
│   └── requirements.txt
├── infrastructure/          # compose.yml · compose.dev.yml · Caddyfile · Dockerfile.web · Dockerfile.api · backup.sh
├── docs/
├── .env.example · CLAUDE.md · README.md
```

### تغییرات نسبت به ساختار پیشنهادی brief

| پیشنهاد brief | تصمیم | دلیل |
|---|---|---|
| `components/glass/` | ادغام در `ui/` به‌صورت `GlassPanel` | Glass یک سبک است، نه یک دسته کامپوننت |
| `components/animations/` | `lib/reveal.ts` و `lib/motion.ts` | انیمیشن‌ها رفتار هستند، نه کامپوننت |
| `features/` | حذف | پوشه‌های `sections/` و `forms/` کافی‌اند |
| Backend apps: `core`، `services`، `leads`، `content`، `integrations` | فقط **`leads`** به‌اضافه `config` | خدمات ثابت‌اند و فقط سه مورد (در messages تعریف می‌شوند). Phase 1 CMS ندارد (D-036). Integration فقط یک ماژول Telegram است |
| `backend/tests/` | `leads/tests/` | تست‌ها کنار کد |

---

## ۴. Frontend

- **Rendering:** همه صفحات **SSG** هستند (`generateStaticParams` برای چهار زبان). TTFB سریع است و تنها بخش پویا Server Action فرم است.
- **Client Components:** فهرست بسته و کوچک است: Nav (وضعیت اسکرول)، MobileMenu، StickyCta، ConsultationForm، HeroTooth، Journey (GSAP)، MagneticButton، CardTilt، و wrapper کوچک reveal. **بقیه Server Component هستند.**
- **Content flags:** فایل `lib/content-flags.ts` یک ثابت TypeScript است، مثلاً `{ medicalTeam: false, technology: false, patientStories: false, aboutPage: false }`. بدون env و بدون CMS (D-028).
- **فونت‌ها:**
  - Self-host در `public/fonts` با `@font-face` دستی.
  - در `[locale]/layout.tsx` فقط فونت H1 **همان زبان** preload می‌شود.
  - fallback با `size-adjust` تنظیم می‌شود تا CLS صفر بماند.
  - دلیل: `next/font` در یک layout مشترک امکان preload شرطی بر اساس زبان را نمی‌دهد. در B01 با Network panel تأیید می‌شود.
- **Env عمومی:** `NEXT_PUBLIC_SITE_URL`، `NEXT_PUBLIC_WHATSAPP_NUMBER`.
- **Env فقط سرور:** `API_INTERNAL_URL`، `INTERNAL_API_TOKEN`.

## ۵. Backend

- **Settings:** یک فایل `settings.py` که همه مقادیر را از `os.environ` می‌خواند. اگر env الزامی وجود نداشته باشد، برنامه فوراً با پیام واضح متوقف می‌شود.
- **Apps:** `django.contrib.*`، `rest_framework`، `django_otp` (TOTP و static)، `axes`، `leads`.
- **Admin:** روی مسیر `DJANGO_ADMIN_PATH` با `OTPAdminSite`. Static ادمین با WhiteNoise و روی مسیر `/django-static/` سرو می‌شود تا با `/_next/static` تداخلی نداشته باشد.
- **API:** `LeadCreateView` با `InternalTokenPermission` و `ClientIPRateThrottle`.
- **Management commands:** `deliver_pending_notifications` و `send_test_notification`.
- **منطقه زمانی:** `TIME_ZONE='Europe/Istanbul'` و `USE_TZ=True`.

## ۶. مدل داده

```text
auth.User ──1───*── Lead.assigned_to
Lead ──1───*── LeadActivity (note | status | assignment)
auth.User ──1───*── LeadActivity.author
```

جزئیات فیلدها در `LEAD_MANAGEMENT_AND_FORM_SPEC.md` §۷ آمده است.

## ۷. استقرار

| موضوع | تصمیم |
|---|---|
| میزبانی | **یک VPS** با Docker Compose. پیشنهاد شروع: ۲ vCPU و ۴GB RAM. **منطقه میزبانی** (ترکیه یا اتحادیه اروپا) با مشاور حقوقی تعیین می‌شود (Q6) |
| شبکه | فقط `caddy` پورت عمومی دارد. `db` و `api` فقط در شبکه داخلی‌اند |
| Worker | همان image ‏`api` با دستور `sh -c 'while true; do python manage.py deliver_pending_notifications; sleep 60; done'` |
| Backup | اسکریپت `backup.sh`: خروجی `pg_dump -Fc` گرفته، **رمزنگاری** و به فضای off-site منتقل می‌شود. روزانه، با نگهداری ۳۰ روزه. **تست بازیابی ماهانه** |
| لاگ‌ها | لاگ‌های Docker با چرخش (json-file و max-size). لاگ‌های دسترسی Caddy که شامل IP هستند ۱۴ روز نگهداری می‌شوند |
| به‌روزرسانی | `docker compose pull && docker compose up -d` و بعد `manage.py migrate` |
| محیط‌ها | **local** (compose.dev) · **staging** (`noindex` + Basic Auth) · **production** |
| CI/CD | بعد از ساخت repository روی GitHub: Actions برای lint، typecheck، unit، تست‌های Django، build و E2E. Deploy با trigger دستی |
| مقیاس‌پذیری | ترافیک یک کلینیک با یک VPS به‌راحتی پوشش داده می‌شود. مسیر رشد: VPS بزرگ‌تر ← CDN برای `/_next/static` و تصاویر ← دیتابیس managed |

### طرح Caddyfile

```caddyfile
{$SITE_DOMAIN} {
  encode zstd gzip
  @django path /{$DJANGO_ADMIN_PATH}/* /django-static/*
  reverse_proxy @django api:8000
  reverse_proxy web:3000
  header {
    Strict-Transport-Security "max-age=31536000; includeSubDomains"
    X-Content-Type-Options nosniff
    Referrer-Policy strict-origin-when-cross-origin
    Permissions-Policy "camera=(), microphone=(), geolocation=()"
    # CSP: SECURITY_PERFORMANCE_QA.md §3
  }
}
```

## ۸. متغیرهای محیطی

جزئیات در `.env.example` (مرحله A05) می‌آید.

| متغیر | سرویس | محرمانه |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` · `NEXT_PUBLIC_WHATSAPP_NUMBER` | web | خیر |
| `API_INTERNAL_URL` · `INTERNAL_API_TOKEN` | web، api | **بله** (توکن) |
| `DJANGO_SECRET_KEY` · `DJANGO_ALLOWED_HOSTS` · `DJANGO_ADMIN_PATH` · `ADMIN_BASE_URL` | api | **بله** (secret key) |
| `DATABASE_URL` یا `POSTGRES_*` | api، db | **بله** |
| `TELEGRAM_BOT_TOKEN` · `TELEGRAM_CHAT_ID` | api، worker | **بله** |
| `SITE_DOMAIN` | caddy | خیر |
