# SECURITY, PERFORMANCE & QA — JOKAR DENTAL

> نسخه: 1.0 · تاریخ: 2026-11-11 · وضعیت: پیش‌نویس
> قانون ۶: هیچ عدد، امتیاز یا وضعیتی بدون اندازه‌گیری واقعی گزارش نمی‌شود. اعداد زیر **هدف** هستند، نه نتیجه.

## ۱. Performance

### اهداف Core Web Vitals

صدک ۷۵، موبایل، داده واقعی کاربران:

| معیار | هدف |
|---|---|
| LCP | ≤ 2.5s |
| INP | ≤ 200ms |
| CLS | ≤ 0.1 (هدف داخلی ما: **۰**) |

در Lab، هدف امتیاز Performance حداقل ۹۰ در Lighthouse موبایل است.

### بودجه هر صفحه

موبایل، بارگذاری اولیه، **بدون** بخش‌هایی که lazy بارگذاری می‌شوند:

| منبع | سقف |
|---|---|
| JS اولیه | ≤ 170KB gzip |
| CSS | ≤ 35KB gzip |
| فونت‌ها (هر زبان) | ≤ 120KB |
| تصاویر بالای صفحه | ≤ 120KB |
| **مجموع اولیه** | **≤ 550KB** |
| فقط در Home و lazy: chunk سه‌بعدی + GLB | ≤ 250KB + ≤ 150KB |
| lazy: GSAP | حدود 40KB |

### تکنیک‌ها

- SSG برای همه صفحات.
- Server Component به‌صورت پیش‌فرض؛ فهرست Client Componentها بسته است (`ARCHITECTURE.md` §۴).
- `next/image` با AVIF/WebP، `sizes` دقیق و ابعاد ثابت.
- فونت self-host با preload مخصوص هر زبان.
- 3D و GSAP فقط lazy، بعد از LCP.
- انیمیشن‌ها فقط با transform و opacity.
- IntersectionObserver به‌جای scroll listener.
- هیچ اسکریپت شخص ثالثی در Phase 1 وجود ندارد.

### اندازه‌گیری

| نوع | ابزار | زمان |
|---|---|---|
| Lab | Lighthouse CLI (میانه ۵ اجرا، پروفایل موبایل) · WebPageTest روی دستگاه میان‌رده · Chrome Performance | هر فاز و H03 |
| Field | PageSpeed Insights و CrUX، در صورت ترافیک کافی | بعد از Launch |
| RUM اختصاصی (first-party) | Phase 2، بعد از بررسی حقوقی | — |

## ۲. دسترس‌پذیری — WCAG 2.2 AA

| SC | الزام در این پروژه |
|---|---|
| 1.1.1 | `alt` معنادار برای تصاویر محتوایی و `alt=""` و `aria-hidden` برای 3D و تصاویر تزئینی |
| 1.3.1 / 4.1.2 | HTML معنایی، landmarkها، label واقعی برای همه فیلدها |
| 1.4.3 | کنتراست متن ≥ 4.5 (محاسبه‌شده در `DESIGN_SYSTEM.md`) |
| **1.4.11** | کادر فیلدها `#727F90` (کنتراست 4.07؛ D-074). رنگ روشن مرزها `#E0D6CB` برای این کار کافی نیست |
| 1.4.10 / 1.4.12 | Reflow در عرض 320px و تحمل text spacing |
| 2.1.1 / 2.4.3 / 2.4.7 | کل سایت با keyboard قابل استفاده است، ترتیب focus منطقی است و focus ring قابل مشاهده است |
| **2.2.2** | حرکت خودکار ≤ 5s (دندان سه‌بعدی). Marquee و کاروسل خودکار نداریم |
| 2.3.1 | هیچ فلش سریعی نداریم |
| 2.4.1 | لینک Skip to content |
| **2.4.11** | `scroll-padding` به اندازه Nav و Sticky bar تا المان focus‌شده زیر آن‌ها پنهان نشود |
| 2.5.8 | اندازه هدف لمس ≥ 44px |
| 3.1.1 / 3.1.2 | `lang` در `<html>` و `lang` روی هر گزینه Language Switcher |
| 3.3.1–3.3.3 | پیام خطا کنار فیلد، به‌علاوه یک خلاصه و راهنمای اصلاح |
| **3.3.7** | کد تلفن از روی کشور پر می‌شود (ورود تکراری حذف شده) |
| **3.3.8** | ورود به Admin بدون مانع شناختی؛ paste و password manager مجاز است |
| 4.1.3 | پیام‌های وضعیت فرم در `aria-live` اعلام می‌شوند |

