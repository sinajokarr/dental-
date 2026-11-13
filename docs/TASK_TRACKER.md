# TASK TRACKER — JOKAR DENTAL

> به‌روزرسانی: 2026-11-12

**وضعیت‌ها:**

- ⬜ شروع‌نشده
- 🔄 در حال انجام
- ✅ تمام‌شده
- 🔒 منتظر ورودی کارفرما
- ⏸ به تعویق افتاده

**اندازه Task** (نسبی، نه زمان قطعی): S کوچک · M متوسط · L بزرگ

**Phase A (Foundation) تمام شد** (2026-11-11) روی شاخه `phase-a-foundation`: ۸ Task، تست‌ها: واحد ۹/۹ · E2E و axe ۱۰/۱۰ · Django ۴/۴. تصمیم‌های این فاز: D-053 تا D-059.

## Phase A — Foundation

| ID | Task | پیش‌نیاز | فایل‌ها | خروجی و معیار پذیرش | تست | اندازه | وضعیت |
|---|---|---|---|---|---|---|---|
| A01 | Repository | G0 | `.gitignore` · `README.md` · `CLAUDE.md` · `.env.example` | git init انجام شده؛ هیچ secret در repo نیست؛ CLAUDE.md قوانین پروژه را دارد | `git check-ignore .env` | S | ✅ `48e483f` |
| A02 | Next.js | A01 | `frontend/*` | Next 16، TS strict، Tailwind 4، ESLint، `output: 'standalone'` | `npm run build` · `tsc --noEmit` · lint | S | ✅ `e9a734a` |
| A03 | Django | A01 | `backend/config` · `backend/leads` | Django 5.2 LTS + DRF؛ settings از env | `manage.py check` · `manage.py test` | S | ✅ `8dadfb9` |
| A04 | PostgreSQL | A03 | `infrastructure/compose.dev.yml` | PostgreSQL 18 در Docker؛ migrate موفق | `manage.py migrate` | S | ✅ `5bd4f81` |
| A05 | Env | A02–A04 | `.env.example` · settings | نبود env الزامی، برنامه را با پیام روشن متوقف می‌کند | اجرای بدون env | S | ✅ `acf72be` |
| A06 | Localization | A02 | `src/i18n/*` · `src/proxy.ts` · `messages/*` | ۴ زبان، pathnames، `lang` و `dir`، ریدایرکت `/`، کلید گم‌شده یعنی شکست build | Playwright با هدر Accept-Language · build با کلید ناقص | M | ✅ `7a7cf7e` |
| A07 | Design Tokens | A02 | `src/app/globals.css` | `@theme` مطابق DESIGN_SYSTEM؛ grep برای کلاس‌های فیزیکی (`ml-`، `pl-`، `left-`) | grep در اسکریپت test | S | ✅ `082b078` |
| A08 | زیرساخت تست | A02 · A03 | `tests/` · `playwright.config.ts` · scripts | یک تست نمونه در هر لایه سبز است | `node --test` · Playwright · `manage.py test` | M | ✅ `f00dc3f` |

## Phase B — Design System

