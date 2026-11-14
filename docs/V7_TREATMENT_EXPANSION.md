# V7 — گسترش صفحه‌های ایمپلنت و طراحی لبخند (Strict Scope)

> تاریخ: 2026-11-14 · شاخه: `v7-treatment-expansion` · تصمیم: D-091 · وضعیت: **اجرا شد** (کارفرما همه Gateها را به اجرای کامل واگذار کرد: «تا خط آخر اجرا کن، در انتها سؤال کن»)

## ۱. TARGETED_EXPANSION_AUDIT (TASK 01–03)

| مورد | فایل |
|---|---|
| Route ایمپلنت (۴ زبان: `/dental-implants`، `/zahnimplantate`، `/dis-implanti`) | `src/app/[locale]/dental-implants/page.tsx` |
| Route طراحی لبخند (`/smile-design`، `/gulus-tasarimi`) | `src/app/[locale]/smile-design/page.tsx` |
| کامپوننت مشترک سه صفحه درمان (Hero + فیلم بالای صفحه + بخش‌ها) | `src/components/sections/TreatmentPage.tsx` |
| فیلم Hero (`ServiceFilm`) | `src/components/sections/service-film/*`، `public/images/treatments/*` |
| متن‌ها | `messages/{fa,en,de,tr}.json` |

**جای درج:** بعد از آخرین بخش موجود هر صفحه («یادداشت‌ها» + هشدار پزشکی) و قبل از نوار «بیماران بین‌المللی». Hero، فیلم، explorer، «چه کسانی»، «چطور»، یادداشت‌ها، FAQ و فرم دست نخوردند.

**تنها تغییر در فایل مشترک:** `TreatmentPage` یک prop اختیاری `expansion` گرفت که فقط `{expansion}` را در همان نقطه render می‌کند. صفحه لمینت آن را نمی‌دهد، پس خروجی‌اش بایت‌به‌بایت همان است (اثبات: تست زیر). FAQ هر دو صفحه فقط **سؤال‌های تازه در انتهای فهرست** گرفت؛ سؤال‌های قبلی تغییری نکردند.

**حفاظت از Scope:** `tests/e2e/v7-scope.spec.ts` قبل از هر تغییری، HTML سرور این بخش‌ها را hash کرد (`tests/e2e/baselines/v7-scope.json`) و بعد از کار مقایسه می‌کند: Hero هر دو صفحه در ۴ زبان (متن، فیلم، poster، چیدمان)، کل صفحه لمینت، کل صفحه اصلی، Header و Footer — **۲۴ ناحیه**.

## ۲. ساختار محتوا و عنوان‌ها (TASK 04–10، 12)

| صفحه | بخش | عنوان انتخاب‌شده | دو گزینه دیگر |
|---|---|---|---|
| ایمپلنت | معرفی | From a single tooth to a full arch | Advanced implantology, planned around you · When more than one tooth is missing |
| | All-on-4 / All-on-6 | A fixed full arch on four or six implants | A thoughtful approach to full-arch restoration · One fixed bridge, carefully anchored |
| | تکی و چندتایی + برندها | One tooth or several, each planned on its own | Precision in every component · The implant behind a natural crown |
| | Same-day / Immediate loading | Immediate, but never rushed | Sooner, when it is safe · Fast where possible, careful always |
| | پیوند استخوان + سینوس لیفت | When the bone needs support first | Supporting procedures for implant treatment · A stable foundation |
| طراحی لبخند | معرفی | The details behind a natural smile | Designed digitally, refined by hand · Where technology meets a natural smile |
| | CAD/CAM و لابراتوار | From scan to ceramic, under one roof | Precision begins with a digital impression · Made where you are treated |
| | اصلاح لثه با لیزر | The frame of your smile | Beautiful balance lies in the details · Gums in harmony with your teeth |
| | سفیدکردن | Brighter, and still natural | Natural brightness · Lighter teeth, natural character |

