"""Health-check endpoints for uptime monitors, Railway healthchecks and the
go-live smoke tests.

GET /health           — liveness (always 200 while the process runs)
GET /health/database  — PostgreSQL ping (SELECT 1)
GET /health/redis     — Upstash Redis ping        (503 "not_configured" if unset)
GET /health/storage   — Cloudflare R2 reachability (503 "not_configured" if unset)
GET /health/email     — Resend API key validity    (503 "not_configured" if unset)

Sub-checks return 200 {"status": "ok"} or 503 {"status": "...", "detail": ...}
so Better Stack / UptimeRobot can alert on individual dependencies.
"""

import time

import httpx
from fastapi import APIRouter
from fastapi.responses import JSONResponse

from app.config import settings
from app.database import db

router = APIRouter(prefix="/health", tags=["health"])

_started_at = time.time()


def _ok(extra: dict | None = None) -> JSONResponse:
    return JSONResponse({"status": "ok", **(extra or {})})


def _fail(status: str, detail: str = "", code: int = 503) -> JSONResponse:
    body: dict = {"status": status}
    if detail:
        body["detail"] = detail
    return JSONResponse(body, status_code=code)


@router.get("")
async def health():
    """Liveness — used by Railway's healthcheck and the CI smoke test."""
    return _ok({
        "service": settings.app_name,
        "env": settings.app_env,
        "uptime_seconds": round(time.time() - _started_at),
    })


@router.get("/database")
async def health_database():
    if await db.ping():
        # Report the live engine (mssql on Azure SQL, postgresql on Neon, sqlite locally).
        engine = db.engine.dialect.name if db.engine is not None else "unknown"
        return _ok({"database": engine})
    return _fail("unreachable", "Database ping failed (SELECT 1)")


@router.get("/redis")
async def health_redis():
    if not settings.redis_url:
        return _fail("not_configured", "REDIS_URL is not set")
    try:
        # redis-py is an optional dependency — only needed once Redis is used.
        import redis.asyncio as aioredis  # type: ignore[import-not-found]

        client = aioredis.from_url(settings.redis_url, socket_connect_timeout=5)
        pong = await client.ping()
        await client.aclose()
        return _ok() if pong else _fail("unreachable", "PING returned falsy")
    except ModuleNotFoundError:
        return _fail("not_configured", "redis package not installed (pip install redis)")
    except Exception as exc:  # noqa: BLE001 — health checks report, never raise
        return _fail("unreachable", str(exc))


@router.get("/storage")
async def health_storage():
    if not (settings.r2_account_id and settings.r2_access_key and settings.r2_secret_key):
        return _fail("not_configured", "R2_ACCOUNT_ID / R2_ACCESS_KEY / R2_SECRET_KEY not set")
    try:
        from app.services.storage import check_storage

        ok, detail = check_storage()
        return _ok() if ok else _fail("unreachable", detail)
    except ModuleNotFoundError:
        return _fail("not_configured", "boto3 not installed (pip install boto3)")
    except Exception as exc:  # noqa: BLE001
        return _fail("unreachable", str(exc))


@router.get("/email")
async def health_email():
    if not settings.resend_api_key:
        return _fail("not_configured", "RESEND_API_KEY is not set")
    try:
        # Listing domains is a free, side-effect-less way to validate the key.
        async with httpx.AsyncClient(timeout=8) as client:
            r = await client.get(
                "https://api.resend.com/domains",
                headers={"Authorization": f"Bearer {settings.resend_api_key}"},
            )
        if r.status_code == 200:
            return _ok()
        return _fail("unreachable", f"Resend responded {r.status_code}")
    except Exception as exc:  # noqa: BLE001
        return _fail("unreachable", str(exc))
