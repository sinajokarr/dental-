# DESIGN SYSTEM — JOKAR DENTAL · «Arctic Porcelain»

> نسخه: 1.1 · تاریخ: 2026-11-11 · وضعیت: **پیش‌نویس نهایی؛ قفل در فاز B**
> Concept منتخب: **Arctic Porcelain**. ساختار، رنگ و Glass از Concept A (Glacier) می‌آید؛ Hero و تایپوگرافی از Concept B (Porcelain). جزئیات در `CREATIVE_DIRECTION.md`.

## ۰. روح طراحی

**«پرسلن زیر نور صبح قطبی.»** سفیدی غالب، نور سرد و تمیز، سطح‌های براق و دقیق، و تایپوگرافی serif ظریف مثل برندهای جواهر. همه‌چیز آرام، گران و قابل‌اعتماد.

| ✅ Do | ❌ Don't |
|---|---|
| فضای خالی زیاد و ترکیب‌بندی مطمئن | شلوغی، شمارنده‌های پرتعداد، badgeهای رنگی متعدد |
| نور، glow و بازتاب ملایم آبی | نئون، گرادیان‌های بنفش، حس SaaS و گیمینگ |
| تصاویر روشن و هوادار با white balance سرد | دندان کارتونی، عکس قبل/بعد ساختگی، دندانپزشک با انگشت شست بالا |
| یک CTA اصلی در هر viewport | چند دکمه هم‌وزن کنار هم |

---

## ۱. رنگ

### Primitive Tokens

```text
white        #FFFFFF    ice-50   #F8FCFF    ice-100  #F2FAFF
sky-100      #DDF4FF    sky-200  #BDEAFF    sky-400  #7FD3F4
navy-900     #092A4A    navy-800 #103C68    blue-700 #0C5798
slate-600    #4A6785    (متن کم‌رنگ)      slate-500 #6F8DAA (کادر فیلد)
red-700      #B42318    green-700 #0E7A5A    (وضعیت فرم)
```

### Semantic Tokens — پس‌زمینه روشن (پیش‌فرض)

| Token | مقدار | کنتراست (بدترین سطح روشن) | کاربرد |
|---|---|---|---|
| `bg.page` | `#FFFFFF` | — | پس‌زمینه صفحه |
| `bg.section-alt` | `#F8FCFF` | — | سکشن‌های متناوب |
| `bg.raised` | `#F2FAFF` | — | کارت‌های غیرشیشه‌ای |
| `bg.highlight` | `#DDF4FF` | — | پس‌زمینه برجسته و Chip |
| `text.primary` | `#092A4A` | 12.80 ✅ | عنوان و متن اصلی |
| `text.secondary` | `#103C68` | 9.88 ✅ | متن ثانویه |
| `text.muted` | `#4A6785` | 5.17 ✅ | توضیح، helper text و caption |
| `text.link` / `action.primary` | `#0C5798` | 6.52 ✅ | لینک و CTA |
| `border.subtle` | `#BDEAFF` | تزئینی | مرز کارت (هرگز به‌عنوان تنها مرز input) |
| `border.input` | `#6F8DAA` | 3.28 ✅ (حداقل 3:1، WCAG 1.4.11) | کادر input، select و checkbox |
| `decor.glow` | `#7FD3F4` | ❌ هرگز برای متن | glow، خط و آیکون تزئینی |
| `state.error` | `#B42318` | 5.78 ✅ | خطای فرم |
| `state.success` | `#0E7A5A` | 4.67 ✅ | موفقیت فرم |

### Semantic Tokens — سکشن Navy (International و Finale)

| Token | مقدار | کنتراست روی `#092A4A` / `#103C68` |
|---|---|---|
| `dark.bg` | `#092A4A` | — |
| `dark.text.primary` | `#FFFFFF` | 14.57 / 11.24 ✅ |
| `dark.text.muted` | `#A9C4DD` | 8.06 / 6.22 ✅ |
| `dark.accent` | `#7FD3F4` | 8.69 / 6.70 ✅ (روی navy، برای متن هم مجاز است) |
| `dark.error` | `#FF8A80` | 6.38 / 4.92 ✅ |

### نسبت رنگ در صفحه

- حدود ۷۰٪ سفید و Ice، حدود ۱۵٪ Sky، و ۱۵٪ Navy.
- Navy فقط در **دو ناحیه** استفاده می‌شود:
  1. سکشن International Patients
  2. Finale، یعنی Final CTA و Footer که به هم پیوسته‌اند.

