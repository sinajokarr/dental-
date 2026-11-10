# ANIMATION MASTER PLAN — JOKAR DENTAL

> نسخه: 1.0 · تاریخ: 2026-11-11 · وضعیت: پیش‌نویس
> مرجع‌ها: `DESIGN_SYSTEM.md` §10 (توکن‌ها) · `3D_HERO_MASTER_PLAN.md` · `RESEARCH.md`

**قاعده طلایی:** هر حرکت باید یکی از این سه کار را انجام دهد: **جهت دادن به توجه**، **توضیح تغییر وضعیت**، یا **القای کیفیت**. حرکتی که هیچ‌کدام را انجام ندهد حذف می‌شود.

## ۱. قوانین هفت‌گانه

| # | قانون | اجرا در این پروژه |
|---|---|---|
| 1 | هدف مشخص | هر ردیف کاتالوگ (§۴) هدف خودش را دارد |
| 2 | هماهنگ با برند | فقط توکن‌ها: `ease.out`، و زمان‌های 160، 320 و 800ms. **بدون bounce و elastic.** حرکت آرام و مطمئن |
| 3 | حفظ سرعت موبایل | فقط `transform` و `opacity`. `clip-path` برای تصاویر و `filter` فقط روی کلمات H1. **IntersectionObserver به‌جای scroll listener** |
| 4 | مزاحم خواندن نباشد | متن body هرگز انیمیت نمی‌شود. reveal فقط یک بار اجرا می‌شود. **هیچ scroll-jacking نداریم** |
| 5 | دسترس‌پذیری | `prefers-reduced-motion`: فقط fade 200ms یا حالت ثابت. **هیچ حرکت خودکاری بیش از ۵ ثانیه** (WCAG 2.2.2) |
| 6 | Fallback | بدون JS همه محتوا دیده می‌شود. مرورگری که از قابلیتی پشتیبانی نکند، همان محتوا را بدون انیمیشن نشان می‌دهد |
| 7 | هماهنگی | یک ریتم واحد (reveal 800ms، stagger 60–90ms). **در هر viewport حداکثر یک حرکت سنگین** (🟡 یا 🔴) |

## ۲. تقسیم کار بین موتورها

| نوع حرکت | موتور | دلیل |
|---|---|---|
| تغییر وضعیت: hover، focus، باز و بسته شدن، reveal یک‌باره | **CSS** + یک hook کوچک به نام `useReveal` (حدود ۲۰ خط، IntersectionObserver) | بدون کتابخانه، اجرا روی compositor |
| Choreography: timeline چندمرحله‌ای و scrub با اسکرول | **GSAP + ScrollTrigger** با lazy-load | دقت timeline |
| صحنه سه‌بعدی | R3F `useFrame` + GSAP timeline برای ورود | — |

GSAP **فقط در سه نقطه** استفاده می‌شود:

1. ورود سینمایی Hero
2. خروج Hero با اسکرول
3. خط مسیر بیماران بین‌المللی

GSAP با `import()` پویا بارگذاری می‌شود و در bundle اولیه نیست. برای reduced-motion از `gsap.matchMedia()` و برای cleanup از `useGSAP` استفاده می‌شود.

**License:** GSAP از نسخه 3.13 کاملاً رایگان است، شامل SplitText و ScrollTrigger، و استفاده تجاری مجاز است. تنها محدودیت مربوط به ابزارهای visual builder رقیب Webflow است که شامل این پروژه نمی‌شود.

**ترکیب با منابع الهام:** هیچ کامپوننتی مستقیم از React Bits یا Aceternity کپی نمی‌شود. فقط **الگو** گرفته و با CSS یا GSAP بازنویسی می‌شود (D-014). نتیجه: کد اختصاصی، بدون وابستگی Motion، و بدون نگرانی License.

## ۳. قوانین فنی

