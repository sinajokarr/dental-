> **توجه (2026-11-12):** Hero دیگر از دندان سه‌بعدی استفاده نمی‌کند؛ جایگزین آن «Signature Smile» است (D-076). فایل‌های سه‌بعدی برای مرجع در repo مانده‌اند.

# 3D HERO MASTER PLAN — JOKAR DENTAL

> نسخه: 1.1 · تاریخ: 2026-11-11 · وضعیت: **⚠️ تأیید الزامی قبل از پیاده‌سازی (C02)**
> مرجع‌ها: `DESIGN_SYSTEM.md` · `RESEARCH.md` §3–4

---

## ۱. Concept منتخب

**ترکیب B (Cinematic Tooth Reveal) و A (Floating Dental Sculpture):** یک ورود سینمایی کوتاه با عبور نور، بعد شناوری کوتاه و «نشستن» آرام. کل حرکت خودکار ≤ ۵ ثانیه است.

> **v2 (D-063، D-064، D-065):** ورود اکنون «اسکن دیجیتال» است: دندان به‌صورت ابر نقاط (داده اسکن) ظاهر می‌شود، یک صفحه اسکن با خط آبی از بالا به پایین عبور می‌کند و دندان را به پرسلن (تاج) و یخ (ریشه‌ها) تبدیل می‌کند، سپس نور rim، درخشش صیقل و یک شناوری؛ کل حرکت خودکار ≈ 4.85 ثانیه. poster پیش‌فرض همان فریم اول (ابر نقاط) است و کاربران reduced motion، بدون WebGL یا خطای 3D دندان کامل را می‌بینند. با اسکرول، دندان سطح جونده را نشان می‌دهد و دور می‌شود.

| Concept | تصمیم | دلیل |
|---|---|---|
| A — Floating Sculpture | ✅ شناوری کوتاه پس از ورود | آرام، لوکس، کم‌هزینه |
| B — Cinematic Reveal | ✅ فقط ۲ ثانیه اول | لحظه «وای» بدون معطل کردن کاربر |
| C — Technology Experience | ❌ برای Hero | لایه‌های آموزشی نیاز به تأیید پزشکی دارند، توجه را از CTA می‌گیرند و سنگین‌ترین گزینه‌اند. **کاندیدای Phase 2 برای صفحه Implants** |

---

## ۲. Art Direction — «Porcelain Crown, Ice Roots»

- **سوژه:** یک **مولر اول فک پایین** با آناتومی واقعی ولی ایده‌آل‌شده: بدون ترک، لکه یا پوسیدگی. این دندان دو ریشه دارد و کلاسیک‌ترین و قابل‌تشخیص‌ترین فرم «دندان» است.
- **امضای بصری:**
  - تاج دندان از **پرسلن سفید براق** است.
  - ریشه‌ها به‌تدریج به **یخ شیشه‌ای مات** تبدیل می‌شوند.
  - این گذار هم مفهوم Arctic و Porcelain را به هم وصل می‌کند و هم استعاره ظریفی از ایمپلنت (جایگزینی ریشه) است. ضمناً ظاهر واقع‌گرایانه و احتمالاً ناخوشایند ریشه را حذف می‌کند.
- **نسخه جایگزین (Decision Point DP2):** پرسلن کامل، یعنی ریشه‌ها هم سفید باشند. هر دو نسخه render می‌شوند و انتخاب نهایی با شماست.
- **ترکیب‌بندی:**
  - دسکتاپ: دندان در ستون inline-end، با زاویه سه‌رخ (yaw حدود 25°، pitch حدود 8°).
  - زیر دندان یک caustic آبی کشیده روی «زمین» دیده می‌شود.
  - پشت دندان یک glow یخی نرم قرار دارد.
- **نورپردازی (استودیو محصول):**

| نور | جهت | رنگ | نقش |
|---|---|---|---|
| Key softbox | بالا و inline-start | سفید سرد | فرم و براقیت تاج |
| Strip side | inline-end | سفید | خط highlight عمودی روی لبه |
| Rim | پشت | `#7FD3F4` | glow آبی لبه‌ها (Subtle Blue Glow) |
| Floor bounce | پایین | `#DDF4FF` | پرکردن سایه‌ها و رنگ یخی ریشه‌ها |
| Sweep | متحرک (فقط در ورود) | سفید | عبور نوار نور سینمایی |

---

## ۳. مدل سه‌بعدی و Pipeline

