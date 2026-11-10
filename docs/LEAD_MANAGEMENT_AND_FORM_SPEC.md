# LEAD MANAGEMENT & FORM SPEC — JOKAR DENTAL

> نسخه: 1.0 · تاریخ: 2026-11-11 · وضعیت: پیش‌نویس
> مرجع‌ها: `API_SPEC.md` · `WHATSAPP_TELEGRAM_INTEGRATION.md` · `DESIGN_SYSTEM.md` §۷ (Form Fields)

## ۱. اهداف

1. **حداقل اصطکاک:** فقط ۵ فیلد الزامی دارد. بقیه پیش‌فرض دارند یا اختیاری‌اند.
2. **کیفیت Lead:** داده کافی برای پیگیری درست ثبت می‌شود: زبان ارتباط، کشور، خدمت و شهر.
3. **حریم خصوصی:** حداقل داده جمع‌آوری می‌شود، اعتبارسنجی اصلی سمت سرور است، و رضایت با نسخه متن و زمان ثبت می‌شود. IP خام ذخیره نمی‌شود.

## ۲. فیلدها

| # | فیلد (`name`) | نوع UI | الزامی | پیش‌فرض | اعتبارسنجی سرور |
|---|---|---|---|---|---|
| 1 | `full_name` | text · `autocomplete="name"` | ✅ | — | ۲ تا ۱۲۰ کاراکتر بعد از trim · هر خطی (فارسی یا لاتین) مجاز است |
| 2 | `country` | `<select>` بومی؛ نام‌ها با `Intl.DisplayNames` تولید می‌شوند | ✅ | — | کد ISO alpha-2 که در `phonenumbers.SUPPORTED_REGIONS` باشد |
| 3 | `phone_code` + `phone` | `<select>` + `type="tel"` · `inputmode="tel"` · `autocomplete="tel-national"` | ✅ | کد از روی کشور انتخاب‌شده پر می‌شود (قابل تغییر است) | با `phonenumbers` معتبر و به E.164 تبدیل می‌شود |
| 4 | `treatment` | radio cards: Implants / Veneers / Smile Design / Not sure | ✅ | در صفحات خدمات، همان خدمت؛ در Home خالی | enum |
| 5 | `consent` | checkbox | ✅ | تیک‌نخورده | باید `true` باشد |
| 6 | `preferred_contact` | segmented: WhatsApp / Phone call / Email | — | `whatsapp` | enum |
| 7 | `email` | `type="email"` · `autocomplete="email"` | فقط وقتی contact برابر Email باشد | — | فرمت ایمیل معتبر |
| 8 | `preferred_city` | segmented: Antalya / Istanbul / No preference | — | `no_preference` | enum |
| 9 | `preferred_language` | `<select>` با ۴ زبان | — | زبان صفحه | enum `fa`، `en`، `de`، `tr` |
| 10 | `message` | textarea | — | — | حداکثر ۱۰۰۰ کاراکتر |

**فیلدهای پنهان:**

| فیلد | نقش | قانون |
|---|---|---|
| `website` | Honeypot (ضد ربات) | مخفی از کاربر، `tabindex="-1"` و `autocomplete="off"`. اگر پر باشد، ارسال **بی‌صدا** رد می‌شود و به ربات پاسخ «موفق» داده می‌شود |
| `submission_id` | Idempotency | یک UUID که هنگام render فرم ساخته می‌شود. ارسال دوباره، Lead تکراری نمی‌سازد |
| `source_page` و `utm_*` | منبع درخواست | **فقط از URL همان صفحه** خوانده می‌شوند. هیچ cookie یا storage استفاده نمی‌شود |

### چیدمان

- فیلدهای ۱ تا ۵ همیشه دیده می‌شوند. ترتیب: نام ← کشور ← تلفن ← خدمت ← رضایت.
- فیلدهای ۶ تا ۱۰ داخل یک `<details>` با عنوان «ترجیحات و پیام (اختیاری)» هستند و به‌صورت پیش‌فرض بسته‌اند.
- دکمه Submit در موبایل تمام‌عرض است.
- زیر دکمه این متن می‌آید: «پاسخ از طریق WhatsApp یا روش انتخابی شما» به‌همراه لینک Privacy.
- کنار textarea یک راهنما قرار دارد: «جزئیات پزشکی را در جلسه مشاوره بررسی می‌کنیم.» هدف این است که کاربر داده سلامت غیرضروری در فرم وارد نکند.

## ۳. رفتارها

| رفتار | توضیح |
|---|---|
| پیش‌انتخاب خدمت | در صفحه هر خدمت، همان خدمت انتخاب‌شده است |
| کد تلفن خودکار | با انتخاب کشور، کد تلفن پر می‌شود، مگر اینکه کاربر قبلاً آن را دستی تغییر داده باشد. این رفتار ورود تکراری اطلاعات را حذف می‌کند (WCAG 3.3.7) |
| زبان ترجیحی | از زبان صفحه پیش‌فرض می‌گیرد |
| ایمیل شرطی | با انتخاب «Email» فیلد ایمیل الزامی می‌شود. بدون JS هم سرور خطای `email_required` برمی‌گرداند |
| حفظ داده‌ها | در هر خطایی، همه مقادیر واردشده حفظ می‌شوند |
| فهرست کشورها | Türkiye، United Kingdom و Germany بالای فهرست، بعد یک جداکننده، و سپس فهرست کامل الفبایی به زبان صفحه |
| بدون JS | فرم از طریق Next.js Server Action ارسال می‌شود و سرور خطاها یا پیام موفقیت را render می‌کند |

