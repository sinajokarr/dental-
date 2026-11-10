# TASK TRACKER — JOKAR DENTAL

> به‌روزرسانی: 2026-11-11

**وضعیت‌ها:**

- ⬜ شروع‌نشده
- 🔄 در حال انجام
- ✅ تمام‌شده
- 🔒 منتظر ورودی کارفرما
- ⏸ به تعویق افتاده

**اندازه Task** (نسبی، نه زمان قطعی): S کوچک · M متوسط · L بزرگ

**تنها کار تمام‌شده تا امروز:** طراحی و مستندات. همه اسناد در `docs/` هستند.

## Phase A — Foundation

| ID | Task | پیش‌نیاز | فایل‌ها | خروجی و معیار پذیرش | تست | اندازه | وضعیت |
|---|---|---|---|---|---|---|---|
| A01 | Repository | G0 | `.gitignore` · `README.md` · `CLAUDE.md` · `.env.example` | git init انجام شده؛ هیچ secret در repo نیست؛ CLAUDE.md قوانین پروژه را دارد | `git check-ignore .env` | S | ⬜ |
| A02 | Next.js | A01 | `frontend/*` | Next 16، TS strict، Tailwind 4، ESLint، `output: 'standalone'` | `npm run build` · `tsc --noEmit` · lint | S | ⬜ |
| A03 | Django | A01 | `backend/config` · `backend/leads` | Django 5.2 LTS + DRF؛ settings از env | `manage.py check` · `manage.py test` | S | ⬜ |
| A04 | PostgreSQL | A03 | `infrastructure/compose.dev.yml` | PostgreSQL 18 در Docker؛ migrate موفق | `manage.py migrate` | S | ⬜ |
| A05 | Env | A02–A04 | `.env.example` · settings | نبود env الزامی، برنامه را با پیام روشن متوقف می‌کند | اجرای بدون env | S | ⬜ |
| A06 | Localization | A02 | `src/i18n/*` · `src/proxy.ts` · `messages/*` | ۴ زبان، pathnames، `lang` و `dir`، ریدایرکت `/`، کلید گم‌شده یعنی شکست build | Playwright با هدر Accept-Language · build با کلید ناقص | M | ⬜ |
| A07 | Design Tokens | A02 | `styles/globals.css` | `@theme` مطابق DESIGN_SYSTEM؛ grep برای کلاس‌های فیزیکی (`ml-`، `pl-`، `left-`) | grep در اسکریپت test | S | ⬜ |
| A08 | زیرساخت تست | A02 · A03 | `tests/` · `playwright.config.ts` · scripts | یک تست نمونه در هر لایه سبز است | `node --test` · Playwright · `manage.py test` | M | ⬜ |

## Phase B — Design System

| ID | Task | پیش‌نیاز | فایل‌ها | خروجی و معیار پذیرش | تست | اندازه | وضعیت |
|---|---|---|---|---|---|---|---|
| B01 | Typography | A06 · A07 | `public/fonts` · `globals.css` · `[locale]/layout.tsx` | فونت‌ها و type scale؛ preload مخصوص هر زبان؛ fallback با `size-adjust` | Network: صفحه fa فونت display لاتین دانلود نکند · اسکرین‌شات حروف İ، ß و ğ · CLS برابر ۰ | M | ⬜ |
| B02 | رنگ و کنتراست | A07 | `globals.css` · `tests/unit/contrast.test.ts` | توکن‌های معنایی | Unit test کنتراست همه جفت‌های متن و پس‌زمینه | S | ⬜ |
| B03 | Glass | B02 | `ui/GlassPanel.tsx` | ۴ recipe، Porcelain Edge و fallbackها | اسکرین‌شات + شبیه‌سازی مرورگر بدون backdrop-filter | M | ⬜ |
| B04 | Navigation | B03 · A06 | `layout/Nav*` · `LanguageSwitcher.tsx` | نسخه دسکتاپ و موبایل، dropdown، switcher که به صفحه معادل می‌رود، skip link | Playwright با keyboard + axe | L | ⬜ |
| B05 | Buttons | B02 | `ui/Button.tsx` | Primary، WhatsApp، Tertiary و Inverted با همه states و magnetic | axe + اسکرین‌شات states | S | ⬜ |
| B06 | Layout | A07 | `ui/Section*` · `lib/content-flags.ts` | responsive در عرض‌های 360 تا 1440؛ RTL | اسکرین‌شات fa و en | S | ⬜ |
| B07 | Motion system | A07 | `lib/reveal.ts` · `lib/motion.ts` | `useReveal`، noscript، `dirSign`، GSAP lazy، reduced-motion | Playwright با RM و بدون JS · bundle analyzer (GSAP نباید در bundle اولیه باشد) | M | ⬜ |
| B08 | Gallery + QA راست‌به‌چپ | B01–B07 | `app/[locale]/dev/gallery` (فقط dev) | همه کامپوننت‌ها در ۴ زبان | اسکرین‌شات → **Gate G1** | S | ⬜ |

