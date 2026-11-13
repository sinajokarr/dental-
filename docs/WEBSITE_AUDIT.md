# WEBSITE AUDIT — JOKAR DENTAL (V6 · Phase 01)

> تاریخ: 2026-11-13 · شاخه `luxury-v5` (commit `9c58cbc`) · فقط مشاهده — هیچ فایل اجرایی تغییر نکرده است.
> روش: خواندن Repository، شمارش کلیدهای ترجمه، و مشاهده‌های ثبت‌شده در این جلسه (screenshot و تست Playwright). هر چیزی که مشاهده نشده، گزارش نشده است.

## ۱. Repository (TASK 01.01)

| حوزه | وضعیت واقعی |
|---|---|
| Frontend | Next.js 16 (App Router) + TypeScript + Tailwind 4؛ next-intl برای ۴ زبان (`fa` RTL، `en`، `de`، `tr`) |
| Backend | Django 5.2 + DRF + PostgreSQL؛ API فقط داخلی؛ Lead → Telegram (فقط کد پیگیری و متادیتا) |
| Animation | CSS-only برای تصاویر خدمات و Hero؛ GSAP نصب است؛ `three` + R3F فقط برای فایل‌های قدیمی Hero (۳D دندان) که **دیگر mount نمی‌شوند** (`components/three/hero-tooth`, `public/models/tooth.bin` ۲۶۴KB، `tooth-poster.png`، `tooth-scan.png`) |
| Design tokens | `globals.css` `@theme` — پالت Beige Agate / Blue Gentian / Warm Ivory (D-079) |
| ترجمه | `frontend/messages/{fa,en,de,tr}.json`؛ ۱۷۷ کلید در `en` (فهرست بالاترین سطح در §۳) |
| فرم‌ها | `LeadForm` / `ConsultationForm` + Server Action؛ WhatsApp در Header، StickyCta، هر صفحه |
| تست | unit + Playwright: ۱۸۵ passed / ۳ skipped (آخرین اجرا، commit `9c58cbc`) |

## ۲. Visual Audit (TASK 01.02) — فقط موارد مشاهده‌شده

1. **صفحه‌های درمان هنوز نقاشی SVG قدیمی (`TreatmentDrawing`) دارند** و با رندرهای صفحهٔ اصلی هم‌خانواده نیستند؛ یعنی کاربر روی «بیشتر بدانید» از تصویر واقع‌گرا به خط‌کشی ساده می‌رسد. (کد: `TreatmentPage.tsx`، `data-draw-load` + `TreatmentDrawing`)
2. **رندر Veneer:** یقهٔ لثه شبیه «سطل» است و رندر کلی هنوز کمی پلاستیکی/مدل‌وار؛ **رندر Smile:** صفحهٔ لثه شبیه یک نوار صورتی است (مشاهدهٔ مستقیم در frameهای `sr2_all.png`). این‌ها رندر رویه‌ای‌اند، نه عکس.
3. **Hero:** عکس stock یک فرد واقعی (Unsplash) — کیفیت خوب ولی بدون model release؛ هویت «کلینیک» نیست.
4. **بخش‌های تیره:** سه باند `bg-band` (#3C4C66) در صفحهٔ اصلی (Journey، Finale، Footer) و یکی در هر صفحهٔ درمان (بیماران بین‌المللی). پرامپت می‌گوید آبی تیره در سطح بزرگ نباید بی‌دلیل باشد؛ این‌ها هرکدام بخش مستقل‌اند ولی **یک ضعف بالقوه‌اند** (تصمیم D-بعدی).
5. **متن:** تکرار «We speak your language / Your trip, coordinated / Most visits take 3 to 8 days» در Home، About، International و صفحات درمان (۴ بار). تکرار عمدی برای SEO/اعتماد بوده ولی حس برند ندارد.
6. **Responsive:** در تست‌ها نه overflow افقی دیده شد و نه شکست layout (Playwright روی ۵ پروژه). بررسی چشمی همهٔ ۱۶ ترکیب صفحه/زبان در اندازه‌های موبایل انجام نشده: **NOT RUN**.

## ۳. Route & Content Inventory (TASK 01.03)

| Route (هر ۴ زبان: `/{fa,en,de,tr}…`) | هدف | بخش‌های فعلی | CTA | کمبود محتوا |
|---|---|---|---|---|
| `/` | معرفی + تبدیل | Hero پرتره، TrustStrip، Treatments (۳ رندر)، Why، Journey، FAQ، Consultation، Finale | مشاوره رایگان، WhatsApp | عنوان‌ها generic؛ شعار برند ندارد |
| `/dental-implants` | آموزش + تبدیل | Hero+نقاشی، What، Who، How(۴)، Intl، FAQ(۳)، فرم | مشاوره، WhatsApp | مواد، مراقبت، ریسک، آناتومی، مراحل تفصیلی، نمای علمی — **ندارد** |
| `/dental-veneers` | همان | همان | همان | همان + Layer Explorer |
| `/smile-design` | همان | همان | همان | همان + تحلیل تناسب |
| `/international-patients` | اعتماد بین‌الملل | ۶ سرویس، اقامت، شهرها | WhatsApp، فرم | بدون قیمت/پکیج (عمداً) |
| `/about` | معرفی | ۵ بخش کوتاه | مشاوره | — |
| `/free-consultation` | فرم | LeadForm | ارسال | — |
| `/privacy` `/kvkk` `/legal-notice` | حقوقی | پیش‌نویس (`consent_version=draft-1`) | — | **بازبینی حقوقی** |

کلیدهای ترجمهٔ `en` (۱۷۷ برگ): home ۳۴، nav ۱۸، form ≈ ۴۷، treatments (۳×۶ بخش)، international، about، legal، cities، meta. **تقارن کلیدها بین ۴ زبان توسط تست unit کنترل می‌شود**؛ تقارن «معنا» کنترل ماشینی ندارد (فقط بازبینی انسانی).

## ۴. مسیرهای صفحهٔ درمان (TASK 05.01)

مسیرهای فعلی **دقیقاً همان‌هایی‌اند که V6 مثال زده**: `/dental-implants`، `/dental-veneers`، `/smile-design` با پیشوند زبان. تغییری لازم نیست؛ لینک «Learn more» به صفحهٔ همان زبان می‌رود (تست e2e موجود). نیازی به تأیید برای تغییر مسیر نیست.

## ۵. مسائل فنی ثبت‌شده

- iCloud روی Desktop فایل‌ها را offload می‌کند؛ کار روی clone در scratchpad و انتقال شاخه‌ها (ثبت در حافظه).
- Lighthouse، دستگاه واقعی، screen reader: **NOT RUN**.
- ۳ تست skipped (مرورگر/پروژه‌های خاص، قبلاً ثبت شده).
