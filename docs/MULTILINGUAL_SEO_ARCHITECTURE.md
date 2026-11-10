# MULTILINGUAL & SEO ARCHITECTURE — JOKAR DENTAL

> نسخه: 1.0 · تاریخ: 2026-11-11 · وضعیت: پیش‌نویس

## ۱. مدل داده: زبان ≠ کشور ≠ محل درمان

| بُعد | منبع | نمونه |
|---|---|---|
| **زبان رابط** | URL (`/fa/`، `/de/`، ...) | fa |
| **کشور اقامت** | فیلد فرم. نام کشورها با `Intl.DisplayNames` در زبان صفحه تولید می‌شود | Germany |
| **شهر درمان** | فیلد فرم: Antalya / Istanbul / «هنوز نمی‌دانم» | Istanbul |

- **هیچ ریدایرکت مبتنی بر IP نداریم.** یک کاربر فارسی‌زبان در آلمان باید بتواند نسخه فارسی را ببیند. Googlebot هم باید به همه نسخه‌ها دسترسی داشته باشد.
- تنها تشخیص خودکار در مسیر ریشه `/` است: بر اساس `Accept-Language` با ریدایرکت 307. اگر تطابقی نبود، کاربر به `/en/` می‌رود (D-011).
  - `fa-*` به `/fa/` می‌رود.
  - `de-*` (شامل AT و CH) به `/de/` می‌رود.
  - `tr-*` به `/tr/` و `en-*` به `/en/` می‌رود.
- انتخاب صریح کاربر در cookie `NEXT_LOCALE` ذخیره می‌شود. این یک cookie کارکردی و درخواست‌شده توسط خود کاربر است و برای آن رضایت جداگانه لازم نیست. در Privacy Policy ذکر می‌شود.

## ۲. Routing

- **کتابخانه:** `next-intl`.
  - از App Router، **pathnames محلی‌شده**، تشخیص زبان در middleware، پیام‌های ICU و کلیدهای type-safe پشتیبانی می‌کند.
  - Next.js در App Router سیستم i18n داخلی ندارد. پیاده‌سازی دستی همین کارها را با کد بیشتر انجام می‌داد.
- **ساختار:** `app/[locale]/...` با `localePrefix: 'always'`. همه URLها پیشوند زبان دارند و هیچ نسخه بدون پیشوند تکراری وجود ندارد.
- **`<html lang dir>`:** برای `fa` مقدار `dir="rtl"` و برای بقیه `dir="ltr"`.
- **مستقل از دامنه:** همه URLهای مطلق (canonical، hreflang، sitemap، OG) از env `NEXT_PUBLIC_SITE_URL` خوانده می‌شوند (D-010).

### اسلاگ‌ها (پیشنهادی؛ نهایی پس از بازبینی مترجم)

| صفحه | en | de | tr | fa |
|---|---|---|---|---|
| Implants | `dental-implants` | `zahnimplantate` | `dis-implanti` | `dental-implants` |
| Veneers | `dental-veneers` | `veneers` | `porselen-lamina` | `dental-veneers` |
| Smile Design | `smile-design` | `smile-design` | `gulus-tasarimi` | `smile-design` |
| International | `international-patients` | `internationale-patienten` | `uluslararasi-hastalar` | `international-patients` |
| Consultation | `free-consultation` | `kostenlose-beratung` | `ucretsiz-danismanlik` | `free-consultation` |
| About | `about` | `ueber-uns` | `hakkimizda` | `about` |
| Privacy | `privacy` | `datenschutz` | `gizlilik` | `privacy` |
| KVKK | `kvkk` | `kvkk` | `kvkk-aydinlatma-metni` | `kvkk` |
| Legal Notice | `legal-notice` | `impressum` | `yasal-bilgiler` | `legal-notice` |

- اسلاگ‌های ترکی و آلمانی ASCII هستند (ş→s، ı→i، ü→ue).
- **اسلاگ‌های فارسی انگلیسی‌اند.** اسلاگ با حروف فارسی هنگام اشتراک در WhatsApp به رشته‌ای طولانی و ناخوانا (percent-encoded) تبدیل می‌شود.

## ۳. محتوا و ترجمه

- **فایل‌ها:** `messages/{fa,en,de,tr}.json`، دسته‌بندی‌شده بر اساس صفحه و سکشن.
- **کلید گم‌شده یعنی Build شکست می‌خورد.** هیچ fallback بی‌صدا به انگلیسی وجود ندارد. صفحه‌ای که ترجمه کامل و بازبینی‌شده نداشته باشد در آن زبان منتشر نمی‌شود.
- **لحن:**
  - English: **British English** (بازار UK و اروپا)
  - Deutsch: رسمی (**Sie**)
  - Türkçe: رسمی (**siz**)
  - فارسی: رسمی و گرم (**شما**)
