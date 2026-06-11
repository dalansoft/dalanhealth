"""SQLAlchemy ORM tables — the single schema definition for PostgreSQL.

UUID-string primary keys keep ids portable across Postgres and the SQLite
dev database, and line up with the string ids the frontend already expects.
JSON columns hold the few list-shaped fields (invoice items, medicines,
clinic timings) that don't warrant their own tables yet.
"""

from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy import JSON, Boolean, DateTime, Float, Index, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


def _uuid() -> str:
    return str(uuid4())


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class _Pk:
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class UserRow(_Pk, Base):
    __tablename__ = "users"

    name: Mapped[str] = mapped_column(String(120))
    role: Mapped[str] = mapped_column(String(24), index=True)
    mobile: Mapped[str | None] = mapped_column(String(20), index=True)
    email: Mapped[str | None] = mapped_column(String(254), index=True)
    password_hash: Mapped[str | None] = mapped_column(String(128))
    clinic_id: Mapped[str | None] = mapped_column(String(36), index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_demo: Mapped[bool] = mapped_column(Boolean, default=False)
    avatar_url: Mapped[str | None] = mapped_column(Text)
    cashback_balance: Mapped[float] = mapped_column(Float, default=0.0)


class ClinicRow(_Pk, Base):
    __tablename__ = "clinics"

    name: Mapped[str] = mapped_column(String(160), index=True)
    doctor_name: Mapped[str] = mapped_column(String(120))
    specialization: Mapped[str | None] = mapped_column(String(120))
    city: Mapped[str | None] = mapped_column(String(80))
    state: Mapped[str | None] = mapped_column(String(80))
    address: Mapped[str | None] = mapped_column(Text)
    mobile: Mapped[str] = mapped_column(String(20))
    email: Mapped[str | None] = mapped_column(String(254))
    plan: Mapped[str] = mapped_column(String(16), default="starter")
    wallet_balance: Mapped[float] = mapped_column(Float, default=0.0)
    consultation_fee: Mapped[int] = mapped_column(Integer, default=300)
    booking_fee: Mapped[int] = mapped_column(Integer, default=1)
    timings: Mapped[list] = mapped_column(JSON, default=list)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class PatientRow(_Pk, Base):
    __tablename__ = "patients"
    __table_args__ = (Index("ix_patients_clinic_mobile", "clinic_id", "mobile"),)

    clinic_id: Mapped[str] = mapped_column(String(36))
    user_id: Mapped[str | None] = mapped_column(String(36))
    name: Mapped[str] = mapped_column(String(120))
    mobile: Mapped[str] = mapped_column(String(20))
    age: Mapped[int | None] = mapped_column(Integer)
    gender: Mapped[str | None] = mapped_column(String(12))
    address: Mapped[str | None] = mapped_column(Text)
    email: Mapped[str | None] = mapped_column(String(254))
    visit_count: Mapped[int] = mapped_column(Integer, default=0)
    last_visit_at: Mapped[str | None] = mapped_column(String(32))


class QueueEntryRow(_Pk, Base):
    __tablename__ = "queue_entries"
    __table_args__ = (
        Index("ix_queue_clinic_day_token", "clinic_id", "date_key", "token"),
        Index("ix_queue_clinic_day_status", "clinic_id", "date_key", "status"),
    )

    clinic_id: Mapped[str] = mapped_column(String(36))
    date_key: Mapped[str] = mapped_column(String(10))
    # Patient-visible token — assigned at booking, NEVER changed afterwards.
    # Patients track this number; skip/call-back only affect sort_order.
    token: Mapped[int] = mapped_column(Integer)
    patient_id: Mapped[str] = mapped_column(String(36))
    patient_name: Mapped[str] = mapped_column(String(120))
    patient_mobile: Mapped[str] = mapped_column(String(20))
    source: Mapped[str] = mapped_column(String(12))
    status: Mapped[str] = mapped_column(String(20), default="waiting")
    joined_at: Mapped[str | None] = mapped_column(String(8))
    # Queue-position key (defaults to token). Skip pushes it past the max so
    # the patient drops to the back with their token intact; call-back sets it
    # just after the currently-serving entry. Float so we can insert between.
    sort_order: Mapped[float | None] = mapped_column(Float)
    was_skipped: Mapped[bool] = mapped_column(Boolean, default=False)


class InvoiceRow(_Pk, Base):
    __tablename__ = "invoices"

    clinic_id: Mapped[str] = mapped_column(String(36), index=True)
    patient_id: Mapped[str | None] = mapped_column(String(36))
    patient_name: Mapped[str] = mapped_column(String(120))
    patient_mobile: Mapped[str] = mapped_column(String(20))
    invoice_no: Mapped[str] = mapped_column(String(20), index=True)
    consultation_fee: Mapped[float] = mapped_column(Float, default=0)
    medicine_fee: Mapped[float] = mapped_column(Float, default=0)
    extra_charges: Mapped[float] = mapped_column(Float, default=0)
    discount: Mapped[float] = mapped_column(Float, default=0)
    total: Mapped[float] = mapped_column(Float, default=0)
    notes: Mapped[str | None] = mapped_column(Text)
    items: Mapped[list] = mapped_column(JSON, default=list)


class PrescriptionRow(_Pk, Base):
    __tablename__ = "prescriptions"

    clinic_id: Mapped[str] = mapped_column(String(36), index=True)
    patient_id: Mapped[str | None] = mapped_column(String(36))
    patient_name: Mapped[str] = mapped_column(String(120))
    symptoms: Mapped[str | None] = mapped_column(Text)
    diagnosis: Mapped[str | None] = mapped_column(Text)
    tests: Mapped[str | None] = mapped_column(Text)
    notes: Mapped[str | None] = mapped_column(Text)
    follow_up: Mapped[str | None] = mapped_column(String(64))
    medicines: Mapped[list] = mapped_column(JSON, default=list)


class TransactionRow(_Pk, Base):
    __tablename__ = "transactions"
    __table_args__ = (Index("ix_tx_clinic_created", "clinic_id", "created_at"),)

    clinic_id: Mapped[str | None] = mapped_column(String(36))
    user_id: Mapped[str | None] = mapped_column(String(36), index=True)
    reason: Mapped[str] = mapped_column(String(32))
    amount: Mapped[float] = mapped_column(Float)
    balance_after: Mapped[float | None] = mapped_column(Float)
    note: Mapped[str | None] = mapped_column(Text)
    ref_id: Mapped[str | None] = mapped_column(String(36))


class NotificationRow(_Pk, Base):
    __tablename__ = "notifications"
    __table_args__ = (Index("ix_notif_user_created", "user_id", "created_at"),)

    user_id: Mapped[str | None] = mapped_column(String(36))
    clinic_id: Mapped[str | None] = mapped_column(String(36))
    event: Mapped[str] = mapped_column(String(32))
    channel: Mapped[str] = mapped_column(String(16))
    title: Mapped[str] = mapped_column(String(200))
    body: Mapped[str] = mapped_column(Text)
    delivered: Mapped[bool] = mapped_column(Boolean, default=False)
    error: Mapped[str | None] = mapped_column(Text)


def row_to_dict(row: Base) -> dict:
    """Serialize an ORM row to a JSON-safe dict. Datetimes become ISO strings
    here because WebSocket send_json (plain json.dumps) can't encode datetime —
    REST responses go through FastAPI's encoder either way."""
    out: dict = {}
    for c in row.__table__.columns:
        v = getattr(row, c.name)
        if isinstance(v, datetime):
            v = v.isoformat()
        out[c.name] = v
    return out
