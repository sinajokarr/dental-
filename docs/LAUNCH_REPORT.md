# JOKAR DENTAL — گزارش آمادگی Launch (H07/H08)

> تاریخ: 2026-11-11 · branch `phases-b-h` · وضعیت: **آماده از نظر فنی؛ Launch منتظر چهار کار کارفرماست** · Gate G5: **باز** (هنوز عبور نکرده)

## ۱. خلاصه

سایت از نظر فنی کامل است و نسخه Production آن روی همین سیستم، با همان Docker Compose و Caddy که روی سرور اجرا می‌شود، راه‌اندازی و تست شد.

- صفحه اصلی با دندان سه‌بعدی (ورود «اسکن دیجیتال») و انیمیشن‌های اسکرول
- سه صفحه درمان، بیماران بین‌المللی، مشاوره رایگان، درباره ما، پیش‌نویس صفحات حقوقی و ۴۰۴، همه در **۴ زبان**
- فرم مشاوره متصل به Django Admin، با و بدون JavaScript
- SEO چندزبانه
- عکس‌های لایسنس‌دار آنتالیا و استانبول (Unsplash) فقط برای نمایش شهرها (D-072)

**Deployment روی سرور واقعی انجام نشده (NOT RUN)**، چون دامنه و سرور هنوز تهیه نشده‌اند.

## ۲. کارهایی که با کارفرماست (مانع Launch)

| # | کار | چرا لازم است | بعد از انجام، ما چه می‌کنیم |
|---|---|---|---|
| 1 | **خرید دامنه و سرور** (Q6) | بدون دامنه، HTTPS، SEO و آدرس نهایی وجود ندارد. پیشنهاد: یک VPS با ۲ CPU و ۴GB RAM، در ترکیه یا اتحادیه اروپا (تصمیم حقوقی KVKK/GDPR) | تنظیم DNS، پر کردن `.env.production`، اجرای ۶ قدم README (بخش Production)، اجرای `infrastructure/smoke.sh` |
| 2 | **ساخت بات Telegram** (Q5) | اعلان فوری Lead جدید به تیم | قرار دادن `TELEGRAM_BOT_TOKEN` و `TELEGRAM_CHAT_ID` فقط در `.env.production` روی سرور (نه در چت)، تست با `send_test_notification` |
| 3 | **بازبینی متن‌های حقوقی** (Q8/Q12) | Privacy، KVKK و Legal notice فعلاً پیش‌نویس‌اند و برچسب «پیش‌نویس» و noindex دارند. نام حقوقی شرکت هم لازم است | جایگزینی متن نهایی، حذف برچسب پیش‌نویس و noindex، تغییر `consent_version` از `draft-1` به نسخه نهایی |
| 4 | **بازبینی ترجمه‌های پزشکی** (Q7) | متن‌های درمانی فارسی، آلمانی و ترکی باید توسط متخصص بومی بازبینی شوند | اعمال اصلاحات در `messages/*.json`؛ گارد خودکار ادعاها دوباره همه را بررسی می‌کند |

## ۳. نتیجه تست‌ها (اجرای واقعی)

| مجموعه | نتیجه |
|---|---|
| تست واحد Frontend (`node:test`) | **49/49** |
| Django | **38/38** |
| E2E (Chromium، کل مجموعه) | **160 passed** (۱ skipped: تست مخصوص گوشی) |
| E2E روی همه موتورها (Chromium + Firefox + WebKit + iPhone 13 + Pixel 7) | **178 passed** (۳ اجرای کامل پشت‌سرهم؛ در یک اجرای قبلی، تست فرم Firefox یک بار زیر بار شکست خورد و در ۳ اجرای کامل و ۱۲ اجرای جداگانه تکرار نشد) |
| E2E روی stack محلی Production (Caddy → Next → Django → PostgreSQL) | **144 passed** |
| Smoke روی Production (`infrastructure/smoke.sh`) | **18/18** |
| دسترس‌پذیری (axe) | ۱۱ نوع صفحه × فارسی و انگلیسی: بدون خطای serious/critical |