## Phase C — Homepage

| ID | Task | پیش‌نیاز | فایل‌ها | خروجی و معیار پذیرش | تست | اندازه | وضعیت |
|---|---|---|---|---|---|---|---|
| C01 | Hero (HTML) | B | `sections/Hero.tsx` | متن و CTA سمت سرور، AN-04 تا AN-06، کادر poster | Lighthouse ×5 (LCP Lab ≤ 2.5s) · Playwright بدون JS · viewport 390×844 | M | ⬜ |
| C02 | مدل و صحنه سه‌بعدی | C01 · **DP1** | `three/hero-tooth/*` · `public/models` · `public/images/hero` | خرید مدل؛ Blender (نصب یا آرتیست)؛ GLB ≤ 150KB؛ متریال دو Tier؛ Lightformer؛ pipeline ساخت poster؛ renderهای برند؛ **DP2** | `gltf-transform inspect` · `renderer.info` · visual diff بین poster و فریم اول | L | 🔒 DP1 |
| C03 | ورود سینمایی و تعامل | C02 | همان | Tierها، lazy-load، `compileAsync`، AN-07 تا AN-09، حرکت خودکار ≤ 5s، fallback برای context loss | طبق 3D plan §۱۲ روی دستگاه واقعی → **Gate G3** | L | ⬜ |
| C04 | Trust + Treatments | B · C02 | `sections/TrustStrip.tsx` · `Treatments.tsx` | فقط ادعاهای تأییدشده؛ هر کارت یک لینک | axe · keyboard · اسکرین‌شات | M | ⬜ |
| C05 | Why Jokar | B | `sections/WhyJokar.tsx` | هر ادعا به Brief قابل ردیابی است | بازبینی محتوا | S | ⬜ |
| C06 | مسیر International | B07 | `sections/Journey.tsx` | Navy، ۵ مرحله، AN-16 و AN-17 | Performance trace · RM · RTL | M | ⬜ |
| C07 | FAQ | B | `sections/Faq.tsx` | `<details name>`؛ فقط سؤالاتی که پاسخ تأییدشده دارند | keyboard · axe | S | ⬜ |
| C08 | پوسته بخش مشاوره | B | `sections/Consultation.tsx` | چیدمان + «What happens next» + WhatsApp | اسکرین‌شات | S | ⬜ |
| C09 | Finale + Footer + Sticky | B04 · B05 | `sections/Finale.tsx` · `layout/Footer.tsx` · `StickyCta.tsx` | Sticky کنار فرم یا هنگام باز بودن کیبورد پنهان می‌شود؛ WCAG 2.4.11 | Playwright موبایل | M | ⬜ |
| C10 | سکشن‌های مخفی | B06 | `sections/Team.tsx` · `Technology.tsx` · `Stories.tsx` | flag خاموش یعنی هیچ DOM | اسکرین‌شات با flag روشن و خاموش | S | ⬜ |

## Phase D — Backend

