"""Wallet service — recharges and consultation deductions.

Rule: deduct only on consultation_completed. Never on token, queue join or cancel.
"""
from datetime import datetime, timezone
from bson import ObjectId
from app.database import db
from app.models.clinic import Plan, PLAN_RATE
from app.models.transaction import TxReason


LOW_BALANCE_WARN = 1000
LOW_BALANCE_CRITICAL = 200


async def get_plan_rate(clinic_id: str) -> int:
    clinic = await db.coll("clinics").find_one({"_id": ObjectId(clinic_id)})
    if not clinic:
        return PLAN_RATE[Plan.starter]
    plan = clinic.get("plan", Plan.starter.value)
    return PLAN_RATE[Plan(plan)] if plan in (Plan.starter.value, Plan.growth.value) else PLAN_RATE[Plan.starter]


async def deduct_consultation(clinic_id: str, queue_entry_id: str) -> dict:
    rate = await get_plan_rate(clinic_id)
    result = await db.coll("clinics").find_one_and_update(
        {"_id": ObjectId(clinic_id)},
        {"$inc": {"wallet_balance": -rate}},
        return_document=True,
    )
    if not result:
        return {"ok": False}
    new_balance = result.get("wallet_balance", 0)
    await db.coll("transactions").insert_one({
        "clinic_id": clinic_id,
        "reason": TxReason.consultation_deduction.value,
        "amount": -rate,
        "balance_after": new_balance,
        "ref_id": queue_entry_id,
        "created_at": datetime.now(timezone.utc),
    })
    if new_balance < LOW_BALANCE_WARN:
        # In production: enqueue notification to clinic admin
        pass
    return {"ok": True, "balance": new_balance, "deducted": rate}


async def recharge(clinic_id: str, amount: float, note: str | None = None) -> dict:
    result = await db.coll("clinics").find_one_and_update(
        {"_id": ObjectId(clinic_id)},
        {"$inc": {"wallet_balance": amount}},
        return_document=True,
    )
    if not result:
        return {"ok": False}
    new_balance = result.get("wallet_balance", 0)
    await db.coll("transactions").insert_one({
        "clinic_id": clinic_id,
        "reason": TxReason.recharge.value,
        "amount": amount,
        "balance_after": new_balance,
        "note": note,
        "created_at": datetime.now(timezone.utc),
    })
    return {"ok": True, "balance": new_balance}


async def history(clinic_id: str, limit: int = 100) -> list[dict]:
    docs = await db.coll("transactions").find({"clinic_id": clinic_id}).sort("created_at", -1).to_list(length=limit)
    return [{**d, "_id": str(d["_id"])} for d in docs]
