# RESEARCH — منابع طراحی، انیمیشن و سه‌بعدی

> تاریخ: 2026-11-11 · این سند فقط بررسی منابع است. انتخاب نهایی هر کامپوننت در `ANIMATION_MASTER_PLAN.md` انجام می‌شود.

## ۱. React Bits — reactbits.dev

| مورد | یافته |
|---|---|
| License | **MIT + Commons Clause**. استفاده تجاری در وب‌سایت مشتری **مجاز** است. فروش یا بازتوزیع خود کامپوننت‌ها به‌صورت مستقل **ممنوع** است |
| روش نصب | کپی سورس یا CLI (shadcn / jsrepo). کد داخل پروژه قرار می‌گیرد و مالکیتش با ماست |
| نسخه‌ها | JS یا TS، و CSS یا Tailwind |
| دسته‌ها | Text Animations، Animations، Components، Backgrounds، Micro Interactions |
| موارد مرتبط با Jokar | Split Text و Blur Text (برای عنوان Hero)، Fluid Glass، Metallic Paint/Liquid Chrome (فقط الهام برای متریال)، Magnet و Click Spark (میکرواینترکشن CTA) |
| ریسک | برخی کامپوننت‌ها به `ogl`، `three` یا `gsap` وابسته‌اند. Backgroundهای WebGL تمام‌صفحه با Hero سه‌بعدی ما **رقابت می‌کنند** و استفاده نمی‌شوند. **ما فقط از یک WebGL context استفاده می‌کنیم** |

> نکته حقوقی: تحویل سورس به کارفرما بخشی از تحویل وب‌سایت است و فروش کامپوننت محسوب نمی‌شود. این برداشت ما از متن License است و مشاوره حقوقی نیست.

## ۲. Aceternity UI — ui.aceternity.com

| مورد | یافته |
|---|---|
| License | کامپوننت‌های بخش Free رایگان و copy-paste هستند. Blockها و Templateها نیاز به **All-Access پولی** دارند و استفاده نمی‌کنیم |
| وابستگی | **Tailwind CSS + Motion** (Framer Motion سابق) |
| موارد مرتبط | Spotlight، Card Spotlight، 3D Card Effect، Sticky Scroll Reveal، Tracing Beam، Timeline، Floating Navbar / Resizable Navbar، Animated Tabs، Text Generate Effect، Compare (برای قبل/بعد، **فقط با عکس واقعی**) |
| تصمیم | فقط **الگو** را بازنویسی می‌کنیم. Motion را اضافه نمی‌کنیم چون GSAP همین کارها را انجام می‌دهد و داشتن دو موتور انیمیشن یعنی bundle بزرگ‌تر و تداخل timeline. این کامپوننت‌ها با GSAP یا CSS پیاده می‌شوند |
| رد شده | Meteors، Vortex، Sparkles، Background Beams. حس SaaS دارند، نه کلینیک لوکس |

## ۳. Codrops — tympanus.net