- المان‌های **viewport اولیه** هرگز با reveal پنهان نمی‌شوند. Hero انیمیشن جداگانه CSS دارد و H1 همیشه opacity 1 دارد (D-023).
- `will-change` فقط در طول انیمیشن تنظیم می‌شود و بعد برداشته می‌شود.
- **بدون JS:** با `<noscript><style>[data-reveal]{opacity:1;transform:none}</style></noscript>` همه محتوا دیده می‌شود. این روش بومی است و به اسکریپت inline نیاز ندارد.
- **RTL:**
  - هر حرکت افقی در `dirSign` ضرب می‌شود.
  - `transform-origin` در underline با `[dir=rtl]` قرینه می‌شود.
  - مسیرهای SVG قرینه می‌شوند.
- **متن فارسی:** فقط در سطح کلمه یا خط انیمیت می‌شود (D-024).
- **Cleanup:** هر ScrollTrigger و listener هنگام unmount حذف می‌شود.

---

## ۴. کاتالوگ انیمیشن‌ها

**راهنمای هزینه:**

- 🟢 فقط transform یا opacity روی compositor
- 🟡 JS در هر فریم، یا scrub، یا filter
- 🔴 WebGL

**RM** = حالت `prefers-reduced-motion`

### Navigation

| ID | الگو و هدف | الهام | فناوری | Trigger و زمان | هزینه | RM و موبایل |
|---|---|---|---|---|---|---|
| AN-01 | Nav از حالت شفاف به glass تبدیل می‌شود و ارتفاعش از 76 به 64 می‌رسد. **هدف:** خوانایی هنگام اسکرول | Aceternity Resizable Navbar | CSS transition + IO sentinel | اسکرول بیش از 24px · 320ms | 🟢 | RM: بدون transition · موبایل: فقط glass |
| AN-02 | Dropdown خدمات: fade، rise به اندازه 8px و scale .98. **هدف:** پیوستگی بصری | — | CSS | hover، focus یا click · 200ms | 🟢 | RM: فقط fade |
| AN-03 | منوی موبایل: sheet با fade و blur، لینک‌ها با stagger | — | CSS | باز شدن · 320ms + stagger 60ms | 🟢 | RM: فقط fade |

### Hero

| ID | الگو و هدف | الهام | فناوری | Trigger و زمان | هزینه | RM و موبایل |
|---|---|---|---|---|---|---|
| AN-04 | **Word settle** در H1: blur از 6 به 0 و y از 0.3em به 0، با **opacity ثابت 1**. **هدف:** حس لوکس بدون تأخیر LCP | React Bits BlurText (بازنویسی) | CSS keyframes؛ کلمات در SSR جدا می‌شوند | load · 800ms، stagger 60ms | 🟡 (filter روی حداکثر ۱۲ کلمه، یک بار) | RM: حذف |
| AN-05 | eyebrow، زیرعنوان و CTAها به‌ترتیب با fade و rise ظاهر می‌شوند. **هدف:** ترتیب خواندن | — | CSS | load، از 200 تا 700ms | 🟢 | RM: حذف |
| AN-06 | Glow یخی که pointer را دنبال می‌کند. **هدف:** حس زنده بودن | Aceternity Spotlight | CSS variables + rAF | pointermove | 🟢 | فقط با `pointer: fine` |
| AN-07 | **ورود سینمایی دندان:** reveal، عبور نور، dolly، rim آبی | Codrops (نور و transmission) | R3F + GSAP timeline | 3D آماده · حدود 2.2s | 🔴 | Tier 0: یک عبور نور CSS روی poster |
| AN-08 | شناوری کوتاه، «نشستن»، tilt با pointer و drag | — | R3F `useFrame` | بعد از AN-07؛ **حرکت خودکار کل ≤ 5s** | 🔴 | موبایل: drag افقی · RM: فقط poster |
| AN-09 | خروج Hero با اسکرول: دندان بالا می‌رود، می‌چرخد و محو می‌شود. **هدف:** پیوند به سکشن بعدی | — | GSAP ScrollTrigger با scrub 0.6 | اسکرول Hero | 🟡 | RM: حذف |

