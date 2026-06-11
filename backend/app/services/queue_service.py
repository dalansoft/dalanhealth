"""Queue engine — sequential token assignment and status transitions.

Single source of truth: backend. Clients render, never compute.

Position vs token: `token` is the patient-visible number printed on their
slip — it never changes. `sort_order` (defaults to token) decides queue
position: skip pushes it past the max so the patient drops to the back with
their token intact; call-back slots them right behind the current patient.
"""

from datetime import datetime, timezone

from sqlalchemy import func, select

from app.database import session_scope
from app.models.orm import QueueEntryRow, row_to_dict
from app.models.queue import QueueSource, QueueStatus

ACTIVE_STATUSES = [
    QueueStatus.waiting.value,
    QueueStatus.queued.value,
    QueueStatus.in_consultation.value,
]


def today_key() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


def _order_value(e: QueueEntryRow) -> float:
    return e.sort_order if e.sort_order is not None else float(e.token)


def _sort_key(e: QueueEntryRow) -> tuple[float, int]:
    # Tie-break by token so a skipped patient stays ahead of a newcomer who
    # lands on the same sort_order value.
    return (_order_value(e), e.token)


async def enqueue(
    clinic_id: str,
    patient_id: str,
    patient_name: str,
    patient_mobile: str,
    source: QueueSource,
) -> dict:
    date_key = today_key()
    async with session_scope() as session:
        max_token = await session.scalar(
            select(func.max(QueueEntryRow.token)).where(
                QueueEntryRow.clinic_id == clinic_id,
                QueueEntryRow.date_key == date_key,
            )
        )
        token = (max_token or 0) + 1
        entry = QueueEntryRow(
            clinic_id=clinic_id,
            date_key=date_key,
            token=token,
            patient_id=patient_id,
            patient_name=patient_name,
            patient_mobile=patient_mobile,
            source=source.value if isinstance(source, QueueSource) else str(source),
            status=QueueStatus.waiting.value,
            joined_at=datetime.now(timezone.utc).strftime("%H:%M"),
            sort_order=float(token),
        )
        session.add(entry)
        await session.flush()
        await _recompute_statuses(session, clinic_id, date_key)
        result = row_to_dict(entry)
        await session.commit()
    return result


async def _active_rows(session, clinic_id: str, date_key: str) -> list[QueueEntryRow]:
    rows = (
        await session.scalars(
            select(QueueEntryRow).where(
                QueueEntryRow.clinic_id == clinic_id,
                QueueEntryRow.date_key == date_key,
                QueueEntryRow.status.in_(ACTIVE_STATUSES),
            )
        )
    ).all()
    return sorted(rows, key=_sort_key)


async def _recompute_statuses(session, clinic_id: str, date_key: str) -> None:
    """Top of queue → Consultation, next → Queue, rest → Waiting (active only)."""
    for i, entry in enumerate(await _active_rows(session, clinic_id, date_key)):
        target = (
            QueueStatus.in_consultation.value
            if i == 0
            else QueueStatus.queued.value
            if i == 1
            else QueueStatus.waiting.value
        )
        if entry.status != target:
            entry.status = target


async def _current(session, clinic_id: str, date_key: str) -> QueueEntryRow | None:
    return await session.scalar(
        select(QueueEntryRow).where(
            QueueEntryRow.clinic_id == clinic_id,
            QueueEntryRow.date_key == date_key,
            QueueEntryRow.status == QueueStatus.in_consultation.value,
        )
    )


async def complete_current(clinic_id: str) -> dict | None:
    """Mark current consultation completed, deduct wallet, advance queue."""
    date_key = today_key()
    async with session_scope() as session:
        current = await _current(session, clinic_id, date_key)
        if not current:
            return None
        current.status = QueueStatus.completed.value
        await _recompute_statuses(session, clinic_id, date_key)
        result = row_to_dict(current)
        await session.commit()

    # Wallet deduction happens here (only on completion).
    from app.services.wallet_service import deduct_consultation

    await deduct_consultation(clinic_id, result["id"])
    return result


async def skip_current(clinic_id: str) -> dict | None:
    """Send the current patient to the back — token stays the same, only the
    queue position (sort_order) moves. was_skipped marks the yellow badge."""
    date_key = today_key()
    async with session_scope() as session:
        current = await _current(session, clinic_id, date_key)
        if not current:
            return None
        max_order = await session.scalar(
            select(func.max(func.coalesce(QueueEntryRow.sort_order, QueueEntryRow.token))).where(
                QueueEntryRow.clinic_id == clinic_id,
                QueueEntryRow.date_key == date_key,
            )
        )
        current.sort_order = float(max_order or 0) + 1
        current.was_skipped = True
        current.status = QueueStatus.waiting.value
        await _recompute_statuses(session, clinic_id, date_key)
        result = row_to_dict(current)
        await session.commit()
    return result


async def call_back(clinic_id: str, entry_id: str) -> dict | None:
    """Bring a previously-skipped patient to the front (next after the one in
    consultation). Token unchanged; was_skipped stays true as an audit mark."""
    date_key = today_key()
    async with session_scope() as session:
        target = await session.get(QueueEntryRow, entry_id)
        if not target or target.clinic_id != clinic_id or target.status not in ACTIVE_STATUSES:
            return None
        active = await _active_rows(session, clinic_id, date_key)
        others = [e for e in active if e.id != entry_id]
        min_order = min((_order_value(e) for e in others), default=0.0)
        target.sort_order = min_order + 0.5
        await _recompute_statuses(session, clinic_id, date_key)
        result = row_to_dict(target)
        await session.commit()
    return result


async def list_active(clinic_id: str) -> list[dict]:
    date_key = today_key()
    async with session_scope() as session:
        return [row_to_dict(r) for r in await _active_rows(session, clinic_id, date_key)]