| ID | Task | پیش‌نیاز | فایل‌ها | خروجی و معیار پذیرش | تست | اندازه | وضعیت |
|---|---|---|---|---|---|---|---|
| B01 | Typography | A06 · A07 | `public/fonts` · `globals.css` · `[locale]/layout.tsx` | فونت‌ها و type scale؛ preload مخصوص هر زبان؛ fallback با `size-adjust` | Network: صفحه fa فونت display لاتین دانلود نکند · اسکرین‌شات حروف İ، ß و ğ · CLS برابر ۰ | M | ✅ `f808652` |
| B02 | رنگ و کنتراست | A07 | `globals.css` · `tests/unit/contrast.test.ts` | توکن‌های معنایی | Unit test کنتراست همه جفت‌های متن و پس‌زمینه | S | ✅ `a7cbf05` |
| B03 | Glass | B02 | `ui/GlassPanel.tsx` | ۴ recipe، Porcelain Edge و fallbackها | اسکرین‌شات + شبیه‌سازی مرورگر بدون backdrop-filter | M | ✅ `ad61a56` |
| B04 | Navigation | B03 · A06 | `layout/Nav*` · `LanguageSwitcher.tsx` | نسخه دسکتاپ و موبایل، dropdown، switcher که به صفحه معادل می‌رود، skip link | Playwright با keyboard + axe | L | ✅ `f38a547` |
| B05 | Buttons | B02 | `ui/Button.tsx` | Primary، WhatsApp، Tertiary و Inverted با همه states و magnetic | axe + اسکرین‌شات states | S | ✅ `9fcc3d0` |
| B06 | Layout | A07 | `ui/Section*` · `lib/content-flags.ts` | responsive در عرض‌های 360 تا 1440؛ RTL | اسکرین‌شات fa و en | S | ✅ `c8e8897` |
| B07 | Motion system | A07 | `lib/reveal.ts` · `lib/motion.ts` | `useReveal`، noscript، `dirSign`، GSAP lazy، reduced-motion | Playwright با RM و بدون JS · bundle analyzer (GSAP نباید در bundle اولیه باشد) | M | ✅ `50ec205` |
| B08 | Gallery + QA راست‌به‌چپ | B01–B07 | `app/[locale]/dev/gallery` (فقط dev) | همه کامپوننت‌ها در ۴ زبان | اسکرین‌شات → **Gate G1** | S | ⏭ ادغام در G3 (ruling) |
| B09 | پالت Beige Agate / Blue Gentian — فقط رنگ (D-073) | B02 | `globals.css` · rgbهای دستی در ۷ کامپوننت · `ToothScene.tsx` · posterهای Hero · `icon.svg` · `apple-icon.tsx` · `opengraph-image.tsx` | همه رنگ‌ها از `#CBBAA8` و `#3B4D65` ساخته می‌شوند؛ نام tokenها ثابت؛ چیدمان، تایپوگرافی و انیمیشن بدون تغییر | unit (token و کنتراست) · مقایسه جای ۵۵۲۶ المان قبل و بعد · e2e | M | ✅ commit `B09` (روی branch `palette-beige-agate-gentian`، push نشده) |
| B10 | منوی زبان کنار دکمه‌اش باز شود (باگ) | B04 | `layout/LanguageSwitcher.tsx` · `tests/e2e/navigation.spec.ts` | استایل پیش‌فرض popover مرورگر (`inset: 0`) منو را به لبه start می‌چسباند (دسکتاپ: گوشه بالا چپ)؛ `start-auto` اضافه شد | e2e در LTR و RTL (اول شکست خورد، بعد پاس شد) | S | ✅ commit `B10` |
| B11 | پالت پررنگ‌تر (بازخورد کارفرما) | B09 | `globals.css` · `Hero.tsx` · `PointerGlow.tsx` · `ToothScene.tsx` · posterهای Hero · `opengraph-image.tsx` | سطح‌های بژ یک پله پررنگ‌تر، کنتراست AA حفظ شد (D-074) | unit · e2e · مقایسه ۵۵۲۶ المان | S | ✅ commit `B11` |
| B12 | منوی زبان دقیقاً زیر دکمه‌اش باز شود (بازخورد کارفرما) | B10 | `layout/LanguageSwitcher.tsx` · `tests/e2e/navigation.spec.ts` | لبه منو با لبه دکمه هم‌تراز و درست زیر آن، در LTR و RTL | e2e (اول شکست خورد، بعد پاس شد) | S | ✅ commit `B12` |
| B13 | View Transitions: نقاشی درمان بین صفحه‌ها (D-075) | C13 | `Treatments.tsx` · `TreatmentPage.tsx` · `RevealObserver.tsx` · `globals.css` · `[locale]/layout.tsx` · `tests/e2e/treatments.spec.ts` | نقاشی نرم به صفحه درمان می‌رود و دوباره کشیده نمی‌شود؛ reduced motion بدون انیمیشن | e2e (اول شکست خورد، بعد پاس شد) + فریم‌های انتقال | S | ✅ commit `B13` |
| HS01 | Hero «Signature Smile» (D-076) | C12 | `sections/hero-smile/*` · `page.tsx` · `tests/e2e/hero-smile.spec.ts` · `tests/unit/hero-smile.test.ts` · `performance.spec.ts` | SVG+CSS جای دندان سه‌بعدی؛ ≤ ۵ ثانیه؛ reduced motion و بدون JS = تصویر نهایی؛ چیدمان یکسان | unit 57/57 · e2e 181 · mutation check · ۲۹۷ box · LCP 0.72s | M | ✅ commit `HS01` (بدون push) |
| SV01 | سه انیمیشن بخش خدمات اصلی (D-077) | C13 | `sections/service-art/*` · `Treatments.tsx` · `tests/e2e/service-art.spec.ts` · `treatments.spec.ts` | هر درمان یک روایت ≈ ۲٫۵ ثانیه؛ مستقل؛ یک‌بار؛ تصویر نهایی ثابت؛ چیدمان یکسان | e2e 187 · mutation check · ۴۷۷ box · ریتم فریم | L | ✅ commit `SV01` (بدون push) |
| V5-A1 | Hero: لبخند طبیعی و تمام‌رخ (D-080، جایگزین D-078) | HS01 | `sections/hero-portrait/*` · `public/images/hero/portrait.webp` · `page.tsx` · `next.config.ts` · `hero-portrait.spec.ts` · `performance.spec.ts` · `ASSET_LICENSES.md` | پنجره قوسی، subject جدا از backdrop، reveal ≈ ۳ ثانیه، عمق با ماوس، ۴۹KB | e2e · mutation check · LCP 0.80s | M | ✅ commit `V5-A1` (بدون push) |
| V5-B | پالت Soft Luxury (D-079) | V5-A1 | `globals.css` · `Section.tsx` · `SiteFooter.tsx` · `TrustStrip.tsx` · کامپوننت‌هایی که rgb پراکنده داشتند · icon و OG · tests | tokenهای ivory/band/muted-blue؛ بخش‌های تیره = Blue Gentian؛ بدون rgb پراکنده | unit 57/57 · e2e 185 (axe) | M | ✅ commit `V5-B` (بدون push) |
| V5-A2 | سه تصویر خدمات: رندر استودیویی آفلاین (D-081) | V5-B | `scripts/render-treatments/*` · `assets/treatments/*` · `sections/service-art/*` · `tests/e2e/service-art.spec.ts` | لایه‌های PNG→AVIF، حرکت CSS یک‌باره، راهنمای هم‌تراز | Playwright: service-art 9/9 · کل ۱۸۵ passed / ۳ skipped · tsc/lint 0 · Lighthouse و دستگاه واقعی NOT RUN | M | ✅ |
| V6-00 | ممیزی سایت + بسته تأیید خلاقانه | V5-A2 | `WEBSITE_AUDIT.md` · `CREATIVE_APPROVAL_PACKAGE.md` | فقط سند | — | S | ✅ `9dae791` |
| V6-01 | صفحه‌های اختصاصی سه درمان: explorer تعاملی + بخش‌های مخصوص هر درمان + شعار Hero (D-082) | V6-00 | `sections/explorers/*` · `TreatmentPage.tsx` · `messages/*.json` · `treatment-pages.spec.ts` · `treatments.spec.ts` · `hero.spec.ts` | سه تعامل بومی، محتوای ۴زبانه، رفع خطای RTL guard در `SmileRender.tsx` | unit ۵۷/۵۷ · e2e ۱۹۱ passed / ۳ skipped · tsc/lint 0 · LCP 0.72s CLS 0 (Home) · Lighthouse، INP، دستگاه واقعی، screen reader: NOT RUN · بازبینی پزشکی/بومی: NOT DONE | L | ✅ |
| V6-02 | باندهای Soft Blue به‌جای دو باند تیره + چهار عنوان برند صفحه اصلی (D-083) | V6-01 | `globals.css` · `Section.tsx` · `Finale.tsx` · `TreatmentPage.tsx` · `messages/*.json` · `tokens.test.ts` · `contrast.test.ts` | توکن mist، متن تیره روی باند روشن | unit ۵۷/۵۷ · e2e ۱۹۰ passed / ۳ skipped / ۱ failed (Firefox، فرم مشاوره: در تکرار ۶ از ۶ سبز؛ ناپایدار، بی‌ارتباط با این تغییر) · tsc/lint 0 | S | ✅ |
| V6-03 | رندر v2 لمینت و قوس لبخند: لثه‌ای که محو می‌شود (نه لبه بریده)، لبه بالایی صاف، پوسته لمینت نازک‌تر و کم‌براق‌تر | V6-02 | `scripts/render-treatments/{geometry,jobs}.js` · `assets/treatments/{veneers,smile}/*.png` · `explorers.css` | همان خط لوله D-081؛ دوربین و meta بدون تغییر | e2e (chromium): service-art + treatment-pages + treatments = ۳۴ passed · lint 0 · کل مجموعه در این Task: NOT RUN (آخرین اجرای کامل در V6-02) · هنوز رندر رویه‌ای است، نه عکس | S | ✅ |
| V6-04 | QA چهارزبانه: تست هم‌معنایی حقایق در ۴ زبان، Vitals سه صفحه درمان، ۱۶ ترکیب صفحه × زبان؛ حذف یک تکرار «۳ تا ۸ روز» از صفحه اصلی | V6-03 | `tests/unit/facts.test.ts` · `tests/e2e/treatment-pages.spec.ts` · `messages/*.json` | تست‌ها با mutation کنترل شدند (facts) | unit ۶۲/۶۲ · e2e ۱۹۸ passed / ۳ skipped · tsc/lint 0 · موبایل کندشده: Home LCP 0.94s · Implants 1.29s · Veneers 1.28s · Smile 1.51s · CLS 0 در هر چهار · INP، Lighthouse، دستگاه واقعی، screen reader: NOT RUN | S | ✅ |
| V6-A1 | Hero: فیلم واقعی لبخند طبیعی به‌جای عکس ثابت (D-084) | V6-04 | `sections/hero-film/*` · `public/images/hero/film/*` · `scripts/video/*` · `page.tsx` · `hero-film.spec.ts` · `performance.spec.ts` · `cross-browser.spec.ts` · حذف `hero-portrait/*` و `portrait.webp` | `<video>` بومی، یک بار، بدون حلقه؛ reduced motion = عکس ثابت لبخند | unit ۶۲/۶۲ · e2e ۲۰۴ passed / ۳ skipped · tsc/lint 0 · موبایل کندشده: LCP 1.19s، CLS 0 · پخش کامل در ۵ موتور شبیه‌سازی‌شده · دستگاه واقعی، Low Power Mode آیفون، Lighthouse: NOT RUN | M | ✅ |
| V6-A1b | بازیگر فیلم Hero عوض شد (D-085) | V6-A1 | `public/images/hero/film/*` | — | e2e فیلم Hero در ۵ موتور سبز؛ LCP 0.99s | S | ✅ `4923fea` |
| V6-A2 | تصاویر سه خدمت = فیلم واقعی مجوزدار (D-086) | V6-A1b | `sections/service-film/*` · `Treatments.tsx` · `TreatmentPage.tsx` · `Explorers.tsx` · `service-art.css` · `public/images/treatments/*` · `scripts/video/encode.mjs` · `service-film.spec.ts` · `treatments.spec.ts` · حذف `ServiceArt`/`PlayOnView`/`service-art.spec.ts` | فیلم یک‌باره در پنجره دایره‌ای، بارگذاری فقط در دید | unit ۶۲/۶۲ · e2e ۲۰۱ passed / ۳ skipped · tsc/lint 0 · LCP درمان‌ها 1.21–1.36s · هشدار hydration فقط در dev (RevealObserver، از قبل؛ در Known Issues) | M | ✅ |
| V6-A3 | سه عکس واقعی مجوزدار (مدل، نه بیمار) در «چرا»، بیماران بین‌المللی و درباره ما؛ حذف نقاشی‌های خطی (D-087) | V6-A2 | `ui/Photo.tsx` · `WhyJokar.tsx` · `InternationalPage.tsx` · `about/page.tsx` · `assets/photos/*` · `globals.css` · `RevealObserver.tsx` · حذف `TreatmentDrawing.tsx` · `why.spec.ts` · `treatment-pages.spec.ts` | — | unit ۶۲/۶۲ · tsc/lint 0 · e2e: فایل‌های مرتبط ۳۳ passed؛ کل مجموعه پیش از دو اصلاح آخر ۲۰۲ passed / ۲ failed (همان دو تست که اصلاح شدند) | S | ✅ |