| مورد | یافته |
|---|---|
| دسترسی | صفحه Hub برای fetch خودکار 403 برمی‌گرداند. مقاله‌ها از طریق جست‌وجو بررسی شدند |
| License | هر Demo در GitHub مجوز جداگانه دارد (معمولاً MIT). **قبل از اقتباس، مجوز هر repo جداگانه بررسی و در `ASSET_LICENSES.md` ثبت می‌شود** |
| مرجع ۱ | [Warping 3D Text Inside a Glass Torus (2025)](https://tympanus.net/codrops/2025/03/13/warping-3d-text-inside-a-glass-torus/) — استفاده از `MeshTransmissionMaterial` در Drei، و ساخت شیشه مات با ترکیب roughness و anisotropy |
| مرجع ۲ | [Transparent Glass and Plastic in Three.js](https://tympanus.net/codrops/2021/10/27/creating-the-effect-of-transparent-glass-and-plastic-in-three-js/) — مبانی transmission و thickness در `MeshPhysicalMaterial` |
| مرجع ۳ | [Infinite Liquid Glass Grid — WebGPU + TSL](https://tympanus.net/codrops/?p=120372) — فقط برای الهام. WebGPU هنوز برای مخاطب موبایل پایه مناسب نیست |
| درس فنی کلیدی | **هر شیء با transmission یک render pass اضافه از کل صحنه می‌گیرد.** نتیجه: در Hero فقط یک شیء transmissive داریم (یا هیچ). روی موبایل از material ارزان‌تر استفاده می‌شود |

## ۴. مدل سه‌بعدی دندان

| گزینه | مزایا | معایب |
|---|---|---|
| Sketchfab با مجوز CC-BY (مثلاً [Human deciduous molar](https://www.sketchfab.com/3d-models/human-deciduous-molar-daa374b3d2bd4a8ab18336267816b1df)) | رایگان و آناتومیک | اسکن microCT با ۱.۸M مثلث، **دندان شیری**، Attribution اجباری، نیاز به retopology سنگین |
| [Tooth (mRiot), Sketchfab CC-BY](https://sketchfab.com/3d-models/tooth-68b2e478f5f843048af2e21e80ba1db2) | سبک (~۲.۳k مثلث) | ساده و کارتونی، در حد برند لوکس نیست |
| خرید از CGTrader یا RenderHub (Royalty-free) | کیفیت بالا، آماده | License هر مدل باید بررسی شود؛ معمولاً نیاز به بهینه‌سازی دارد |
| **سفارش اختصاصی در Blender** | منحصربه‌فرد، دقیقاً مطابق برند، بهینه از ابتدا | هزینه و زمان (~۳ تا ۷ روز کار آرتیست) |

**توصیه:** خرید یک مدل royalty-free آناتومیک از **دندان دائمی** (مولر یا سانترال)، سپس retopology اختصاصی در Blender.

- بودجه هندسه: ≤ ۳۰k مثلث
- فشرده‌سازی: Draco/Meshopt
- حجم هدف: GLB ≤ 150KB (سقف 250KB)؛ جزئیات در `3D_HERO_MASTER_PLAN.md`
- مزیت: هم سرعت تحویل بالا است و هم ظاهر اختصاصی.

> تصمیم نهایی درباره مدل در `3D_HERO_MASTER_PLAN.md` گرفته می‌شود.

## ۵. تصاویر

| منبع | License | کاربرد |
|---|---|---|
| Unsplash | Unsplash License (تجاری، بدون Attribution) | فضای معماری، بافت، نور، سفر (آنتالیا و استانبول) |
| Pexels | Pexels License (تجاری) | پشتیبان |
| Adobe Stock | Standard License (پولی) | فقط اگر تصویر پزشکی باکیفیت در منابع رایگان پیدا نشود |

> طبق تصمیم D-007، تصاویر stock هرگز به‌عنوان کلینیک واقعی، پزشک یا نتیجه درمان معرفی نمی‌شوند.

## ۶. کنتراست پالت رنگ (WCAG 2.2، محاسبه واقعی)

| رنگ متن | روی `#FFFFFF` | روی `#F2FAFF` | روی `#DDF4FF` | نتیجه |
|---|---|---|---|---|
| `#092A4A` | 14.57 | 13.80 | 12.80 | ✅ متن اصلی |
| `#103C68` | 11.24 | 10.65 | 9.88 | ✅ متن ثانویه |
| `#0C5798` | 7.41 | 7.02 | 6.52 | ✅ لینک و CTA (AA و AAA) |
| `#7FD3F4` | 1.68 | 1.59 | 1.47 | ❌ **هرگز برای متن** — فقط glow، خط و دکور |
| `#BDEAFF` | 1.28 | 1.21 | 1.13 | ❌ فقط سطح و پس‌زمینه |

اعداد بالا نسبت کنتراست هستند (مثلاً 14.57 یعنی 14.57:1).

- متن سفید روی دکمه `#0C5798`: **7.41** ✅
- متن `#7FD3F4` روی پس‌زمینه `#092A4A`: **8.69** ✅ (برای سکشن‌های تیره)
