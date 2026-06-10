"""Production middleware: security headers + a light per-IP rate limiter.

The rate limiter is in-memory (per instance). On Railway's free tier the app
runs as a single instance, so this is sufficient; if you scale out, swap the
counter for Upstash Redis (INCR + EXPIRE on `rl:{ip}:{minute}`) so all
instances share one budget.
"""

import time
from collections import defaultdict

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

from app.config import settings


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Standard hardening headers on every response (Helmet-equivalent)."""

    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)
        response.headers.setdefault("X-Content-Type-Options", "nosniff")
        response.headers.setdefault("X-Frame-Options", "DENY")
        response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
        response.headers.setdefault("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
        if settings.app_env == "production":
            response.headers.setdefault(
                "Strict-Transport-Security", "max-age=63072000; includeSubDomains"
            )
        return response


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Fixed-window per-IP limiter. Health checks and docs are exempt."""

    EXEMPT_PREFIXES = ("/health", "/docs", "/openapi.json", "/redoc")

    def __init__(self, app) -> None:
        super().__init__(app)
        self._hits: dict[str, int] = defaultdict(int)
        self._window_start = int(time.time() // 60)

    async def dispatch(self, request: Request, call_next) -> Response:
        if request.url.path.startswith(self.EXEMPT_PREFIXES) or request.url.path == "/":
            return await call_next(request)

        window = int(time.time() // 60)
        if window != self._window_start:
            self._hits.clear()
            self._window_start = window

        # Railway / Vercel sit behind proxies — honour X-Forwarded-For.
        forwarded = request.headers.get("x-forwarded-for", "")
        ip = forwarded.split(",")[0].strip() if forwarded else (request.client.host if request.client else "unknown")

        self._hits[ip] += 1
        if self._hits[ip] > settings.rate_limit_per_minute:
            return JSONResponse(
                {"detail": "Too many requests — slow down."},
                status_code=429,
                headers={"Retry-After": "60"},
            )
        return await call_next(request)
