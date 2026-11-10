# API SPEC — JOKAR DENTAL

> نسخه: 1.0 · تاریخ: 2026-11-11 · وضعیت: پیش‌نویس
> مرجع‌ها: `LEAD_MANAGEMENT_AND_FORM_SPEC.md` · `ARCHITECTURE.md`

## ۱. اصول

- **API داخلی است.** Django API از اینترنت در دسترس نیست. Reverse proxy مسیر `/api/` را منتشر نمی‌کند و تنها مصرف‌کننده آن Next.js Server Action در شبکه داخلی Docker است (D-033).
- **Base URL:** `http://api:8000/api/v1/`. در Next.js از env `API_INTERNAL_URL` خوانده می‌شود.
- **احراز هویت:** هدر `Authorization: Bearer <INTERNAL_API_TOKEN>`. مقایسه با `hmac.compare_digest` انجام می‌شود.
- **IP کاربر:** Next.js IP کاربر را از هدر `X-Forwarded-For` که Caddy تنظیم کرده می‌خواند و در هدر `X-Client-IP` به Django می‌فرستد. Django فقط برای rate limit از آن استفاده می‌کند. چون API عمومی نیست، این هدر قابل جعل از بیرون نیست.
- **فرمت:** JSON و UTF-8.
- **نسخه‌بندی:** `/api/v1/`. تغییرات ناسازگار به `/v2/` می‌روند.

## ۲. Endpointها

### `POST /api/v1/leads/` — ثبت درخواست مشاوره

**هدرها:**

```http
Authorization: Bearer <INTERNAL_API_TOKEN>
X-Client-IP: 203.0.113.7
Content-Type: application/json
```

**بدنه درخواست:**

```json
{
  "submission_id": "3f9a6c2e-8d41-4b7a-9c1e-5a2d7f0b4e11",
  "full_name": "Max Mustermann",
  "country": "DE",
  "phone": "+4915112345678",
  "email": "",
  "treatment": "implants",
  "preferred_contact": "whatsapp",
  "preferred_city": "no_preference",
  "preferred_language": "de",
  "site_locale": "de",
  "message": "",
  "consent": true,
  "consent_version": "2026-11-v1",
  "source_page": "/de/zahnimplantate",
  "utm": { "source": "", "medium": "", "campaign": "", "term": "", "content": "" }
}
```

مقدار `phone` را Next.js از کد کشور و شماره ملی می‌سازد. Django آن را با `phonenumbers` اعتبارسنجی می‌کند و به E.164 تبدیل می‌کند.

**پاسخ‌ها:**

| کد | معنی | بدنه |
|---|---|---|
| `201` | Lead جدید ساخته شد | `{"reference": "JD-7K3Q9P", "created": true}` |
| `200` | **Replay:** این `submission_id` قبلاً ثبت شده است | `{"reference": "JD-7K3Q9P", "created": false}` |
| `400` | خطای اعتبارسنجی | `{"errors": {"phone": ["invalid_phone"], "consent": ["consent_required"]}}` |
| `401` | توکن نامعتبر یا ارسال‌نشده | `{"error": "unauthorized"}` |
| `429` | عبور از سقف rate limit | `{"error": "rate_limited", "retry_after": 1800}` |
| `500` | خطای سرور | `{"error": "server_error"}` |

- کدهای خطای فیلدها در `LEAD_MANAGEMENT_AND_FORM_SPEC.md` §۴ تعریف شده‌اند.
- فیلد ناشناخته در بدنه درخواست باعث خطای `400` می‌شود.

**Idempotency:**

- `submission_id` یک ستون unique است.
- اگر دو درخواست هم‌زمان با یک شناسه برسند، دومی به `IntegrityError` می‌خورد. این خطا گرفته می‌شود و همان رکورد قبلی با کد `200` برگردانده می‌شود.

**Rate limit:**

- به ازای هر `X-Client-IP`: **۱۰ درخواست در ساعت و ۳۰ در روز**.
- از DRF throttle با cache پایگاه داده استفاده می‌شود و Redis لازم نیست (D-032).

### `GET /api/v1/health/` — سلامت سرویس

| کد | بدنه |
|---|---|
| `200` | `{"status": "ok", "db": "ok"}` |
| `503` | `{"status": "error", "db": "error"}` |

این endpoint برای healthcheck داکر و پایش استفاده می‌شود و توکن لازم ندارد، چون فقط داخل شبکه داخلی در دسترس است.

## ۳. قرارداد Server Action (سمت Next.js)

```ts
// components/forms/actions.ts — 'use server'
type ErrorCode =
  | 'required' | 'too_short' | 'too_long' | 'invalid_choice' | 'invalid_phone'
  | 'invalid_email' | 'email_required' | 'consent_required';

type ConsultationState =
  | { status: 'idle' }
  | { status: 'success'; reference: string }
  | { status: 'error';
      fieldErrors?: Partial<Record<string, ErrorCode[]>>;
      formError?: 'rate_limited' | 'server_error' | 'network_error' };
```

**ترتیب کار Server Action:**

1. **Honeypot:** اگر `website` پر باشد، پاسخ `success` جعلی برمی‌گردد و چیزی ذخیره نمی‌شود.
2. اعتبارسنجی سبک با `validateLead()`.
3. درخواست `fetch` به Django با timeout هشت ثانیه.
4. نگاشت پاسخ Django به `ConsultationState`.
5. اگر timeout یا خطای شبکه رخ دهد، `network_error` برمی‌گردد. اگر کاربر دوباره تلاش کند، به لطف idempotency همان Lead برگردانده می‌شود.

- **CSRF:** Server Actionها در Next.js به‌طور داخلی Origin را با Host مقایسه می‌کنند.
- **Secrets:** ماژول‌هایی که از توکن‌ها استفاده می‌کنند `import 'server-only'` دارند. این import مانع ورود اشتباهی آن‌ها به bundle مرورگر می‌شود.

## ۴. تست قرارداد

| مورد | نوع تست |
|---|---|
| همه کدهای وضعیت جدول §۲ | Django `APITestCase` |
| ماتریس اعتبارسنجی هر فیلد | Django، به‌صورت جدولی |
| Replay و هم‌زمانی `submission_id` | Django + PostgreSQL |
| Throttle: یازدهمین درخواست کد `429` می‌گیرد | Django |
| نگاشت پاسخ به state و timeout | Playwright E2E روی stack محلی |