## Phase C — Homepage

| ID | Task | پیش‌نیاز | فایل‌ها | خروجی و معیار پذیرش | تست | اندازه | وضعیت |
|---|---|---|---|---|---|---|---|
| C01 | Hero (HTML) | B | `sections/Hero.tsx` | متن و CTA سمت سرور، AN-04 تا AN-06، کادر poster | Lighthouse ×5 (LCP Lab ≤ 2.5s) · Playwright بدون JS · viewport 390×844 | M | ✅ `2b3ba01` |
| C02 | مدل و صحنه سه‌بعدی | C01 · **DP1** | `three/hero-tooth/*` · `public/models` · `public/images/hero` | خرید مدل؛ Blender (نصب یا آرتیست)؛ GLB ≤ 150KB؛ متریال دو Tier؛ Lightformer؛ pipeline ساخت poster؛ renderهای برند؛ **DP2** | `gltf-transform inspect` · `renderer.info` · visual diff بین poster و فریم اول | L | ✅ `6701a91` |
| C03 | ورود سینمایی و تعامل | C02 | همان | Tierها، lazy-load، `compileAsync`، AN-07 تا AN-09، حرکت خودکار ≤ 5s، fallback برای context loss | طبق 3D plan §۱۲ روی دستگاه واقعی → **Gate G3** | L | ✅ `e07bb73` |
| C04 | Trust + Treatments | B · C02 | `sections/TrustStrip.tsx` · `Treatments.tsx` | فقط ادعاهای تأییدشده؛ هر کارت یک لینک | axe · keyboard · اسکرین‌شات | M | ✅ `9052b54` |
| C05 | Why Jokar | B | `sections/WhyJokar.tsx` | هر ادعا به Brief قابل ردیابی است | بازبینی محتوا | S | ✅ `c92788e` |
| C06 | مسیر International | B07 | `sections/Journey.tsx` | Navy، ۵ مرحله، AN-16 و AN-17 | Performance trace · RM · RTL | M | ✅ `4e78ffa` |
| C07 | FAQ | B | `sections/Faq.tsx` | `<details name>`؛ فقط سؤالاتی که پاسخ تأییدشده دارند | keyboard · axe | S | ✅ `c402e6f` |
| C08 | پوسته بخش مشاوره | B | `sections/Consultation.tsx` | چیدمان + «What happens next» + WhatsApp | اسکرین‌شات | S | ✅ `83041bb` |
| C09 | Finale + Footer + Sticky | B04 · B05 | `sections/Finale.tsx` · `layout/Footer.tsx` · `StickyCta.tsx` | Sticky کنار فرم یا هنگام باز بودن کیبورد پنهان می‌شود؛ WCAG 2.4.11 | Playwright موبایل | M | ✅ `83041bb` |
| C10 | سکشن‌های مخفی | B06 | `sections/Team.tsx` · `Technology.tsx` · `Stories.tsx` | flag خاموش یعنی هیچ DOM | اسکرین‌شات با flag روشن و خاموش | S | ⏭ منتظر محتوا (Q2/Q3/Q4) |

