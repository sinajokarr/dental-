# JOKAR DENTAL — CREATIVE APPROVAL PACKAGE (V6.0)

> تاریخ: 2026-11-13 · وضعیت: **منتظر تأیید کارفرما (GATE A–D)** · هیچ فایل اجرایی تغییر نکرده؛ فقط `docs/`.
> پایه: `WEBSITE_AUDIT.md` (مشاهدات واقعی) · `DECISIONS.md` (D-073…D-081) · Claims Policy (`INTERNATIONAL_PATIENT_FUNNEL.md` §3).

## ۰. محدودیت‌های صادقانهٔ این بسته

- **مرجع‌ها:** دو ویدئوی Vimeo (Queens Elite، Dental Excellence) را نمی‌توان از این محیط تماشا کرد. از EthosVFX فقط متن صفحه خوانده شد (انیمیشن سه‌بعدی پروتکل جراحی، «ساخته‌شده از CAD تا هندسهٔ رزوه دقیق بماند»، نمایش «زیر سطح» و «از دید بیمار»). بنابراین جهت هنری زیر از **توصیف خود شما در پرامپت** + همان یک صفحه استخراج شده، نه از مشاهدهٔ فریم‌ها. هیچ چیزی از آن‌ها کپی نمی‌شود.
- **کیفیت استودیوی CGI:** تضمین نمی‌شود. رندرهای ما رویه‌ای‌اند (three.js آفلاین)؛ نزدیک‌ترین گزینهٔ واقع‌گرایانه با ابزار فعلی، نه معادل EthosVFX.
- **عکس واقعی لبخند/ماکروی لمینت:** در دسترس نیست (رجوع به §۶). کیفیت فدا نمی‌شود: جای خالی گزارش می‌شود.

## ۱. Creative Direction — «THE ART OF NATURAL CONFIDENCE»

**ایدهٔ واحد:** سایت مثل یک فیلم کوتاه و آرام است، نه یک ویترین فناوری. بشر در مرکز؛ دقت پزشکی در حاشیه و همیشه *توضیح‌دهنده*، نه نمایشی.

| ستون | معنا در عمل |
|---|---|
| Natural Beauty | لبخند طبیعی، دندان با سایه و شفافیت واقعی، بدون سفیدیِ پلاستیکی |
| Medical Precision | هر تصویر پزشکی آموزشی و از نظر آناتومی/ترتیب مراحل درست |
| Luxury Simplicity | فضای خالی، یک نقطهٔ تمرکز در هر صحنه، تایپوگرافی آرام |
| Cinematic Storytelling | هر صفحه یک روایت کوتاه با آغاز، اوج، سکون (≈۳ ثانیه، D-041) |
| Soft Elegant Motion | فقط opacity/translate/scale؛ فقط یک‌بار؛ reduced-motion = تصویر نهایی |

**سه Concept** (TASK 02.02) — خلاصه:

| | A · Editorial Porcelain | B · Clinical Atelier | C · Quiet Cinema |
|---|---|---|---|
| Hero | پرتره روبه‌رو در قاب قوسی، reveal آرام | ترکیب چهره + جزئیات دندان با تغییر قاب | یک لحظهٔ لبخند و سکون روی قاب نهایی |
| Treatment visual | رندر استودیویی لایه‌ای (وضع فعلی) | مدل سه‌بعدی تعاملی | عکس ماکرو + خطوط راهنما |
| نور | نرم، گرم، سایهٔ کم | سرد-بالینی | کنتراست سینمایی ملایم |
| موبایل | تصویر ثابت + حرکت کوتاه | تعامل لمسی سنگین‌تر | ویدئو کوتاه (سنگین) |
| هزینهٔ عملکرد | کم (≤۱۲۰KB hero؛ ≤۷۰۰KB رندرها) | بالا (WebGL زمان اجرا) | بالا (ویدئو) + نیازمند Asset |
| ریسک | Asset واقعی ندارد | کیفیت دندان مدل‌شده | **بدون ویدئوی مجوزدار قابل اجرا نیست** |