| مرحله | ابزار | خروجی و معیار |
|---|---|---|
| ۱. تهیه | خرید مدل آناتومیک **royalty-free با مجوز تجاری** (CGTrader، TurboSquid یا مشابه) | **DP1:** ۲ تا ۳ کاندید با قیمت و متن License قبل از خرید به شما ارائه می‌شود |
| ۲. پاک‌سازی | Blender | retopology، حذف عیوب، ایده‌آل‌سازی فرم، UV با projection عمودی (V برابر ارتفاع) |
| ۳. بودجه هندسه | Blender | **≤ 24k مثلث**، یک mesh، **بدون texture** (متریال procedural) |
| ۴. فشرده‌سازی | `gltf-transform optimize --compress meshopt` | **GLB ≤ 150KB** (سقف 250KB). Meshopt انتخاب شد چون decoder آن از Draco بسیار کوچک‌تر است |
| ۵. Poster | یک route فقط برای dev که همان صحنه three را در pose شروع render می‌کند؛ با Playwright اسکرین‌شات 2x گرفته و به AVIF/WebP با alpha تبدیل می‌شود | **poster دقیقاً برابر فریم اول 3D است.** AVIF ≤ 45KB و WebP ≤ 70KB |
| ۶. Brand Renders | همان pipeline با زاویه و نور متفاوت | تصاویر کارت خدمات، Hero صفحات خدمات و OG Image |
| ۷. مستندسازی | `ASSET_LICENSES.md` | منبع، License، تاریخ و فاکتور خرید |

---

## ۴. متریال — دو سطح

| پارامتر (`MeshPhysicalMaterial`) | Tier 2 (دسکتاپ) | Tier 1 (موبایل و تبلت) |
|---|---|---|
| `color` | `#F7FBFE` | `#F7FBFE` |
| `roughness` | 0.22 | 0.24 |
| `clearcoat` / `clearcoatRoughness` | 1.0 / 0.06 | 1.0 / 0.08 |
| `sheen` / `sheenColor` / `sheenRoughness` | 0.35 / `#BDEAFF` / 0.5 | 0.35 / `#BDEAFF` / 0.5 |
| `iridescence` | 0.08 (درخشش مرواریدی خیلی ملایم) | 0 |
| **ریشه‌های یخی** | `transmission` 1.0 با `transmissionMap` (گرادیان: تاج 0 ← ریشه 1) · `thickness` 0.9 · `attenuationColor` `#BDEAFF` · `roughness` ریشه حدود 0.35 (مات) | **بدون transmission.** گرادیان رنگ سفید تا `#DDF4FF` با `map` به‌همراه roughness بیشتر (یخ مات تقلیدی، بدون render pass اضافه) |
| Texture | گرادیان `DataTexture` 1×64 که در کد ساخته می‌شود (۰ بایت دانلود) | همان |

> ⚠️ **نکته فنی حیاتی:** transmission در three.js **محتوای DOM پشت canvas را نمی‌بیند**. فقط صحنه خودش را می‌بیند. بنابراین canvas پس‌زمینه خودش را رسم می‌کند: clear color `#F8FCFF` و یک صفحه glow یخی پشت دندان. لبه‌های canvas و poster هم با `mask-image: radial-gradient(...)` نرم (feather) می‌شوند تا هیچ درزی با صفحه دیده نشود.

## ۵. محیط و Render

- **Environment:** Drei `<Environment frames={1} resolution={256}>` با `<Lightformer>`های ساخته‌شده در صحنه. محیط استودیو **یک بار** ساخته می‌شود. **هیچ فایل HDRI دانلود نمی‌شود** (صرفه‌جویی بیش از 1MB).
- **Sweep ورود:** یک `RectAreaLight` متحرک. highlight مستطیلی شبیه softbox روی clearcoat ایجاد می‌کند و نیازی به بازسازی environment نیست.
- **Tone mapping:** `NeutralToneMapping`. سفیدها سفید و رنگ‌های برند دقیق می‌مانند؛ ACES سفیدها را خاکستری‌مایل می‌کند.
- **سایه:** shadow map نداریم. caustic و سایه نرم با یک صفحه radial-gradient در صحنه ساخته می‌شوند (`toneMapped: false`).
- **Post-processing:** ندارد. Bloom و DOF هر کدام یک pass تمام‌صفحه اضافه دارند؛ glow را خود نور rim می‌سازد.
- **Camera:** `PerspectiveCamera` با fov 28 (لنز تله مثل عکاسی محصول، بدون اعوجاج).
- **Canvas:** فقط اندازه ستون دندان است، نه تمام‌صفحه؛ پیکسل کمتر یعنی هزینه کمتر.
  - `antialias: true`
  - DPR سقف 2 (Tier 2) و 1.5 (Tier 1)