## Phase C2 — Motion & 3D v2 (بازخورد کارفرما، D-063 تا D-065)

| ID | Task | پیش‌نیاز | فایل‌ها | خروجی و معیار پذیرش | تست | اندازه | وضعیت |
|---|---|---|---|---|---|---|---|
| C11 | دندان v2 | C02 | `scripts/build-tooth.mjs` · `tooth.bin` | مولر آناتومیک (۵ cusp، شیار، گردن، دو ریشه)، ≤ 30k مثلث، ≤ 150KB | unit: جزئیات، آناتومی، بودجه | M | ✅ `c93d6fe` |
| C12 | صحنه v2 + ورود «اسکن دیجیتال» | C11 | `ToothScene.tsx` · `HeroTooth.tsx` · `entrance.ts` · posterها | ابر نقاط ← پرسلن ≤ 5s، چرخش با اسکرول، poster اسکن/نهایی | unit: زمان‌بندی؛ e2e: settle، بدون تکرار، poster، بدون WebGL | L | ✅ `f9ac904` |
| C13 | فصل‌های درمان | B07 | `Treatments.tsx` · `TreatmentDrawing.tsx` | نقاشی خطی که با اسکرول کشیده می‌شود؛ بدون شماره ساختگی | e2e: draw، reduced motion، لینک‌ها، axe | M | ✅ `9293530` |
| C14 | مسیر سینمایی و پنل‌های navy | C06 | `Journey.tsx` · `Finale.tsx` · `WhyJokar.tsx` · `button.ts` | پنل باز می‌شود، خط با سر درخشان، مراحل به‌ترتیب روشن، glint | e2e: پنل، خط، reduced motion | M | ✅ `da0363a` |
| C15 | پاسخ‌های کارفرما در متن‌ها | D-062 | `messages/*` · `TrustStrip` · `Consultation` · `SiteFooter` · `whatsapp.ts` | زبان، ارزیابی آنلاین، ۳–۸ روز، پیگیری/ضمانت، لینک تماس | unit + e2e (FAQ ۹، tel) | M | ✅ `ec6c377` |

