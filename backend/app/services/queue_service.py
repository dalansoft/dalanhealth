"""Queue engine — sequential token assignment and status transitions.

Single source of truth: backend. Clients render, never compute.
"""
from datetime import datetime, timezone
from app.database import db
from app.models.queue import QueueSource, QueueStatus


def today_key() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


async def next_token(clinic_id: str, date_key: str) -> int:
    coll = db.coll("queue")
    doc = await coll.find_one(
        {"clinic_id": clinic_id, "date_key": date_key},
        sort=[("token", -1)],
    )
    return (doc["token"] + 1) if doc else 1


async def enqueue(
    clinic_id: str,
    patient_id: str,
    patient_name: str,
    patient_mobile: str,
    source: QueueSource,
) -> dict:
    date_key = today_key()
    token = await next_token(clinic_id, date_key)
    doc = {
        "clinic_id": clinic_id,
        "date_key": date_key,
        "token": token,
        "patient_id": patient_id,
        "patient_name": patient_name,
        "patient_mobile": patient_mobile,
        "source": source.value if isinstance(source, QueueSource) else source,
        "status": QueueStatus.waiting.value,
        "joined_at": datetime.now(timezone.utc).strftime("%H:%M"),
        "created_at": datetime.now(timezone.utc),
    }
    res = await db.coll("queue").insert_one(doc)
    doc["_id"] = str(res.inserted_id)
    await _recompute_statuses(clinic_id, date_key)
    return doc


async def _recompute_statuses(clinic_id: str, date_key: str) -> None:
    """Top of queue → Consultation, next → Queue, rest → Waiting (active only)."""
    coll = db.coll("queue")
    cursor = coll.find(
        {
            "clinic_id": clinic_id,
            "date_key": date_key,
            "status": {"$in": [QueueStatus.waiting.value, QueueStatus.queued.value, QueueStatus.in_consultation.value]},
        }
    ).sort("token", 1)
    active = await cursor.to_list(length=500)
    for i, entry in enumerate(active):
        if i == 0:
            target = QueueStatus.in_consultation.value
        elif i == 1:
            target = QueueStatus.queued.value
        else:
            target = QueueStatus.waiting.value
        if entry.get("status") != target:
            await coll.update_one({"_id": entry["_id"]}, {"$set": {"status": target}})


async def complete_current(clinic_id: str) -> dict | None:
    """Mark current consultation completed, deduct wallet, advance queue."""
    date_key = today_key()
    coll = db.coll("queue")
    current = await coll.find_one(
        {"clinic_id": clinic_id, "date_key": date_key, "status": QueueStatus.in_consultation.value}
    )
    if not current:
        return None
    await coll.update_one({"_id": current["_id"]}, {"$set": {"status": QueueStatus.completed.value}})
    await _recompute_statuses(clinic_id, date_key)

    # Wallet deduction happens here (only on completion)
    from app.services.wallet_service import deduct_consultation
    await deduct_consultation(clinic_id, str(current["_id"]))

    return current


async def skip_current(clinic_id: str) -> dict | None:
    date_key = today_key()
    coll = db.coll("queue")
    current = await coll.find_one(
        {"clinic_id": clinic_id, "date_key": date_key, "status": QueueStatus.in_consultation.value}
    )
    if not current:
        return None
    await coll.update_one({"_id": current["_id"]}, {"$set": {"status": QueueStatus.waiting.value, "token": 9999}})
    await _recompute_statuses(clinic_id, date_key)
    return current


async def list_active(clinic_id: str) -> list[dict]:
    date_key = today_key()
    docs = await db.coll("queue").find(
        {
            "clinic_id": clinic_id,
            "date_key": date_key,
            "status": {"$in": [QueueStatus.waiting.value, QueueStatus.queued.value, QueueStatus.in_consultation.value]},
        }
    ).sort("token", 1).to_list(length=500)
    return [{**d, "_id": str(d["_id"])} for d in docs]
