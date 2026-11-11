# JOKAR DENTAL — Website

Premium four-language (fa · en · de · tr) dental website for JOKAR DENTAL (Antalya & Istanbul):
a Next.js frontend and a Django + PostgreSQL backend for consultation requests.

- Approved design & architecture: [docs/FINAL_REVIEW_PACKAGE.md](docs/FINAL_REVIEW_PACKAGE.md)
- Decisions: [docs/DECISIONS.md](docs/DECISIONS.md) · Tasks: [docs/TASK_TRACKER.md](docs/TASK_TRACKER.md)

## Structure

```text
frontend/        Next.js (App Router, TypeScript, Tailwind CSS)
backend/         Django + Django REST Framework
infrastructure/  Docker Compose, reverse proxy, scripts
docs/            Design & architecture documents
```

## Setup

Prerequisites: Node.js 24+, Python 3.13, Docker.

1. **Environment** — one `.env` at the repository root serves the frontend, the backend and the dev database:

   ```bash
   cp .env.example .env   # then replace every change-me value
   ```

   Real environment variables always override `.env`. A missing required variable stops the app with an error naming it.

2. **Database** — PostgreSQL 18 in Docker, on host port 5433 (localhost only):

   ```bash
   docker compose -f infrastructure/compose.dev.yml --env-file .env up -d --wait
   ```

3. **Backend**:

   ```bash
   python3 -m venv backend/.venv
   backend/.venv/bin/pip install -r backend/requirements.txt
   backend/.venv/bin/python backend/manage.py migrate
   backend/.venv/bin/python backend/manage.py createcachetable   # rate-limit cache (no Redis)
   ```

   Staff accounts: `backend/.venv/bin/python backend/manage.py createsuperuser`; roles are the groups **Clinic Admin** and **Coordinator**.
   Outside local development the admin requires two-factor sign-in (`DJANGO_ADMIN_2FA=true`): issue a one-time code with
   `manage.py addstatictoken <username>`, sign in, then add a TOTP device under *Admin › TOTP devices* and scan its QR code.
   Five failed sign-ins lock the username + IP for 30 minutes.

   Telegram lead notifications (optional until the bot exists): set `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`, check with
   `manage.py send_test_notification`; retries run with `manage.py deliver_pending_notifications` (every minute in production).

4. **Frontend**:

   ```bash
   cd frontend && npm install && npm run dev
   ```

   http://localhost:3000 redirects to `/fa`, `/en`, `/de` or `/tr` from the browser language (fallback `/en`).
   Translations live in `frontend/messages/<locale>.json`; a key missing in any locale fails the build.

## Tests

| Suite | Command | Covers |
|---|---|---|
| Frontend unit (`node:test`) | `cd frontend && npm test` | env fail-fast, translation parity, design tokens, RTL guard |
| End-to-end + accessibility (Playwright, Chromium) | `cd frontend && npm run test:e2e` | locale redirects, `lang`/`dir` per locale, axe (no serious/critical), 404 |
| Backend (Django) | `backend/.venv/bin/python backend/manage.py test` | env fail-fast, PostgreSQL 18, admin path |

First end-to-end run: `cd frontend && npx playwright install chromium`. The backend suite needs the dev database (Setup step 2).