## Phase D — Backend

| ID | Task | پیش‌نیاز | فایل‌ها | خروجی و معیار پذیرش | تست | اندازه | وضعیت |
|---|---|---|---|---|---|---|---|
| D01 | Database Schema | A04 | migrations | ERD نهایی و ایندکس‌ها | migration روی PostgreSQL | S | ✅ `4f7590f` |
| D02 | Lead Models | D01 | `leads/models.py` | Lead، LeadActivity، تولید reference یکتا | Django tests | S | ✅ `4f7590f` |
| D03 | Lead API | D02 | `leads/api.py` · `config/urls.py` | `POST /leads/` و `/health/` طبق API_SPEC | `APITestCase` برای همه کدهای وضعیت | M | ✅ `e5e625e` |
| D04 | Validation | D03 | `leads/api.py` | phonenumbers، enumها، رضایت، ایمیل شرطی، idempotency و throttle | ماتریس جدولی + تست هم‌زمانی | M | ✅ `e5e625e` |
| D05 | Django Admin | D02 | `leads/admin.py` | ستون‌ها، فیلترها، جست‌وجو، actions، یادداشت‌ها، تماس سریع و ثبت activity | تست‌های admin client | M | ✅ `469ff05` |
| D06 | Telegram | D03 | `leads/notifications.py` · commands · worker | outbox، retry، تصاحب اتمیک، redaction توکن | تست با mock؛ **تست واقعی NOT RUN تا Q5** | M | ✅ `85dc434` (تست واقعی NOT RUN — منتظر Q5) |
| D07 | Permissions و امنیت | D05 | settings · admin | گروه‌ها، 2FA، axes، مسیر Admin، کوکی‌ها؛ `check --deploy` تمیز | tests + ورود دستی | M | ✅ `583a6e3` |
| D08 | مجموعه تست API و Admin | D03–D07 | `leads/tests/` | همه تست‌ها سبز | `manage.py test` | S | ✅ `583a6e3` |

