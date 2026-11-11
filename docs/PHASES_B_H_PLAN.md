# PHASES B–H — Execution Plan

> 2026-11-11 · Client instruction: «task b ta h boro anjam bede» (execute B through H) · Branch `phases-b-h` (from `phase-a-foundation`)
> Specs: DESIGN_SYSTEM · 3D_HERO_MASTER_PLAN · ANIMATION_MASTER_PLAN · HOMEPAGE_UX_SPEC · LEAD_MANAGEMENT_AND_FORM_SPEC · WHATSAPP_TELEGRAM_INTEGRATION · API_SPEC · MULTILINGUAL_SEO_ARCHITECTURE · SECURITY_PERFORMANCE_QA

## Interim decisions (client inputs not yet available)

| Item | Waiting for | Interim | Swap later |
|---|---|---|---|
| 3D tooth | ~~DP1~~ answered: «much more professional» (D-064) | Procedural anatomical molar v2 (Task 39) | — |
| Treatment visuals | final model renders | Brand SVG line illustrations | Brand renders |
| Copy fa/en/de/tr | G4 approval, Q7 medical review | Drafts from verified facts only (Claims Policy); every UI task ships all 4 locales (parity test) | Reviewed text |
| Legal pages, consent text | Q12 (no counsel, D-062) | Draft templates, `noindex`, consent_version `draft-1` — legal review blocks launch | Reviewed text |
| Telegram | Q5 bot token | Mocked tests; real smoke test NOT RUN | — |
| Deployment (H07) | domain + host (Q6) | Production stack built and smoke-tested locally | Real deploy |
| Devices / screen readers | physical devices | Playwright WebKit/Firefox/mobile emulation; manual SR NOT RUN | Manual pass |
| Photos | ~~stock selection~~ done (D-072) | Two licensed city photos (Antalya, Istanbul) | Real clinic photos when available |
| About page | ~~Q10~~ answered (D-062) | Our copy from verified facts, published | — |

## Tasks

### Task 1 · B01 — Typography
Self-hosted subset woff2 (Cormorant Garamond 300/300i, Manrope var, Vazirmatn var) in `public/fonts` + OFL; `@font-face` with unicode-range; per-locale preload of the H1 font; metric-matched fallbacks; type-scale utilities. Test: fa page requests no Latin display font and vice versa (Playwright network), glyph render, CLS 0.

### Task 2 · B02 — Contrast
Unit test: every text/background pair in DESIGN_SYSTEM meets its WCAG ratio, computed from globals.css tokens.

### Task 3 · B03 — Glass & porcelain
Tailwind `@utility` recipes glass-nav / glass-card / glass-strong / glass-dark, porcelain-edge; `@supports` and reduced-transparency fallbacks. Test: utilities compile; fallback rules present.

### Task 4 · B05 — Buttons
`ButtonLink` (primary / primary-inverted / whatsapp / tertiary), WhatsApp glyph, loading state, magnetic hover (pointer:fine, reduced-motion off). Test: e2e focus ring + 44px targets + axe.

### Task 5 · B06 — Layout primitives
Container / Section (light, ice, navy) / SectionHeader, `lib/content-flags.ts`. Test: unit for flags, RTL guard.

### Task 6 · B07 — Motion system
`useReveal` (IntersectionObserver, once), `[data-reveal]` CSS, noscript fallback, `lib/motion.ts` (dirSign, lazy GSAP + matchMedia). Test: reduced-motion + no-JS e2e; GSAP absent from the initial bundle.

### Task 7 · B04 — Navigation
Glass nav (shrink on scroll), Treatments dropdown, mobile `<dialog>` menu, language switcher (same page in other locale, native names, no flags), skip link, `i18n/navigation.ts`. Test: keyboard e2e, switcher keeps page, axe.

### Task 8 · C01 — Hero (HTML)
SSR copy, CSS word-settle (opacity 1), glows, CTAs, poster slot with fixed aspect. Test: content without JS, both CTAs above the fold at 390×844, CLS 0.

### Task 9 · C02 — Procedural tooth + scene
`scripts/build-tooth.mjs` → `public/models/tooth.bin`; scene (Lightformer env, tiered materials, rim/sweep lights, glow plane); poster script. Test: asset size/triangle budget, poster = first frame.

### Task 10 · C03 — Hero 3D behavior
Tiers, idle lazy-load, compileAsync, GSAP entrance, ≤5 s auto-motion then rest, pointer tilt, horizontal drag (pan-y), scroll exit, context-loss fallback, demand rendering. Test: reduced-motion → poster only, no-WebGL → poster, scroll not blocked.