---

## ۲. تایپوگرافی

### خانواده‌ها (همه OFL، self-host با `next/font`)

| نقش | en / de / tr | fa |
|---|---|---|
| Display (H1، H2) | **Cormorant Garamond** 300 + Italic 300 (D-060) | **Vazirmatn** 200/300 |
| UI و Body (H3 به پایین، متن، دکمه) | **Manrope** variable 200–800 | **Vazirmatn** variable 100–900 |

پوشش کاراکترها: Cormorant Garamond و Manrope زیرمجموعه `latin-ext` دارند (شامل ğ ş ı İ ö ü ç ß). Vazirmatn زیرمجموعه‌های `arabic` و `latin-ext` دارد. این‌ها از METADATA مخزن Google Fonts بررسی شد. تست نمایش واقعی در فاز B01 انجام می‌شود.

**بودجه فونت:** هر زبان ≤ 120KB woff2. فقط وزن استفاده‌شده در H1 preload می‌شود.

### Type Scale (viewport بین 360px و 1440px)

| Token | لاتین | فارسی |
|---|---|---|
| `display` (H1 Hero) | Cormorant 300 · `clamp(2.75rem, 1.6rem + 4.8vw, 6.5rem)` (44→104px) · lh 1.02 · tracking −0.015em | Vazirmatn 300 · `clamp(2.25rem, 1.4rem + 3.6vw, 4.75rem)` (36→76px) · lh 1.35 |
| `h2` | Cormorant 300 · `clamp(2rem, 1.4rem + 2.6vw, 3.5rem)` · lh 1.1 | Vazirmatn 300 · `clamp(1.625rem, 1.2rem + 1.8vw, 2.75rem)` · lh 1.45 |
| `h3` | Manrope 600 · `clamp(1.25rem, 1.1rem + .6vw, 1.5rem)` · lh 1.3 | Vazirmatn 600 · همان اندازه · lh 1.6 |
| `lead` | Manrope 400 · `clamp(1.125rem, 1rem + .4vw, 1.3125rem)` · lh 1.6 | Vazirmatn 400 · همان اندازه · lh 1.9 |
| `body` | Manrope 400 · 16→17px · lh 1.65 | Vazirmatn 400 · 17→18px · lh 1.9 |
| `small` | Manrope 500 · 14px · lh 1.5 | Vazirmatn 500 · 15px · lh 1.7 |
| `eyebrow` | Manrope 600 · 12px · UPPERCASE · tracking 0.18em | Vazirmatn 600 · 13px · بدون uppercase و tracking |

**Italic تأکیدی:** در عنوان‌های لاتین یک کلمه کلیدی با Cormorant Italic نوشته می‌شود، مثلاً «Your *signature* smile». در فارسی معادل آن رنگ `#0C5798` است، نه italic.

### قوانین زبانی

- **فارسی:** هیچ letter-spacing و uppercase ندارد. **متن فارسی هرگز به حروف جدا شکسته نمی‌شود**، چون اتصال حروف می‌شکند. انیمیشن متن فارسی فقط در سطح کلمه یا خط است.
- **آلمانی:** `hyphens: auto` با `lang="de"` برای کلمات مرکب بلند مثل «Implantatbehandlung». تست روی عرض 360px.
- **ترکی:** uppercase فقط با `lang="tr"` روی `<html>`، تا «i» درست به «İ» تبدیل شود.
- **طول خط:** حداکثر 64ch برای body.
- **شماره تلفن:** در همه زبان‌ها با ارقام لاتین و ایزوله LTR نوشته می‌شود: `<bdi dir="ltr">+90 542 713 01 32</bdi>`.

---

## ۳. فاصله، Layout و Grid

```text
space (4px base):  1=4  2=8  3=12  4=16  6=24  8=32  12=48  16=64  24=96  32=128  40=160
section padding:   clamp(5rem, 3rem + 8vw, 10rem)       → 80 تا 160px
container:         max 1280px · padding-inline 24px (موبایل) / 48px (≥1024)
grid:              4 ستون (<768) · 8 ستون (768–1023) · 12 ستون (≥1024)
gutter:            16 / 24 / 32px
breakpoints:       sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1536
```