### Trust Strip و Treatments

| ID | الگو و هدف | الهام | فناوری | Trigger و زمان | هزینه | RM و موبایل |
|---|---|---|---|---|---|---|
| AN-10 | آیتم‌های Trust با fade-rise و stagger ظاهر می‌شوند | — | CSS + `useReveal` | ورود به viewport · 800ms | 🟢 | RM: fade |
| AN-11 | **H2 همه سکشن‌ها:** mask reveal در سطح کلمه | React Bits SplitText (بازنویسی) | CSS + `useReveal` · کلمات در SSR جدا می‌شوند | ورود · 800ms، stagger 60ms | 🟢 | RM: fade |
| AN-12 | تصویر کارت‌ها با clip-path از پایین reveal می‌شود | Codrops image reveal | CSS + `useReveal` | ورود · 900ms | 🟢 | RM: fade |
| AN-13 | Hover کارت: بالا آمدن 4px، tilt حداکثر 4° و spotlight | Aceternity 3D Card + Card Spotlight | CSS + یک pointer handler کوچک | hover | 🟢 | فقط `pointer: fine`؛ در لمسی tilt نداریم |
| AN-14 | CTA مغناطیسی تا 6px. **هدف:** دعوت به کلیک | React Bits Magnet | vanilla JS + rAF | pointer نزدیک دکمه | 🟢 | فقط `pointer: fine` · RM: خاموش |

### Why Jokar

| ID | الگو و هدف | الهام | فناوری | Trigger و زمان | هزینه | RM و موبایل |
|---|---|---|---|---|---|---|
| AN-15 | کارت‌های مزیت با fade-rise و stagger؛ خطوط آیکون‌ها به‌صورت کوتاه رسم می‌شوند | — | CSS + `useReveal` | ورود · 800ms | 🟢 | RM: fade |

### International Patients (Navy)

| ID | الگو و هدف | الهام | فناوری | Trigger و زمان | هزینه | RM و موبایل |
|---|---|---|---|---|---|---|
| AN-16 | ورود سکشن: container از scale 0.96 به 1 می‌رسد. **هدف:** ورود سینمایی به فضای تیره | Codrops expanding container | GSAP scrub | ورود سکشن | 🟢 (فقط transform) | RM: حذف |
| AN-17 | **خط مسیر:** stroke یک SVG همگام با اسکرول کشیده می‌شود و نقطه هر مرحله با رسیدن خط روشن می‌شود. **هدف:** فهم مرحله‌به‌مرحله | Aceternity Tracing Beam / Timeline | GSAP ScrollTrigger scrub | اسکرول سکشن | 🟡 | موبایل: خط عمودی · RTL: مسیر قرینه · RM: خط کامل و ثابت |

### FAQ

| ID | الگو و هدف | الهام | فناوری | Trigger و زمان | هزینه | RM و موبایل |
|---|---|---|---|---|---|---|
| AN-18 | باز و بسته شدن آکاردئون و چرخش 45° آیکون | — | `<details>` + `::details-content` + `interpolate-size` | click · 320ms | 🟢 | مرورگر بدون پشتیبانی یا RM: بدون انیمیشن |

### Consultation Form

| ID | الگو و هدف | الهام | فناوری | Trigger و زمان | هزینه | RM و موبایل |
|---|---|---|---|---|---|---|
| AN-19 | Focus: تغییر رنگ border و label، ظاهر شدن ring | — | CSS | focus · 160ms | 🟢 | — |
| AN-20 | خطا: پیام و آیکون ظاهر می‌شوند. **بدون shake** | — | CSS | submit نامعتبر · 200ms | 🟢 | — |
| AN-21 | Submit با spinner. **موفقیت:** فرم به پنل موفقیت cross-fade می‌شود، تیک SVG رسم می‌شود و نور یک بار pulse می‌زند | — | CSS | پاسخ API · 600ms | 🟢 | RM: بدون رسم تیک و pulse. focus در هر حالت به عنوان پنل منتقل می‌شود |

