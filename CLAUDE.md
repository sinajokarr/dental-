# CLAUDE.md — working rules for JOKAR DENTAL

Start with `docs/FINAL_REVIEW_PACKAGE.md`. Every decision lives in `docs/DECISIONS.md` — check it before proposing anything new.

## Communication

- Talk to the client in Persian; keep technology names and terms in English.

## Process (client rules)

- Phase by phase: present each phase's execution plan and wait for approval before coding it.
- After every task, report: Task ID · Status · Files Changed · Implementation Summary · Tests Executed · Test Results · Known Issues · Next Task.
- Never claim a test, score, API, Telegram link or tracking works without running it. Write `NOT RUN` when something was not run.
- Record technical decisions in `docs/DECISIONS.md` and task status in `docs/TASK_TRACKER.md`.
- Commits: one per task, message starts with the task ID (`A03: …`). Never commit directly to `main`; never push without asking.

## Content rules (medical honesty)

- Never invent dentists, credentials, addresses, reviews, prices, durations, guarantees or treatment results.
- Publish only claims marked verified in `docs/PROJECT_BRIEF.md` and the Claims Policy (`docs/INTERNATIONAL_PATIENT_FUNNEL.md` §3).
- Stock images are decorative only — never presented as the clinic, its dentists or treatment results.

## Code rules

- CSS uses logical properties only (`ms-`/`me-`/`ps-`/`pe-`/`start-`/`end-`/`text-start`). Physical left/right utilities fail the RTL guard test.
- Persian text animates per word or line, never per character.
- Hero text and CTAs never wait for JS or WebGL; animate only `transform`/`opacity`; honour `prefers-reduced-motion`.
- Standard library and native platform features before new dependencies; no dependency for what a few lines can do.
- Secrets only in environment variables; never log tokens; the Django API is internal-only.
- New environment variables go into `.env.example` in the same task.
- This machine disables Node TLS checks globally: run npm/npx/playwright network commands with `env -u NODE_TLS_REJECT_UNAUTHORIZED`.
