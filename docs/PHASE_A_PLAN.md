# PHASE A — Foundation · برنامه اجرایی

> نسخه: 1.0 · تاریخ: 2026-11-11 · وضعیت: **منتظر تأیید کارفرما**
> مرجع‌ها: `TASK_TRACKER.md` (A01 تا A08) · `ARCHITECTURE.md` · `MULTILINGUAL_SEO_ARCHITECTURE.md`

**هدف فاز:** یک اسکلت قابل‌اعتماد که در هر ۴ زبان build شود، PostgreSQL داشته باشد و سه مجموعه تست آن سبز باشد. **Phase A شامل هیچ طراحی یا UI نیست.**

## ۰. پیش‌نیازها (بررسی‌شده در 2026-11-11)

| مورد | وضعیت |
|---|---|
| Node 25.2 · npm 11.6 | ✅ |
| Python 3.13.7 | ✅ |
| Docker Desktop 29.1.3 (daemon در حال اجرا) | ✅ |
| git 2.39 + هویت سراسری | ✅ |
| فضای دیسک | ✅ 29GB آزاد |
| ⚠️ `NODE_TLS_REJECT_UNAUTHORIZED=0` (تنظیم‌شده در launchd) | بررسی گواهی TLS برای ابزارهای Node خاموش است. **همه دستورات نصب با `env -u NODE_TLS_REJECT_UNAUTHORIZED` اجرا می‌شوند** تا بررسی TLS فعال باشد. اگر شبکه شما بدون این تنظیم کار نکند، کار را متوقف می‌کنم و از شما می‌پرسم |

## ۱. Git

- `git init` در ریشه پروژه. **پیش از اولین commit، branch `phase-a-foundation` ساخته می‌شود.** هیچ commit مستقیمی روی `main` انجام نمی‌شود.
- **هر Task یک commit** دارد با پیام `A0x: …` و خط `Co-Authored-By`.
- اولین commit شامل اسناد تأییدشده `docs/` است، به‌عنوان خط مبنا.
- پایان فاز: **با تأیید شما** به `main` ادغام می‌شود.
- Remote وجود ندارد، پس push هم انجام نمی‌شود. CI بعد از ساخت repository روی GitHub اضافه می‌شود.

## ۲. Taskها

### Task 1 · A01 — Repository
- `git init` ← `git checkout -b phase-a-foundation`
- فایل `.gitignore` شامل:
  - `node_modules` · `.next` · `.env*` (به‌جز `.env.example`)
  - `.venv` · `__pycache__` · `staticfiles`
  - `playwright-report` · `test-results` · `.DS_Store`
- `README.md`: معرفی، پیش‌نیازها، و دستورات اجرا و تست. در هر Task تکمیل می‌شود.
- `CLAUDE.md`: قوانین پروژه برای جلسات بعدی:
  - Gateها و قالب گزارش Task
  - صداقت فنی (`NOT RUN`)
  - ممنوعیت محتوای پزشکی ساختگی
  - CSS منطقی (logical properties) و انیمیشن فارسی فقط در سطح کلمه
  - ارجاع به `docs/`
- **تست:** `git check-ignore -q .env` · خروجی خالی `git status --porcelain` بعد از commit

### Task 2 · A02 — Next.js
- دستور ساخت:

  ```bash
  npx create-next-app@16 frontend --ts --tailwind --eslint --app --src-dir \
    --import-alias "@/*" --use-npm --empty --disable-git --no-agent-feedback --yes
  ```

- اگر React Compiler فعال شده باشد، غیرفعال می‌شود (فعلاً لازم نیست). فونت‌ها و boilerplate پیش‌فرض حذف می‌شوند.
- در `next.config.ts`: `output: 'standalone'` و `poweredByHeader: false`.
- `NEXT_TELEMETRY_DISABLED=1` تنظیم می‌شود، به خاطر حریم خصوصی.
- **معیار پذیرش:** `npm run build` · `npx tsc --noEmit` · `npm run lint` همه موفق.

### Task 3 · A03 — Django
- `python3 -m venv backend/.venv`
- `requirements.txt` با نسخه‌های دقیق (`pip freeze`): Django 5.2.x · DRF 3.18.x · psycopg[binary] 3.3.x
- سایر پکیج‌ها، مثل phonenumbers، otp، axes، whitenoise و gunicorn، **در فاز خودشان** اضافه می‌شوند (D و H).
- `django-admin startproject config backend` ← `manage.py startapp leads`
- `settings.py`:
  - یک تابع کمکی `env()` که در نبود متغیر الزامی فوراً خطا می‌دهد.
  - اتصال به DB از متغیرهای `POSTGRES_*`.
  - `TIME_ZONE='Europe/Istanbul'`.
  - مسیر Admin از `DJANGO_ADMIN_PATH`.
  - `STATIC_URL='/django-static/'`.
- **معیار پذیرش:** `manage.py check` موفق.

### Task 4 · A04 — PostgreSQL (فقط برای توسعه)
- فایل `infrastructure/compose.dev.yml`:
  - image ‏`postgres:18` (نسخه Debian، تا collation با production یکسان باشد)
  - پورت فقط روی `127.0.0.1:5432`
  - healthcheck با `pg_isready`
- **Volume روی `/var/lib/postgresql`**، نه مسیر قدیمی `/data`. در image نسخه 18 مسیر PGDATA تغییر کرده است.
- `manage.py migrate`
- **تست:** وضعیت `healthy` کانتینر · خروجی migrate · `showmigrations` همه [X]