| ID | Task | پیش‌نیاز | فایل‌ها | خروجی و معیار پذیرش | تست | اندازه | وضعیت |
|---|---|---|---|---|---|---|---|
| D01 | Database Schema | A04 | migrations | ERD نهایی و ایندکس‌ها | migration روی PostgreSQL | S | ⬜ |
| D02 | Lead Models | D01 | `leads/models.py` | Lead، LeadActivity، تولید reference یکتا | Django tests | S | ⬜ |
| D03 | Lead API | D02 | `leads/api.py` · `config/urls.py` | `POST /leads/` و `/health/` طبق API_SPEC | `APITestCase` برای همه کدهای وضعیت | M | ⬜ |
| D04 | Validation | D03 | `leads/api.py` | phonenumbers، enumها، رضایت، ایمیل شرطی، idempotency و throttle | ماتریس جدولی + تست هم‌زمانی | M | ⬜ |
| D05 | Django Admin | D02 | `leads/admin.py` | ستون‌ها، فیلترها، جست‌وجو، actions، یادداشت‌ها، تماس سریع و ثبت activity | تست‌های admin client | M | ⬜ |
| D06 | Telegram | D03 | `leads/notifications.py` · commands · worker | outbox، retry، تصاحب اتمیک، redaction توکن | تست با mock؛ **تست واقعی NOT RUN تا Q5** | M | 🔒 Q5 (فقط تست واقعی) |
| D07 | Permissions و امنیت | D05 | settings · admin | گروه‌ها، 2FA، axes، مسیر Admin، کوکی‌ها؛ `check --deploy` تمیز | tests + ورود دستی | M | ⬜ |
| D08 | مجموعه تست API و Admin | D03–D07 | `leads/tests/` | همه تست‌ها سبز | `manage.py test` | S | ⬜ |

## Phase E — Conversion

| ID | Task | پیش‌نیاز | فایل‌ها | خروجی و معیار پذیرش | تست | اندازه | وضعیت |
|---|---|---|---|---|---|---|---|
| E01 | رابط فرم | C08 · B | `forms/ConsultationForm.tsx` · `lib/validate-lead.ts` · `lib/countries.ts` | فیلدها، حالت‌ها، دسترس‌پذیری، کد تلفن خودکار، honeypot | Playwright برای همه حالت‌ها + axe | L | ⬜ |
| E02 | WhatsApp CTA | A06 | `lib/whatsapp.ts` · messages | ۶ context در ۴ زبان؛ همه محل‌های دکمه | `node:test` برای URL + بررسی href در Playwright | S | ⬜ |
| E03 | اتصال فرم به API | E01 · D04 | `forms/actions.ts` | Server Action، نگاشت خطاها، timeout، retry با idempotency، کار بدون JS | E2E روی stack محلی در ۴ زبان | M | ⬜ |
| E04 | Consent | E01 · Q8 | فرم · settings | متن حقوقی، `consent_version` و لینک‌ها | API + E2E | S | 🔒 Q8 (متن نهایی) |
| E05 | Conversion events | — | — | — | — | — | ⏸ فاز I |
| E06 | Tracking QA | — | — | — | — | — | ⏸ فاز I |
| E07 | QA پایداری فرم | E03 · D06 | tests | سناریوهای قطع Telegram، قطع API و شبکه کند | E2E + integration | S | ⬜ |

## Phase F — Multilingual

| ID | Task | پیش‌نیاز | فایل‌ها | خروجی و معیار پذیرش | تست | اندازه | وضعیت |
|---|---|---|---|---|---|---|---|
| F01 | متن مرجع انگلیسی | C · G01 · Q13 | `messages/en.json` | همه متن‌های Phase 1 طبق Claims Policy | بازبینی → **Gate G4** | M | 🔒 Q13 |
| F02 | فارسی | F01 | `messages/fa.json` | ترجمه + بازبینی توسط فارسی‌زبان | بازبینی + اسکرین‌شات RTL | M | ⬜ |
| F03 | Deutsch | F01 · Q7 | `messages/de.json` | ترجمه + بازبینی متخصص | بازبینی | M | 🔒 Q7 |
| F04 | Türkçe | F01 · Q7 | `messages/tr.json` | ترجمه + بازبینی متخصص | بازبینی | M | 🔒 Q7 |
| F05 | QA راست‌به‌چپ و چپ‌به‌راست | F02–F04 | — | چک‌لیست MULTILINGUAL §۷ | اسکرین‌شات ۴ زبان از صفحات کلیدی + grep | M | ⬜ |
| F06 | International SEO | F01–F04 | `generateMetadata` · `sitemap.ts` · `robots.ts` · JSON-LD | hreflang دوطرفه، canonical، OG، Organization و Breadcrumb | `node:test` برای hreflang · Rich Results Test | M | ⬜ |

