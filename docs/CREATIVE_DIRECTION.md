# CREATIVE DIRECTION — JOKAR DENTAL

> نسخه: 1.1 · تاریخ: 2026-11-11 · وضعیت: **✅ Concept منتخب: Arctic Porcelain (D-016)** — توکن‌های نهایی در `DESIGN_SYSTEM.md`
> مرجع‌ها: `PROJECT_BRIEF.md`، `RESEARCH.md`

بعد از انتخاب Concept، توکن‌های نهایی در `DESIGN_SYSTEM.md` قفل می‌شوند.

---

## بخش اول — پایه مشترک هر سه Concept

### Logo Concept (موقت، تا رسیدن لوگوی رسمی)

- **Wordmark:** `JOKAR` با وزن Medium و letter-spacing باز (+0.08em). `DENTAL` با اندازه کوچک‌تر، uppercase و letter-spacing خیلی باز (+0.32em).
- **نشانه:** یک بیضی شیشه‌ای. دو خط منحنی داخل آن فرم انتزاعی تاج دندان می‌سازند. یک خط آبی `#7FD3F4` نقش بازتاب نور را دارد.
- **نسخه فارسی:** «جوکار دنتال» با Vazirmatn. نسخه لاتین در هر چهار زبان ثابت می‌ماند.

### Design Tokens پایه

```text
color.surface.0      #FFFFFF   پس‌زمینه اصلی
color.surface.1      #F8FCFF   سکشن‌های متناوب
color.surface.2      #F2FAFF   کارت‌ها
color.sky.100        #DDF4FF   سطح برجسته
color.sky.200        #BDEAFF   مرز و hover
color.sky.400        #7FD3F4   glow، خط و دکور (هرگز برای متن)
color.navy.900       #092A4A   متن اصلی و سکشن تیره
color.navy.800       #103C68   متن ثانویه
color.blue.700       #0C5798   CTA و لینک

radius: 8 / 14 / 22 / 32 / full
spacing (4px base): 4 8 12 16 24 32 48 64 96 128 160
container: 1280px (max) · gutter 24px در موبایل و 48px در دسکتاپ
```

### Typography System

| نقش | لاتین (en/de/tr) | فارسی |
|---|---|---|
| Display | وابسته به Concept (جدول هر Concept) | Vazirmatn 300–500 |
| Body | **Manrope** 400/500 | **Vazirmatn** 400/500 |
| Label / Data | Manrope 600 uppercase با tracking باز | Vazirmatn 600 (بدون uppercase) |

- همه فونت‌ها OFL هستند و با `next/font` به‌صورت self-host بارگذاری می‌شوند.
- پوشش کاراکترهای ğ ş ı İ ö ü ç ß در فاز B01 تست واقعی می‌شود.
- Fluid type scale بر اساس `clamp()`:
  - Display: 44 تا 104px
  - H2: 32 تا 56px
  - Body: 16 تا 18px
- در فارسی line-height حدود ۱۵٪ بیشتر از لاتین است.
- tracking منفی فقط برای لاتین. در فارسی هرگز letter-spacing نداریم، چون اتصال حروف را می‌شکند.

### Glass Effect Rules

1. Glass فقط برای **لایه‌های شناور** است: Navigation، کارت‌های روی تصویر یا صحنه سه‌بعدی، فرم مشاوره، Modal و Badge.
2. متن اصلی هرگز روی Glass بدون پس‌زمینه کافی قرار نمی‌گیرد. حداقل کنتراست متن روی هر Glass برابر 4.5:1 است و با بدترین تصویر پشت آن تست می‌شود.
3. حداکثر **۳** المان دارای backdrop-filter هم‌زمان در viewport.
4. Blur بین 12 و 24px است و روی موبایل حداکثر 16px.
5. مقادیر پیشنهادی:
   - Fill: `rgba(255,255,255,0.55–0.72)`
   - Border: 1px `rgba(255,255,255,0.7)` به‌همراه inner highlight
   - Shadow: `0 8px 32px rgba(9,42,74,0.08)`
6. Fallback برای مرورگرهایی که backdrop-filter را پشتیبانی نمی‌کنند: فیلتر با `@supports` و استفاده از `#F8FCFF` با opacity 0.94.
7. در حالت `prefers-reduced-transparency` سطوح Glass کاملاً مات می‌شوند.

### CTA Hierarchy

| سطح | نمونه | استایل |
|---|---|---|
| Primary | «مشاوره رایگان» / Free Consultation / Kostenlose Beratung / Ücretsiz Danışmanlık | پس‌زمینه solid `#0C5798`، متن سفید، با glow ملایم آبی در hover |
| Secondary | WhatsApp | Glass به‌همراه آیکون WhatsApp و متن navy |
| Tertiary | «بیشتر بدانید» | لینک متنی با underline انیمیشنی |