### Task 5 · A05 — Environment
- **یک فایل `.env` در ریشه پروژه**، منبع واحد برای توسعه محلی:
  - Docker Compose با `--env-file .env` آن را می‌خواند.
  - Django با یک loader حدود ۶ خطی (فقط stdlib) آن را می‌خواند. متغیرهای واقعی محیط اولویت دارند.
  - Next.js با `loadEnvConfig` از پکیج `@next/env` آن را از ریشه بارگذاری می‌کند.
- `.env.example` شامل همه متغیرهای `ARCHITECTURE.md` §۸، با توضیح و بدون هیچ مقدار محرمانه.
- `.env` محلی با secretهای تصادفی ساخته می‌شود (`secrets.token_urlsafe`). **هیچ‌وقت در گزارش‌ها نمایش داده نمی‌شود.**
- **تست:**
  - اجرای `manage.py check` بدون env باید خطایی بدهد که نام متغیر را ذکر کند.
  - اجرای build با `NEXT_PUBLIC_SITE_URL` خالی باید پیام روشن بدهد.
  - با env کامل، هر دو باید موفق شوند.

### Task 6 · A06 — Localization
- نصب `next-intl` (4.14.x).
- `src/i18n/routing.ts`:
  - زبان‌ها: `fa`، `en`، `de`، `tr`
  - `defaultLocale: 'en'` و `localePrefix: 'always'`
  - **pathnames** کامل جدول §۲ سند Multilingual
  - `alternateLinks: false` (hreflang در F06 از طریق metadata اضافه می‌شود)
- فایل‌های `src/i18n/request.ts`، `src/i18n/navigation.ts` و `src/proxy.ts` (در Next 16 جایگزین middleware شده است).
- `app/[locale]/layout.tsx`:
  - `<html lang dir>` (برای `fa` مقدار `rtl`)
  - `hasLocale` ← `notFound()`
  - `setRequestLocale` و `generateStaticParams`
- یک صفحه placeholder ساده که فقط یک متن ترجمه‌شده نشان می‌دهد.
- اسکلت فایل‌های `messages/{fa,en,de,tr}.json`.
- `onError` در صورت **پیام گم‌شده، build را متوقف می‌کند**.
- **تست:**

  ```bash
  curl -sI -H 'Accept-Language: de-AT' localhost:3000/   # → location: /de
  curl -sI -H 'Accept-Language: fa-IR' localhost:3000/   # → /fa
  curl -sI -H 'Accept-Language: ja'    localhost:3000/   # → /en
  curl -s localhost:3000/fa | grep 'dir="rtl"'
  ```

### Task 7 · A07 — Design Tokens
- تعریف `@theme` در `src/app/globals.css` (مسیر پیش‌فرض create-next-app؛ `ARCHITECTURE.md` به‌روز می‌شود):
  - رنگ‌های primitive و semantic
  - radius، shadowها، z-index
  - `ease-*` و مدت‌زمان‌ها
  - padding سکشن‌ها
- حذف حالت تاریک پیش‌فرض.
- **محافظ RTL:** یک تست که کد را برای کلاس‌های فیزیکی جست‌وجو می‌کند (`ml-` · `pr-` · `left-` · `text-right` · `rounded-l-` و مشابه) و در صورت پیدا کردن، شکست می‌خورد.
- **تست:** بودن همه رنگ‌های DESIGN_SYSTEM در `@theme` · تست محافظ RTL.

### Task 8 · A08 — زیرساخت تست
- در tsconfig: `allowImportingTsExtensions` و `erasableSyntaxOnly`. این دو اجازه می‌دهند `node:test` فایل‌های TS را مستقیم اجرا کند (D-043).
- `npm test` ← `node --test "tests/unit/**/*.test.ts"`، شامل:
  - تست **یکسان بودن کلیدهای ۴ زبان**
  - تست محافظ RTL
  - تست وجود توکن‌ها
- **Playwright** به‌همراه `@axe-core/playwright`، **فعلاً فقط Chromium**. WebKit و Firefox در فاز H اضافه می‌شوند، که حدود 500MB دانلود را فعلاً حذف می‌کند.
  - ماتریس ریدایرکت زبان
  - بررسی `dir` و `lang` هر زبان
  - تست دسترس‌پذیری با axe: صفر خطای serious یا critical
- **Django:** `leads/tests/test_smoke.py`:
  - اتصال واقعی به PostgreSQL
  - صفحه ورود Admin روی مسیر env پاسخ 200 بدهد
- README: بخش «اجرای تست‌ها».

## ۳. معیار پایان فاز (Milestone M1)

- [ ] هر ۴ زبان build و render می‌شوند و `lang` و `dir` درست است
- [ ] PostgreSQL 18 در Docker اجرا می‌شود و migrate موفق است
- [ ] `npm test` · `npx playwright test` · `manage.py test` همه سبزند
- [ ] ۸ commit در `phase-a-foundation`، به‌اضافه گزارش استاندارد هر Task (قانون ۳)

## ۴. خارج از Phase A

- UI و طراحی (فاز B)
- فونت‌ها (B01)
- مدل Lead (فاز D)
- Dockerfileهای web و api (H06)
- CI (تا ساخت remote)
- Prettier و Ruff: اگر تیم بزرگ شد اضافه می‌شوند
