# WHATSAPP & TELEGRAM INTEGRATION — JOKAR DENTAL

> نسخه: 1.0 · تاریخ: 2026-11-11 · وضعیت: پیش‌نویس
> اصل حاکم: **WhatsApp برای بیمار است و Telegram فقط برای اعلان داخلی.** هیچ پیامی بدون اقدام خود بیمار ارسال نمی‌شود.

---

# بخش A — WhatsApp (کانال بیمار)

## A1. لینک

```text
https://wa.me/905427130132?text=<encodeURIComponent(پیام)>
```

- شماره در env `NEXT_PUBLIC_WHATSAPP_NUMBER=905427130132` نگه داشته می‌شود: فرمت بین‌المللی، بدون `+`، فاصله یا صفر اول.
- تابع `lib/whatsapp.ts` به شکل `waLink(locale, context, vars?)` لینک را می‌سازد. متن پیام از `messages/{locale}.json` و کلید `whatsapp.<context>` خوانده می‌شود.
- لینک با `target="_blank"` و `rel="noopener"` باز می‌شود. روی موبایل اپلیکیشن WhatsApp و روی دسکتاپ WhatsApp Web یا Desktop باز می‌شود.
- **پیام فقط آماده می‌شود. ارسال را خود بیمار انجام می‌دهد.**

## A2. متن پیام‌های آماده

**پیش‌نویس‌اند و قبل از انتشار توسط مترجم بازبینی می‌شوند (Q7).**

| Context | English | Deutsch |
|---|---|---|
| `general` | Hello JOKAR DENTAL, I'd like to request a free consultation. | Hallo JOKAR DENTAL, ich möchte eine kostenlose Beratung anfragen. |
| `implants` | Hello JOKAR DENTAL, I'd like a free consultation about dental implants. | Hallo JOKAR DENTAL, ich möchte eine kostenlose Beratung zu Zahnimplantaten. |
| `veneers` | Hello JOKAR DENTAL, I'd like a free consultation about dental veneers. | Hallo JOKAR DENTAL, ich möchte eine kostenlose Beratung zu Veneers. |
| `smile_design` | Hello JOKAR DENTAL, I'd like a free consultation about smile design. | Hallo JOKAR DENTAL, ich möchte eine kostenlose Beratung zum Smile Design. |
| `international` | Hello JOKAR DENTAL, I live abroad and I'd like a free consultation. | Hallo JOKAR DENTAL, ich lebe im Ausland und möchte eine kostenlose Beratung. |
| `after_form` | Hello JOKAR DENTAL, I've just submitted a consultation request ({reference}). | Hallo JOKAR DENTAL, ich habe gerade eine Beratungsanfrage gesendet ({reference}). |

| Context | Türkçe |
|---|---|
| `general` | Merhaba JOKAR DENTAL, ücretsiz danışmanlık almak istiyorum. |
| `implants` | Merhaba JOKAR DENTAL, diş implantı hakkında ücretsiz danışmanlık almak istiyorum. |
| `veneers` | Merhaba JOKAR DENTAL, porselen lamina hakkında ücretsiz danışmanlık almak istiyorum. |
| `smile_design` | Merhaba JOKAR DENTAL, gülüş tasarımı hakkında ücretsiz danışmanlık almak istiyorum. |
| `international` | Merhaba JOKAR DENTAL, yurt dışında yaşıyorum ve ücretsiz danışmanlık almak istiyorum. |
| `after_form` | Merhaba JOKAR DENTAL, az önce bir danışmanlık talebi gönderdim ({reference}). |

