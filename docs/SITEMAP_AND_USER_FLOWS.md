# SITEMAP & USER FLOWS — JOKAR DENTAL

> نسخه: 1.0 · تاریخ: 2026-11-11 · وضعیت: پیش‌نویس
> اسلاگ‌های چندزبانه، hreflang و canonical در `MULTILINGUAL_SEO_ARCHITECTURE.md` آمده‌اند.

## ۱. صفحات Phase 1

| # | صفحه | مسیر (en) | وابستگی محتوایی | وضعیت |
|---|---|---|---|---|
| 1 | Home | `/en` | — | ✅ قابل ساخت |
| 2 | Dental Implants | `/en/dental-implants` | بازبینی پزشکی متن | ✅ قابل ساخت |
| 3 | Dental Veneers | `/en/dental-veneers` | بازبینی پزشکی متن | ✅ قابل ساخت |
| 4 | Smile Design | `/en/smile-design` | بازبینی پزشکی متن | ✅ قابل ساخت |
| 5 | International Patients | `/en/international-patients` | جزئیات پکیج‌ها (Q11) | ✅ بخش‌های عمومی |
| 6 | Free Consultation | `/en/free-consultation` | — | ✅ قابل ساخت (فرم + WhatsApp) |
| 7 | About Jokar Dental | `/en/about` | **داستان و معرفی برند از کارفرما** | ⚠️ اسکلت آماده؛ انتشار پس از دریافت متن |
| 8 | Privacy Policy (شامل بخش Cookies) | `/en/privacy` | متن حقوقی (Q8) | ⚠️ قبل از Launch |
| 9 | KVKK Aydınlatma Metni | `/en/kvkk` | متن حقوقی (Q8) | ⚠️ قبل از Launch |
| 10 | Legal Notice / Impressum | `/en/legal-notice` | اطلاعات حقوقی شرکت | ⚠️ برای مخاطب آلمانی توصیه می‌شود |
| — | 404 | — | — | ✅ چهارزبانه |

- **Treatments** صفحه مستقل ندارد. با سه خدمت، صفحه hub محتوای تکراری و کم‌ارزش می‌سازد. در منو یک dropdown است و در Home یک سکشن.
- **Contact** با **Free Consultation** ادغام شده است. آدرس نمایش داده نمی‌شود (D-003)، پس صفحه تماس جداگانه چیزی جز فرم و WhatsApp نداشت.
- صفحه **Thank-you** مستقل نداریم. موفقیت فرم به‌صورت inline نمایش داده می‌شود. اگر بعداً برای Google Ads به URL جداگانه نیاز شد، اضافه می‌شود.

## ۲. Phase 2 (منوط به محتوای واقعی)

| صفحه | شرط انتشار |
|---|---|
| Our Dentists | اطلاعات و تصاویر پزشکان (Q2) |
| Antalya و Istanbul | محتوای متمایز و واقعی برای هر شهر (طبق D-003، بدون آدرس) |
| Patient Stories | نظرات واقعی با رضایت‌نامه (Q3) |
| Technology | فهرست تجهیزات واقعی (Q4) |
| Landing Pageهای تبلیغاتی | فاز Google Ads |

---

## ۳. Navigation

### Header دسکتاپ

```text
[JOKAR DENTAL]   Treatments ▾   International Patients   About      [EN ▾] [WhatsApp] [Free Consultation]
                    ├─ Dental Implants
                    ├─ Dental Veneers
                    └─ Smile Design
```

در RTL (فارسی) کل چیدمان قرینه می‌شود و لوگو در سمت راست قرار می‌گیرد.

### Header موبایل

```text
[JOKAR DENTAL]                       [FA ▾] [☰]
```

منوی تمام‌صفحه شامل این موارد است: سه خدمت، International Patients، About، و در پایین منو دکمه‌های Free Consultation و WhatsApp.

### Sticky Bar موبایل

```text
[ WhatsApp ]  [ Free Consultation ]
```

### Footer

| Treatments | Patients | Company | Legal | Contact |
|---|---|---|---|---|
| Implants · Veneers · Smile Design | International Patients · Free Consultation | About | Privacy · KVKK · Legal Notice | WhatsApp · زبان‌ها |

---

## ۴. ساختار صفحه اصلی

ساختار کلی در جدول زیر آمده است. جزئیات UX، انیمیشن و Acceptance Criteria هر سکشن در `HOMEPAGE_UX_SPEC.md` می‌آید.