### Task 11 · C04 — Trust strip + Treatments
### Task 12 · C05 — Why Jokar
### Task 13 · C06 — International journey (navy, GSAP draw-line)
### Task 14 · C07 — FAQ (`<details name>`)
### Task 15 · C08/C09 — Consultation shell, Finale, Footer, sticky mobile CTA
### Task 16 · C10 — Hidden sections behind flags
Tests per task: e2e render + axe + reduced-motion where animated.

## Phase C2 — Motion & 3D v2 (client feedback 2026-11-11: «انیمیشن‌ها خیلی ساده‌اند»، «دندان را خیلی حرفه‌ای‌تر کن») · D-063, D-064, D-065

Executed before Task 22. Principle: a few orchestrated moments the visitor drives (load ≤ 5 s, then scroll/pointer), not more fade-ups.

### Task 39 · C11 — Tooth v2 geometry
Anatomical mandibular first molar SDF (5 cusps + grooves, cervical constriction, root trunk, 2 roots with distal curve), higher resolution, vertices projected onto the surface, SDF-gradient normals. Test: detail floor ≥ 18k triangles, budget ≤ 30k / 150 KB brotli, anatomy checks (separate roots, cervical constriction, cusps above the central fossa).

### Task 40 · C12 — Hero scene v2 + digital-scan entrance
Studio light (strip softboxes, key, rim), porcelain crown / ice roots, contact shadow. Entrance: point cloud → scan band → porcelain (shader injection, no extra files), then rest; auto-motion ≤ 5 s. Scroll: tooth turns to show the occlusal surface and recedes. Two posters (scan/final) with `<picture>` reduced-motion source; Tier 0/failure → final. Test: canvas ready, motion stops ≤ 5 s, reduced motion gets the final poster, posters exist.

### Task 41 · C13 — Treatment chapters
Desktop: sticky illustration stage; each treatment entry activates its line illustration, which draws itself with the scroll. Mobile: illustration draws on enter. No 01/02/03 (not a sequence). Test: one active chapter at a time, reduced motion/no JS = all drawn, axe.

### Task 42 · C14 — Cinematic journey, navy panels, details
Navy panels open from an inset card to full bleed with the scroll; journey line draws with a glowing head while steps light up (desktop: pinned); Finale light sweep; porcelain glint on primary buttons; Why section without the reused poster and fake numbering. Test: reduced motion/no JS = final state, no CLS, axe, scroll never blocked.

### Task 43 · C15 — Client answers in the copy
4 locales: consultation in your language, phone calls, online photo/X-ray assessment via WhatsApp, typical stay 3–8 days, aftercare follow-up, guarantee terms depend on the treatment (FAQ + journey + trust strip + footer tel link). Test: message parity, FAQ count, tel link.

### Task 17 · D01/D02 — Lead models
### Task 18 · D03/D04 — Lead API, validation, idempotency, throttle, health
### Task 19 · D05 — Admin
### Task 20 · D06 — Telegram outbox + commands
### Task 21 · D07 — Security (groups, 2FA, axes, admin-path validation, check --deploy)
Tests: Django TestCase / APITestCase per LEAD_MANAGEMENT §11 and API_SPEC §4.

### Task 22 · E02 — WhatsApp links
### Task 23 · E01 — Consultation form UI
### Task 24 · E03/E04 — Server Action + consent (draft)
### Task 25 · E07 — Form resilience (API / Telegram down)

### Task 26 · F01–F04 — Copy & claims audit (all locales)
### Task 27 · F05 — RTL/LTR QA
### Task 28 · F06 — International SEO (metadata, hreflang, sitemap, robots, JSON-LD, OG images)

### Task 29 · G01–G04 — Treatment template + 3 pages
### Task 30 · G05 — International Patients page
### Task 31 · G06 — Free Consultation page
### Task 32 · G07–G09 — About (flagged), legal drafts, localized 404

### Task 33 · H01/H02 — Cross-browser + mobile emulation, accessibility suite
### Task 34 · H03 — Performance (Lighthouse lab, budgets, bundle)
### Task 35 · H06 — Production infrastructure (Dockerfiles, compose, Caddy, backup) + local smoke
### Task 36 · H04 — Security review (headers/CSP on prod stack, check --deploy, audits)
### Task 37 · H05 — Full e2e on the production stack
### Task 38 · H07/H08 — Deployment (blocked: NOT RUN) + launch validation report
