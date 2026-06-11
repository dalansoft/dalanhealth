"""Database layer — PostgreSQL via SQLAlchemy 2.0 async.

Production:  Neon PostgreSQL  → DATABASE_URL=postgresql+asyncpg://…
Local dev:   SQLite (zero setup) → default sqlite+aiosqlite:///./dalanhealth.db

Tables are created automatically at boot (`Base.metadata.create_all`) — fine
for a greenfield schema. When the schema starts evolving with real data in
production, introduce Alembic migrations and remove create_all.
"""

from __future__ import annotations

from contextlib import asynccontextmanager
from typing import AsyncIterator

from sqlalchemy import text
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.config import settings


class Base(DeclarativeBase):
    pass


def _normalize_url(url: str) -> tuple[str, bool]:
    """Make any pasted Postgres URL work with asyncpg.

    - `postgres://` / `postgresql://` → `postgresql+asyncpg://`
    - Strips libpq-only query params (`sslmode`, `channel_binding`) that Neon
      includes by default — asyncpg rejects them as unknown kwargs and the
      app would crash at boot (seen as a Railway "Healthcheck failure").

    Returns (url, ssl_required).
    """
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+asyncpg://", 1)
    elif url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
    if not url.startswith("postgresql+asyncpg://"):
        return url, False

    from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

    parts = urlsplit(url)
    params = dict(parse_qsl(parts.query))
    sslmode = params.pop("sslmode", "require")  # Neon always wants TLS
    params.pop("channel_binding", None)
    cleaned = urlunsplit(parts._replace(query=urlencode(params)))
    return cleaned, sslmode != "disable"


class Database:
    def __init__(self) -> None:
        self.engine: AsyncEngine | None = None
        self.session_factory: async_sessionmaker[AsyncSession] | None = None

    async def connect(self) -> None:
        url, ssl_required = _normalize_url(settings.database_url)
        connect_args: dict = {}
        if url.startswith("postgresql+asyncpg"):
            # Neon's pooled endpoints run PgBouncer (transaction mode) — disable
            # asyncpg's prepared-statement cache, it's incompatible with PgBouncer.
            connect_args["statement_cache_size"] = 0
            if ssl_required:
                connect_args["ssl"] = True
        self.engine = create_async_engine(
            url,
            echo=False,
            pool_pre_ping=True,
            connect_args=connect_args,
        )
        self.session_factory = async_sessionmaker(self.engine, expire_on_commit=False)

        # Import models so create_all sees every table.
        from app.models import orm  # noqa: F401

        async with self.engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

    async def disconnect(self) -> None:
        if self.engine:
            await self.engine.dispose()

    async def ping(self) -> bool:
        try:
            if self.engine is None:
                return False
            async with self.engine.connect() as conn:
                await conn.execute(text("SELECT 1"))
            return True
        except Exception:
            return False


db = Database()


async def get_session() -> AsyncIterator[AsyncSession]:
    """FastAPI dependency — one session per request."""
    if db.session_factory is None:
        raise RuntimeError("Database not connected")
    async with db.session_factory() as session:
        yield session


@asynccontextmanager
async def session_scope() -> AsyncIterator[AsyncSession]:
    """For services that run outside a request dependency."""
    if db.session_factory is None:
        raise RuntimeError("Database not connected")
    async with db.session_factory() as session:
        yield session
