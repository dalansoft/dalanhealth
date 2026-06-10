from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import db
from app.api.v1 import auth as auth_router
from app.api.v1 import clinics as clinics_router
from app.api.v1 import patients as patients_router
from app.api.v1 import queue as queue_router
from app.api.v1 import billing as billing_router
from app.api.v1 import prescription as prescription_router
from app.api.v1 import wallet as wallet_router
from app.api.v1 import notifications as notifications_router
from app.api.v1 import cashback as cashback_router
from app.api.v1 import health as health_router
from app.middleware import RateLimitMiddleware, SecurityHeadersMiddleware
from app.websocket.queue_ws import router as ws_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await db.connect()
    yield
    await db.disconnect()


app = FastAPI(
    title=f"{settings.app_name} API",
    version="0.1.0",
    description="DalanHealth — Hybrid clinic + patient queue platform. By Dalansoft Technologies Pvt Ltd.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RateLimitMiddleware)


@app.get("/")
async def root():
    return {
        "name": settings.app_name,
        "version": "0.1.0",
        "status": "ok",
        "docs": "/docs",
    }


# Health checks — /health, /health/database, /health/redis, /health/storage,
# /health/email (see app/api/v1/health.py). Railway's healthcheck hits /health.
app.include_router(health_router.router)

# v1 API
prefix = "/api/v1"
app.include_router(auth_router.router, prefix=f"{prefix}/auth", tags=["auth"])
app.include_router(clinics_router.router, prefix=f"{prefix}/clinics", tags=["clinics"])
app.include_router(patients_router.router, prefix=f"{prefix}/patients", tags=["patients"])
app.include_router(queue_router.router, prefix=f"{prefix}/queue", tags=["queue"])
app.include_router(billing_router.router, prefix=f"{prefix}/billing", tags=["billing"])
app.include_router(prescription_router.router, prefix=f"{prefix}/prescriptions", tags=["prescriptions"])
app.include_router(wallet_router.router, prefix=f"{prefix}/wallet", tags=["wallet"])
app.include_router(notifications_router.router, prefix=f"{prefix}/notifications", tags=["notifications"])
app.include_router(cashback_router.router, prefix=f"{prefix}/cashback", tags=["cashback"])

# WebSocket
app.include_router(ws_router)