---

## ۶. Choreography (خط زمانی)

| زمان | رویداد | پیاده‌سازی |
|---|---|---|
| **0ms** | Navigation، H1، زیرعنوان، CTAها و **poster دندان** با اولین paint نمایش داده می‌شوند | SSR + CSS بحرانی، **بدون انتظار برای JS** |
| 0–800ms | H1 در سطح کلمه «می‌نشیند»: translateY از 0.3em به 0 و blur از 6px به 0، با stagger 60ms. **opacity همیشه 1 است** تا LCP تأخیر نخورد | CSS keyframes. در فارسی هم سطح کلمه، هرگز حرف |
| 200–700ms | eyebrow، زیرعنوان و سپس CTAها به‌ترتیب fade و rise می‌شوند | CSS |
| پس از `load` و idle | بررسی Tier ← import پویای chunk سه‌بعدی و دریافت GLB به‌صورت موازی | `next/dynamic` (ssr: false) + `requestIdleCallback` (timeout 2s) |
| آماده‌سازی | parse مدل، ساخت متریال، **`renderer.compileAsync`**، render اولین فریم پنهان | بدون jank کامپایل shader |
| Reveal (400ms) | canvas روی poster cross-fade می‌شود. چون pose و نور یکسان‌اند، جابه‌جایی‌ای دیده نمی‌شود | اگر Hero در دید نباشد: جایگزینی بی‌صدا و بدون انیمیشن |
| +0–1800ms | **لحظه سینمایی:** dolly آرام دوربین (z از 7.0 به 6.0؛ در اجرای C03 از 6.4 افزایش یافت تا دیده شود) · عبور نوار نور از بالای inline-start به پایین inline-end (1400ms) · روشن شدن تدریجی rim آبی (600ms) · پررنگ شدن caustic | GSAP timeline |
| سپس | **Settle:** ۱.۲ ثانیه شناوری نرم (±0.05، yaw ±10°) و سپس ۱.۲ ثانیه «نشستن» آرام در pose استراحت. **کل حرکت خودکار از لحظه Reveal ≤ ۵ ثانیه** (WCAG 2.2.2). پس از آن فقط تعامل کاربر حرکت ایجاد می‌کند | `useFrame` |

> ⏱ اگر 3D تا **۸ ثانیه** آماده نشد، poster برای همیشه باقی می‌ماند (حالت Tier 0).

### تعامل

| ورودی | رفتار |
|---|---|
| **Pointer** (دسکتاپ) | دندان به سمت pointer متمایل می‌شود: yaw ±12° و pitch ±8° با damping حدود 0.6 ثانیه. مختصات pointer نسبت به کل Hero است، نه فقط canvas |
| **Drag** (دسکتاپ و لمسی) | چرخش آزاد yaw و pitch محدود به ±20°، با اینرسی. پس از ۱.۵ ثانیه بی‌حرکتی، بازگشت فنری (1.2 ثانیه) به pose استراحت |
| **لمس** | فقط کشیدن **افقی** دندان را می‌چرخاند. با `touch-action: pan-y` **اسکرول عمودی هرگز مسدود نمی‌شود** |
| **Wheel** | **هیچ رهگیری‌ای ندارد.** از OrbitControls استفاده نمی‌شود، چون zoom با wheel اسکرول صفحه را می‌دزدد. گزینه‌ها: Drei `PresentationControls` اگر وابستگی‌هایش سبک باشد، یا حدود ۶۰ خط کد pointer اختصاصی (تصمیم در C02) |
| **Scroll خروج** | در طول اسکرول Hero: دندان 0.5 واحد بالا می‌رود، yaw به اندازه 24° اضافه می‌شود و scale به 0.94 می‌رسد. canvas در ۳۵٪ پایانی fade می‌شود (ScrollTrigger scrub 0.6) |

---

## ۷. سیاست Render (بدون render مداوم بی‌دلیل)