- در هر viewport فقط **یک Primary** وجود دارد.
- در موبایل یک Sticky Bar پایین صفحه داریم: دکمه Consultation و آیکون WhatsApp. این نوار بعد از عبور از Hero ظاهر می‌شود.

### Responsive Principles

- Mobile-first با breakpointهای 640 / 768 / 1024 / 1280 / 1536.
- طراحی RTL با CSS logical properties (`margin-inline-start` و مانند آن) انجام می‌شود. یک کد واحد برای هر چهار زبان کافی است.
- Hit area حداقل 44×44px.

### Motion Design System

| توکن | مقدار | کاربرد |
|---|---|---|
| `dur.micro` | 160ms | hover و focus |
| `dur.base` | 320ms | کارت‌ها و تغییر state |
| `dur.reveal` | 800ms | ورود متن و سکشن |
| `dur.cinematic` | 1400–2400ms | فقط برای ورود Hero |
| `ease.out` | `cubic-bezier(0.22, 1, 0.36, 1)` | پیش‌فرض |
| `ease.inOut` | `cubic-bezier(0.65, 0, 0.35, 1)` | transitionها |
| `stagger` | 60–90ms | فهرست‌ها |

- در حالت `prefers-reduced-motion` فقط fade 200ms اجرا می‌شود؛ parallax، scrub و چرخش خودکار سه‌بعدی غیرفعال‌اند.
- متن و CTA اصلی **هرگز منتظر WebGL نمی‌مانند**. HTML اول رندر می‌شود و مدل سه‌بعدی بعداً روی آن لایه می‌شود.

---

## بخش دوم — سه Concept

### Concept A — **Glacier Clarity**
> «شفاف مثل یخ، دقیق مثل پزشکی»

| بعد | توضیح |
|---|---|
| Visual Identity | سفید مطلق با نور سرد صبحگاهی. سطح‌ها مثل یخ مات و فضای خالی بسیار زیاد. حسی شبیه کلینیک سوئیسی |
| Hero | چیدمان دو ستونی: عنوان در ستون آغازین، دندان در ستون پایانی. دندان مثل یک مجسمه یخی معلق است و زیر آن یک caustic نوری آبی روی زمین سفید می‌افتد |
| 3D Direction | متریال **مینای شیری نیمه‌شفاف** (`MeshPhysicalMaterial` با transmission پایین، sheen و clearcoat). چرخش آرام ۲۰ ثانیه در هر دور. با حرکت pointer تا ±12° tilt می‌شود و drag اختیاری است |
| Display Font | **Manrope** 300 با سایز بزرگ و tracking منفی |
| Color Usage | ۸۰٪ سفید، ۱۵٪ آبی یخی، ۵٪ navy. سکشن تیره نداریم |
| Glass | زیاد و یکدست: Navigation، کارت خدمات و فرم. همه frosted با border سفید |
| Motion | آرام و شناور. fade و rise، ورود متن با blur، و parallax بسیار ملایم |
| Mobile | دندان بالای عنوان و کوچک‌تر. روی موبایل‌های ضعیف تصویر ثابت (poster) جایگزین مدل می‌شود |
| ✅ مزایا | بیشترین حس **اعتماد پزشکی و تمیزی**. خوانایی عالی. سبک‌ترین گزینه از نظر Performance |
| ⚠️ محدودیت | ممکن است «زیادی امن» و کمتر به‌یادماندنی باشد. خطر شباهت به قالب‌های عمومی کلینیک |

### Concept B — **Porcelain Atelier**
> «لبخند شما، یک اثر هنری دست‌ساز»

| بعد | توضیح |
|---|---|
| Visual Identity | زبان طراحی برندهای جواهر و ساعت لوکس. چیدمان editorial، تایپوگرافی serif بزرگ، و تضاد سفید با navy عمیق |
| Hero | دندان در مرکز مثل یک **جواهر زیر نور استودیو** دیده می‌شود. یک نوار نور (light sweep) از روی سطحش عبور می‌کند. عنوان serif بزرگ پشت و جلوی دندان لایه‌بندی شده تا عمق ایجاد شود |
| 3D Direction | متریال **پرسلن براق** با clearcoat بالا و environment map استودیویی (یک HDRI کوچک). حرکت دوربین سینمایی: ورود از نمای نزدیک به نمای کامل |
| Display Font | **Fraunces** یا **Cormorant Garamond**، serif لوکس با پشتیبانی Latin Extended. در فارسی Vazirmatn 300 در اندازه بزرگ |
| Color Usage | ۶۵٪ سفید، ۱۵٪ آبی، ۲۰٪ navy. هر دو یا سه سکشن یک بار به navy عمیق تغییر رنگ می‌دهد تا ریتم سینمایی ایجاد شود |
| Glass | کم و گزیده: فقط Navigation و فرم. روی سکشن‌های navy، Glass تیره (dark glass) |
| Motion | سینمایی و آهسته. Split Text با mask reveal، تصاویر با clip-path reveal، و transition رنگ بین سکشن‌ها |
| Mobile | چیدمان editorial در یک ستون. عنوان serif بزرگ تمام عرض صفحه. مدل سه‌بعدی کوچک‌تر و ثابت‌تر |
| ✅ مزایا | **لوکس‌ترین و متمایزترین** گزینه. مناسب درمان‌های زیبایی (لمینت و طراحی لبخند) |
| ⚠️ محدودیت | serif در فارسی معادل مستقیم ندارد و تجربه فارسی کمی متفاوت می‌شود. سکشن‌های navy از نسبت ۱۰٪ برند فراتر می‌روند. HDRI حدود ۱۵۰ تا ۳۰۰KB بار اضافه دارد |

