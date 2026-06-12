# DalanHealth — Production Deployment Guide (100% free tier)

> **Architecture rule #1: the founder's laptop never hosts anything.**
> GitHub stores the code, GitHub Actions builds it, Railway + Vercel run it,
> Atlas/Upstash/R2/Resend back it. Laptop off → product still up.

```
                    ┌────────────── GitHub (code + Actions CI/CD) ─────────────┐
                    │  push → lint → build → deploy api → deploy web → smoke   │
                    └──────────────┬───────────────────────┬──────────────────┘
                                   ▼                       ▼
   dalanhealth.com ────────►  Vercel (Vite SPA)     Railway (FastAPI)  ◄──── api.dalanhealth.com
   www / tv / admin                 │                       │
                                    │              ┌────────┼─────────┬──────────┐
                                    ▼              ▼        ▼         ▼          ▼
                               browsers        Neon      Upstash  Cloudflare  Resend
                                            PostgreSQL    Redis      R2       (email)
```

## ⚠️ Stack corrections vs. the original brief

The deployment brief assumed a different codebase. This guide is adapted to
what DalanHealth **actually is**:

| Brief said | Repo reality | What we deploy |
|---|---|---|
| Next.js frontend | **Vite + React SPA** (`web/`) | Vercel static build (`framework: vite`), SPA rewrites in `vercel.json` |
| Node/Express + Socket.IO backend | **FastAPI + native WebSocket** (`backend/`) | Railway Dockerfile deploy; WS works out of the box, no Socket.IO adapter needed |
| Neon PostgreSQL + Prisma | FastAPI + SQLAlchemy 2.0 async | **Neon PostgreSQL** ✅ (data layer rewritten from the original MongoDB to SQLAlchemy + asyncpg; schema in `backend/app/models/orm.py`, no Prisma — that's a Node tool) |
| `NEXT_PUBLIC_*` env vars | Vite | `VITE_*` env vars |

Everything else (Vercel, Railway, Upstash, R2, Resend, GitHub Actions,
Cloudflare DNS) applies as written.

---

## 1. Vercel — frontend

1. Push the repo to GitHub (private is fine).
2. [vercel.com](https://vercel.com) → **Add New → Project** → import the repo.
3. **Root Directory:** `web` ← important (monorepo).
4. Framework preset: **Vite** (auto-detected; `web/vercel.json` pins it).
5. Environment variables (Production):
   | Name | Value |
   |---|---|
   | `VITE_API_BASE_URL` | `https://api.dalanhealth.com/api/v1` |
   | `VITE_WS_URL` | `wss://api.dalanhealth.com/ws` |
   | `VITE_APP_URL` | `https://dalanhealth.com` |
6. Deploy once from the dashboard to verify, then let GitHub Actions own it.
7. **Domains** (Project → Settings → Domains): add
   `dalanhealth.com` (primary), `www.dalanhealth.com`, `tv.dalanhealth.com`,
   `admin.dalanhealth.com`, `dalanhealth.in`, `www.dalanhealth.in`.
   - Set `dalanhealth.in` → **Redirect to** `dalanhealth.com` (308) in the
     domain's settings. `www→apex` and the `tv./admin.` entry redirects are
     already handled by `web/vercel.json`.
8. SSL: automatic (Let's Encrypt) once DNS points at Vercel — nothing to do.
9. Preview deployments: every PR gets a preview URL automatically.

PWA note: the current app has no service worker/manifest yet. When wanted,
add `vite-plugin-pwa` — one plugin entry in `vite.config.ts`; Vercel needs no
extra config.

For CI deploys, link once locally to capture IDs for GitHub secrets:
```bash
cd web && npx vercel link    # creates .vercel/project.json → orgId, projectId
```

## 2. Railway — backend API

1. [railway.app](https://railway.app) → **New Project → Deploy from GitHub repo**.
2. **Service → Settings → Root Directory:** `backend`. Railway reads
   `backend/railway.json` → builds the **Dockerfile**, probes **`/health`**.
3. Variables (Service → Variables) — copy names from `backend/.env.example`:
   `APP_ENV=production`, `DATABASE_URL` (Neon pooled string, §3),
   `JWT_SECRET` (`openssl rand -hex 32`), `CORS_ORIGINS=https://dalanhealth.com,https://www.dalanhealth.com,https://tv.dalanhealth.com,https://admin.dalanhealth.com`,
   `REDIS_URL`, `R2_ACCOUNT_ID/ACCESS_KEY/SECRET_KEY`, `RESEND_API_KEY`,
   `CASHFREE_CLIENT_ID/SECRET_KEY`.
4. **Custom domain:** Service → Settings → Networking → Custom Domain →
   `api.dalanhealth.com` → Railway shows a CNAME target → add it in
   Cloudflare (see `DNS.md`). HTTPS is automatic.
5. Dev environment (optional): Railway → Environments → New → `development`,
   pointed at the Neon `dev` branch's connection string.
6. Generate a **project token** (Project → Settings → Tokens) → GitHub secret
   `RAILWAY_TOKEN`; set `RAILWAY_SERVICE` to the service name.

WebSocket: FastAPI's `/ws` works over Railway HTTPS/WSS natively — no
adapter, no sticky sessions needed at one replica.

## 3. Neon — PostgreSQL database

1. [neon.tech](https://neon.tech) → sign up → **Create project**:
   - Name: `dalanhealth`
   - Postgres version: 16 (default)
   - Region: **AWS ap-southeast-1 (Singapore)** — Neon has no Mumbai region;
     Singapore is the closest (~60 ms from India, fine for an API).
2. The project comes with a default database (`neondb`) and role. Optionally
   rename the database to `dalanhealth` (Databases → New database).
3. **Connection string:** dashboard → Connect → select **Pooled connection**
   (the host contains `-pooler`) → copy. It looks like:
   ```
   postgresql://neondb_owner:npg_xxxx@ep-xxxx-pooler.ap-southeast-1.aws.neon.tech/dalanhealth?sslmode=require
   ```
   **This is `DATABASE_URL`** → paste into Railway. The backend accepts the
   `postgresql://` spelling and routes it to asyncpg automatically; the
   PgBouncer-incompatible prepared-statement cache is already disabled in
   `app/database.py`.
4. **Environments via branching** (Neon's killer feature): Branches → New
   branch `dev` (and `test` / `uat` when needed) — each branch is an
   instant copy-on-write copy of production with its own connection string.
   Point Railway's development environment at the `dev` branch URL.
5. **Backups:** the free plan keeps **point-in-time restore history**
   (rewind any branch). For belt-and-braces, schedule a weekly `pg_dump` →
   R2 `backups` bucket via GitHub Actions cron when real data lands.
6. **Schema:** tables are created automatically at boot
   (`Base.metadata.create_all` in `app/database.py`); definitions live in
   `backend/app/models/orm.py`. When the schema starts evolving with real
   production data, add Alembic migrations and drop create_all.
7. Free-tier note: Neon autosuspends compute after ~5 min idle; the first
   request after a sleep takes ~1 s extra to wake. Fine for launch.

## 4. Upstash — Redis

1. [upstash.com](https://upstash.com) → **Create Database** → region
   ap-south-1, TLS on (default).
2. Copy the **`rediss://…`** connection string → Railway `REDIS_URL`.
3. Verify: `https://api.dalanhealth.com/health/redis` → `{"status":"ok"}`.

Use today: distributed rate limiting (swap the in-memory limiter in
`app/middleware.py` per its docstring) and queue-event fan-out when the API
scales past one replica. The REST API (`UPSTASH_REDIS_REST_URL/TOKEN`) is
also available for edge/serverless callers.

## 5. Cloudflare R2 — object storage

1. Cloudflare dashboard → **R2** (free: 10 GB storage, no egress fees).
2. Create these buckets (names must match `app/services/storage.py`):
   `clinic-logos`, `doctor-profiles`, `patient-profiles`, `prescriptions`,
   `reports`, `exports`, `invoices`, `backups`.
3. Leave every bucket **private** (no public access, no custom domain).
   All browser traffic goes through **presigned URLs** minted by the backend
   (15-min expiry, content-type allow-lists, per-bucket size caps — see
   `backend/app/services/storage.py`).
4. R2 → **Manage R2 API Tokens** → Create token (Object Read & Write) →
   copy Account ID, Access Key ID, Secret → Railway `R2_ACCOUNT_ID`,
   `R2_ACCESS_KEY`, `R2_SECRET_KEY`.
5. Verify: `/health/storage` → `{"status":"ok"}`.

## 6. Resend — email

1. [resend.com](https://resend.com) → sign up (free: 100 emails/day).
2. **Domains → Add Domain** → `dalanhealth.com` → Resend lists 3–4 DNS
   records (SPF TXT, DKIM CNAMEs/TXT, optional DMARC) → add them in
   Cloudflare (see `DNS.md`) → wait for **Verified**.
3. **API Keys → Create** → Railway `RESEND_API_KEY`.
4. Sender is `DalanHealth <info@dalanhealth.com>` (`EMAIL_FROM`).
5. Templates live in `backend/app/services/email.py`: OTP, welcome, invoice,
   password reset, token confirmation, queue alert, support notification —
   call them from the API handlers (e.g. `await send_otp(email, code)`).
6. Verify: `/health/email` → `{"status":"ok"}`.

## 7. Monitoring — Sentry + Better Stack

**Sentry** (free tier):
- Frontend: `npm i @sentry/react` in `web/`, init in `src/main.tsx` with
  `import.meta.env.VITE_SENTRY_DSN` (skip init when DSN is empty so local
  dev stays clean).
- Backend: `pip install sentry-sdk[fastapi]`, then in `main.py`:
  `sentry_sdk.init(dsn=os.environ.get("SENTRY_DSN", ""), traces_sample_rate=0.1)`
  before creating the app. Captures unhandled exceptions, slow transactions,
  API failures.

**Better Stack** (free uptime monitoring):
- Add monitors: `https://api.dalanhealth.com/health`, `/health/database`,
  `/health/redis`, `/health/storage`, `/health/email`,
  `https://dalanhealth.com` — 1–3 min interval, alert to
  `info@dalanhealth.com`. The sub-checks return **503** when degraded, so
  alerts name the failing dependency directly.

## 8. Security — what's implemented

| Layer | Where |
|---|---|
| HTTPS only | Vercel + Railway terminate TLS; HSTS sent by both (`vercel.json`, `SecurityHeadersMiddleware`) |
| Secure headers | `web/vercel.json` (browser side) + `backend/app/middleware.py` (API side) — nosniff, frame-deny, referrer policy, permissions policy |
| CORS | Exact-origin allow-list from `CORS_ORIGINS` — no wildcards in production |
| Rate limiting | Per-IP fixed window (`RATE_LIMIT_PER_MINUTE`, default 120). Upgrade path to Upstash documented in the middleware |
| Secrets | Only in Railway/Vercel/GitHub secret stores. `.env` is git-ignored; `.env.example` carries names only |
| Signed URLs | All R2 access presigned, 15-min TTL, content-type + size restrictions |
| JWT | `openssl rand -hex 32` secrets, HS256, rotate by redeploying with a new value |