**روش تست:**

- خودکار: axe در Playwright، با هدف **صفر خطای serious یا critical**.
- Keyboard دستی در کل سایت.
- Screen reader: VoiceOver (macOS و iOS، شامل فارسی)، NVDA و TalkBack.
- Zoom در ۲۰۰٪ و ۴۰۰٪.

## ۳. امنیت

| تهدید | کنترل |
|---|---|
| اسپم و ربات در فرم | Honeypot، rate limit (۱۰ در ساعت و ۳۰ در روز برای هر IP)، idempotency. Turnstile فقط در صورت نیاز |
| XSS و Injection | Escape خودکار React · `dangerouslySetInnerHTML` فقط برای JSON-LD سریال‌شده · ORM خود Django · CSP |
| CSRF | بررسی Origin داخلی Server Actionها · CSRF خود Django برای Admin |
| تصاحب حساب Admin | **2FA اجباری** · django-axes · مسیر غیرپیش‌فرض · گروه‌ها با حداقل دسترسی · کوکی Secure، HttpOnly و SameSite · پایان نشست بعد از ۸ ساعت |
| نشت Secrets | فقط در env · `.env` در `.gitignore` · `import 'server-only'` · Telegram token هرگز لاگ نمی‌شود |
| در دسترس بودن عمومی API و DB | `/api` و `db` منتشر نمی‌شوند · Bearer token داخلی |
| آسیب‌پذیری وابستگی‌ها | `npm audit` و `pip-audit` در CI · Dependabot یا Renovate |
| Clickjacking | `frame-ancestors 'none'` |
| از دست رفتن داده | Backup رمزنگاری‌شده روزانه در محل خارج از سرور + تست بازیابی ماهانه |
| خرابی بدون اطلاع | پایش uptime خارجی برای صفحه اصلی و صفحه ورود Admin |

### پیش‌نویس CSP

در H04 بازبینی می‌شود.

```text
default-src 'self';
script-src 'self' 'unsafe-inline';
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob:;
font-src 'self';
connect-src 'self';
frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none';
```

- **`'unsafe-inline'` در script:** Next.js در صفحات استاتیک اسکریپت‌های inline برای hydration دارد. CSP مبتنی بر nonce صفحات را به رندر پویا مجبور می‌کند و TTFB را بدتر می‌کند. این یک مصالحه آگاهانه است و در H04 دوباره ارزیابی می‌شود.
- **`'wasm-unsafe-eval'` حذف شد (H04):** مدل دندان با فرمت باینری اختصاصی و بدون decoder WebAssembly بارگذاری می‌شود (D-061).

### نتیجه بازبینی امنیت (H04، 2026-11-11، روی stack محلی Production)

| مورد | نتیجه |
|---|---|
| هدرها (Caddy) | HSTS (یک سال، includeSubDomains، preload)، CSP بالا، `X-Frame-Options: DENY`، `nosniff`، `Referrer-Policy`، `Permissions-Policy`؛ هدر `Server` حذف است — `infrastructure/smoke.sh` |
| سازگاری CSP | Hero سه‌بعدی، GSAP، نقاشی‌ها، فرم و صفحه ورود Admin بدون هیچ خطای CSP در console |
| API داخلی | `/api/*` از بیرون 404 است؛ Server Action از شبکه داخلی Docker و با Bearer token صدا می‌زند |
| Rate limit | IP واقعی بازدیدکننده به Django می‌رسد (کلید throttle با IP کلاینت، نه IP کانتینر frontend یا Caddy) |
| Django | `check --deploy --fail-level WARNING` داخل کانتینر: بدون هشدار؛ 2FA اجباری، django-axes، مسیر Admin غیرپیش‌فرض |
| وابستگی‌ها | `npm audit --omit=dev`: ۰ آسیب‌پذیری؛ ۷ مورد moderate فقط در ابزار توسعه (ESLint) و خارج از محصول؛ `pip-audit` روی `requirements.txt`: بدون آسیب‌پذیری شناخته‌شده |
| Secrets | `.env` در هیچ image وجود ندارد (`.dockerignore`)؛ در repo فقط قالب‌ها (`.env.example`، `.env.production.example`) |
| باقی‌مانده | `'unsafe-inline'` در script-src (D-050)؛ تست نفوذ مستقل، اسکن روی دامنه واقعی و ثبت در HSTS preload list: **NOT RUN** (دامنه نداریم) |