| وضعیت | Frame loop |
|---|---|
| Hero خارج از viewport (IntersectionObserver) | **متوقف** (`frameloop="never"`) |
| تب مخفی | متوقف (rAF به‌طور طبیعی متوقف می‌شود) + GSAP pause |
| ورود سینمایی | 60fps (هر دو Tier) |
| پس از Settle (هر دو Tier) | **متوقف.** با pointer (دسکتاپ) یا drag روشن می‌شود و ۱.۵ ثانیه پس از پایان تعامل دوباره متوقف می‌شود |
| تعامل در Tier 1 | سقف **30fps** |
| `prefers-reduced-motion` | هیچ 3D بارگذاری نمی‌شود (Tier 0) |

## ۸. سطح‌بندی دستگاه (Device Tiering)

| Tier | شرط | تجربه |
|---|---|---|
| **0 — Poster** | `prefers-reduced-motion` · `saveData` · نبود WebGL2 · `deviceMemory < 4` · شبکه 2G یا 3G · شکست یا timeout بارگذاری · context lost | poster ثابت + یک **عبور نور CSS** یک‌باره روی poster (با mask همان تصویر؛ در reduced-motion خاموش) |
| **1 — Mobile** | `pointer: coarse` یا عرض < 1024 | متریال Tier 1، DPR ≤ 1.5، تعامل با سقف 30fps، drag افقی |
| **2 — Desktop** | `pointer: fine` و عرض ≥ 1024 | متریال کامل با transmission، DPR ≤ 2، 60fps، tilt و drag |

**تطبیق در زمان اجرا:** Drei `<PerformanceMonitor>`. اگر FPS افت کند، DPR پله‌پله کم می‌شود (2 ← 1.5 ← 1.25 ← 1). اگر در DPR 1 هم افت ادامه داشت، tilt با pointer خاموش می‌شود و فقط drag باقی می‌ماند. متریال در زمان اجرا عوض نمی‌شود، چون کامپایل مجدد shader باعث لگ می‌شود.

---

## ۹. Fallback و پایداری

| رخداد | واکنش |
|---|---|
| `webglcontextlost` (رایج در iOS زیر فشار حافظه) | cross-fade به poster. حداکثر یک بار تلاش مجدد |
| خطای دریافت chunk یا GLB | poster می‌ماند و خطا لاگ می‌شود |
| خروج از صفحه (route change) | dispose هندسه، متریال و renderer؛ با `renderer.info` تأیید می‌شود |
| JS غیرفعال | صفحه کامل کار می‌کند: متن، CTA و poster |

## ۱۰. دسترس‌پذیری

- Canvas و poster **تزئینی** هستند: `aria-hidden="true"` و `alt=""`. هیچ اطلاعاتی فقط در 3D وجود ندارد.
- canvas در ترتیب Tab قرار ندارد. Drag هیچ عملکرد ضروری‌ای ندارد (WCAG 2.5.7 شامل آن نمی‌شود).
- عبور نور نرم است و هیچ فلش سریعی ندارد (WCAG 2.3.1).
- در Reduced motion تصویر کاملاً ثابت است.
- **حرکت خودکار حداکثر ۵ ثانیه** (WCAG 2.2.2 Pause, Stop, Hide). بعد از آن دندان ساکن است و فقط با تعامل کاربر حرکت می‌کند. این قاعده مصرف باتری و GPU را هم کم می‌کند.

---

## ۱۱. بودجه Performance

| معیار | سقف |
|---|---|
| JS chunk سه‌بعدی (three + R3F + اجزای لازم Drei) | ≤ 250KB gzip. **همیشه خارج از مسیر بحرانی**، بعد از LCP |
| GLB | ≤ 150KB (هدف) / 250KB (سقف) |
| Poster | AVIF ≤ 45KB · WebP ≤ 70KB |
| HDRI و texture دانلودی | **۰** |
| Draw calls / مثلث‌ها | ≤ 6 / ≤ 30k |
| GPU frame time | ≤ 8ms (دسکتاپ با GPU مجتمع) · ≤ 16ms (موبایل میان‌رده با DPR 1.5) |
| Long task هنگام init سه‌بعدی | هیچ task بالای 200ms · مجموع blocking ≤ 300ms (Lab، پروفایل موبایل) |
| اثر روی LCP | اختلاف با و بدون 3D ≤ 100ms (میانه ۵ اجرا) |
| CLS ناشی از Hero | **0** (کادر ثابت با aspect-ratio برای poster و canvas) |
| INP هنگام init سه‌بعدی | ≤ 200ms |
| حافظه GPU | ≤ 64MB |

## ۱۲. برنامه تست

