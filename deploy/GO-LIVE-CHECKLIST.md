# DalanHealth — Production Go-Live Checklist

Work top to bottom. Every box must be ticked before announcing the URL.

## Accounts & access
- [ ] GitHub repo pushed (private), founder + CI have access
- [ ] Vercel account created, project imported with **Root Directory = `web`**
- [ ] Railway project created with **Root Directory = `backend`**
- [ ] MongoDB Atlas M0 cluster (Mumbai) created
- [ ] Upstash Redis database (ap-south-1) created
- [ ] Cloudflare account holds DNS for dalanhealth.com + dalanhealth.in
- [ ] Cloudflare R2 enabled, all 8 buckets created (`clinic-logos`, `doctor-profiles`, `patient-profiles`, `prescriptions`, `reports`, `exports`, `invoices`, `backups`)
- [ ] Resend account created, domain `dalanhealth.com` **Verified**

## Secrets (never in git)
- [ ] Railway vars set: `APP_ENV=production`, `MONGODB_URI`, `MONGODB_DB`, `JWT_SECRET` (fresh `openssl rand -hex 32`), `CORS_ORIGINS` (https origins only), `REDIS_URL`, `R2_*`, `RESEND_API_KEY`, `CASHFREE_*`
- [ ] Vercel vars set: `VITE_API_BASE_URL`, `VITE_WS_URL`, `VITE_APP_URL`
- [ ] GitHub Actions secrets set: `RAILWAY_TOKEN`, `RAILWAY_SERVICE`, `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
- [ ] Demo OTP (`OTP_DEMO_CODE`) disabled or rotated for production

## DNS & domains (see DNS.md)
- [ ] `dalanhealth.com` A → Vercel; `www`, `tv`, `admin` CNAMEs → Vercel
- [ ] `api.dalanhealth.com` CNAME → Railway target; custom domain added in Railway
- [ ] `dalanhealth.in` + `www` → Vercel, set as 308 redirect to dalanhealth.com
- [ ] Resend SPF + DKIM (+ DMARC) records added, domain shows Verified
- [ ] `https://www.dalanhealth.com` 308-redirects to apex
- [ ] `https://tv.dalanhealth.com` lands on the TV display
- [ ] SSL padlock valid on all five hosts

## Pipeline
- [ ] Push to `master` runs: lint → build → api deploy → web deploy → smoke ✅
- [ ] PR opens a Vercel preview deployment
- [ ] Smoke job passed on the latest run

## Health (all must return 200 `{"status":"ok"}`)
- [ ] `GET https://api.dalanhealth.com/health`
- [ ] `GET …/health/database`
- [ ] `GET …/health/redis`
- [ ] `GET …/health/storage`
- [ ] `GET …/health/email`

## Functional smoke (manual, 10 min)
- [ ] Landing page loads on phone + desktop, dark/light both fine
- [ ] Demo login works; clinic dashboard renders
- [ ] Add patient → token generated → appears on `/display/clinic` in a second tab
- [ ] Complete consultation → TV chimes + speaks + queue advances
- [ ] TV pairing flow works (`/tv/pair` with a code from Clinic › TV Displays)
- [ ] A test email arrives from `info@dalanhealth.com` (not in spam)

## Monitoring & ops
- [ ] Better Stack monitors on `/health*` + the frontend, alerting `info@dalanhealth.com`
- [ ] Sentry DSNs wired (frontend + backend), test error visible in dashboard
- [ ] Weekly `mongodump` → R2 `backups` workflow scheduled (or calendar reminder until data is real)

## The laptop test 🔌
- [ ] Shut the founder's laptop completely
- [ ] From a phone on mobile data: site loads, demo login works, queue updates, API `/health` returns ok
- [ ] If all green → **DalanHealth is live and laptop-independent** 🎉

## Known free-tier limits (plan, don't panic)
| Service | Limit | First upgrade trigger |
|---|---|---|
| Railway | $5 credit/mo ≈ 500 exec hours | API sleeping / credit exhausted mid-month |
| Vercel | 100 GB bandwidth/mo | Heavy TV/display traffic |
| Atlas M0 | 512 MB storage | ~50k+ visits stored |
| Upstash | 10k commands/day | Aggressive rate limiting / pub-sub |
| Resend | 100 emails/day | OTP-heavy onboarding days |