### Concept C — **Precision Lab**
> «فناوری دیجیتال دندانپزشکی، قابل لمس»

| بعد | توضیح |
|---|---|
| Visual Identity | حس CAD/CAM و اسکن دیجیتال: grid ظریف آبی، خطوط اندازه‌گیری، label‌های کوچک مونو، و سفید آزمایشگاهی |
| Hero | دندان ابتدا به‌صورت **wireframe اسکن** ظاهر می‌شود. یک صفحه اسکن از آن عبور می‌کند و سطح نهایی صاف و درخشان پشت آن نمایان می‌شود (scan-to-solid) |
| 3D Direction | shader سفارشی برای scan line و wireframe. در سکشن‌های پایین‌تر لایه‌های آموزشی مثل تاج، ریشه و ایمپلنت نمایش داده می‌شوند. **این لایه‌ها نیاز به تأیید علمی پزشک دارند** |
| Display Font | **Manrope** 500 به‌همراه **JetBrains Mono** برای labelها |
| Color Usage | ۷۰٪ سفید، ۲۰٪ آبی (خطوط و grid)، ۱۰٪ navy |
| Glass | کارت‌های HUD-مانند با border آبی نازک |
| Motion | دقیق و مکانیکی: scan، draw-line (SVG stroke)، counterها و snap |
| Mobile | انیمیشن scan کوتاه‌تر. لایه‌های آموزشی به tap-to-reveal تبدیل می‌شوند |
| ✅ مزایا | بیشترین تمایز «فناوری». بیان عالی برای ایمپلنت و برای پیام دقت |
| ⚠️ محدودیت | خطر حس **سرد و غیرانسانی** و شباهت به SaaS. سنگین‌ترین shader. محتوای آموزشی بدون پزشک تأییدکننده ریسک دارد. ضعیف‌ترین تناسب با «لوکس» |

---

## بخش سوم — مقایسه و توصیه

| معیار (۱ تا ۵) | A Glacier | B Porcelain | C Precision |
|---|---|---|---|
| اعتماد پزشکی | 5 | 4 | 4 |
| حس لوکس | 3 | **5** | 2 |
| به‌یادماندنی بودن | 3 | **5** | 4 |
| تجربه فارسی (RTL) | 5 | 3 | 4 |
| Performance موبایل | **5** | 3 | 2 |
| تناسب با Glassmorphism | **5** | 3 | 4 |
| ریسک محتوایی | کم | کم | **زیاد** |

### توصیه CTO: **Concept B بر پایه A — «Arctic Porcelain»**

- **ساختار، رنگ و Glass از A:** سفیدی غالب، Glass کنترل‌شده، و بهترین Performance و تجربه RTL.
- **Hero و تایپوگرافی از B:**
  - دندان پرسلنی زیر نور استودیو با light sweep سینمایی.
  - عنوان serif برای en/de/tr و Vazirmatn سبک و بزرگ برای فارسی.
- **سکشن navy:** فقط دو ناحیه: International Patients و Finale (Final CTA + Footer). سکشن Technology تا رسیدن فهرست تجهیزات واقعی مخفی است (Q4).
- **از C:** فقط یک لحظه draw-line مینیمال در مسیر بیماران بین‌المللی. بدون لایه‌های آموزشی تا وقتی پزشک تأیید کند.

نتیجه: حس لوکس و تمایز B، با اعتماد، سرعت و یکپارچگی چهارزبانه A.

---

## گام بعدی

با انتخاب Concept، اسناد زیر نوشته می‌شوند:

1. `DESIGN_SYSTEM.md`: توکن‌های نهایی
2. `SITEMAP_AND_USER_FLOWS.md`
3. `3D_HERO_MASTER_PLAN.md`