| تست | روش | ابزار |
|---|---|---|
| LCP، CLS و TBT با و بدون 3D | ۵ اجرا، میانه | Lighthouse (پروفایل موبایل) + WebPageTest |
| frame time و draw calls | پروفایل ورود و idle | Chrome Performance · `renderer.info` · `r3f-perf` (فقط dev) |
| Tiering | شبیه‌سازی reduced-motion، saveData، نبود WebGL (`--disable-webgl`) و CPU throttle ۴ برابر | Playwright `emulateMedia` + فلگ‌های Chrome |
| یکسانی poster و فریم اول | مقایسه تصویری | Playwright visual diff |
| اسکرول بدون مسدودی | لمس عمودی روی canvas در iOS و Android | دستگاه واقعی |
| context loss | `WEBGL_lose_context.loseContext()` | DevTools |
| نشت حافظه | ۱۰ بار رفت‌وبرگشت route و بررسی `renderer.info.memory` | DevTools |
| RTL | قرینه بودن ترکیب‌بندی و جهت tilt | `/fa/` |

**ماتریس دستگاه:**

- iPhone 12 به بالا (Safari)
- iPad (Safari)
- Android میان‌رده (Chrome)
- Android ضعیف با RAM ≤ 4GB
- MacBook (Safari و Chrome)
- Windows با GPU مجتمع (Chrome و Edge)
- Firefox دسکتاپ

> طبق قانون ۶: هیچ عددی بدون اندازه‌گیری واقعی گزارش نمی‌شود.

---

## ۱۳. ریسک‌ها

| ریسک | احتمال | راهکار |
|---|---|---|
| حجم JS سه‌بعدی روی INP اندروید ضعیف اثر بگذارد | متوسط | بارگذاری بعد از idle + Tier 0 + اندازه‌گیری در H03 |
| Context loss در iOS | متوسط | fallback به poster + dispose کامل |
| درز رنگی بین canvas و صفحه | زیاد بدون راهکار | پس‌زمینه داخل صحنه + feather لبه‌ها + `toneMapped: false` |
| کیفیت مدل خریداری‌شده | متوسط | **Gate بصری:** renderها قبل از اتصال به سایت تأیید می‌شوند |
| «ریشه یخی» نامفهوم به نظر برسد | کم تا متوسط | DP2: render هر دو نسخه و انتخاب با شما |
| لگ کامپایل shader | متوسط | `compileAsync` و render پنهان قبل از reveal |
| License مدل | کم | فقط royalty-free تجاری، ثبت در `ASSET_LICENSES.md` |

## ۱۴. ایده‌های ردشده

| ایده | دلیل رد |
|---|---|
| دندان ثابت در کل صفحه که بین سکشن‌ها سفر می‌کند | render مداوم وابسته به اسکرول و پیچیدگی زیاد. پس از Launch و با داده واقعی بازبینی می‌شود |
| Bloom و DOF | pass تمام‌صفحه اضافه؛ نور rim همین اثر را می‌سازد |
| فایل HDRI | بیش از 1MB؛ Lightformerها رایگان هستند |
| WebGPU و TSL | پوشش مرورگری کافی نیست؛ WebGL2 همه‌جا در دسترس است |
| Tilt با ژیروسکوپ | iOS دیالوگ مجوز نشان می‌دهد و باتری مصرف می‌کند |
| OrbitControls | اسکرول را می‌دزدد |
| Particles و sparkles | حس SaaS و ارزان |
| Background WebGL از React Bits | دومین WebGL context (نقض D-013) |

## ۱۵. ساختار فایل (پیش‌نمایش؛ نهایی در `ARCHITECTURE.md`)

```text
frontend/src/components/three/hero-tooth/
├── HeroTooth.tsx        # tier → poster | lazy canvas
├── Scene.tsx            # camera، Environment+Lightformers، lights
├── Tooth.tsx            # GLB + متریال‌ها
├── tier.ts              # تشخیص Tier
frontend/public/models/tooth.glb
frontend/public/images/hero/tooth-poster.{avif,webp}
```

## ۱۶. Decision Points برای کارفرما

| ID | سؤال | زمان |
|---|---|---|
| **DP1** | تأیید خرید مدل دندان (۲ تا ۳ کاندید با قیمت و License ارائه می‌شود) | شروع C02 |
| **DP2** | «تاج پرسلنی + ریشه یخی» (توصیه) یا «پرسلن کامل» | پس از اولین renderها |