- همه فاصله‌گذاری‌های افقی با **CSS logical properties** نوشته می‌شوند (`ms-*`، `pe-*`، `start-*`). یک کد واحد برای هر دو جهت RTL و LTR کافی است.
- آیکون‌های جهت‌دار، مثل فلش «بیشتر بدانید»، در RTL قرینه می‌شوند (`rtl:-scale-x-100`).

## ۴. Radius، Border و Shadow

```text
radius:  sm 14 (input، chip) · md 22 (کارت) · lg 32 (پنل و فرم) · full (دکمه)

shadow (رنگ navy، هرگز سیاه):
  e1   0 1px 2px rgba(9,42,74,.06), 0 4px 12px rgba(9,42,74,.04)
  e2   0 8px 32px rgba(9,42,74,.08)
  e3   0 24px 64px rgba(9,42,74,.12)
  glow 0 0 0 1px rgba(127,211,244,.35), 0 12px 40px rgba(127,211,244,.35)
```

**Porcelain Edge** (امضای بصری کارت‌ها): یک border گرادیانی یک‌پیکسلی که با `border-radius` سازگار است.

```css
border: 1px solid transparent;
background:
  linear-gradient(var(--card-bg), var(--card-bg)) padding-box,
  linear-gradient(135deg, rgb(255 255 255 / .95), rgb(189 234 255 / .6) 40%, rgb(255 255 255 / .2)) border-box;
```

---

## ۵. Glass Recipes

| Recipe | Fill | Blur (دسکتاپ / موبایل) | Border | Shadow | کاربرد |
|---|---|---|---|---|---|
| `glass.nav` | `rgb(255 255 255 / .62)` | 18 / 14 + `saturate(160%)` | پایین 1px `rgb(255 255 255 / .7)` | e1 | Navigation و Sticky CTA |
| `glass.card` | `rgb(255 255 255 / .55)` | 16 / 12 | Porcelain Edge + `inset 0 1px 0 rgb(255 255 255 / .9)` | e2 | کارت‌های روی تصویر یا Hero |
| `glass.strong` | `rgb(248 252 255 / .78)` | 24 / 16 | 1px `rgb(189 234 255 / .9)` | e3 | فرم مشاوره، منوی موبایل، Dropdown |
| `glass.dark` | `rgb(16 60 104 / .45)` | 18 / 14 | 1px `rgb(127 211 244 / .22)` | — | کارت‌ها روی Navy |

**قوانین:**

1. حداکثر **۳** المان دارای backdrop-filter هم‌زمان در viewport.
2. Glass فقط وقتی معنا دارد که **چیزی پشتش باشد**، مثل گرادیان، تصویر یا صحنه سه‌بعدی. روی سفید یکدست از `bg.raised` استفاده می‌شود.
3. کنتراست متن روی Glass با **بدترین** پس‌زمینه ممکن تست می‌شود و باید ≥ 4.5:1 باشد.
4. مرورگر بدون پشتیبانی backdrop-filter: با `@supports not (backdrop-filter: blur(1px))` پس‌زمینه به `#F8FCFF` با opacity 0.94 تغییر می‌کند.
5. در حالت `prefers-reduced-transparency: reduce` همه سطوح Glass مات می‌شوند.

## ۶. نور و Glow

- `glow.ice`: یک `radial-gradient` با رنگ `#DDF4FF` که به سمت شفاف محو می‌شود. پس‌زمینه Hero و سکشن فرم را می‌سازد.
- `glow.pointer` (فقط دسکتاپ): یک spotlight نرم آبی که موقعیت pointer را دنبال می‌کند. با CSS variable و rAF throttle پیاده می‌شود و هیچ WebGL ندارد.
- `caustic`: یک لکه نور آبی کشیده زیر دندان سه‌بعدی. با CSS ساخته می‌شود و هزینه GPU ندارد.

---

## ۷. Components

### Buttons

| نوع | استایل | ارتفاع sm / md / lg | States |
|---|---|---|---|
| **Primary** | bg `#0C5798`، متن سفید، Manrope 600 | 44 / 52 / 56 | hover: bg `#103C68` + shadow glow · active: scale .98 · loading: spinner + `aria-busy` با عرض قفل‌شده |
| **Primary on Navy** | bg سفید، متن `#092A4A` | همان | hover: bg `#DDF4FF` |
| **WhatsApp (Secondary)** | `glass.card`، متن navy، glyph رسمی WhatsApp سبز `#25D366` با اندازه 20px | همان | hover: border `#7FD3F4` + fill سفید .8 |
| **Tertiary** | متن `#0C5798` + فلش | — | underline از سمت inline-start کشیده می‌شود |