| Context | فارسی |
|---|---|
| `general` | سلام، وقت بخیر. مایل به دریافت مشاوره رایگان از JOKAR DENTAL هستم. |
| `implants` | سلام، وقت بخیر. مایل به دریافت مشاوره رایگان درباره ایمپلنت دندان هستم. |
| `veneers` | سلام، وقت بخیر. مایل به دریافت مشاوره رایگان درباره لمینت دندان هستم. |
| `smile_design` | سلام، وقت بخیر. مایل به دریافت مشاوره رایگان درباره طراحی لبخند هستم. |
| `international` | سلام، وقت بخیر. خارج از ترکیه زندگی می‌کنم و مایل به دریافت مشاوره رایگان هستم. |
| `after_form` | سلام، وقت بخیر. همین حالا درخواست مشاوره ثبت کردم (کد پیگیری: {reference}). |

## A3. محل دکمه‌های WhatsApp در سایت

| محل | Context | نوع دکمه |
|---|---|---|
| Nav (آیکون) | `general` | آیکون با `aria-label` |
| Hero | `general` | Secondary |
| صفحات خدمات | همان خدمت | Secondary |
| سکشن و صفحه International | `international` | Secondary |
| کنار فرم (راه جایگزین) | context همان صفحه | Tertiary |
| پنل موفقیت فرم | `after_form` | Secondary |
| Sticky bar موبایل | context همان صفحه | Secondary |
| Finale و Footer | `general` | Secondary و لینک |

## A4. پیشنهاد عملیاتی برای کلینیک (WhatsApp Business App)

این بخش کدنویسی ندارد و تنظیمات آن را کلینیک انجام می‌دهد:

- **پیام خوش‌آمد و پیام خارج از ساعت کاری** به چهار زبان.
- **Quick Replies** برای پاسخ‌های پرتکرار در هر زبان.
- **Labels** هم‌نام با وضعیت‌های Lead (New، Contacted، ...) تا WhatsApp و Admin هماهنگ بمانند.
- **پروفایل کسب‌وکار** با لینک وب‌سایت، بعد از خرید دامنه.

## A5. Tracking

در Phase 1 هیچ Tracking نداریم (D-029). در فاز مارکتینگ، `whatsapp_click` فقط یک **کلیک** شمرده می‌شود، **نه Lead** (`CRO_TRACKING_PLAN.md`).

---

# بخش B — Telegram (اعلان داخلی)

## B1. راه‌اندازی (توسط کارفرما، Q5)

1. در `@BotFather` دستور `/newbot` را بزنید و **Bot Token** را دریافت کنید. توکن را فقط از راه امن به مسئول فنی بدهید.
2. یک **گروه خصوصی**، مثلاً «Jokar Leads»، بسازید و کارکنان مجاز و ربات را عضو کنید. Privacy mode ربات روشن بماند (پیش‌فرض همین است)، چون ربات فقط پیام می‌فرستد و پیامی نمی‌خواند.
3. یک پیام در گروه بفرستید. سپس با یک بار فراخوانی `getUpdates`، مقدار `chat_id` گروه را بخوانید. شناسه گروه عدد منفی است. **از ربات‌های شخص ثالث برای این کار استفاده نکنید.**
4. مقادیر `TELEGRAM_BOT_TOKEN` و `TELEGRAM_CHAT_ID` را فقط در env سرور قرار دهید.
5. دستور `python manage.py send_test_notification` را اجرا کنید تا اتصال تأیید شود.

## B2. محتوای اعلان (Data Minimization، D-009)

```text
🦷 New consultation request
Ref: JD-7K3Q9P
Language: DE · Country: Germany
Treatment: Dental implants · City: Istanbul
[ Open in admin ]   ← دکمه inline؛ لینک به صفحه Lead در Admin (نیازمند ورود و 2FA)
```

| ارسال می‌شود | ارسال **نمی‌شود** |
|---|---|
| کد پیگیری · زبان ترجیحی · کشور · خدمت · شهر ترجیحی (برای ارجاع Lead بین شعبه‌ها) | نام · تلفن · ایمیل · پیام · UTM |

