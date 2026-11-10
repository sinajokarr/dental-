# JOKAR DENTAL — پکیج نهایی بررسی (Design & Architecture)

> تاریخ: 2026-11-11 · وضعیت: **آماده بررسی کارفرما** · فاز طراحی تمام شده و **هیچ کدی نوشته نشده است**

## ۱. خلاصه اجرایی

- **چه می‌سازیم:** یک وب‌سایت لوکس و چهارزبانه (fa، en، de، tr) برای JOKAR DENTAL. سه خدمت ایمپلنت، لمینت و طراحی لبخند در آنتالیا و استانبول، با مشاوره اولیه رایگان و خدمات کامل بیماران بین‌المللی.
- **هویت بصری:** «**Arctic Porcelain**». سفیدی قطبی، شیشه کنترل‌شده، تایپوگرافی serif شبیه برندهای جواهر، و یک دندان سه‌بعدی پرسلنی با ریشه‌های یخی.
- **هدف تجاری:** هر بازدید به درخواست مشاوره تبدیل شود، از طریق فرم یا WhatsApp. هر Lead در Django ثبت می‌شود و اعلان آن به Telegram می‌رسد.
- **اصول:** فقط اطلاعات واقعی و تأییدشده · سرعت بالا در موبایل · دسترس‌پذیری WCAG 2.2 AA · امنیت و حریم خصوصی از روز اول.
- **خارج از محدوده فعلی:** Google Ads، مارکتینگ و Tracking (فاز I).

## ۲. فهرست اسناد

| سند | محتوا |
|---|---|
| [PROJECT_BRIEF.md](PROJECT_BRIEF.md) | اطلاعات تأییدشده و ۱۳ سؤال باز |
| [DECISIONS.md](DECISIONS.md) | ۵۲ تصمیم ثبت‌شده، هر کدام با دلیل |
| [RESEARCH.md](RESEARCH.md) | بررسی React Bits، Aceternity و Codrops؛ License‌ها؛ مدل سه‌بعدی؛ کنتراست رنگ‌ها |
| [CREATIVE_DIRECTION.md](CREATIVE_DIRECTION.md) | سه Concept و Concept منتخب |
| [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) | توکن‌ها، تایپوگرافی، Glass، کامپوننت‌ها، Art Direction |
| [SITEMAP_AND_USER_FLOWS.md](SITEMAP_AND_USER_FLOWS.md) | صفحات، منوها، شش مسیر کاربر |
| [MULTILINGUAL_SEO_ARCHITECTURE.md](MULTILINGUAL_SEO_ARCHITECTURE.md) | Routing، اسلاگ‌ها، RTL، SEO چندزبانه |
| [3D_HERO_MASTER_PLAN.md](3D_HERO_MASTER_PLAN.md) | طرح کامل دندان سه‌بعدی |
| [ANIMATION_MASTER_PLAN.md](ANIMATION_MASTER_PLAN.md) | ۲۵ انیمیشن با فناوری، هزینه و تست هر کدام |
| [HOMEPAGE_UX_SPEC.md](HOMEPAGE_UX_SPEC.md) | مشخصات UX هر سکشن صفحه اصلی و معیار پذیرش |
| [INTERNATIONAL_PATIENT_FUNNEL.md](INTERNATIONAL_PATIENT_FUNNEL.md) | مسیر بیمار، مخاطبان، سیاست ادعاها |
| [LEAD_MANAGEMENT_AND_FORM_SPEC.md](LEAD_MANAGEMENT_AND_FORM_SPEC.md) | فرم، مدل داده، وضعیت‌ها، Django Admin |
| [WHATSAPP_TELEGRAM_INTEGRATION.md](WHATSAPP_TELEGRAM_INTEGRATION.md) | پیام‌های آماده در ۴ زبان؛ اعلان امن Telegram |
| [API_SPEC.md](API_SPEC.md) | قرارداد API و Server Action |
| [ARCHITECTURE.md](ARCHITECTURE.md) | معماری، Stack و نسخه‌ها، ساختار Repository، استقرار |
| [SECURITY_PERFORMANCE_QA.md](SECURITY_PERFORMANCE_QA.md) | بودجه‌های Performance، WCAG، امنیت، KVKK و GDPR، QA |
| [CRO_TRACKING_PLAN.md](CRO_TRACKING_PLAN.md) | ⏸ اصول Tracking برای فاز مارکتینگ |
| [PROJECT_ROADMAP.md](PROJECT_ROADMAP.md) | فازها، مسیر بحرانی، Gateها، ورودی‌های لازم |
| [TASK_TRACKER.md](TASK_TRACKER.md) | همه Taskها با پیش‌نیاز، فایل‌ها، معیار پذیرش و روش تست |
| [QA_CHECKLIST.md](QA_CHECKLIST.md) | چک‌لیست قبل از Launch |

## ۳. تصمیمات بصری