**داده کشورها و کدهای تلفن:** فایل `lib/countries.ts` یک بار با یک اسکریپت کوچک از روی `phonenumbers` ساخته می‌شود. نتیجه: یک منبع واحد برای سرور و client.

## ۴. اعتبارسنجی و کدهای خطا

- **Client:** تابع TS مشترک `validateLead()`. هنگام submit اجرا می‌شود، و بعد از اولین تلاش، با خروج از هر فیلد (blur) هم اجرا می‌شود.
- **Server (Django):** اعتبارسنجی **مرجع و نهایی** است.
- **خروجی سرور:** سرور فقط کد خطا برمی‌گرداند. متن خطا از `messages/{locale}.json` و از کلید `form.errors.<code>` خوانده می‌شود.

| کد | معنی |
|---|---|
| `required` | فیلد الزامی خالی است |
| `too_short` / `too_long` | طول فیلد مجاز نیست |
| `invalid_choice` | مقدار خارج از گزینه‌های مجاز است |
| `invalid_phone` | شماره تلفن معتبر نیست |
| `invalid_email` | ایمیل معتبر نیست |
| `email_required` | روش تماس ایمیل انتخاب شده ولی ایمیل وارد نشده |
| `consent_required` | تیک رضایت زده نشده |
| `rate_limited` | تعداد درخواست‌ها بیش از حد مجاز است |
| `server_error` | خطای سرور |
| `network_error` | خطای شبکه یا timeout |

## ۵. حالت‌های فرم

| حالت | UI | دسترس‌پذیری |
|---|---|---|
| Submitting | spinner روی دکمه با عرض ثابت. جلوی ارسال دوباره گرفته می‌شود | `aria-busy`، و پیام «در حال ارسال…» در ناحیه `aria-live="polite"` |
| خطای فیلد | پیام زیر هر فیلد، به‌علاوه یک خلاصه بالای فرم با لینک به هر فیلد خطادار | focus به خلاصه منتقل می‌شود؛ فیلدها `aria-invalid` و `aria-describedby` دارند |
| خطای سرور یا شبکه | پیام عمومی، دکمه «تلاش دوباره» و WhatsApp به‌عنوان راه جایگزین | `role="alert"` |
| Rate limited | «تعداد درخواست‌ها زیاد است. لطفاً چند دقیقه دیگر تلاش کنید یا از WhatsApp پیام دهید» | `role="alert"` |
| **موفقیت** | پنل «درخواست شما ثبت شد»، کد پیگیری (مثلاً `JD-7K3Q9P`)، مراحل بعدی، و دکمه WhatsApp با پیام `after_form` که کد پیگیری را هم دارد | focus به عنوان پنل منتقل می‌شود |

> **مزیت Idempotency:** اگر پاسخ سرور به‌موقع نرسد (timeout) ولی Lead ذخیره شده باشد، «تلاش دوباره» **همان Lead و همان کد پیگیری** را برمی‌گرداند و Lead تکراری ساخته نمی‌شود.

## ۶. ضد اسپم

| لایه | جزئیات |
|---|---|
| Honeypot | فیلد پنهان `website` |
| Rate limit | هر IP حداکثر **۱۰ درخواست در ساعت و ۳۰ در روز**. سقف‌ها کمی باز است، چون اپراتورهای موبایل ترکیه از CGNAT استفاده می‌کنند و ممکن است چند کاربر واقعی یک IP مشترک داشته باشند |
| Idempotency | با `submission_id` |
| CAPTCHA | **در Phase 1 نداریم.** اگر اسپم واقعی دیده شد، Cloudflare Turnstile بعد از بررسی حقوقی اضافه می‌شود (این سرویس خارجی است و انتقال داده دارد) |

## ۷. مدل داده

```text
Lead
  id                     BigAutoField
  reference              Char(9) unique        # JD-XXXXXX (Crockford base32 تصادفی؛ ترتیبی نیست)
  submission_id          UUID unique           # idempotency
  created_at, updated_at DateTime
  full_name              Char(120)
  phone_e164             Char(16)
  email                  Email (blank)
  country                Char(2)               # ISO alpha-2
  preferred_language     Char(2) choices
  site_locale            Char(2) choices       # زبان صفحه هنگام ارسال
  treatment              choices (implants|veneers|smile_design|not_sure)
  preferred_city         choices (antalya|istanbul|no_preference)
  preferred_contact      choices (whatsapp|phone|email)
  message                Text (≤1000, blank)
  source_page            Char(200)
  utm                    JSON {source, medium, campaign, term, content}
  consent_version        Char(20)
  consent_at             DateTime
  status                 choices, default=new, indexed
  assigned_to            FK User (null, SET_NULL)
  notification_status    choices (pending|sending|sent|failed), indexed
  notification_attempts  SmallInt
  notification_next_at   DateTime (null)
  notified_at            DateTime (null)
  notification_error     Char(300) (blank)     # بدون token

LeadActivity
  lead FK · author FK User (null) · created_at
  kind choices (note|status|assignment) · text · old_value · new_value
```