- همه دکمه‌ها radius full دارند و padding-inline آن‌ها 28px است.
- **Magnetic hover** (کشش تا 6px به سمت pointer) فقط روی Primary و فقط در دستگاه‌هایی با `pointer: fine`.
- آیکون WhatsApp همیشه با برچسب متنی همراه است (کنتراست سبز روی سفید 1.98 است، پس معنی را متن منتقل می‌کند). در آیکون‌های تنها: `aria-label`.
- glyph از Simple Icons (CC0) گرفته می‌شود. رعایت Brand Guidelines متا در E02 بررسی می‌شود.

### Navigation

- **دسکتاپ:**
  - ارتفاع 76px است و بعد از 24px اسکرول به 64px کاهش پیدا می‌کند.
  - روی Hero شفاف است و بعد از اسکرول به `glass.nav` تبدیل می‌شود.
  - چیدمان: لوگو (start) | Treatments ▾ · International Patients · About | (end) زبان · آیکون WhatsApp · **Free Consultation** (Primary sm).
  - **Treatments ▾:** پنل `glass.strong` با سه کارت کوچک. هر کارت شامل یک تصویر render، عنوان و یک خط توضیح است.
- **موبایل (<1024):**
  - چیدمان: لوگو | زبان (کد کوتاه) | دکمه منو.
  - منو یک sheet تمام‌صفحه `glass.strong` است با لینک‌های بزرگ. CTA و WhatsApp در پایین آن قرار دارند.
  - رفتار منو: focus trap، بسته‌شدن با Esc و قفل اسکرول.
- لینک «Skip to content» اولین المان قابل focus است.

### Language Switcher

- نام زبان‌ها **بومی** است: فارسی · English · Deutsch · Türkçe.
- **بدون پرچم.** پرچم نماینده کشور است، نه زبان؛ مثلاً یک کاربر فارسی‌زبان مقیم آلمان.
- هر گزینه یک **لینک واقعی** به صفحه معادل در زبان دیگر است و بدون JS هم کار می‌کند. هر لینک `lang` و `hreflang` مخصوص خودش را دارد.

### Treatment Card

- `glass.card` با radius 22 و padding 28.
- ساختار: تصویر 4:3 ← eyebrow («01») ← H3 ← توضیح دوخطی ← لینک Tertiary.
- کل کارت یک لینک واحد است (الگوی stretched link).
- Hover (فقط `pointer: fine`): بالا آمدن 4px، روشن‌تر شدن Porcelain Edge، و tilt سه‌بعدی ≤ 4°.

### Section Header

- ساختار: eyebrow ← H2 ← lead، با max-width 720px.
- به‌صورت پیش‌فرض start-aligned است. فقط سکشن‌های Hero-مانند center-aligned هستند.

### Journey Steps (International Patients)

- در موبایل timeline عمودی و در دسکتاپ افقی است.
- خط اتصال بین مراحل هم‌زمان با اسکرول کشیده می‌شود (SVG stroke). این همان لحظه «Precision» گرفته‌شده از Concept C است.

### FAQ Accordion

- از **`<details name="faq">` بومی** استفاده می‌شود. خاصیت exclusive accordion را خود مرورگر فراهم می‌کند و JS لازم نیست.
- انیمیشن ارتفاع با `::details-content` و `interpolate-size` انجام می‌شود. در مرورگرهای بدون پشتیبانی، باز و بسته شدن بدون انیمیشن است.
- آیکون + هنگام باز شدن 45° می‌چرخد.

### Form Fields

- برچسب **همیشه بالای فیلد** است. placeholder هرگز جای برچسب را نمی‌گیرد.
- ارتفاع 52px، radius 14، پس‌زمینه سفید با opacity .9، border 1px `#6F8DAA` (`border.input`). کادر روشن‌تر `#BDEAFF` کنتراست 1.28 دارد و معیار WCAG 1.4.11 را رد می‌کند.
- **Focus:** border `#0C5798` + focus ring.
- **Error:** border `#B42318` + پیام همراه آیکون زیر فیلد، با `aria-invalid` و `aria-describedby`.
- **تلفن:** `<select>` بومی برای کد کشور + `<input type="tel" autocomplete="tel-national">`.
- **کشور اقامت:** `<select>` بومی. نام کشورها با `Intl.DisplayNames` در زبان صفحه تولید می‌شود؛ ترجمه دستی لازم نیست.
- **Consent:** checkbox با ابعاد 24px. برچسب آن به Privacy و KVKK لینک دارد.