- **فرایند:**
  1. نسخه مرجع انگلیسی فقط از اطلاعات تأییدشده نوشته می‌شود.
  2. کارفرما آن را تأیید می‌کند.
  3. ترجمه به fa، de و tr انجام می‌شود.
  4. **بازبینی متخصص واجد صلاحیت** برای هر متن پزشکی (Q7).
  5. انتشار.
- **پیام‌های خطای فرم:** سرور فقط **کد خطا** برمی‌گرداند (مثلاً `phone_invalid`). متن خطا در client و به زبان صفحه نمایش داده می‌شود.

## ۴. قالب‌بندی

| مورد | قانون |
|---|---|
| اعداد در متن فارسی | ارقام فارسی (`Intl.NumberFormat('fa')` ← ۱۲۳) |
| شماره تلفن | ارقام لاتین و ایزوله LTR در همه زبان‌ها (برای کپی و شماره‌گیری بدون خطا) |
| تاریخ | در Phase 1 تاریخی در سایت نیست. ⚠️ اگر بعداً اضافه شد: locale `fa` به‌صورت پیش‌فرض تقویم شمسی برمی‌گرداند؛ در صورت نیاز به میلادی، `calendar: 'gregory'` باید صریح تنظیم شود |
| نام کشورها | `Intl.DisplayNames(locale, { type: 'region' })` |

## ۵. مهندسی RTL

- CSS فقط با logical properties نوشته می‌شود (Tailwind: `ms-`، `pe-`، `start-`، `end-`، `text-start`).
- آیکون‌های جهت‌دار در RTL قرینه می‌شوند (`rtl:-scale-x-100`).
- **انیمیشن‌های افقی GSAP علامت جهت دارند:** `x: 40 * dirSign` (`dirSign = rtl ? -1 : 1`). بدون این، در فارسی المان‌ها از سمت اشتباه وارد می‌شوند.
- Hero در RTL قرینه می‌شود: متن در سمت راست و دندان در سمت چپ.
- کلمات لاتین داخل متن فارسی (JOKAR DENTAL، WhatsApp، شماره‌ها) در QA بررسی می‌شوند. در صورت نیاز با `<bdi>` ایزوله می‌شوند.
- **فونت‌ها برای هر زبان جداگانه بارگذاری می‌شوند.** صفحه فارسی فونت‌های Cormorant و Manrope را دانلود نمی‌کند و صفحات لاتین فونت Vazirmatn را دانلود نمی‌کنند. نحوه پیاده‌سازی در `ARCHITECTURE.md` می‌آید.

## ۶. SEO فنی

| مورد | پیاده‌سازی |
|---|---|
| Metadata | `generateMetadata` برای هر زبان: title ≤ 60 کاراکتر و description ≤ 155 کاراکتر، هر دو ترجمه‌شده |
| hreflang | `alternates.languages`: `fa`، `en`، `de`، `tr` (فقط زبان، **بدون کد کشور**؛ آلمانی‌زبان اتریش و سوئیس هم پوشش داده می‌شوند) + `x-default` که به `en` اشاره می‌کند |
| Canonical | خودارجاع برای هر زبان |
| Sitemap | `app/sitemap.ts` با `alternates.languages` برای هر URL |
| robots | Production: اجازه کامل. Staging: `noindex` بر اساس env. صفحات منتشرنشده (مثلاً About بدون محتوا): `noindex` و خارج از sitemap |
| Open Graph | `og:locale`: `fa_IR`، `en_GB`، `de_DE`، `tr_TR` + تصویر OG برای هر زبان (render برند) |
| Structured Data | `Organization` (نام، url، contactPoint با WhatsApp و `availableLanguage` چهارگانه) + `WebSite` + `BreadcrumbList`. **`Dentist` و `LocalBusiness` نداریم**، چون آدرس لازم دارند (D-003) |
| FAQPage | فقط پس از بازبینی پزشکی متن FAQ. Google از ۲۰۲۳ نتیجه غنی FAQ را فقط برای سایت‌های سلامت و دولتی شناخته‌شده نشان می‌دهد، پس انتظار نتیجه غنی نداریم |

## ۷. معیار پذیرش (فاز F)

- [ ] تعویض زبان در همه صفحات کاربر را به **صفحه معادل** می‌برد.
- [ ] `/` با `Accept-Language: de-AT` به `/de/` و با `ja` به `/en/` ریدایرکت می‌شود.
- [ ] هر صفحه hreflang کامل و دوطرفه دارد، به‌علاوه `x-default`.
- [ ] هیچ کلید ترجمه‌ای گم‌شده نیست (build در CI).
- [ ] RTL: هیچ margin یا padding فیزیکی (`ml-`، `pl-`، `left-`) در کد نیست (بررسی با grep در CI).
- [ ] صفحه فارسی فونت لاتین display دانلود نمی‌کند (بررسی در Network panel).
- [ ] کلمه «İ» در ترکی و کلمات مرکب آلمانی در عرض 360px درست نمایش داده می‌شوند.
