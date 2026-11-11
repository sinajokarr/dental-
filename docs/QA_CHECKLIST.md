# QA CHECKLIST — قبل از Launch (Gate G5)

> هر مورد فقط با **شواهد واقعی** تیک می‌خورد: خروجی تست، اسکرین‌شات یا گزارش. هر مورد اجرانشده `NOT RUN` نوشته می‌شود.
> وضعیت در 2026-11-11 (branch `phases-b-h`). علامت‌ها: ✅ انجام و تأیید شد · 🔒 با کارفرما · NOT RUN = اجرا نشده (دلیل کنار آن).

## محتوا و صحت پزشکی

- [x] ✅ هیچ ادعایی خارج از Claims Policy وجود ندارد — گارد خودکار `tests/unit/claims.test.ts` روی هر ۴ زبان
- [ ] 🔒 متن‌های پزشکی هر ۴ زبان توسط فرد واجد صلاحیت بازبینی شده‌اند 🩺 (Q7 — کار کارفرما)
- [x] ✅ هیچ نام پزشک، آدرس، نظر بیمار، قیمت یا نتیجه درمانی ساختگی در سایت نیست — بازبینی متن‌ها + گارد ادعاها
- [x] ✅ تصاویر stock هیچ‌جا به‌عنوان کلینیک، پزشک یا نتیجه درمان معرفی نشده‌اند — فقط دو عکس شهر با نام شهر (D-072)
- [x] ✅ مجوز همه تصاویر و مدل سه‌بعدی در `ASSET_LICENSES.md` ثبت شده است — تست `tests/unit/assets.test.ts`
- [x] ✅ سکشن‌های 🔒 بدون داده تأییدشده خاموش هستند — پزشکان، نظرات و تجهیزات ساخته نشده‌اند تا محتوا برسد

## چندزبانگی

- [x] ✅ همه صفحات در fa، en، de و tr کامل هستند و هیچ کلید ترجمه‌ای گم نشده است — تست برابری کلیدها + `onError` روی MISSING_MESSAGE
- [x] ✅ تعویض زبان کاربر را به صفحه معادل می‌برد — `treatment-pages.spec`، `cross-browser.spec`
- [x] ✅ ریدایرکت `/` بر اساس `Accept-Language` درست کار می‌کند و پیش‌فرض `/en/` است — `locale.spec`
- [x] ✅ RTL در فارسی کامل است: چیدمان، آیکون‌ها، انیمیشن‌ها و شماره‌های ایزوله — `rtl.spec` + اسکرین‌شات
- [x] ✅ حرف İ در ترکی و کلمات مرکب آلمانی در عرض 360px و 320px درست نمایش داده می‌شوند — `rtl.spec` (شکستن با hyphen)

## فرم، WhatsApp و Telegram

- [x] ✅ ثبت موفق در ۴ زبان؛ کد پیگیری نمایش داده می‌شود؛ Lead در Admin دیده می‌شود — `form.spec` + اجرای واقعی (`JD-XAC89M`، `JD-GVY9F2`)
- [x] ✅ خطاهای هر فیلد به زبان صفحه نمایش داده می‌شوند — `form.spec`
- [x] ✅ کلیک دوباره یا «تلاش دوباره» فقط یک Lead می‌سازد — `form-resilience.spec` + تست‌های Django
- [x] ✅ فرم بدون JS کار می‌کند — `form.spec`
- [x] ✅ Honeypot و rate limit کار می‌کنند — `form.spec` (honeypot)، Django (۱۰ در ساعت)، IP واقعی در Production تأیید شد
- [x] ✅ لینک WhatsApp در هر context و زبان شماره و متن درست دارد — `whatsapp.spec`
- [ ] 🔒 **اعلان واقعی Telegram** در production دریافت شد؛ هیچ داده تماسی در آن نیست — NOT RUN: بات هنوز ساخته نشده (Q5)
- [x] ✅ وقتی Telegram در دسترس نیست، Lead از بین نمی‌رود و retry انجام می‌شود — Django `TelegramOutageTests` + worker

## دسترس‌پذیری (WCAG 2.2 AA)

- [x] ✅ axe در همه صفحات بدون خطای serious یا critical — ۱۱ نوع صفحه × fa/en (`a11y-pages.spec`) + خانه در ۴ زبان (`locale.spec`)
- [x] ✅ Keyboard: skip link، منوها، فرم و آکاردئون با keyboard کار می‌کنند و focus دیده می‌شود — `navigation.spec`، `form.spec`، `faq.spec` (بازبینی دستی کامل: NOT RUN)
- [ ] VoiceOver (macOS و iOS)، NVDA و TalkBack آزموده شده‌اند — NOT RUN: نیاز به آزمون دستی روی دستگاه
- [x] ✅ Reduced motion: انیمیشن‌ها حالت نهایی را نشان می‌دهند و Hero فقط poster است — `hero-3d.spec`، `journey.spec`، `treatments.spec`
- [x] ✅ Reflow در عرض 320px درست است — `rtl.spec` (فارسی و آلمانی)؛ zoom ۲۰۰٪ و ۴۰۰٪ در مرورگر واقعی: NOT RUN