## Phase E — Conversion

| ID | Task | پیش‌نیاز | فایل‌ها | خروجی و معیار پذیرش | تست | اندازه | وضعیت |
|---|---|---|---|---|---|---|---|
| E01 | رابط فرم | C08 · B | `forms/ConsultationForm.tsx` · `forms/LeadForm.tsx` · `lib/validate-lead.ts` · `lib/countries.ts` | فیلدها، حالت‌ها، دسترس‌پذیری، کد تلفن خودکار، honeypot، کار بدون JS | Playwright ۱۳ تست + axe | L | ✅ `4b0b2d6` |
| E02 | WhatsApp CTA | A06 | `lib/whatsapp.ts` · messages | ۶ context در ۴ زبان؛ همه محل‌های دکمه | `node:test` + Playwright در ۴ زبان | S | ✅ `3d977ba` |
| E03 | اتصال فرم به API | E01 · D04 | `forms/actions.ts` · `lib/lead-response.ts` | Server Action، نگاشت خطاها، timeout ۸ ثانیه، retry با idempotency، کار بدون JS | unit + e2e (mock قراردادی) + یک اجرای واقعی با Django (`JD-XAC89M`) | M | ✅ `4b0b2d6` |
| E04 | Consent | E01 · Q8 | فرم | چک‌باکس رضایت با لینک Privacy، `consent_version=draft-1` | e2e | S | 🟡 پیش‌نویس — متن حقوقی نهایی قبل از Launch (D-062) |
| E05 | Conversion events | — | — | — | — | — | ⏸ فاز I |
| E06 | Tracking QA | — | — | — | — | — | ⏸ فاز I |
| E07 | QA پایداری فرم | E03 · D06 | `tests/e2e/form-resilience.spec.ts` · `leads/tests/test_api.py` | timeout، خطای 500، قطع اتصال، قطع Telegram — بدون Lead تکراری یا گمشده | e2e ۳ تست + Django | S | ✅ |

