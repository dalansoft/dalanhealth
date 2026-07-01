"""Database layer — SQLAlchemy 2.0 async, engine-agnostic.

Production:  Azure SQL Database → DATABASE_URL=mssql+aioodbc://…?driver=ODBC+Driver+18+for+SQL+Server&Encrypt=yes
             (PostgreSQL also supported → postgresql+asyncpg://… for Neon/Railway)
Local dev:   SQLite (zero setup) → default sqlite+aiosqlite:///./dalanhealth.db

The ORM in app/models/orm.py uses only portable column types (String, Text,
Integer, Float, Boolean, DateTime, JSON) and UUID-string primary keys, so the
same schema runs unchanged on SQL Server, PostgreSQL and SQLite. Only the
driver-specific connect options and the tiny raw-SQL migration below are
dialect-aware.

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

    SQL Server (`mssql+aioodbc://…`) and SQLite URLs are passed through
    untouched — their TLS/driver options travel in the ODBC/DSN query string.

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
        await self._ensure_columns()

    async def _ensure_columns(self) -> None:
        """Tiny forward-only migration: create_all never ALTERs existing
        tables, so columns added after first deploy are applied here. Replace
        with Alembic once the schema churns with real data.

        Dialect-aware because the column DDL differs per engine (SQL Server
        omits the COLUMN keyword and spells the types FLOAT / BIT). On a fresh
        database create_all already made these columns, so this is a no-op
        there; it only matters for tables that predate the columns."""
        assert self.engine is not None
        dialect = self.engine.dialect.name  # 'mssql' | 'postgresql' | 'sqlite'

        # (column, postgres/sqlite type, sql-server type, default clause)
        columns = [
            ("sort_order", "DOUBLE PRECISION", "FLOAT", ""),
            ("was_skipped", "BOOLEAN", "BIT", " DEFAULT 0"),
        ]

        for name, pg_type, mssql_type, default in columns:
            if dialect == "mssql":
                # SQL Server: guard on sys.columns; ADD (no COLUMN keyword).
                stmt = (
                    "IF NOT EXISTS (SELECT 1 FROM sys.columns "
                    "WHERE object_id = OBJECT_ID('queue_entries') "
                    f"AND name = '{name}') "
                    f"ALTER TABLE queue_entries ADD {name} {mssql_type}{default}"
                )
            else:
                # Postgres supports IF NOT EXISTS; SQLite needs the plain form,
                # which errors harmlessly if the column already exists.
                stmt = f"ALTER TABLE queue_entries ADD COLUMN IF NOT EXISTS {name} {pg_type}{default}"
            try:
                async with self.engine.begin() as conn:
                    await conn.execute(text(stmt))
            except Exception:
                # SQLite has no IF NOT EXISTS for ADD COLUMN — retry without it;
                # if that also fails the column already exists. Never fatal.
                try:
                    async with self.engine.begin() as conn:
                        await conn.execute(text(stmt.replace(" IF NOT EXISTS", "")))
                except Exception:
                    pass

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