**پیشنهاد:** ترکیب **A + عناصر C**: Hero و تصاویر ثابت-متحرک آرام (A)، و در لحظهٔ نهایی هر صحنه سکون سینمایی (C). **B فقط در یک جا** (Interactive Implant Anatomy، رندر ثابت با hotspot، نه WebGL). دلیل: تنها گزینه‌ای که با Assetهای موجود صادقانه ساخته می‌شود و سرعت را نمی‌کشد.

**معیار کیفیت (۸ محور، امتیاز فعلی صادقانه /۵):** Natural Realism ۳ · Cinematic ۳ · Originality ۳٫۵ · Medical Accuracy ۳٫۵ (نیازمند بازبین) · Visual Consistency ۳ (صفحه‌های درمان ناهم‌خوان) · Emotional Impact ۳٫۵ · UX ۴ · Mobile Performance ۴٫۵ (اندازه‌گیری‌شده؛ Lighthouse NOT RUN). هدف پس از اجرا: همه ≥ ۴ جز Realism ≥ ۳٫۵ (سقف رندر رویه‌ای).

## ۲. Hero Concepts (TASK 03.02–03.04)

وضع فعلی (V5-A1b، D-080): پرتره تمام‌رخ، پنجرهٔ قوسی، حرکت ≈۳ث (open → focus-pull → breath → glint)، ۴۹KB، LCP 0٫80s، CLS 0. متن و CTA بدون JS/ویدئو.

| گزینه | روایت | مدت | Asset لازم | هزینه | وضعیت |
|---|---|---|---|---|---|
| **A Editorial Smile Reveal** | پرتره، reveal قوسی آرام، سکون | ۳ث | همان پرتره | ≈۵۰KB | ✅ **ساخته شده** |
| **B Human Detail** | چهره → نمای نزدیک لبخند با تغییر قاب (دو crop از همان عکس با cross-fade) | ۴ث | عکس با وضوح ≥ ۲۴۰۰px | ≈۹۰KB | ممکن؛ **کیفیت crop دندان به رزولوشن مرجع وابسته است** |
| **C Cinematic Smile Moment** | ویدئوی لبخند واقعی → فریم نهایی | ۴–۶ث | ویدئوی مجوزدار یا فیلم‌برداری خودمان | ۳۰۰KB+ poster جدا | **مسدود: Asset موجود نیست** (D-080: کلیپ‌های رایگان بررسی و رد شدند) |

**توصیه:** نگه‌داشتن A، افزودن B فقط اگر عکس بهتر تأمین شود، و **جایگزینی عکس stock با عکس‌برداری اختصاصی با model release قبل از Launch** (تصمیم ۱ در §۱۴). تصویر AI برای چهره/دهان **استفاده نمی‌شود** (قانون خود شما).

## ۳. Treatment Animation Concepts (TASK 04.x)

هر سه، رندر آفلاین لایه‌ای → AVIF؛ بدون WebGL زمان اجرا. صحنه‌ها به ≤ ۳٫۴ث و بسته‌های قابل‌فهم فشرده می‌شوند.

**Implants — «PRECISION REDEFINED»** (ساخته‌شده: assembly)
۱ آناتومی (فک/لثه کم‌رنگ) → ۲ Fixture با رزوهٔ دقیق → ۳ Abutment نشست → ۴ تاج سرامیکی → ۵ نمای کامل با برچسب اجزا. *ارتقا:* افزودن بافت استخوان و لثهٔ برش‌خورده (cross-section) برای «زیر سطح»؛ تیتانیوم brushed با anisotropy ملایم؛ سرامیک با subsurface تقلیدی. *ممنوع:* دندان شناور چرخان.

**Veneers — «THE ART OF PORCELAIN»** (ساخته‌شده: shell نزدیک‌شونده)
۱ دندان طبیعی → ۲ پوستهٔ نازک (ماکرو) → ۳ شفافیت/ضخامت (برش لبه) → ۴ نشست روی سطح لبیال → ۵ نتیجهٔ طبیعی. *ارتقا:* نرم‌کردن یقهٔ لثه، ضخامت پوسته ≈ نیم‌میلی‌متر قابل‌مشاهده، براقیت کمتر. *ممنوع:* ریشه به‌جای veneer، sparkle، پوستهٔ ضخیم.