## Phase G — Inner Pages

| ID | Task | پیش‌نیاز | فایل‌ها | خروجی و معیار پذیرش | تست | اندازه | وضعیت |
|---|---|---|---|---|---|---|---|
| G01 | قالب صفحه خدمت | C | `sections/TreatmentTemplate.tsx` | ساختار SITEMAP §۵ | اسکرین‌شات + axe | M | ⬜ |
| G02 | Dental Implants | G01 · 🩺 | `dental-implants/page.tsx` | محتوای بازبینی‌شده؛ پیش‌انتخاب خدمت در فرم و WhatsApp | E2E smoke | S | ⬜ |
| G03 | Dental Veneers | G01 · 🩺 | `dental-veneers/page.tsx` | همان | E2E smoke | S | ⬜ |
| G04 | Smile Design | G01 · 🩺 | `smile-design/page.tsx` | همان | E2E smoke | S | ⬜ |
| G05 | International Patients | G01 · C06 · Q11 | `international-patients/page.tsx` | مسیر بیمار، خدمات سفر، FAQ سفر | E2E smoke | M | 🔒 Q11 (جزئیات) |
| G06 | Free Consultation | E01 | `free-consultation/page.tsx` | فرم + WhatsApp + مراحل بعدی | E2E | S | ⬜ |
| G07 | About | G01 · Q10 | `about/page.tsx` | مخفی با flag تا رسیدن Q10 | — | S | 🔒 Q10 |
| G08 | صفحات حقوقی | Q8 · Q12 | `privacy` · `kvkk` · `legal-notice` | متن‌های مشاور حقوقی | بازبینی | S | 🔒 Q8 · Q12 |
| G09 | 404 و صفحه خطا | B | `not-found.tsx` · `error.tsx` | در ۴ زبان | E2E | S | ⬜ |

## Phase H — Quality & Launch

| ID | Task | پیش‌نیاز | فایل‌ها | خروجی و معیار پذیرش | تست | اندازه | وضعیت |
|---|---|---|---|---|---|---|---|
| H01 | تست موبایل | C–G | — | پوشش کامل ماتریس دستگاه‌ها | دستگاه واقعی | M | ⬜ |
| H02 | دسترس‌پذیری | C–G | — | axe بدون خطای serious یا critical؛ تست دستی و screen reader | `SECURITY_PERFORMANCE_QA.md` §۲ | M | ⬜ |
| H03 | Performance | C–G | — | رعایت بودجه‌ها؛ CWV در Lab | Lighthouse و WebPageTest | M | ⬜ |
| H04 | بازبینی امنیت | D · H06 | — | CSP، هدرها، `check --deploy`، audit وابستگی‌ها | ابزارها + بازبینی دستی | M | ⬜ |
| H05 | E2E | همه | — | کل مجموعه روی staging | Playwright | M | ⬜ |
| H06 | زیرساخت Production | D · Q6 | `infrastructure/*` | Dockerfileها، Compose، Caddy، backup، پایش | راه‌اندازی staging + **تست بازیابی backup** | L | 🔒 Q6 |
| H07 | Deployment | H06 · دامنه | — | DNS، TLS، secrets، تست واقعی Telegram | smoke tests | M | 🔒 دامنه |
| H08 | اعتبارسنجی نهایی | H01–H07 | `QA_CHECKLIST.md` | چک‌لیست ۱۰۰٪ کامل | **Gate G5** | S | ⬜ |
