# DalanHealth — Migration to Microsoft Azure

Move the whole platform onto Azure, with **Azure SQL Database (SQL Server)** as
the main database. This guide is written against what DalanHealth *actually is*
(FastAPI + Vite + React Native), not the assumptions in the original cost
sheet — see the corrections table below before you provision anything.

```
              ┌──────────── GitHub (code + Actions) ────────────┐
              │  azure-deploy.yml (manual) → SWA + Container Apps │
              └───────────────┬──────────────────┬──────────────┘
                              ▼                  ▼
 dalanhealth.com ──► Azure Static Web Apps   Azure Container Apps ──► api.dalanhealth.com
                            │                        │
                            │        ┌───────────────┼───────────┬────────────┐
                            ▼        ▼               ▼           ▼            ▼
                        browsers  Azure SQL      Azure Cache  Cloudflare   Resend
                                  Database        for Redis     R2 *      (email) *
                                 (SQL Server)                 * keep as-is, optional
```

## ⚠️ Corrections vs. the cost sheet — read first

| Sheet said | Repo reality | What we actually deploy |
|---|---|---|
| Frontend = **Next.js** | **Vite + React** SPA (`web/`) | Azure Static Web Apps, `web/public/staticwebapp.config.json` for SPA routing |
| Backend = **.NET API** | **Python FastAPI** + native WebSocket (`backend/`) | Azure Container Apps from `backend/Dockerfile.azure` — no rewrite |
| DB = "Azure SQL" (unspecified) | Currently PostgreSQL, schema is **dialect-agnostic** | **Azure SQL Database** ✅ — driver swap only, no model rewrite |
| Email = M365 Business Basic | App sends via **Resend** REST API | Keep Resend (M365 = mailboxes, not an app-send API) or use Azure Communication Services Email |
| (missing) Redis | Upstash Redis in use | Azure Cache for Redis **or** keep Upstash |
| Blob Storage for files | Cloudflare **R2** via boto3 (S3 API) | Keep R2 (Blob has no S3 API) **or** rewrite `storage.py` to `azure-storage-blob` |
| (missing) Mobile | **Expo / React Native** (`mobile/`) | Not hosted on Azure; ships via EAS to the app stores, only its API URL points at Azure |

### Why SQL Server is a small change here

`backend/app/models/orm.py` uses only portable SQLAlchemy types
(`String/Text/Integer/Float/Boolean/DateTime/JSON`) and **UUID-string** primary
keys — no `JSONB`, `ARRAY`, native `UUID`, `ON CONFLICT`, or `::` casts. So the
same ORM runs on SQL Server unchanged. The only dialect-aware code is the
connection setup and the tiny raw-SQL forward migration in
`backend/app/database.py`, both already handled.

Two behavioural notes:
- **Collation:** Azure SQL is case-*insensitive* by default; Postgres is
  case-sensitive. Email/mobile lookups become case-insensitive.
- **Data migration is cross-engine:** no `pg_dump` → SQL Server restore. Use
  the ORM row-copy script in step 4 (or re-seed if you have little real data).

---

## 0. Prerequisites

```bash
az login
az extension add --name containerapp --upgrade
RG=dalanhealth-rg
LOC=centralindia            # or your nearest region
az group create -n $RG -l $LOC
```

## 1. Azure SQL Database (SQL Server)

```bash
SQL_SERVER=dalanhealth-sql            # becomes dalanhealth-sql.database.windows.net
SQL_DB=dalanhealth
SQL_ADMIN=dalanadmin
SQL_PASS='<strong-password>'

az sql server create -g $RG -n $SQL_SERVER -l $LOC \
  --admin-user $SQL_ADMIN --admin-password "$SQL_PASS"

# Serverless General Purpose autoscaler — cheap when idle, scales on load.
az sql db create -g $RG -s $SQL_SERVER -n $SQL_DB \
  --edition GeneralPurpose --compute-model Serverless \
  --family Gen5 --capacity 1 --auto-pause-delay 60

# Allow Azure services (Container Apps) to reach the server.
az sql server firewall-rule create -g $RG -s $SQL_SERVER \
  -n AllowAzure --start-ip-address 0.0.0.0 --end-ip-address 0.0.0.0

# For the one-off data-migration run from your machine, also add your IP:
az sql server firewall-rule create -g $RG -s $SQL_SERVER \
  -n MyIP --start-ip-address <your.ip> --end-ip-address <your.ip>
```

**Connection string** (this becomes `DATABASE_URL` on the Container App):

```
mssql+aioodbc://dalanadmin:<pwd>@dalanhealth-sql.database.windows.net:1433/dalanhealth?driver=ODBC+Driver+18+for+SQL+Server&Encrypt=yes&TrustServerCertificate=no
```

On first backend boot, `Base.metadata.create_all` builds the full schema on the
empty Azure SQL database automatically.

## 2. Container Registry + Container Apps (backend)

```bash
ACR=dalanhealthacr
az acr create -g $RG -n $ACR --sku Basic
az containerapp env create -g $RG -n dalanhealth-env -l $LOC

# First deploy (CI does subsequent ones via azure-deploy.yml).
az containerapp create -g $RG -n dalanhealth-api \
  --environment dalanhealth-env \
  --registry-server $ACR.azurecr.io \
  --ingress external --target-port 8000 \
  --min-replicas 1 --max-replicas 3 \
  --image mcr.microsoft.com/azuredocs/containerapps-helloworld:latest   # placeholder; CI pushes the real image
```