### Sticky CTA، Finale و Footer

| ID | الگو و هدف | الهام | فناوری | Trigger و زمان | هزینه | RM و موبایل |
|---|---|---|---|---|---|---|
| AN-22 | Sticky CTA موبایل با slide-up ظاهر و پنهان می‌شود | — | CSS transform + IO | خروج Hero یا ورود فرم · 320ms | 🟢 | RM: fade |
| AN-23 | Finale: عنوان serif بزرگ با line reveal و CTA با fade | — | CSS + `useReveal` | ورود · 800ms | 🟢 | RM: fade |
| AN-24 | لینک‌ها: underline از سمت inline-start کشیده می‌شود | — | CSS (`transform-origin` در RTL قرینه می‌شود) | hover یا focus · 320ms | 🟢 | — |

### صفحات خدمات

| ID | الگو و هدف | الهام | فناوری | Trigger و زمان | هزینه | RM و موبایل |
|---|---|---|---|---|---|---|
| AN-25 | Render برند در Hero با یک عبور نور CSS، مثل Tier 0 در Home | — | CSS mask | load · 1.4s، یک بار | 🟢 | RM: حذف |

سایر سکشن‌های صفحات خدمات از AN-10، AN-11، AN-12، AN-18 و AN-21 استفاده می‌کنند.

---

## ۵. ایده‌های ردشده

| ایده | دلیل رد |
|---|---|
| Preloader یا splash screen | LCP را عقب می‌اندازد و کلیشه است |
| Smooth scroll (مثل Lenis) | حس اسکرول بومی را تغییر می‌دهد و برای INP و دسترس‌پذیری ریسک دارد |
| Custom cursor | مشکل دسترس‌پذیری دارد و در دستگاه لمسی بی‌معناست |
| Marquee یا کاروسل خودکار | WCAG 2.2.2 را نقض می‌کند و حواس را پرت می‌کند |
| Pin کردن و scroll-jacking سکشن‌ها | کنترل اسکرول را از کاربر می‌گیرد |
| Page transition | پیچیدگی زیاد و ارزش کم در Phase 1 |
| Shake در خطای فرم | حرکت تهاجمی است؛ رنگ و آیکون کافی‌اند |
| Motion (Framer) | دومین موتور انیمیشن می‌شد (D-014) |
| شمارنده اعداد | هیچ عدد تأییدشده‌ای نداریم |

## ۶. بودجه و تست

| بودجه | مقدار |
|---|---|
| JS انیمیشن غیرسه‌بعدی در bundle اولیه | حدود 2KB (`useReveal`، magnet و tilt) |
| GSAP + ScrollTrigger | حدود 40KB gzip، **فقط lazy** |
| حرکت سنگین هم‌زمان | حداکثر یکی در هر viewport |

| تست | روش | معیار پذیرش |
|---|---|---|
| Frame rate | Chrome Performance روی اسکرول کامل صفحه با CPU throttle چهار برابر | هیچ long task بالای 50ms ناشی از انیمیشن · dropped frame زیر ۵٪ |
| CLS | Lighthouse + Layout Shift Regions | صفر جابه‌جایی ناشی از انیمیشن |
| Reduced motion | Playwright `emulateMedia({ reducedMotion: 'reduce' })` + اسکرین‌شات | هیچ حرکتی به‌جز fade |
| بدون JS | غیرفعال کردن JavaScript | همه محتوا قابل مشاهده |
| RTL | اسکرین‌شات `/fa/` | همه حرکات افقی و مسیرها قرینه‌اند |
| Keyboard | Tab از ابتدا تا انتهای صفحه | focus همیشه دیده می‌شود؛ dropdown و accordion کار می‌کنند |
| Visual regression | Playwright screenshot بعد از پایان انیمیشن‌ها | diff کمتر از آستانه تعیین‌شده |