هر خدمت: نام خدمت (eyebrow) · عنوان امضا · مقدمه · توضیح پزشکی · برای چه کسی · ملاحظات و محدودیت · متن تصویر · لینک آرام «در مشاوره رایگان درباره‌اش بپرسید» (به همان فرم صفحه، بدون CTA تازه پشت‌سرهم) · FAQ (۵ سؤال ایمپلنت، ۴ سؤال لبخند، در انتهای FAQ موجود).

## ۳. متن چهارزبانه (TASK 11، 14)

منبع واحد: namespace تازه `expansion` در `messages/{fa,en,de,tr}.json` + سؤال‌های اضافه‌شده به `treatments.implants.faq` و `treatments.smileDesign.faq`. متن انگلیسی مرجع است؛ fa/de/tr ترجمه طبیعی‌اند، نه کلمه‌به‌کلمه. کنترل خودکار: برابری کلیدها در ۴ زبان (`messages.test.ts`)، سیاست ادعا (`claims.test.ts`: بدون lifetime/دائمی/بدون درد/بهترین، ضمانت فقط با «بستگی دارد»)، و برابری فکت‌ها زیر همان کلیدها (`facts.test.ts`: برندها، ضمانت کتبی، ۲۴ تا ۴۸ ساعت، تیتانیوم، بی‌حسی موضعی). **بازبینی پزشک و بازبینی بومی fa/de/tr هنوز لازم است (Q7).**

## ۴. Fact-check پزشکی و دسته‌بندی ادعاها (TASK 21)

**A — آموزش عمومی (منابع):**
- بارگذاری فوری = اتصال پروتز ظرف حدود یک هفته، مشروط به ثبات اولیه هر ایمپلنت؛ پیوند استخوان یا سینوس لیفت هم‌زمان «منع نسبی» — ITI Consensus (Implant placement and loading protocols): https://academy.iti.org/my-academy/-/my/consensus-db/1802
- سینوس لیفت: بالا بردن غشا + پیوند؛ روش جانبی یا از محل ایمپلنت؛ ترمیم معمولاً ماه‌ها — Cambridge University Hospitals (NHS): https://www.cuh.nhs.uk/patient-information/sinus-lift-procedures/
- لبخند لثه‌ای علل مختلف دارد (رویش غیرفعال ناقص، فک، لب)؛ بدون بررسی استخوان، بافت ممکن است برگردد — PMC8740157 و کارآزمایی لیزر دیود در crown lengthening.
- سفیدکردن: اثر از ژل است؛ مرورهای سیستماتیک افزایش ثابت اثر با نور/لیزر را نشان نمی‌دهند و حساسیت را بیشتر می‌بینند — PubMed 29289725. متن سایت فقط می‌گوید «لیزر برای فعال‌کردن ژل استفاده می‌شود؛ سفیدشدن کار ژل است».
- اتحادیه اروپا (Directive 2011/84/EU): محصولات ۰٫۱ تا ۶٪ پراکسید هیدروژن فقط از طریق دندانپزشک، نه برای زیر ۱۸ سال. **قانون ترکیه برای غلظت مورد استفاده کلینیک: PENDING CLINIC VERIFICATION.**
- برندها (دفتر مرکزی): Straumann — بازل، سوئیس؛ Nobel Biocare — کلوتن، سوئیس (مالک: Envista)؛ Medentika — هوگلزهایم، آلمان، عضو Straumann Group؛ Osstem — سئول، کره جنوبی. سایت «دفتر مرکزی» می‌گوید، نه «ساخت سوئیس/آلمان». **All-on-4® علامت تجاری Nobel Biocare است**؛ به‌عنوان نام مفهوم درمانی به‌کار رفته، همراه با یادداشت مالکیت علائم تجاری.