## Phase F — Multilingual

| ID | Task | پیش‌نیاز | فایل‌ها | خروجی و معیار پذیرش | تست | اندازه | وضعیت |
|---|---|---|---|---|---|---|---|
| F01 | متن مرجع انگلیسی | C · G01 | `messages/en.json` | همه متن‌ها طبق Claims Policy؛ گارد خودکار ادعاها | `tests/unit/claims.test.ts` | M | ✅ `66bd0d4` (Q13 پاسخ داده شد) |
| F02 | فارسی | F01 | `messages/fa.json` | ترجمه کامل؛ برابری کلیدها؛ گارد ادعاها | unit + اسکرین‌شات RTL | M | ✅ (بازبینی نهایی فارسی‌زبان باقی است) |
| F03 | Deutsch | F01 | `messages/de.json` | ترجمه کامل؛ گارد ادعاها | unit | M | 🟡 ترجمه کامل — بازبینی متخصص پزشکی (Q7) باقی است |
| F04 | Türkçe | F01 | `messages/tr.json` | ترجمه کامل؛ گارد ادعاها | unit | M | 🟡 ترجمه کامل — بازبینی متخصص پزشکی (Q7) باقی است |
| F05 | QA راست‌به‌چپ و چپ‌به‌راست | F02–F04 | `tests/e2e/rtl.spec.ts` | آینه‌شدن جهت، اعداد LTR، هیچ کنترلی بیرون از صفحه ۳۶۰px | e2e + اسکرین‌شات | M | ✅ `41f7f7b` |
| F06 | International SEO | F01–F04 | `lib/seo.ts` · `sitemap.ts` · `robots.ts` · JSON-LD · OG · icons | hreflang با slug محلی + x-default، canonical، OG، MedicalOrganization | `tests/e2e/seo.spec.ts` | M | ✅ `4a0d9f0` (Rich Results Test: NOT RUN — دامنه نداریم) |

## Phase G — Inner Pages