## ۴. Performance (Lab)

| معیار | بودجه | نتیجه |
|---|---|---|
| JS اولیه | ≤ 170KB gzip | **167KB** |
| CSS | ≤ 35KB | **10KB** |
| فونت‌ها (هر زبان) | ≤ 120KB | فارسی **72KB** · لاتین **102KB** |
| LCP (موبایل کند: 1.6Mbps، 150ms، CPU ×4) | ≤ 2.5s | **0.78–1.12s** |
| CLS | ≤ 0.1 (هدف ۰) | **0.000** (حتی وقتی فونت دیر برسد) |
| تصویر Hero | ≤ 120KB | **7KB** |

Lighthouse: **NOT RUN** (اجرای `npx lighthouse` با سیستم مجوز متوقف شد)؛ پس از Launch، PageSpeed Insights روی دامنه امتیاز رسمی را می‌دهد. WebPageTest و داده واقعی کاربران (CrUX) هم به دامنه نیاز دارند.

## ۵. امنیت

- هدرهای HSTS، CSP، `X-Frame-Options`، `nosniff`، `Referrer-Policy` و `Permissions-Policy` تأیید شدند؛ با CSP هیچ خطایی در console دیده نشد.
- API داخلی از بیرون در دسترس نیست (404).
- Rate limit با IP واقعی بازدیدکننده کار می‌کند.
- `check --deploy` در کانتینر بدون هشدار است؛ 2FA برای Admin اجباری است.
- `npm audit` (وابستگی‌های محصول) و `pip-audit` بدون آسیب‌پذیری.
- تست نفوذ مستقل و ثبت HSTS preload: **NOT RUN**.

## ۶. زیرساخت

- Docker Compose شامل PostgreSQL 18، Django (gunicorn)، worker اعلان Telegram، Next.js standalone، Caddy (HTTPS خودکار) و backup روزانه با نگهداری ۱۴ روز.
- تمرین بازگردانی backup انجام شد: dump، بازگردانی در دیتابیس تازه و پیدا شدن Lead تست؛ فایل‌های backup فقط برای مالک قابل خواندن‌اند.
- چرخش لاگ همه سرویس‌ها (۵ × 10MB)؛ آدرس Admin بدون «/» به آدرس درست هدایت می‌شود.
- یک Lead واقعی از مسیر کامل HTTPS ثبت و در دیتابیس Production تأیید شد.

## ۷. موارد باز غیرمانع

| مورد | وضعیت |
|---|---|
| ایمپلنت: آیا سفر دوم لازم است؟ | متن فعلی: «بیشتر سفرها ۳ تا ۸ روز؛ تعداد سفرها در مشاوره مشخص می‌شود» |
| مدت ضمانت هر درمان | متن فعلی: «شرایط ضمانت به نوع درمان بستگی دارد» |
| لوگوی رسمی (Q1)، پزشکان (Q2)، نظرات واقعی (Q3)، تجهیزات (Q4)، عکس واقعی کلینیک | بخش‌ها با رسیدن محتوا فعال می‌شوند |
| تست روی دستگاه واقعی و screen reader (VoiceOver، NVDA، TalkBack) | NOT RUN |
| Google Ads، GA4 و Consent Mode | فاز I (D-006) |

## ۸. روز Launch (پس از انجام ۴ کار بخش ۲)

1. DNS دامنه → IP سرور؛ باز کردن پورت‌های 80 و 443.
2. `.env.production` با secretهای جدید و طولانی (هرگز در چت یا repo).
3. `docker compose -f infrastructure/compose.prod.yml --env-file .env.production up -d --build --wait`
4. ساخت کاربر Admin و اتصال TOTP.
5. `ADMIN_PATH=… sh infrastructure/smoke.sh https://<domain>`، اجرای E2E روی دامنه (`E2E_BASE_URL=https://<domain> npx playwright test -c playwright.prod.config.ts`) و یک فرم واقعی + اعلان Telegram.
6. ارسال sitemap به Google Search Console؛ Lighthouse روی دامنه.