**Smile Design — «HARMONY IN EVERY DETAIL»** (ساخته‌شده: arch + راهنما)
۱ قوس طبیعی → ۲ خطوط تحلیل (midline، قوس، تناسب) → ۳ نقاط zenith/برنامه‌ریزی → ۴ خطوط محو → ۵ قاب نهایی. *ارتقا:* لثه به‌جای نوار صورتی، با گرادیان طبیعی. *قانون:* این **فرایند برنامه‌ریزی** است؛ بدون Before/After و بدون پیش‌بینی نتیجه.

## ۴. Treatment Page Wireframes + Sitemap (TASK 05/07/08)

Sitemap بدون تغییر مسیر: `/{lang}/dental-implants | dental-veneers | smile-design` (۱۲ صفحه، ۴ زبان). فعلاً ۴ بخش + FAQ + فرم دارند؛ هدف ۱۱ بخش **شخصی‌سازی‌شده** (نه قالب تکراری):

| بخش V6 | Implants | Veneers | Smile Design |
|---|---|---|---|
| 01 Hero | رندر assembly بزرگ | ماکرو پوستهٔ پرسلن | قوس لبخند + یک خط راهنما |
| 02 Understanding | «ریشهٔ جدید + تاج» | «پوسته‌ای به نازکی…» (بدون عدد تأییدنشده) | «برنامه‌ریزی قبل از درمان» |
| 03 Science | **Interactive Implant Anatomy** (Fixture/Abutment/Crown، hotspot) | **Porcelain Layer Explorer** (لایهٔ پوسته ↔ سطح دندان، اسلایدر) | **Smile Analysis** (تناسب، midline، قوس؛ تعاملی) |
| 04 Who may benefit | شرایط عمومی، بدون تشخیص | همان | همان |
| 05 Journey | ۴ مرحله (فعلی) + تصویر | ۴ مرحله | مرحله‌های برنامه‌ریزی |
| 06 Materials | تیتانیوم، سرامیک | پرسلن/سرامیک | — (حذف: مرتبط نیست) |
| 07 Natural aesthetics | مختصر | **اصلی** | **اصلی** |
| 08 Recovery & aftercare | **اصلی** | مختصر | — |
| 09 Risks | **اصلی** | **اصلی** | مختصر |
| 10 FAQ | ۶–۸ سؤال | ۶–۸ | ۶–۸ |
| 11 Final CTA | فرم + WhatsApp | همان | همان |

**نقطهٔ بحرانی محتوا:** بخش‌های ۰۶–۰۹ (مواد، مراقبت، ریسک) ادعای پزشکی‌اند و در `PROJECT_BRIEF` **تأییدشده نیستند**. پیشنهاد: متن عمومی و استاندارد آموزشی بدون عدد/مدت/تضمین، با برچسب «در انتظار بازبینی پزشک» در `docs` و **انتشار فقط پس از تأیید** (Q7). متن‌های مواد خاص (برند ایمپلنت، نوع سرامیک) را **نمی‌نویسم** تا کلینیک تأیید کند.

**Storyboard رسانه‌ای هر صفحه** (۵ رسانه، ترکیب ثابت/انیمیشن/تعامل، همه از همان خط لولهٔ رندر): Implants: hero رندر · برش آناتومیک · assembly · ماکرو مواد (رندر) · گراف مراحل (SVG). Veneers: ماکرو · پوستهٔ نازک · placement · ماکروی مواد (رندر) · گراف مراحل. Smile: *پرتره اختصاصی (نیازمند Asset)* · تناسب · planning · عکس انسانی (نیازمند Asset) · harmony تعاملی. **دو مورد Smile بدون عکس واقعی با مجوز قابل ساخت نیست**؛ تا آن زمان با رندر قوس جایگزین و گزارش می‌شود.

## ۵. Brand Voice (TASK 06.02)

Sophisticated · Human · Confident · Refined · Warm · Medically responsible · International · Patient-centered.
قواعد: جملهٔ کوتاه و طبیعی؛ فعل فعال؛ بدون ضمیر تحکمی؛ CTA بدون فشار («بپرسید»، «ببینید»)؛ واژهٔ پزشکی دقیق (implant, abutment, enamel). ممنوع: «بهترین»، «تضمین ۱۰۰٪»، «بدون درد»، «بی‌نقص»، «سریع‌ترین»، هر نظر/آمار/سابقهٔ اختراعی.
**یافتهٔ ممیزی محتوا:** متن فعلی صحیح و محافظه‌کار است (۱۰۰٪ مطابق Claims Policy) ولی «عمومی» است: عنوان‌های `Care that is planned around you`، `Treatments focused on your smile` شخصیت برند ندارند. تکرار چهارباره «3 to 8 days / We speak your language» باید به یک منبع (Content Key) کاهش یابد.