**B — ادعاهای مخصوص کلینیک (تأییدشده توسط کارفرما، 2026-11-14):** استفاده از Straumann، Nobel Biocare، Osstem، Medentika · ضمانت کتبی · CAD/CAM، اسکن داخل دهانی و لابراتوار اختصاصی در آنتالیا و استانبول · روکش در ۲۴ تا ۴۸ ساعت «در صورت اجازه شرایط» · دندانپزشکی لیزری در هر دو شعبه.

**PENDING CLINIC VERIFICATION (پیش از Launch):**
1. متن کامل شرایط ضمانت (محصول/درمان، ضامن، استثناها). تا آن زمان سایت فقط «ضمانت کتبی؛ شرایط به درمان و سیستم ایمپلنت بستگی دارد» می‌گوید — **«Lifetime» منتشر نشده.**
2. ارائه All-on-4/All-on-6، کاشت/بارگذاری فوری، پیوند استخوان و سینوس لیفت در **هر دو** شعبه.
3. تصویربرداری سه‌بعدی (CBCT) در کلینیک یا ارجاع به مرکز دیگر (متن: «رادیوگرافی و در صورت نیاز تصویربرداری سه‌بعدی»).
4. مدل لیزر (دیود / Er,Cr:YSGG …) و ژل سفیدکننده (نوع و غلظت)؛ قانون ترکیه درباره غلظت.
5. اینکه کدام برند در کدام شعبه موجود است.
6. نوع ترمیم‌هایی که واقعاً ۲۴ تا ۴۸ ساعته ساخته می‌شوند (مثلاً تک‌واحد زیرکونیا/لیتیوم دی‌سیلیکات).

**C — ادعاهای تبلیغاتی که عمداً منتشر نشدند:** Lifetime Guarantee · «دندان ثابت در یک روز» به‌عنوان نتیجه نهایی (فقط به‌شکل «حداکثر دندان موقت، فقط با ثبات کافی») · نتیجه تضمینی · روکش ۲۴ساعته برای همه · درمان بدون درد · درجه سفیدی مشخص.

## ۵. تصاویر و مجوزها (TASK 12، 15–16)

| بخش | Asset | منبع / مجوز |
|---|---|---|
| All-on-4/6 | رندر سه‌بعدی ۷ لایه (فک، لثه، ۴ و ۶ ایمپلنت، اباتمنت‌های multi-unit، بریج) | ساخت خودمان، three.js آفلاین (`scripts/render-treatments/jobs-v7.js`) |
| موقت/نهایی | عکس بریج فک کامل روی بار (کم‌اشباع) | Pexels 39377366 — Zeynep Kahraman |
| تکی/چندتایی | مدل آموزشی برش‌خورده ایمپلنت | Pexels 6502306 — cottonbro studio |
| پیوند / سینوس | دو مقطع سه‌مرحله‌ای (رندر خودمان) | ساخت خودمان |
| CAD/CAM | اسکن روی مانیتور · طراحی CAD در لابراتوار · فرز دیسک · ابر نقاط اسکن و تاج طراحی/سرامیکی (رندر) | Pexels 6812508 — Pavel Danilyuk · 7788367 و 7788500 — Ivan Babydov · رندرها از مدل دندان خود پروژه |
| اصلاح لثه | لبخند نزدیک با خطوط راهنما (خط لب، قوس لبخند، تناسب دندان) | Pexels 3762441 — Shiny Diamond |
| سفیدکردن | راهنمای رنگ سه‌بعدی ۸ تایی + نشانگر | ساخت خودمان |

همه عکس‌ها تزئینی‌اند (alt خالی)، هیچ‌کدام بیمار، دندانپزشک، لابراتوار یا نتیجه درمان JOKAR DENTAL معرفی نمی‌شوند؛ زیر عکس‌های لابراتوار نوشته شده «لابراتوار JOKAR DENTAL نیست». عکسی که شبیه تصویر هوش مصنوعی بود (Pexels 16212691) رد شد. تصاویر واقعی از لابراتوار و دستگاه‌های خود کلینیک جایگزین بهتری‌اند (با همین قاب‌ها، بدون تغییر کد جز جابه‌جایی فایل).