## Performance

- [x] ✅ LCP Lab موبایل ≤ 2.5s و CLS = 0 — `performance.spec` (موبایل کند: LCP 0.78–1.12s، CLS 0، حتی با فونت دیررس)؛ Lighthouse و میانه ۵ اجرا: NOT RUN (اجرای ابزار Lighthouse با سیستم مجوز متوقف شد؛ پس از Launch با PageSpeed Insights روی دامنه)
- [x] ✅ JS اولیه ≤ 170KB (167KB)؛ JS + CSS + فونت + تصویر Hero = 286KB (بدون HTML که جداگانه اندازه‌گیری نشد) ≤ 550KB — `performance.spec`
- [x] ✅ 3D و GSAP خارج از مسیر بحرانی: مدل دندان فقط پس از رویداد `load` دریافت می‌شود — `hero-3d.spec`، `performance.spec` (اختلاف عددی LCP با و بدون 3D: NOT RUN)
- [ ] روی Android ضعیف، Tier درست انتخاب می‌شود و اسکرول روان است — NOT RUN: دستگاه واقعی (منطق Tier با تست واحد `tier.test`)

## امنیت

- [x] ✅ `manage.py check --deploy` بدون هشدار است — داخل کانتینر Production
- [x] ✅ هدرهای امنیتی و CSP در production تأیید شده‌اند — `infrastructure/smoke.sh` + بدون خطای CSP در console
- [x] ✅ Admin: 2FA اجباری، axes و مسیر غیرپیش‌فرض؛ Coordinator نمی‌تواند حذف کند — Django `test_security`
- [x] ✅ `/api` و پایگاه داده از اینترنت در دسترس نیستند — smoke (404)؛ فقط Caddy پورت دارد
- [x] ✅ `npm audit` (محصول) و `pip-audit` هیچ آسیب‌پذیری ندارند — ۷ مورد moderate فقط در ابزار توسعه (ESLint)
- [x] ✅ هیچ secret در repo، لاگ‌ها یا bundle مرورگر وجود ندارد — بررسی repo و imageها، token هرگز لاگ نمی‌شود

## حریم خصوصی و حقوقی

- [ ] 🔒 متن Privacy، KVKK و Legal Notice در ۴ زبان توسط مشاور حقوقی تأیید شده است (Q8/Q12 — کار کارفرما؛ پیش‌نویس‌ها noindex و برچسب‌دار)
- [x] ✅ متن رضایت و `consent_version` ثبت می‌شوند — هر Lead با `consent_version` و `consent_at` (فعلاً `draft-1`)
- [ ] 🔒 موضوعات `SECURITY_PERFORMANCE_QA.md` §۴ (انتقال داده، VERBİS، GDPR) تعیین تکلیف شده‌اند — بازبینی حقوقی

## SEO

- [x] ✅ hreflang دوطرفه به‌همراه `x-default`، و canonical خودارجاع — `seo.spec`
- [x] ✅ `sitemap.xml` و `robots.txt` درست هستند — `seo.spec` (staging جداگانه وجود ندارد)
- [ ] JSON-LD در Rich Results Test معتبر است — NOT RUN: آدرس عمومی لازم است (ساختار با `seo.spec` تست شده)
- [ ] تصویر OG در هر زبان درست نمایش داده می‌شود (تست اشتراک در WhatsApp) — NOT RUN: آدرس عمومی لازم است (پاسخ 200 و PNG با `seo.spec`)

## عملیات

- [x] ✅ Backup روزانه اجرا می‌شود و **یک بار بازیابی واقعی** انجام شده است — تمرین بازگردانی در دیتابیس تازه (LAUNCH_REPORT §۶)؛ فایل‌ها فقط برای مالک قابل خواندن‌اند
- [ ] پایش uptime فعال است — NOT RUN: پس از دامنه (پیشنهاد: یک سرویس پایش رایگان روی `https://<domain>/en`)
- [x] ✅ چرخش لاگ‌ها فعال است — هر سرویس ۵ × 10MB (`compose.prod.yml`)؛ نگهداری زمانی ۱۴ روزه به‌جای آن مبتنی بر حجم است
- [x] ✅ مستند deploy و rollback در README نوشته شده است — بخش Production

## دستگاه‌ها

- [x] ✅ شبیه‌سازی: Chromium، Firefox، WebKit (Safari)، iPhone 13، Pixel 7 — `cross-browser.spec` (۱۷۳ تست در همه پروژه‌ها)
- [ ] دستگاه واقعی: iPhone (Safari) · iPad · Android میان‌رده · Android ضعیف · macOS Safari · Windows (Chrome و Edge) — NOT RUN