| مورد | تصمیم |
|---|---|
| Concept | **Arctic Porcelain**: ساختار، رنگ و Glass از Concept A؛ Hero و تایپوگرافی از Concept B |
| رنگ | حدود ۷۰٪ سفید و Ice، ۱۵٪ Sky، ۱۵٪ Navy. **Navy فقط در International و Finale.** همه ترکیب‌های متن و پس‌زمینه محاسبه شده‌اند و WCAG AA را پاس می‌کنند |
| فونت | Cormorant Garamond (عنوان‌ها) و Manrope (متن) برای en، de و tr؛ **Vazirmatn** برای فارسی. همه OFL و self-host |
| Glass | ۴ دستورالعمل (nav، card، strong، dark)؛ حداکثر ۳ لایه blur هم‌زمان؛ fallback مات |
| امضای بصری | **Porcelain Edge**: لبه گرادیانی یک‌پیکسلی کارت‌ها |
| تصاویر | Stock دارای License **فقط برای فضاسازی**، به‌همراه renderهای اختصاصی از مدل سه‌بعدی برند |

## ۴. Hero سه‌بعدی

- **ایده:** دندان آسیای فک پایین. **تاج از پرسلن و ریشه‌ها از یخ شیشه‌ای** (نسخه جایگزین: پرسلن کامل، که انتخابش با شماست).
- **تجربه:**
  - متن و دکمه‌ها همان لحظه اول دیده می‌شوند.
  - بعد ورود سینمایی دوثانیه‌ای با عبور نور.
  - بعد شناوری کوتاه و نشستن آرام.
  - بعد از آن، دندان با حرکت ماوس یا لمس واکنش نشان می‌دهد.
- **سه سطح دستگاه:**
  - دسکتاپ: متریال کامل
  - موبایل: متریال سبک
  - دستگاه ضعیف یا Reduced motion: تصویر ثابت با یک عبور نور CSS
- **بودجه:** مدل ≤ 150KB · بدون فایل HDRI و بدون post-processing · اثر روی LCP ≤ 100ms.
- **پایداری:** اگر 3D به هر دلیلی بارگذاری نشود، poster باقی می‌ماند. **Launch سایت به 3D وابسته نیست.**

## ۵. انیمیشن‌ها

- **۲۵ انیمیشن کاتالوگ‌شده.** هر کدام هدف، فناوری، هزینه، رفتار در Reduced motion و روش تست دارد.
- **CSS:** برای ۸۰٪ حرکات.
- **GSAP:** فقط سه choreography، با lazy-load.
- **هیچ‌کدام از این‌ها:** preloader، smooth-scroll، custom cursor یا کاروسل خودکار.
- **قانون:** انیمیشن **هرگز** متن، LCP یا اسکرول را معطل نمی‌کند.

## ۶. ساختار صفحات (Phase 1)

| صفحه | توضیح |
|---|---|
| Home | ۹ سکشن فعال؛ ۳ سکشن آماده ولی خاموش (پزشکان، فناوری، نظرات) تا رسیدن داده واقعی |
| Implants · Veneers · Smile Design | یک قالب مشترک |
| International Patients | مسیر بیمار و خدمات سفر |
| Free Consultation | فرم و WhatsApp |
| About | منتظر متن شما |
| صفحات حقوقی | Privacy، KVKK، Legal Notice |
| 404 | — |

همه صفحات در ۴ زبان، با اسلاگ محلی (مثلاً `/de/zahnimplantate`) و RTL کامل برای فارسی.

## ۷. معماری و فناوری

```text
Browser ─► Caddy (HTTPS) ─┬─► Next.js 16 (SSG + Server Action) ──internal──► Django 5.2 LTS + DRF ─► PostgreSQL 18
                          └─► Django Admin (2FA)            worker ─► Telegram (فقط اعلان حداقلی)
```

- **Frontend:** Next.js 16، React 19، TypeScript، Tailwind 4، next-intl 4، three، R3F 9، Drei 10، GSAP 3.15.
- **Backend:** Django 5.2 LTS، DRF 3.18، PostgreSQL 18، phonenumbers، django-otp، django-axes.
- **حذف آگاهانه:** Celery، Redis، CMS، Motion، کتابخانه UI و SDK تلگرام.
- **زیرساخت:** یک VPS با Docker Compose. منطقه میزبانی را مشاور حقوقی تعیین می‌کند.

## ۸. مسیر یک Lead

```text
فرم (۵ فیلد الزامی) ─► Server Action ─► Django API (اعتبارسنجی، idempotency، rate limit)
   ─► PostgreSQL (کد پیگیری JD-XXXXXX) ─► پیام موفقیت + WhatsApp با همان کد پیگیری
   ─► Telegram: فقط کد پیگیری، زبان، کشور، خدمت، شهر و لینک Admin. Retry خودکار؛ Lead هرگز گم نمی‌شود
   ─► Django Admin: فیلترها، وضعیت‌ها، یادداشت‌ها، تماس با یک کلیک در WhatsApp
```