## ۶. انیمیشن‌ها (TASK 13، 17)

همه پیش‌رندر + CSS؛ **هیچ WebGL، ویدئو یا کتابخانه تازه‌ای در زمان اجرا نیست**. هر تصویر یک‌بار وقتی وارد دید شد اجرا می‌شود (RevealObserver موجود، `data-reveal="draw"`) و روی وضعیت کامل می‌ماند؛ بدون JS و با reduced motion همان وضعیت نهایی دیده می‌شود.

| نام | داستان |
|---|---|
| Full-Arch Precision Reveal (۶ ثانیه) | فک و استخوان → ایمپلنت‌ها ظاهر می‌شوند → بریج آرام پایین می‌آید و می‌نشیند. کنترل بومی: All-on-4 / All-on-6 (radio) و نمایش بریج (checkbox) — فقط CSS `:has()`. |
| Immediate Restoration Journey | خط زمان ۶ مرحله‌ای کشیده می‌شود؛ مرحله «ترمیم موقت» با خط‌چین و برچسب «فقط در صورت مناسب‌بودن». |
| Bone graft / Sinus lift (هر کدام ۶ ثانیه) | لبه باریک → گرانول و غشا → استخوان تازه + ایمپلنت (از بالا / از پایین). شرح مراحل هم‌زمان پررنگ می‌شود. |
| From Digital Scan to Precision Restoration | ۵ قاب: اسکن، ابر نقاط، طراحی، فرز، تاج طراحی‌شده که از لبه به سرامیک تبدیل می‌شود. |
| Gumline Harmony | خطوط راهنما روی عکس خودشان کشیده می‌شوند. |
| Natural Brightness | نشانگر از رنگ هفتم به چهارم می‌رود — چند پله، نه تا انتهای مقیاس (بدون وعده). |

## ۷. فنی و Performance (TASK 14، 18)

- کامپوننت‌ها: `src/components/sections/expansion/{ImplantsExpansion,SmileExpansion,parts}.tsx` + `expansion.css` (پیشوند `xp-`، فقط خواص منطقی). Server Components؛ JS کلاینت تازه: **صفر**.
- تصاویر: `next/image` (AVIF/WebP، lazy، `sizes`)؛ لایه‌های PNG رندر فقط در اندازه نمایش تحویل می‌شوند. هیچ تصویر تازه‌ای پیش از نزدیک‌شدن به viewport درخواست نمی‌شود (تست).
- بدون جابه‌جایی چیدمان: همه قاب‌ها `aspect-ratio` ثابت دارند.

## ۸. فایل‌های تغییرکرده (TASK 15، 22)

جدید: `components/sections/expansion/*`، `assets/treatments/{fullarch,graft,sinus,crown,shades,gumline}/*`، `assets/photos/v7/*`، `scripts/render-treatments/{geometry-v7,jobs-v7}.js`، `tests/e2e/{expansion,v7-scope}.spec.ts`، `tests/e2e/baselines/v7-scope.json`، این سند.
تغییر: `app/[locale]/dental-implants/page.tsx` و `smile-design/page.tsx` (یک prop)، `TreatmentPage.tsx` (prop اختیاری + یک خط)، `messages/*.json` (فقط افزودن)، `tests/unit/facts.test.ts` (۳ فکت)، `scripts/render-treatments/{stage,render}.mjs/js` (پشتیبانی jobهای V7، بدون تغییر رندرهای قبلی)، `docs/{DECISIONS,TASK_TRACKER,ASSET_LICENSES}.md`.
بدون تغییر: Header، Footer، صفحه اصلی، صفحه لمینت، Global CSS و tokenها، فرم‌ها، WhatsApp، Backend، routing و SEO خارج از دو صفحه.