| ID | Task | پیش‌نیاز | فایل‌ها | خروجی و معیار پذیرش | تست | اندازه | وضعیت |
|---|---|---|---|---|---|---|---|
| G01 | قالب صفحه خدمت | C | `sections/TreatmentPage.tsx` | ساختار SITEMAP §۵ | e2e ۱۲ صفحه + axe | M | ✅ `75321b6` |
| G02 | Dental Implants | G01 · 🩺 | `dental-implants/page.tsx` | متن عمومی بدون ادعای تأییدنشده؛ پیش‌انتخاب خدمت در فرم و WhatsApp | E2E | S | ✅ (بازبینی پزشکی Q7 باقی است) |
| G03 | Dental Veneers | G01 · 🩺 | `dental-veneers/page.tsx` | همان | E2E | S | ✅ (بازبینی پزشکی Q7 باقی است) |
| G04 | Smile Design | G01 · 🩺 | `smile-design/page.tsx` | همان | E2E | S | ✅ (بازبینی پزشکی Q7 باقی است) |
| G05 | International Patients | G01 · C06 | `international-patients/page.tsx` | خدمات هماهنگی، مسیر بیمار، اقامت ۳–۸ روز، FAQ سفر | E2E + axe | M | ✅ `e1e631c` |
| G06 | Free Consultation | E01 | `free-consultation/page.tsx` | فرم + WhatsApp + تماس + مراحل بعدی + FAQ | E2E + axe | S | ✅ `6073e28` |
| G07 | About | G01 | `about/page.tsx` | متن ما از واقعیت‌های تأییدشده (D-062) | E2E + axe | S | ✅ |
| G08 | صفحات حقوقی | — | `privacy` · `kvkk` · `legal-notice` | پیش‌نویس منطبق با رفتار واقعی سیستم، noindex، برچسب پیش‌نویس | E2E | S | 🟡 پیش‌نویس — بازبینی حقوقی قبل از Launch |
| G09 | 404 و صفحه خطا | B | `[locale]/not-found.tsx` · `[...rest]` · `error.tsx` | در ۴ زبان، status 404 | E2E | S | ✅ |

## Phase H — Quality & Launch

| ID | Task | پیش‌نیاز | فایل‌ها | خروجی و معیار پذیرش | تست | اندازه | وضعیت |
|---|---|---|---|---|---|---|---|
| H01 | تست موبایل و مرورگرها | C–G | `tests/e2e/cross-browser.spec.ts` | Firefox، WebKit، iPhone 13، Pixel 7 (شبیه‌سازی) | e2e ۵ پروژه | M | ✅ `f072b82` (دستگاه واقعی: NOT RUN) |
| H02 | دسترس‌پذیری | C–G | `tests/e2e/a11y-pages.spec.ts` | axe روی ۱۱ نوع صفحه × fa/en بدون serious/critical | e2e | M | ✅ `f072b82` (screen reader: NOT RUN) |
| H03 | Performance | C–G | `tests/e2e/performance.spec.ts` | JS 166KB، CSS 10KB، فونت ≤ 102KB، LCP ≤ 1.12s، CLS 0 | e2e (lab) | M | ✅ `3c12b31` (Lighthouse/field: NOT RUN) |
| H04 | بازبینی امنیت | D · H06 | `SECURITY_PERFORMANCE_QA.md` | هدرها/CSP، API پنهان، IP واقعی، check --deploy، audit | ابزار + بازبینی | M | ✅ `45f8451` |
| H05 | E2E | همه | `playwright.prod.config.ts` | کل مجموعه روی stack محلی Production | Playwright: 139 passed | M | ✅ `bc1b4ff` |
| H06 | زیرساخت Production | D | `infrastructure/*` · Dockerfileها | Compose، Caddy، worker، backup + تمرین بازگردانی، smoke | smoke 18/18 | L | ✅ `67fdf63` (سرور واقعی: Q6) |
| H07 | Deployment | H06 · دامنه | `LAUNCH_REPORT.md` §۸ | DNS، TLS، secrets، تست واقعی Telegram | smoke | M | 🔒 NOT RUN — دامنه/سرور و بات Telegram با کارفرما |
| H08 | اعتبارسنجی نهایی | H01–H07 | `LAUNCH_REPORT.md` | گزارش آمادگی و موانع | **Gate G5** | S | 🟡 گزارش آماده — G5 باز تا ۴ کار کارفرما |
