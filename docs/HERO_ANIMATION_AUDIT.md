# HERO_ANIMATION_AUDIT — بررسی انیمیشن Hero (قبل از D-076)

> تاریخ: 2026-11-12 · وضعیت: بررسی انجام شد؛ جایگزینی در تسک HS01 انجام شد.

## انیمیشن قبلی
دندان سه‌بعدی با ورود «اسکن دیجیتال» (D-063، D-064، D-065): poster ← بعد از `load` و idle سنجش توان دستگاه (tier) ← chunk lazy شامل three.js، R3F و GSAP ← مدل `tooth.bin` ← timeline ۴٫۸۵ ثانیه‌ای ← سکون.

## نقطه جایگزینی
`Hero.tsx` فقط یک slot به نام `visual` دارد که `page.tsx` آن را پر می‌کند. اندازه slot ثابت است (`h-56`، `sm:h-72`، مربع در دسکتاپ). پس `Hero.tsx` (متن، CTAها، چیدمان، `PointerGlow`، هاله بژ) دست نخورد و فقط محتوای slot عوض شد.

## فایل‌های انیمیشن قبلی (بدون حذف، فقط از صفحه برداشته شدند)
`three/hero-tooth/{HeroTooth,ToothScene,entrance,tier,toothFormat}`، `public/models/tooth.bin`، `public/images/hero/tooth-{scan,poster}.png`، `scripts/build-tooth.mjs`، `scripts/render-poster.mjs`.
`opengraph-image.tsx` هنوز از `tooth-poster.png` استفاده می‌کند، پس تصویر پیش‌نمایش لینک عوض نشد.

## ریسک‌هایی که دیده شد و تصمیمشان
| ریسک | تصمیم |
|---|---|
| پرامپت پالت «آبی یخی» می‌گفت؛ پالت فعلی سایت Beige Agate و Blue Gentian است (D-073/D-074) | رنگ‌ها از tokenهای فعلی |
| تست‌های `hero-3d.spec` دندان قدیمی را قفل کرده بودند | با `hero-smile.spec` جایگزین شدند |
| keyframeهای Hero در `globals.css` بود | انیمیشن جدید در فایل CSS مخصوص Hero؛ `globals.css` دست نخورد |
| CSS Module با قانون Turbopack پروژه (هر `*.css` از Tailwind می‌گذرد) سازگار نیست | CSS ساده با پیشوند `hero-smile` و `hs-` |
| تصویر نباید «نتیجه درمان» یا «بیمار واقعی» به‌نظر برسد (CLAUDE.md) | نشان انتزاعی؛ بدون لب و صورت |
| حرکت خودکار ≤ ۵ ثانیه (D-041) | کل انیمیشن ≈ ۴٫۶ ثانیه؛ با تست قفل شده |