### چک‌لیست Django

- `DEBUG=False` و `ALLOWED_HOSTS` دقیق.
- `SECURE_PROXY_SSL_HEADER` و `SESSION_COOKIE_SECURE`/`CSRF_COOKIE_SECURE`.
- `X_FRAME_OPTIONS='DENY'`.
- `manage.py check --deploy` **بدون هشدار**.

## ۴. حریم خصوصی — KVKK و GDPR

> ⚠️ این بخش **مشاوره حقوقی نیست.** فهرستی است از موضوعاتی که مشاور حقوقی کارفرما باید پیش از Launch بررسی و تأیید کند (Q8).

### فهرست داده‌ها

| داده | هدف | محل ذخیره | گیرنده | انتقال به خارج از کشور | مدت نگهداری |
|---|---|---|---|---|---|
| Lead (نام، تلفن، ایمیل، کشور، خدمت، پیام) | پاسخ به درخواست مشاوره | PostgreSQL روی VPS (منطقه Q6) | کارکنان مجاز | بسته به منطقه میزبانی | تعیین حقوقی |
| اعلان (کد پیگیری، زبان، کشور، خدمت، شهر) | اطلاع‌رسانی داخلی | Telegram | اعضای گروه | **بله** | طبق Telegram |
| گفت‌وگوی WhatsApp | ارتباطی که بیمار شروع می‌کند | Meta | — | **بله** | — |
| لاگ‌های دسترسی (IP) | امنیت | VPS | — | بسته به منطقه | ۱۴ روز |
| Backup | بازیابی | فضای off-site | — | بسته به مقصد | ۳۰ روز |
| Cookie زبان (`NEXT_LOCALE`) | ترجیح زبان | مرورگر | — | — | ۱ سال |

### موضوعات برای مشاور حقوقی

1. متن اطلاع‌رسانی KVKK (Aydınlatma Metni) و Privacy Policy به چهار زبان.
2. متن **رضایت صریح** (Açık Rıza) و جدا بودن آن از اطلاع‌رسانی؛ وضعیت داده‌های مرتبط با سلامت.
3. مکانیزم انتقال داده به خارج (KVKK ماده ۹، اصلاحیه ۲۰۲۴): برای میزبانی، Telegram و Backup.
4. لزوم ثبت در **VERBİS**.
5. شمول GDPR (ماده 3(2)) و لزوم نماینده در اتحادیه اروپا (ماده ۲۷).
6. مدت نگهداری داده و روند پاسخ به درخواست‌های حذف و دسترسی.
7. روند اطلاع‌رسانی نشت داده (KVKK و GDPR).
8. قرارداد با پردازشگرها (میزبانی و Backup).

## ۵. استراتژی QA

| سطح | ابزار | پوشش |
|---|---|---|
| Unit — Frontend | `node:test` | `waLink`، `validateLead`، تشخیص Tier، `dirSign`، بررسی hreflang |
| Unit و API — Backend | Django `TestCase` و DRF `APITestCase` | مدل‌ها، اعتبارسنجی، API، Admin، Telegram (mock) |
| E2E | Playwright | فرم در ۴ زبان، تعویض زبان، ریدایرکت `/`، حالت بدون JS، Reduced motion |
| دسترس‌پذیری | `@axe-core/playwright` + بررسی دستی | `§۲` |
| Visual | اسکرین‌شات Playwright | Hero، کارت‌ها، RTL و LTR |
| Performance | Lighthouse و WebPageTest | `§۱` |

### ماتریس دستگاه و مرورگر

- iPhone 12 به بالا (Safari)
- iPad (Safari)
- Android میان‌رده (Chrome)
- Android ضعیف با RAM ≤ 4GB
- macOS (Safari و Chrome)
- Windows (Chrome و Edge)
- Firefox دسکتاپ

### Gateهای انتشار

همه موارد `QA_CHECKLIST.md` باید ✅ باشند. موارد زیر **غیرقابل‌مذاکره** هستند:

- تست‌ها سبز باشند.
- axe صفر خطای serious یا critical گزارش کند.
- `check --deploy` تمیز باشد.
- Backup حداقل یک بار با موفقیت بازیابی شده باشد.
- تست واقعی Telegram انجام شده باشد.
- متن‌های حقوقی و پزشکی تأیید شده باشند.