### Sticky Mobile CTA

- بعد از خروج Hero از دید ظاهر می‌شود.
- وقتی فرم مشاوره در دید است، یا کیبورد باز است، **مخفی می‌شود**.
- ارتفاع 64px + `env(safe-area-inset-bottom)` با استایل `glass.nav`.
- چیدمان: WhatsApp (۴۰٪) | Free Consultation (۶۰٪).

### Footer (Finale)

- روی Navy و به‌صورت پیوسته با Final CTA.
- محتوا:
  - لوگو و tagline
  - ستون‌های لینک: Treatments · Patients · Company · Legal
  - WhatsApp (شماره ایزوله LTR)
  - لینک زبان‌ها
  - © JOKAR DENTAL

---

## ۸. Focus، دسترس‌پذیری و Hit Area

- **Focus ring:** حلقه 2px `#0C5798` با offset سفید 2px (کنتراست 7.41). روی Navy از حلقه `#7FD3F4` استفاده می‌شود (کنتراست 8.69).
- فقط با `:focus-visible` نمایش داده می‌شود.
- حداقل hit area برای همه المان‌های قابل لمس 44×44px است.
- از دکمه submit غیرفعال (disabled) استفاده نمی‌کنیم. اعتبارسنجی هنگام submit انجام می‌شود و کاربر را به اولین خطا می‌برد.

## ۹. Z-index

```text
base 0 · raised 10 · sticky-cta 40 · nav 50 · dropdown 55 · overlay 60 · modal 70
```

## ۱۰. Motion Tokens

| Token | مقدار |
|---|---|
| `dur.micro` | 160ms |
| `dur.base` | 320ms |
| `dur.reveal` | 800ms |
| `dur.cinematic` | 1400–2400ms (فقط Hero) |
| `ease.out` | `cubic-bezier(.22,1,.36,1)` |
| `ease.inOut` | `cubic-bezier(.65,0,.35,1)` |
| `stagger` | 60–90ms |

**رفتار در `prefers-reduced-motion`:**

- همه انیمیشن‌ها به fade 200ms تبدیل می‌شوند.
- parallax، scrub، tilt و چرخش سه‌بعدی خاموش می‌شوند.
- Hero فقط تصویر ثابت (poster) نمایش می‌دهد.

جزئیات کامل در `ANIMATION_MASTER_PLAN.md`.

## ۱۱. آیکون

- کتابخانه **Lucide** (مجوز ISC، tree-shakable) با stroke 1.5px و گوشه‌های گرد.
- آیکون‌های برند (WhatsApp) از Simple Icons (CC0) می‌آیند.

## ۱۲. Art Direction تصاویر

- **حس و رنگ:** روشن و هوادار، white balance کمی سرد، سایه نرم، و حس آرامش.
- **سوژه‌های مجاز:**
  - معماری مینیمال سفید و آبی
  - بافت‌ها: آب، یخ، پرسلن، نور
  - لبخند طبیعی بزرگسالان متنوع
  - مناظر آنتالیا (دریا، ساحل) و استانبول (بسفر)، فقط با قاب‌بندی سفر و گردشگری
- **ممنوع:**
  - تصویر stock که «کلینیک ما» یا «پزشک ما» القا کند
  - قبل/بعد غیرواقعی
  - ماکت پلاستیکی دندان
  - تصاویری که لوگوی برند دیگر در آن‌ها دیده می‌شود
- **فنی:**
  - همه تصاویر با `next/image` و فرمت AVIF/WebP سرو می‌شوند و ابعاد مشخص دارند (صفر CLS).
  - تصاویر radius 22 تا 32 دارند، به‌همراه یک inner border نازک سفید.
  - مجوز هر تصویر در `ASSET_LICENSES.md` ثبت می‌شود.
- **تصاویر اختصاصی برند:** از همان مدل سه‌بعدی Hero در زاویه‌ها و نورهای مختلف render ثابت گرفته می‌شود. این تصاویر برای کارت خدمات و Hero صفحات خدمات استفاده می‌شوند، پس منحصربه‌فرد هستند، از stock کمتر وابسته‌اند و هزینه runtime ندارند.
