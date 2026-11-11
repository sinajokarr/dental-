# Phases B–H — rulings, fixes and deferred minors

> Extracted from the execution ledger (the working directory `.superpowers/sdd/` is temporary). Every ruling records what was decided on the client's behalf, why, and what it costs if wrong.

## Rulings (55)

- - Ruling: B08 gallery skipped — the built homepage is the visual review surface (G1 merged into G3) — cost if wrong: one dev route later.
- - Ruling: D08 consolidated into per-task Django tests; Task 21 runs the full suite.
- Task 1: Ruling: Cormorant Garamond pinned to static 300 (H1 and H2) — variable 300–400 was 71 KB and broke the 120 KB per-locale budget; now Latin 70 KB (+30 KB italic), Persian 72 KB — DESIGN_SYSTEM h2 weight updated, D-060 — cost if wrong: H2 slightly lighter than designed.
- Task 4: Ruling: buttons are a class helper (buttonClass) applied to <a>/<Link>/<button> instead of a polymorphic component — no wrapper needed — cost if wrong: none.
- Task 4: Ruling: B05/B06/B07 primitives have no page yet (no gallery, pre-flight ruling) — their e2e checks (focus ring, 44px targets, reduced motion, no-JS) run on the homepage sections that consume them (Tasks 8, 11) — cost if wrong: a primitive bug surfaces one task later.
- Task 6: Ruling: reveals are armed by RevealObserver setting html[data-motion] (instead of a <noscript> style) — content stays visible without JS, on JS failure and with reduced motion; elements already in view are marked revealed before arming (no flicker) — cost if wrong: none.
- Task 7: Ruling: the global nav CTA links to /free-consultation; in-page CTAs (hero, sections) anchor to #consultation — the layout cannot know whether a page has a form — cost if wrong: one extra click from the nav.
- Task 7: Ruling: About link hidden while contentFlags.aboutPage is false (Q10) — cost if wrong: none.
- Task 7: Ruling: waLink + all WhatsApp messages (E02 lib) built here because the header needs them; Task 22 covers the remaining placements — cost if wrong: none.
- Task 7: Ruling: NextIntlClientProvider messages={null} — client components receive text as props, so no translations ship to the browser — cost if wrong: a future client component using useTranslations must pick its messages explicitly.
- Task 7: Ruling: icon-only WhatsApp link in the header uses darker green #128C4A (4.3:1 on white, WCAG 1.4.11) instead of #25D366 (1.98:1) — Meta brand-guideline check pending — cost if wrong: swap the color.
- Task 8: Ruling: axe runs on the settled page (helper waits for one-shot animations) — production loads fast enough that axe judged contrast mid-entrance (opacity < 1) and reported false color-contrast failures — cost if wrong: none; final state is what users read.
- Task 9: Ruling: interim procedural molar (SDF + marching cubes via three's MarchingCubes) generated offline by scripts/build-tooth.mjs into a custom binary (int16/int8 normalized attributes, no GLTFLoader, no decode cost) — 12,620 triangles, 67 KB brotli — D-061 — cost if wrong: swap file + loader when the purchased model (DP1) arrives.
- Task 9: Ruling: environment light = in-scene emissive panels prefiltered once with PMREMGenerator, attached declaratively (<primitive attach="environment">); Drei's Environment not used (pulls HDR loaders) — cost if wrong: none.
- Task 9: Ruling: poster rendered from the live scene (tier-2 material) by scripts/render-poster.mjs through a ?poster capture mode — poster equals the 3D first frame on desktop; tier-1 devices see a near match — cost if wrong: a slight color step on mobile cross-fade.
- Task 10: Ruling: Drei removed (unused: environment via PMREM, performance via demand rendering + tiers; PerformanceMonitor unnecessary when frames render only on change) — cost if wrong: re-add for a specific helper.
- Task 10: Ruling: no 30 fps cap for Tier 1 — frameloop "demand" renders only during the ≤5 s entrance or user interaction — cost if wrong: higher frame rate on mid phones during interaction only.
- Task 10: Ruling: dolly 7.0 → 6.0 (plan said 6.4 → 6.0; the 6 % change was invisible) and sweep intensity 14; poster = entrance start state so the cross-fade is seamless — 3D plan updated — cost if wrong: none.
- Task 11: Ruling: trust strip omits "in your language" (staff languages pending Q13) and every unverified claim; treatment descriptions are general medical facts flagged for Q7 review — cost if wrong: copy edits only.
- Task 13: Ruling: axe helper now judges the final content state (reduced motion makes reveals/journey final; gsap.matchMedia reverts) — scroll-pending states are intermediate, not what readers see — cost if wrong: none.
- Task 14: Ruling: FAQ publishes only the five questions with confirmed answers; stay length, cost and guarantees wait for Q11 — cost if wrong: none.
- Task 15: Ruling: footer shows "© JOKAR DENTAL" without a year — new Date() in a prerendered Server Component is dynamic under Cache Components — cost if wrong: add a build-time year later.
- Task 15: Ruling: the consultation section ships without the form slot filled; the form (Task 23) plugs into its `form` prop — cost if wrong: none.
- Task 16: Ruling: SKIPPED — hidden Team / Technology / Stories sections are not built yet: their content model is unknown (Q2/Q3/Q4) and the client asked to prioritise the largest, most important tasks; contentFlags already reserve them — cost if wrong: a few hours once real content exists.
- Task 15: Ruling: e2e default reducedMotion=reduce (no CPU-rendered WebGL in tests that don't need it); hero, hero-3d, treatments and journey specs opt back in — flaked under machine load, now 45/45 twice (41 s, 32 s) — cost if wrong: motion regressions only caught by the 4 motion specs.
- Task 18: Ruling: token check inside the view returning 401 (DRF would turn auth failures into 403 without an authenticator) — cost if wrong: none.
- Task 18: Ruling: throttle runs before the token check (DRF order); unauthorized calls consume quota — acceptable because the API is internal-only — cost if wrong: none.
- Task 18: Ruling: a reference collision retries with a new random reference (up to 3); a submission_id collision returns the original lead (idempotent) — cost if wrong: none.
- Task 20: Ruling: Telegram settings are optional (empty → leads stay "pending", worker logs "not configured") because the bot does not exist yet (Q5) — the real send is NOT RUN until a token is provided — cost if wrong: none.
- Task 20: Ruling: the notification includes the preferred city as well as reference/language/country/treatment (branch routing, D-045) — legal review may drop treatment — cost if wrong: one-line change in notifications.message().
- Task 21: Ruling: 2FA is on by default and switched off only by DJANGO_ADMIN_2FA=false in the local .env (so the client's dev login keeps working); production/staging must keep it on — cost if wrong: someone sets false in production (documented in .env.example and README).
- Task 21: Ruling: SECURE_SSL_REDIRECT exempts ^api/ — the internal API is called over plain HTTP inside the Docker network — cost if wrong: none.
- Task 40: Ruling: shader/material/lighting quality is verified by rendered screenshots (posters, entrance contact sheet, scroll, mobile), not by automated tests — cost if wrong: visual regressions only caught by eye.
- Task 40: Ruling: the ≤5 s entrance rule is asserted on the GSAP timeline itself (unit, deterministic) — wall-clock e2e timing failed under CPU-rendered WebGL because GSAP lag smoothing stretches time when frames take >500 ms — cost if wrong: none (on real GPUs frames are fast).
- Task 41: Ruling: chapters alternate drawing/text instead of a sticky illustration stage — the drawings are driven by CSS view timelines (no JS, robust without JS/with reduced motion), and a sticky stage would hide two of three drawings from no-JS readers — cost if wrong: a later sticky variant.
- Task 42: Ruling: no pinning — the journey runs with native scroll (CSS view timelines) instead of a pinned GSAP stage: no scroll hijack, zero JS, and the finished state for no-JS/reduced motion/unsupported browsers — cost if wrong: add a sticky stage later.
- Task 42: Ruling: browsers without scroll-driven animations (Firefox at the time of writing) get the finished journey/panels without motion (progressive enhancement) — cost if wrong: Firefox visitors see less motion.
- Task 43: Ruling: stay length is phrased per visit («most visits take 3 to 8 days, depending on your treatment») and the online assessment never promises a remote treatment plan («the dentist confirms your treatment plan in person») — the client confirmed 3–8 days and online assessment; whether implants need a second trip is asked (Q-implant-visits) — cost if wrong: one sentence per locale.
- Task 43: Ruling: guarantee published without durations («a guarantee applies; its terms depend on the treatment») — D-062 — cost if wrong: none.
- Task 22: Ruling: the placements themselves were built in Tasks 8–15 (C-phase) with waLink(text) — this task adds the cross-placement test, which passed on first run (regression guard, not RED→GREEN); the after_form placement lands with the success panel in Task 23 — cost if wrong: none.
- Task 22: Ruling: waLink takes the translated text instead of the spec's waLink(locale, context, vars) — next-intl already resolves locale and {reference} — cost if wrong: none.
- Task 23: Ruling: E01 (UI) and E03/E04 (Server Action, draft consent) ship as one commit — the UI cannot be exercised without the action — cost if wrong: none.
- Task 23: Ruling: e2e runs against a contract mock of the lead API (D-068); the real chain browser → Server Action → Django → PostgreSQL was run once on the dev stack: reference JD-XAC89M stored with +4915112345678, de/de, draft-1, /de, utm source — cost if wrong: contract drift (mock vs Django) caught by Django's own API tests.
- Task 24: Ruling: consent_version "draft-1" and the privacy link target /privacy (drafted in Task 32) — legal review required before launch (D-062) — cost if wrong: launch blocker already listed.
- Task 26: Ruling: the audit is enforced by a unit test (tests/unit/claims.test.ts) instead of a one-off review — future edits stay inside the Claims Policy; FAQ questions (.q) may name a guarantee, answers must carry the condition — cost if wrong: a reviewer sees a false positive.
- Task 28: Ruling: deferred until after Tasks 29–32 so metadata, hreflang and the sitemap cover the real pages (no sitemap entries that 404) — cost if wrong: none.
- Task 29: Ruling: treatment copy is general dental information without durations, prices, results or equipment (Q4/Q11) — 'usually under local anaesthesia', 'a thin layer of enamel may be shaped', 'the dentist checks this in your consultation'; implants FAQ answers visits with 'depends on your plan; most visits take 3 to 8 days' — cost if wrong: a medical reviewer (Q7) edits wording.
- Task 29: Ruling: hero visual is the treatment's blueprint drawing (D-022: WebGL only on Home), drawn once on load (≈2.8 s) — cost if wrong: none.
- Task 30: Ruling: the travel FAQ reuses the six confirmed homepage answers (languages, assessment, stay, hotel/transfer, interpreter, follow-up) instead of new copy — one source of truth — cost if wrong: none.
- Task 31: Ruling: Next 16 keeps visited pages hidden in the DOM (Activity, D-069) — measured forward, reverse and back navigation: the visible route is first in the DOM, so #consultation anchors and label/for pairs resolve to it; e2e filters by visibility — cost if wrong: a Next change in DOM order would break anchors after client navigation (the e2e would catch it).
- Task 32: Ruling: About is published (client: «write it and put it up», D-062) from confirmed facts only; legal pages are drafts written from the system's actual behaviour (form fields, utm, 24 h IP throttle cache, Telegram notice without contact data, one session language cookie) with a visible draft notice and robots noindex — launch blocker until reviewed; 24-month retention is the spec's proposal — cost if wrong: legal text changes before launch.
- Task 34: Ruling: lab vitals via Playwright + CDP throttling instead of Lighthouse (no new dependency); Lighthouse/WebPageTest and field data (CrUX) need the real domain: NOT RUN — cost if wrong: lab differs from field.
- Task 33: Ruling: emulated engines/devices (Playwright Firefox, WebKit, iPhone 13, Pixel 7) stand in for the device matrix; physical devices and screen readers (VoiceOver, NVDA, TalkBack) are NOT RUN — cost if wrong: device-specific bugs found after launch.
- Task 37: Ruling: form.spec and form-resilience.spec (scripted 429/500/timeouts) run only against the contract mock; on production the form goes to the real API (throttle 10/h per IP) — cost if wrong: none (the real API path is covered by the cross-browser form test and Django's own tests).
- Task 38: Ruling: H07 deployment NOT RUN (no domain/server — client action); H08 report delivered with Gate G5 open until the four client actions are done — cost if wrong: none.

## Fixes found by tests (19)

- Task 8: Fix: buttonClass's inline-flex overrode `hidden` on the header CTA (visible on mobile) — wrapper div now carries the breakpoint; and the title tokenizer glues punctuation to its word (Persian "شما،" no longer wraps alone). Both covered by new e2e tests (RED → GREEN).
- Task 9: Fix: first studio render was grey (dark room walls reflected in the porcelain) → bright cool walls; lint caught mutation of a hook value (scene.environment) → declarative attach.
- Task 13: Fix: the improved helper caught a real WCAG failure from Task 12 — "01–05" numbers in WhyJokar used sky-400 on white (1.68:1, against D-015) → slate-500 (3.46:1, large text).
- Task 14: Fix: e2e flaked (5 failures in one run at 1.2 min) — headless Chromium renders the WebGL hero on the CPU (SwiftShader); 4 parallel workers starved it. Now 2 workers + 10 s expect timeout; two consecutive runs 41/41.
- Task 21: Fix: the deferred minor "DJANGO_ADMIN_PATH='/' mounts admin at root" is now refused at startup (also "admin"); tested.
- Task 40: Fix: inline callbacks from HeroTooth restarted the scene effect on every render — pre-existing (entrance restarted once after the first frame); with onSettled it looped every ~5 s (WCAG 2.2.2). Now useEffectEvent; test 'once settled the tooth stays at rest' RED→GREEN.
- Task 40: Fix: the larger mobile hero visual (h-64) pushed the English WhatsApp CTA below 844 px — reverted to h-56.
- Task 41: Fix: overflow-hidden on the section made it the view timeline's scroller (never scrolls) → overflow-clip; caught by the RED test.
- Task 23: Fix: action.bind(null, locale) in render sent Next 16's no-JS action render into a CPU-bound loop (reproduced with a 10-line probe) → locale as a hidden field (D-066).
- Task 23: Fix: React resets a form after an `action` submission and <select> values do not come back → the JS path validates and dispatches via startTransition(formAction) (no reset); the no-JS path keeps values via state.values → defaultValue.
- Task 23: Fix: the consultation grid's implicit track took the min-content width of long country names (form 382px on a 390px phone) → grid-cols-1 / minmax(0, …).
- Task 29: Fix: a full e2e run took 55 min with 9 timeouts while the machine was busy (contactsd, softwareupdated, other apps) — every motion spec loaded the CPU-rendered WebGL hero; now only hero-3d.spec loads it (serially, 1100×760), the others report Save-Data (tier 0) through an init script — no production change.
- Task 34: Fix: the first measurement (207 KB) counted Next's <script nomodule> legacy polyfills (38.5 KB), which modern browsers never download; the real initial JS was 168 KB — then −11.7 KB by translating the form on the server (166 KB).
- Task 34: Fix: CLS 0.139 (en) / 0.165 (fa) when web fonts arrive after first paint on a slow phone (the H1 rewraps) — test with 1.5 s font delay RED → font-display: optional GREEN (CLS 0.000).
- Task 34: Fix: Turbopack's persistent build cache kept serving the old CSS (font-display: swap) after globals.css changed — both persistent caches disabled (D-071); earlier 'stale CSS in dev' had the same cause.
- Task 34: Fix: with font-display optional a slow phone can keep the fallback font, where the German hero word 'unverwechselbares' (443 px) overflowed a 360 px screen — caught by the 360 px containment test; headings now hyphenate and the hero track is minmax(0,1fr); the test also checks heading scrollWidth (mutation: without hyphens it fails).
- Task 33: Fix: on iPhone viewports (664/568 px) the hero CTA sat below the fold (683–939 px) because the tooth came first — phones now show text and both CTAs first (all measured locales fit 664 px).
- Task 33: Fix: the hero's italic face was not preloaded; with font-display optional it fell back to Georgia italic — now preloaded (fonts 102 KB ≤ 120).
- Task 35: Fix: collectstatic could not write to the static volume (created root-owned) — the image now owns /app/staticfiles, so the volume inherits the app user.

## Deferred minors (4)

- Final: minor (deferred): Caddy routes "/<admin-path>" without the trailing slash to the frontend 404 — staff use the URL with the slash.
- Final: minor (deferred): backups are plain pg_dump files containing patient data — on the real server restrict permissions and encrypt off-site copies.
- Final: minor (deferred): font-display: optional shows the fallback fonts on a slow first visit (trade-off for CLS 0, D-071).
- Final: minor (deferred): 7 moderate npm audit findings in dev-only tooling (ESLint), not shipped.

## After the final review (client: «پروژه را تمام کن، به‌جز چهار مورد»)

- Fixed: `NEXT_PUBLIC_SITE_URL` must be an absolute http(s) origin (fail fast, unit test); admin address without the trailing slash redirects (308); backups created owner-only (umask 077); ESLint ignores test output; `@types/node` 24.
- Added: two licensed city photos (D-072) on the homepage and the International page; licence guard test.
- Added: log rotation for every production service; rollback steps in the README; 320 px reflow cases.
- Ruling: Lighthouse via `npx lighthouse` was blocked by the permission system (it downloads and runs a new package) — not worked around; the same metrics are covered by `performance.spec` and axe; PageSpeed Insights on the real domain after launch — cost if wrong: no Lighthouse score in the report.
- Ruling: doctors, patient stories and technology sections stay unbuilt until their content exists (YAGNI; Task 16 ruling stands) — cost if wrong: about one to two hours each once the content arrives.
- Note: one Firefox form-smoke failure in one of four full e2e runs under parallel load; not reproduced in three full runs and twelve isolated repeats; failure details were not captured.