## ۶. Asset Sourcing Plan (TASK 03.03 · 09.01)

| Asset | منبع فعلی | مجوز | حجم | مشکل | توصیه |
|---|---|---|---|---|---|
| Hero portrait | Unsplash (Josias Garibay) | Unsplash License | ۴۹KB WebP | **بدون model release، فقط تزئینی** | عکس‌برداری اختصاصی/جایگزین با release |
| ۳ رندر خدمات | تولید داخلی (three.js) | کار خودمان | ≈۹۶۸KB PNG مبدأ → AVIF ≤۱۲۰KB هر یک | رویه‌ای، نه عکس | حفظ؛ ارتقا طبق §۳ |
| ماکروی پرسلن واقعی | **ندارد** | — | — | عکس مجوزدار پیدا نشده | سفارش عکاسی در کلینیک یا stock دقیق (کارفرما) |
| ویدئوی لبخند | **ندارد** | — | — | رد شد (D-080) | فیلم‌برداری با رضایت‌نامه |
| تصویر AI چهره/دهان | **استفاده نمی‌شود** | — | — | ریسک غیرطبیعی | ممنوع |

## ۷. Headlines & Slogans (TASK 06.03–06.04) — پیش‌نویس برای GATE C

هیچ ادعای پزشکی ندارند. **همه برای بازبینی بومی (fa/de/tr) پیش‌نویس‌اند.**

| # | سبک | EN (master) | FA | DE | TR | کاربرد |
|---|---|---|---|---|---|---|
| 1 | A | A smile that feels like you. | لبخندی که به خودتان می‌آید. | Ein Lächeln, das zu Ihnen passt. | Size yakışan bir gülümseme. | **پیشنهاد شعار اصلی/Hero** |
| 2 | A | Naturally yours. | کاملاً مال خودتان. | Ganz natürlich Sie. | Doğal olarak sizin. | زیرعنوان لوگو |
| 3 | A | Quiet confidence. | اعتمادبه‌نفسی آرام. | Stille Zuversicht. | Sessiz bir özgüven. | Finale |
| 4 | A | Detail, done gently. | جزئیات، با ظرافت. | Präzision mit leichter Hand. | İnce işçilik, nazik dokunuş. | بخش درمان‌ها |
| 5 | B | Smile like nobody is watching. | بخندید، انگار کسی نگاه نمی‌کند. | Lachen Sie unbeschwert. | Kimse bakmıyormuş gibi gülün. | Hero ۲ |
| 6 | B | Begin with a conversation. | با یک گفتگو شروع کنید. | Am Anfang steht ein Gespräch. | Bir sohbetle başlayalım. | CTA مشاوره |
| 7 | B | Your smile, planned with you. | لبخندتان، همراه با شما طراحی می‌شود. | Ihr Lächeln – gemeinsam mit Ihnen geplant. | Gülüşünüz, sizinle birlikte planlanır. | Smile Design |
| 8 | C | Plan first. Treat with care. | اول برنامه‌ریزی، بعد درمان. | Erst planen, dann behandeln. | Önce planlama, sonra tedavi. | Journey |
| 9 | C | Every detail explained before it begins. | هر مرحله، پیش از شروع توضیح داده می‌شود. | Jeder Schritt wird vorab erklärt. | Her adım başlamadan önce anlatılır. | About |
| 10 | C | Precision you can understand. | دقتی که می‌توانید بفهمید. | Präzision, die man versteht. | Anlayabileceğiniz bir titizlik. | Implants |
| 11 | B | From your first message to your follow-up. | از اولین پیام تا پیگیری پس از درمان. | Von der ersten Nachricht bis zur Nachsorge. | İlk mesajdan tedavi sonrası takibe. | International |