> ⚠️ **بررسی حقوقی:** خدمت مورد علاقه، در کنار کد پیگیری، ممکن است «داده مرتبط با سلامت» تلقی شود. Telegram هم انتقال داده به خارج از کشور محسوب می‌شود (KVKK ماده ۹). اگر مشاور حقوقی رد کند، اعلان به **کد پیگیری، شهر و لینک** محدود می‌شود. این تغییر فقط یک خط کد است.

- **زبان اعلان:** فعلاً انگلیسی (خنثی). بعد از مشخص شدن گیرنده‌ها (Q5) قابل تغییر است.

## B3. پیاده‌سازی

- **ارسال:** درخواست `POST https://api.telegram.org/bot<TOKEN>/sendMessage` با `parse_mode=HTML` و `reply_markup.inline_keyboard`. پیاده‌سازی با **`urllib` خود Python** و timeout پنج ثانیه است؛ SDK اضافه نمی‌شود.
- **Escape:** همه مقادیر با `html.escape` امن می‌شوند.
- **⚠️ توکن داخل URL است.** بنابراین URL درخواست **هرگز لاگ نمی‌شود**. فقط کد وضعیت و `description` پاسخ ثبت می‌شود و هر جا لازم باشد توکن redact می‌شود.

### Outbox و Retry (بدون Celery و Redis، D-032)

```text
1. Lead و notification_status=pending در یک تراکنش ذخیره می‌شوند
   → پاسخ موفق فوراً به کاربر برمی‌گردد
2. transaction.on_commit → یک thread پس‌زمینه → deliver(lead_id)
3. deliver: «تصاحب» اتمیک رکورد
      UPDATE … SET status='sending'
      WHERE id=? AND status IN ('pending','failed') AND next_at <= now()
   ← فقط اگر دقیقاً یک ردیف تغییر کند، ارسال انجام می‌شود (محافظت از اعلان تکراری)
4. موفق → sent و notified_at
   ناموفق → failed، attempts+1، next_at = now + backoff، و ذخیره خطا (بدون token)
5. سرویس worker هر ۶۰ ثانیه دستور `deliver_pending_notifications` را اجرا می‌کند:
   رکوردهای سررسیده ارسال می‌شوند و رکوردهایی که بیش از ۵ دقیقه در وضعیت 'sending' مانده‌اند آزاد می‌شوند
```

| رخداد | واکنش |
|---|---|
| Backoff | 1، 2، 4، 8، 16، 32 و 60 دقیقه؛ **حداکثر ۸ تلاش** |
| HTTP 429 | منتظر ماندن به اندازه `parameters.retry_after` |
| پایان تلاش‌ها | وضعیت `failed` باقی می‌ماند و در فیلتر Admin («Notification failed») دیده می‌شود. خطا هم لاگ می‌شود |
| در دسترس نبودن Telegram | **Lead از بین نمی‌رود.** Lead قبل از هر تلاش برای ارسال، در PostgreSQL ذخیره شده است |
| ریسک باقی‌مانده | اگر سرور دقیقاً بعد از ارسال موفق و قبل از ثبت `sent` از کار بیفتد، ممکن است اعلان تکراری ارسال شود. این ریسک پذیرفته و مستند شده است |

## B4. تست

| تست | روش | وضعیت |
|---|---|---|
| ساخت پیام، escape و نبودن داده حساس در متن | Unit (Django TestCase) | در D06 |
| موفقیت، 429، 500 و timeout | Unit با mock کردن `urlopen` | در D06 |
| تصاحب هم‌زمان: دو worker، فقط یک ارسال | Integration (PostgreSQL) | در D06 |
| ثبت Lead وقتی Telegram خطا می‌دهد | Integration | در D06 |
| **ارسال واقعی با ربات کلینیک** | `send_test_notification` در staging | **NOT RUN**، منتظر Bot Token (Q5) |

> طبق قانون ۶، اتصال Telegram تا وقتی تست واقعی در staging انجام نشده، «کارکرده» اعلام نمی‌شود.