## ۹. کیفیت

| حوزه | تعهد |
|---|---|
| Performance | LCP ≤ 2.5s، INP ≤ 200ms، CLS برابر ۰؛ JS اولیه ≤ 170KB؛ صفحات SSG |
| دسترس‌پذیری | WCAG 2.2 AA. موارد ویژه: کادر فیلدها، حرکت خودکار ≤ 5s، پنهان نشدن focus زیر Nav و Sticky bar |
| امنیت | API و DB غیرعمومی؛ 2FA برای Admin؛ CSP؛ Backup رمزنگاری‌شده با تست بازیابی |
| حریم خصوصی | حداقل داده؛ نگهداری نکردن IP خام؛ فهرست موضوعات KVKK و GDPR برای مشاور حقوقی |
| صداقت فنی | هیچ نتیجه‌ای بدون تست واقعی گزارش نمی‌شود؛ تست‌های اجرانشده `NOT RUN` نوشته می‌شوند |

## ۱۰. ریسک‌های کلیدی

| # | ریسک | اثر | راهکار |
|---|---|---|---|
| 1 | **کمبود شواهد اعتماد** (پزشکان، نظرات، عکس واقعی، آدرس) | Conversion کمتر | سکشن‌ها آماده و خاموش‌اند؛ جمع‌آوری این داده‌ها مهم‌ترین کار غیرفنی است |
| 2 | مدل سه‌بعدی (خرید و کار Blender) روی مسیر بحرانی است | تأخیر فاز C | معرفی کاندیدها از ابتدای فاز C؛ امکان سپردن کار به آرتیست؛ poster به‌عنوان fallback برای Launch |
| 3 | دیر پیدا شدن مترجم پزشکی آلمانی و ترکی (Q7) | تأخیر Launch آن دو زبان | گزینه انتشار مرحله‌ای: اول fa و en |
| 4 | نتیجه بررسی حقوقی (انتقال داده، Telegram، منطقه میزبانی) | تغییر محتوای اعلان یا محل میزبانی | معماری مستقل از میزبان است و محتوای اعلان با یک خط کد تغییر می‌کند |
| 5 | Performance سه‌بعدی روی Android ضعیف | INP و تجربه کاربری | سه Tier، PerformanceMonitor، بودجه‌ها، تست روی دستگاه واقعی |
| 6 | دامنه و میزبانی هنوز مشخص نیست | انسداد H06 و H07 | تصمیم‌گیری تا پیش از فاز H |
| 7 | اسپم فرم بدون CAPTCHA | Leadهای جعلی | Honeypot، rate limit، و افزودن Turnstile در صورت نیاز |

## ۱۱. ورودی‌های لازم از شما

| ورودی | زمان |
|---|---|
| تأیید خرید مدل سه‌بعدی (DP1) | پایان فاز B |
| زبان کارکنان و مترجم‌ها (Q13) | شروع فاز F |
| مترجم یا بازبین پزشکی (Q7) | فاز F |
| جزئیات پکیج‌ها (Q11) · متن About (Q10) | فاز G |
| متن‌های حقوقی و اطلاعات شرکت (Q8، Q12) · ایمیل رسمی (Q9) | قبل از فاز H |
| Telegram Bot و گروه (Q5) · دامنه · منطقه میزبانی (Q6) | قبل از فاز H |
| **پیشنهادی (اثر زیاد):** پزشکان (Q2)، نظرات واقعی (Q3)، عکس واقعی، تجهیزات (Q4) | هر زمان آماده شد |

## ۱۲. نقشه اجرایی

```text
A Foundation ─► B Design System ─(G1)─► C Homepage + 3D ─(DP1 · DP2 · G3)─┐
                 └─► D Backend ─► E Form & WhatsApp ───────────────────────┼─► G Inner Pages ─► H QA & Launch (G5) 🚀
F Content & Translation (G4) ──────────────────────────────────────────────┘
```

جزئیات هر Task در `TASK_TRACKER.md` آمده است. بعد از هر Task، گزارش استاندارد قانون ۳ ارائه می‌شود.

## ۱۳. خارج از محدوده Phase 1

- Google Ads، GTM و GA4، Landing Pageهای تبلیغاتی و Tracking
- صفحات شهری آنتالیا و استانبول
- صفحه پزشکان
- CMS
- آپلود فایل در فرم
- خروجی CSV از Leadها
- Blog

## ۱۴. تأیید

بعد از بررسی، در صورت موافقت، این جمله را بنویسید:

> **«طرح و معماری Jokar Dental را تأیید می‌کنم؛ فاز کدنویسی را شروع کن.»**

پس از آن، ابتدا برنامه اجرایی **Phase A** ارائه می‌شود و Task اول (A01) فقط بعد از تأیید آن برنامه شروع می‌شود.