WebSockets (`app/websocket/queue_ws.py`) work on Container Apps ingress with no
extra config.

**Set backend env vars** (never commit these):

```bash
az containerapp update -g $RG -n dalanhealth-api --set-env-vars \
  APP_ENV=production \
  DATABASE_URL='mssql+aioodbc://…' \
  JWT_SECRET='<random-64-char>' \
  REDIS_URL='<azure-cache-or-upstash-rediss-url>' \
  R2_ACCOUNT_ID='…' R2_ACCESS_KEY='…' R2_SECRET_KEY='…' \
  RESEND_API_KEY='…' EMAIL_FROM='DalanHealth <info@dalanhealth.com>' \
  CASHFREE_CLIENT_ID='…' CASHFREE_SECRET_KEY='…' \
  CORS_ORIGINS='https://dalanhealth.com,https://www.dalanhealth.com'
```

## 3. Static Web App (frontend)

```bash
az staticwebapp create -g $RG -n dalanhealth-web -l $LOC
az staticwebapp secrets list -g $RG -n dalanhealth-web   # → deployment token
```

`web/public/staticwebapp.config.json` handles SPA fallback and, crucially,
**excludes `/assets/*`** from the fallback so a stale hashed chunk after a
redeploy returns a real 404 (which the client's chunk-recovery code turns into
a one-time refresh) instead of an HTML page. Set `VITE_API_BASE_URL` to the
Container App URL at build time.

## 4. Data migration (PostgreSQL → Azure SQL)

Cross-engine, so copy rows through the shared ORM. Point the source and target
URLs at the two databases and stream each table:

```python
# scripts/migrate_pg_to_mssql.py  (run once, from a machine with ODBC Driver 18)
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy import select
from app.database import Base
from app.models import orm  # registers every table

SRC = "postgresql+asyncpg://…neon…"
DST = "mssql+aioodbc://…azure…?driver=ODBC+Driver+18+for+SQL+Server&Encrypt=yes"

async def main():
    src = async_sessionmaker(create_async_engine(SRC))
    dst_engine = create_async_engine(DST)
    async with dst_engine.begin() as c:
        await c.run_sync(Base.metadata.create_all)
    dst = async_sessionmaker(dst_engine)
    for table in Base.metadata.sorted_tables:           # FK-safe order
        model = next(m for m in orm.Base.registry.mappers if m.local_table is table).class_
        async with src() as s:
            rows = (await s.execute(select(model))).scalars().all()
        async with dst() as d:
            for r in rows:
                d.add(model(**{c.name: getattr(r, c.name) for c in table.columns}))
            await d.commit()
        print(f"{table.name}: {len(rows)} rows")

asyncio.run(main())
```

If the product still has only demo/seed data, skip this and just let
`create_all` build a fresh schema.

## 5. GitHub Actions

Add these repository secrets, then run **Actions → Deploy to Azure → Run
workflow** (`.github/workflows/azure-deploy.yml`):

| Secret | Where from |
|---|---|
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | `az staticwebapp secrets list` |
| `AZURE_CREDENTIALS` | `az ad sp create-for-rbac --sdk-auth --role contributor --scopes /subscriptions/<id>/resourceGroups/dalanhealth-rg` |
| `AZURE_RESOURCE_GROUP` | `dalanhealth-rg` |
| `AZURE_ACR_NAME` | `dalanhealthacr` |
| `AZURE_CONTAINERAPP_NAME` | `dalanhealth-api` |
| `VITE_API_BASE_URL` | `https://<container-app>.<region>.azurecontainerapps.io` |

## 6. DNS cutover

1. Add custom domain to the Static Web App → CNAME `dalanhealth.com` / `www`.
2. Add custom domain to the Container App → CNAME `api.dalanhealth.com`.
3. Verify `GET /health` and `GET /health/database` (expect `"database":"mssql"`).
4. Once stable, retire the GitHub Pages + Railway workflows.

## Optional extras

- **Azure Cache for Redis:** `az redis create … --sku Basic --vm-size c0`, set `REDIS_URL`. (Upstash free tier may be cheaper — keeping it is fine.)
- **Application Insights:** add `azure-monitor-opentelemetry` to `requirements-azure.txt` and `configure_azure_monitor()` at startup.
- **Azure Blob instead of R2:** rewrite `backend/app/services/storage.py` to `azure-storage-blob` (presigned URLs → SAS tokens). Only if you specifically want to drop Cloudflare.
- **Backups:** Azure SQL has automated point-in-time backups built in — no separate service needed.

## Realistic monthly cost (Azure infra only, ₹)

| Service | Est. |
|---|---|
| Azure SQL (Serverless GP, 1 vCore, auto-pause) | 1,500 – 4,000 |
| Container Apps (1 min replica) | 1,000 – 2,500 |
| Static Web Apps (Standard) | 0 – 800 |
| Azure Cache for Redis (Basic C0) *if used* | 1,200 – 1,500 |
| Application Insights | 0 – 500 |
| **Azure subtotal** | **~4,000 – 8,000** |

Cashfree, MSG91/Fast2SMS, WhatsApp API, Google Maps, domain and Resend are
third-party pass-throughs and are unchanged by the Azure move.