| # | سکشن | سطح | وضعیت |
|---|---|---|---|
| 01 | Cinematic Hero + دندان سه‌بعدی | روشن + Glow | ✅ |
| 02 | Trust Strip: مشاوره رایگان · ۴ زبان · آنتالیا و استانبول · هتل، ترانسفر و مترجم | روشن | ✅ فقط ادعاهای تأییدشده |
| 03 | Signature Treatments (سه کارت) | Ice | ✅ |
| 04 | Why Jokar Dental | روشن | ✅ فقط مزیت‌های تأییدشده |
| 05 | International Patient Experience (مسیر ۵ مرحله‌ای + خط کشیده‌شونده) | **Navy** | ✅ |
| 06 | Medical Team | — | 🔒 مخفی تا رسیدن داده (Q2) |
| 07 | Dental Technology | — | 🔒 مخفی تا رسیدن داده (Q4) |
| 08 | Patient Stories | — | 🔒 مخفی تا رسیدن داده (Q3) |
| 09 | FAQ | Ice | ✅ متن نیاز به بازبینی پزشکی دارد |
| 10 | Consultation Form | روشن + Glow | ✅ |
| 11–12 | Final CTA + Footer (Finale) | **Navy** | ✅ |

> سکشن‌های 🔒 ساخته و تست می‌شوند، ولی با یک flag محتوایی خاموش می‌مانند. با رسیدن داده، فقط flag روشن می‌شود.

## ۵. قالب صفحات خدمات (مشترک برای هر سه خدمت)

1. **Hero:** عنوان، توضیح کوتاه، Primary CTA و WhatsApp. تصویر Hero یک **render ثابت** از مدل برند است (WebGL فقط در Home).
2. **What is it?** توضیح ساده درمان.
3. **Who is it for?** کاندیدای مناسب. ⚠️ نیاز به بازبینی پزشکی دارد.
4. **How it works:** مراحل کلی درمان. ⚠️ بازبینی پزشکی.
5. **For international patients:** لینک به مسیر سفر و خدمات هماهنگی.
6. **FAQ** مخصوص همان خدمت.
7. **CTA:** فرم مشاوره با خدمت از پیش انتخاب‌شده، و WhatsApp با پیام مخصوص همان خدمت.

> مدت درمان، تعداد جلسات، قیمت و ضمانت تا تأیید کارفرما (Q11) نمایش داده نمی‌شوند.

---

## ۶. User Flows

### F1 — بازدیدکننده بین‌المللی جدید

```text
ورود به "/" ──► تشخیص Accept-Language ──► /de/ (اگر زبان پشتیبانی نشود ► /en/)
   ──► Hero (متن فوری، سپس دندان سه‌بعدی) ──► Trust Strip ──► کارت Implants
   ──► /de/zahnimplantate ──► [Free Consultation] یا [WhatsApp]
```

### F2 — ورود مستقیم به صفحه خدمت (از جست‌وجو یا لینک)

```text
/en/dental-veneers ──► مطالعه ──► Sticky CTA (موبایل)
   ──► WhatsApp با پیام آماده:
       "Hello JOKAR DENTAL, I'd like a free consultation about dental veneers."
   ──► WhatsApp app یا WhatsApp Web (بیمار خودش پیام را ارسال می‌کند)
```

### F3 — تعویض زبان

```text
/de/zahnimplantate ──► [Deutsch ▾] ──► فارسی ──► /fa/dental-implants (همان صفحه)
   ──► cookie NEXT_LOCALE=fa ──► بازدید بعدی از "/" ──► /fa/
```

### F4 — ثبت فرم مشاوره

```text
فرم ──► اعتبارسنجی client (فوری، چهارزبانه)
     ──► Next.js Server Action ──► Django REST API ──► اعتبارسنجی server
     ──► ذخیره در PostgreSQL (Lead ID + status=New) ──► پاسخ موفق به کاربر
     ──► (async) اعلان Telegram: فقط کد پیگیری، زبان، کشور، خدمت، شهر و لینک Admin

حالت موفق:  پیام «ما به‌زودی در WhatsApp یا ایمیل با شما تماس می‌گیریم» + دکمه WhatsApp
حالت خطا:   داده‌های وارد‌شده حفظ می‌شود + «دوباره تلاش کنید» + WhatsApp به‌عنوان راه جایگزین
Telegram:   اگر در دسترس نباشد Lead از بین نمی‌رود؛ ارسال اعلان دوباره تلاش می‌شود
```

### F5 — بیمار فارسی‌زبان مقیم خارج

```text
/fa/ (RTL کامل) ──► International Patients ──► فرم:
   کشور اقامت = آلمان · زبان ترجیحی = فارسی · خدمت = طراحی لبخند
   ──► Lead با زبان و کشور جداگانه ثبت می‌شود (زبان ≠ کشور)
```

### F6 — کارکنان کلینیک

```text
اعلان Telegram ──► لینک امن ──► ورود به Django Admin ──► جزئیات Lead
   ──► تماس با بیمار ──► Status: Contacted ► Qualified ► Consultation Scheduled ► ...
```