- **ایندکس‌ها:** `(status, created_at)` · `country` · `treatment` · `preferred_language` · `(notification_status, notification_next_at)`.
- **IP خام ذخیره نمی‌شود.** IP فقط به‌طور موقت در cache مربوط به rate limit نگه داشته می‌شود.

## ۸. وضعیت‌های Lead

| Status | معنی |
|---|---|
| `new` | ثبت شده، هنوز با بیمار تماس گرفته نشده |
| `contacted` | اولین تماس انجام شده |
| `qualified` | نیاز بیمار و امکان درمان تأیید شده |
| `consultation_scheduled` | زمان مشاوره تعیین شده |
| `appointment_confirmed` | نوبت درمان قطعی شده |
| `closed` | فرایند با موفقیت تمام شده |
| `lost` | ادامه پیدا نکرده؛ دلیل در یادداشت ثبت می‌شود |

- **جابه‌جایی بین وضعیت‌ها آزاد است**، چون کار کلینیک همیشه خطی پیش نمی‌رود. **هر تغییر** با نام کاربر و زمان در `LeadActivity` ثبت می‌شود.
- **Lead اسپم:** حذف می‌شود. فقط گروه Clinic Admin اجازه حذف دارد.

## ۹. Django Admin

| قابلیت | مشخصات |
|---|---|
| ستون‌های فهرست | reference · created_at · full_name · country · preferred_language · treatment · preferred_city · status · assigned_to · notification_status |
| فیلترها | status · preferred_language · site_locale · country · treatment · preferred_city · منبع (source_page و utm source) · assigned_to · notification_status · تاریخ (date hierarchy) |
| جست‌وجو | reference · full_name · phone_e164 · email |
| Actions گروهی | «Assign to me» · «Mark as contacted». هر دو در LeadActivity ثبت می‌شوند |
| صفحه جزئیات | پنج بخش: Patient · Request · Management · Source & Consent (فقط‌خواندنی) · Notification (فقط‌خواندنی). یادداشت‌ها به‌صورت inline هستند؛ فقط می‌توان یادداشت اضافه کرد و یادداشت‌های قبلی قابل ویرایش نیستند |
| **تماس سریع** | لینک «Open WhatsApp chat» (`https://wa.me/<شماره>`) و لینک‌های `tel:` و `mailto:`. کارمند با یک کلیک گفت‌وگو را شروع می‌کند |
| گروه‌ها | **Clinic Admin:** همه دسترسی‌ها، شامل حذف و مدیریت کاربران · **Coordinator:** مشاهده و ویرایش Lead و افزودن یادداشت؛ بدون حذف و بدون مدیریت کاربران |
| امنیت | **2FA اجباری** (django-otp) · قفل حساب بعد از تلاش‌های ناموفق (django-axes) · مسیر Admin غیرپیش‌فرض · کوکی‌ها فقط HTTPS · پایان نشست بعد از ۸ ساعت |
| Audit | LogEntry خود Django + LeadActivity + لاگ تلاش‌های ورود (axes) |
| Export CSV | Phase 2، بعد از بررسی حریم خصوصی |

## ۱۰. نگهداری و حذف داده

- **مدت نگهداری:** توسط مشاور حقوقی بر اساس KVKK و GDPR تعیین می‌شود. پیشنهاد اولیه برای شروع بحث: Leadهای `lost` و `closed` بعد از ۲۴ ماه ناشناس (anonymize) شوند.
- **درخواست حذف از طرف بیمار:** Clinic Admin داده را دستی حذف می‌کند و این کار در لاگ ثبت می‌شود.

## ۱۱. معیار پذیرش و تست

| تست | نوع |
|---|---|
| ثبت موفق در هر ۴ زبان؛ کد پیگیری نمایش داده می‌شود | E2E (Playwright) |
| خطای هر فیلد با متن درست در هر زبان | E2E |
| کلیک دوباره یا «تلاش دوباره» فقط **یک** Lead می‌سازد | E2E + API |
| فرم بدون JS کار می‌کند | E2E (JS غیرفعال) |
| Honeypot پر باشد: پاسخ موفق داده می‌شود ولی Leadی ذخیره نمی‌شود | API |
| ارسال یازدهم در یک ساعت پاسخ `rate_limited` می‌گیرد | API |
| ماتریس اعتبارسنجی همه فیلدها و کدهای خطا | API (Django TestCase، به‌صورت جدولی) |
| Coordinator نمی‌تواند Lead را حذف کند؛ تغییر status در LeadActivity ثبت می‌شود | Admin tests |
| در دسترس نبودن Telegram باعث از دست رفتن Lead نمی‌شود | Integration (mock) |