*منطق:* #1 هم‌معنا در ۴ زبان، «به شما می‌آید» شخصی و بدون وعده. #9 و #11 فقط واقعیت‌های تأییدشده (توضیح پیش از درمان، پیگیری) را می‌گویند. هیچ‌کدام «بهترین/تضمین/بدون درد» ندارند.

**سه مجموعهٔ Hero** (Eyebrow ثابت: «Antalya · Istanbul»; CTA اصلی: «Request a free consultation»؛ ثانویه: WhatsApp):
1. **Signature:** *A smile that feels like you.* — Dental implants, veneers and smile design in Antalya & Istanbul, planned around you. (FA/DE/TR مطابق ردیف ۱؛ زیرمتن = ترجمهٔ طبیعی همین جمله)
2. **Human:** *Smile like nobody is watching.* — A free first consultation, in your language, before any decision.
3. **Precision:** *Plan first. Treat with care.* — Every step explained, from your first message to your follow-up.
نسخهٔ کامل ۴زبانهٔ زیرمتن‌ها پس از انتخاب شما نوشته و در Semantic Comparison کنترل می‌شود (GATE C).

## ۸. Four-Language Content Strategy (TASK 07)

- **ساختار موجود** `messages/*.json` + next-intl درست است؛ تغییر معماری نه. افزودن namespaceهای `implants.*`, `veneers.*`, `smileDesign.*` (فعلاً زیر `treatments.*`) برای ۱۱ بخش، و namespace `brand.*` برای شعار/حقایق مشترک (مدت ۳–۸ روز، پیگیری، زبان‌ها) تا یک بار تعریف شوند.
- **جریان:** EN master → استخراج «حقایق + قیدها» (جدول facts) → fa → de → tr → مقایسهٔ معنایی خط‌به‌خط → واژگان پزشکی (implant=ایمپلنت/Implantat/implant؛ veneer=لمینت/Veneer/lamina؛ crown=تاج/Krone/kron) → Layout (طول عنوان RTL/آلمانی) → تأیید.
- **کنترل:** تست unit تقارن کلید (موجود) + **تست جدید**: فهرست حقایق ثابت (عدد ۳–۸، «ضمانت با شرایط»، «مشاوره رایگان») باید در هر ۴ زبان وجود داشته باشد.
- **بازبینی انسانی fa/de/tr و پزشکی:** الزامی قبل از Launch (Q7)؛ من جایگزین آن نیستم.

## ۹. Updated Color Palette (TASK 08)

