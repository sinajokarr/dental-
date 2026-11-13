# HERO VIDEO PLAN — «THE PERFECTLY NATURAL SMILE»

> تاریخ: 2026-11-14 · وضعیت: **آماده برای تولید ویدئو توسط کارفرما** · مرتبط: D-084 تا D-090

## ۱. وضع فعلی Hero (TASK 01)

| مورد | مقدار |
|---|---|
| ساختار | `Hero.tsx` (متن، دو CTA) + `HeroPhoto` در slot تصویر (`sections/hero-photo/*`) |
| تصویر | عکس خود کلینیک (`23.PNG`، صاف‌شده) در `src/assets/hero-smile.jpg`، 1040×1414 |
| دسکتاپ | Editorial Split: تمام‌قد، لب‌به‌لب با لبه صفحه (راست در LTR، چپ در فارسی)، حدود ۴۵–۴۷٪ عرض، محوشدن نرم به رنگ عاج کنار متن |
| موبایل | تصویر تمام‌عرض با گوشه گرد زیر دو دکمه، ارتفاع 22rem / 28rem |
| کارایی (موبایل کندشده) | LCP 0.72s · CLS 0 · تصویر ۶۲KB (AVIF) |
| حرکت | یک fade با push آرام ۲٫۴ ثانیه، یک بار؛ reduced motion = عکس ثابت |

## ۲. محدودیت صادقانه

ساختن ویدئوی واقعی «خندیدن» از روی یک عکس ثابت (حرکت لب، گونه و چشم) **با ابزارهای این محیط ممکن نیست** و ادعایش نمی‌شود. این کار ابزار image-to-video می‌خواهد (مثل Runway Gen-4، Kling 2.x، Google Veo 3 یا Luma). خط لوله جایگزینی آماده است: هر فایل ویدئویی که برسد، در حدود ۱۰ دقیقه برش، رمزگذاری، poster و نسخه موبایل می‌گیرد (`frontend/scripts/video/encode.mjs`) و جای عکس می‌نشیند.

## ۳. سه Creative Direction (TASK 02)

| | A · Living Portrait (پیشنهادی) | B · Macro Veneer Film | C · Studio Beauty Campaign |
|---|---|---|---|
| ترکیب | همین قاب `23.PNG` (چشم، بینی، لبخند) | ماکروی لب و دندان (مثل `4.MOV`) | نمای نزدیک تمام‌صورت روبه‌رو، پس‌زمینه عاج |
| حالت صورت | از لبخند آرام به لبخند کامل | لبخند ثابت، نور می‌چرخد | نگاه آرام ← لبخند کامل ← سر کمی می‌چرخد |
| دوربین | ثابت، push بسیار آرام (۳–۵٪) | dolly آهسته در طول لبخند | چشم‌سطح، push آرام |
| نور | نرم، گرم، هایلایت عاج | نور لبه برای نمایش شفافیت مینا | key نرم + fill، پس‌زمینه بژ روشن |
| مزیت | همان چهره‌ای که کارفرما انتخاب کرده؛ کمترین ریسک ناهمخوانی | جزئیات لمینت بیشترین دیده‌شدن | نزدیک‌ترین به مرجع‌ها؛ نیاز به فیلم‌برداری واقعی |

**پیشنهاد:** A، با ابزار image-to-video از روی `23.PNG` (صاف‌شده). اگر نتیجه AI غیرطبیعی شد (دندان لرزان، تغییر چهره)، استفاده نمی‌شود و عکس فعلی می‌ماند. بهترین کیفیت ممکن: C با فیلم‌برداری واقعی ۵ ثانیه‌ای در کلینیک (4K، ۲۵fps، بدون صدا) با رضایت‌نامه کتبی.

## ۴. Storyboard نهایی (TASK 04) — ۶ ثانیه، بدون loop

| ثانیه | صحنه |
|---|---|
| 0.0–1.0 | قاب همان عکس؛ لب‌ها بسته‌تر، لبخند ملایم، نگاه آرام به دوربین |
| 1.0–2.8 | لبخند آهسته باز می‌شود؛ گونه‌ها بالا می‌آیند، چشم‌ها کمی تنگ می‌شوند (لبخند Duchenne) |
| 2.8–4.5 | لبخند کامل: دندان‌های بالا روشن و طبیعی؛ یک پلک‌زدن طبیعی |
| 4.5–6.0 | سر ۲–۳ درجه می‌چرخد؛ دوربین ۳٪ جلو می‌آید؛ فریم آخر = poster |

## ۵. پرامپت تولید ویدئو (TASK 05) — برای Runway / Kling / Veo (image-to-video)

ورودی تصویر: `frontend/src/assets/hero-smile.jpg` (یا `23.PNG` چرخانده‌شده ۱۸۰ درجه).

```text
Image-to-video, 6 seconds, 24 fps, vertical 4:5, no audio, no loop.
Subject: the exact woman in the reference image — keep her identity, skin texture, freckles, nose ring,
lip colour and the shape and number of her teeth exactly as in the photo. Close-up beauty shot, eye level.
Motion: she begins with a soft closed-lip smile, then slowly breaks into a natural, warm, full smile
(genuine Duchenne smile: cheeks lift, eyes narrow slightly), blinks once naturally, and turns her head
2–3 degrees toward camera at the end. The camera holds still with a very slow push-in of about 3 percent.
Teeth: bright natural white porcelain veneers, well aligned, natural proportions and subtle enamel
translucency; teeth stay perfectly stable — same count, same shape, no morphing.
Lighting: soft studio beauty lighting, warm ivory highlights, gentle shadows, natural skin tones.
Style: luxury beauty campaign for a premium dental clinic; realistic, cinematic, editorial; shallow depth
of field with the smile in sharp focus.
Avoid: plastic or airbrushed skin, uncanny or exaggerated smile, oversized or identical square teeth,
excessive whitening, sparkles or flashes on teeth, flickering or changing teeth, extra teeth, gum or lip
distortion, changing facial features, fast or shaky camera, text, watermark.
```

## ۶. بهینه‌سازی و جایگزینی (TASK 06–09)

1. فایل را در `~/Desktop/photo dental /` بگذارید (MP4 یا MOV، حداقل 1080p).
2. رمزگذاری: `node scripts/video/encode.mjs <file> <out> '{"start":0,"end":6,"crop":[...],"size":[1080,1350],"kbps":1400}'` و نسخه موبایل `[720,900]`؛ WebM (VP9) + MP4 (H.264)؛ poster = فریم اول و آخر WebP.
3. نمایش: `<video muted playsinline autoplay>` بدون loop، sourceها با `media="(prefers-reduced-motion: no-preference)"`؛ تا شروع، پس‌زمینه همان فریم اول (بدون پرش)؛ با reduced motion فقط poster آخر و هیچ ویدئویی دانلود نمی‌شود (همان الگوی D-084).
4. بودجه: poster ≤ ۸۰KB، ویدئوی موبایل ≤ ۴۰۰KB، دسکتاپ ≤ ۹۰۰KB؛ LCP ≤ 2.5s و CLS ≤ 0.1 روی موبایل کندشده (تست `performance.spec.ts`).
5. تست: پخش کامل در Chromium، Firefox، WebKit، iPhone و Android (شبیه‌سازی‌شده)؛ متن و CTA منتظر ویدئو نمی‌مانند.

## ۷. پیش از Launch

رضایت‌نامه کتبی و حق استفاده برای `23.PNG`، `1.MOV` و `4.MOV` (ASSET_LICENSES). هیچ‌کدام «نتیجه درمان بیمار X» معرفی نمی‌شوند.