پالت D-079 **قبلاً اجرا شده** (نمونه‌های شما با اختلاف ≤ ۱ واحد: #CCBBA9، #3C4C66، #FCFBF9، #E5D9CE، #273447). نقاط بازنگری پیشنهادی:
1. **باندهای تیره** (Journey، Finale، Footer، intl): کاهش از ۴ به ۲ و جایگزینی دو مورد با `Soft Blue #DCE3EB`/Soft Beige تا «آبی تیره در سطح بزرگ» نماند. *پیش‌نمایش پیش از اجرا* (GATE D).
2. تأیید کنتراست کلمهٔ تأکید فارسی با Muted Blue #5B6D87 روی ivory (محاسبهٔ من: ۵٫۱:۱ روی ivory و ۴٫۸۱:۱ روی ice-50؛ حد AA برای متن عادی ۴٫۵؛ بررسی بصری باقی).
3. هیچ رنگ تازه‌ای افزوده نمی‌شود؛ رنگ پراکنده در کد = ۰ (تست contrast).

## ۱۰. Performance Architecture (TASK 09)

| معیار | بودجه | مبنای واقعی |
|---|---|---|
| LCP (Home، throttled phone) | ≤ 2.5s | اندازه‌گیری‌شده 0٫80s |
| CLS | ≤ 0.1 | 0 |
| INP | ≤ 200ms | **NOT RUN** |
| Hero | ≤ 120KB | ۴۹KB |
| رندرهای خدمات (صفحهٔ اصلی) | هر ≤ 120KB، جمع ≤ 700KB، lazy | تست e2e سبز |
| هر صفحهٔ درمان | تصویر بالای صفحه ≤ 120KB؛ جمع رسانه ≤ 900KB؛ JS تعاملی ≤ 20KB gzip | برنامه |
| فناوری | CSS animation + next/image؛ تعاملات (Anatomy، Layer Explorer، Analysis) = **React کوچک + CSS، بدون WebGL**؛ GSAP/three حذف از bundle صفحه‌ها | تصمیم |
| پاک‌سازی | حذف `three`/R3F و `public/models` اگر تأیید شد (≈ کاهش bundle) | تصمیم ۴ |

دسترسی‌پذیری: هر hotspot دکمه با `aria-pressed`/Tab/Enter، کنترل لمسی ≥ 44px، حالت reduced-motion = تصویر نهایی، متن جایگزین توضیحی برای تصاویر آموزشی (نه `alt=""`، چون محتوا شده‌اند).

## ۱۱. Roadmap (TASK 14) — هر Task یک commit، یک تست، قابل بازگشت

| ID | کار | وابسته | معیار پذیرش | تست |
|---|---|---|---|---|
| V6-01 | Namespaceهای محتوا + تست حقایق ثابت | تأیید C | ۴ زبان کلید برابر؛ تست حقایق سبز | unit |
| V6-02 | بازنویسی Hero/Home/About/International (متن تأییدشده) | V6-01 | بدون ادعای ممنوع؛ سه سایز موبایل بدون شکست | e2e + اسکرین‌شات ۴ زبان |
| V6-03 | رندرهای v2 (لثهٔ طبیعی، یقهٔ veneer، برش آناتومیک، ماکرو) | تأیید A | هر ≤ 120KB؛ بازبینی بصری | e2e service-art |
| V6-04 | قالب صفحهٔ درمان ۱۱ بخشی (اجزای مشترک) | تأیید B | سه صفحه ساختار متفاوت؛ landmark ثابت | e2e |
| V6-05 | Implants: Anatomy تعاملی + محتوا | V6-03/04 | کیبورد/لمس/reduced-motion | e2e + axe |
| V6-06 | Veneers: Layer Explorer + محتوا | V6-03/04 | همان | همان |
| V6-07 | Smile: Analysis + محتوا | V6-03/04 | همان | همان |
| V6-08 | بخش‌های Materials/Aftercare/Risks | **بازبینی پزشک** | منتشر فقط پس از تأیید | بازبینی |
| V6-09 | پالت: کاهش باند تیره | تأیید D | کنتراست AA | contrast + e2e |
| V6-10 | حذف کد/فایل قدیمی 3D (اختیاری) | تأیید | bundle کمتر | build |
| V6-11 | QA نهایی ۱۶ ترکیب + Lighthouse/INP | همه | CWV؛ `NOT RUN` فقط اگر واقعاً اجرا نشد | همه |

## ۱۲. Risks & Dependencies

1. **Asset انسانی با release** (Hero، Smile) — وابسته به کارفرما.
2. **بازبینی پزشکی** بخش‌های ۰۶–۰۹ و **بازبینی بومی** fa/de/tr — بدون آن منتشر نمی‌شود.
3. **سقف کیفیت رندر رویه‌ای** — واقع‌گرایی ≤ ~۳٫۵/۵؛ قول مدل‌سازی EthosVFX داده نمی‌شود.
4. دامنه/سرور/Telegram/بازبینی حقوقی (Launch، H07).
5. iCloud (کار در clone، انتقال دستی).

## ۱۳. تصمیم‌هایی که تأیید شما را می‌خواهد

۱. Hero: نگه‌داشتن عکس فعلی تا عکاسی اختصاصی؟ (پیشنهاد: بله، + سفارش عکاسی)
۲. Concept: A+C (پیشنهاد) یا B/C خالص؟
۳. شعار اصلی: #1 «لبخندی که به خودتان می‌آید»؟ و کدام مجموعهٔ Hero (۱–۳)؟
۴. حذف کد 3D قدیمی و وابستگی `three`/R3F (پیشنهاد: بله).
۵. کاهش باندهای تیره از ۴ به ۲ (پیش‌نمایش قبل از اجرا).
۶. متن مواد/مراقبت/ریسک: نوشتن نسخهٔ عمومی «در انتظار بازبینی پزشک» (پیشنهاد) یا منتظر متن کلینیک؟
۷. سفارش عکاسی/فیلم‌برداری اختصاصی (ماکروی پرسلن، لبخند) — بله/خیر.
