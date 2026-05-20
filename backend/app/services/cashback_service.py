"""Cashback service — rules:
- earn on bookings (campaign rate)
- use only as booking-fee adjustment
- max 50% of booking fee per use
- never withdrawable
"""
from datetime import datetime, timezone
from bson import ObjectId
from app.database import db
from app.models.cashback import DEFAULT_CASHBACK, CashbackCampaignType
from app.models.transaction import TxReason


MAX_USE_RATIO = 0.5


async def earn(user_id: str, campaign_type: CashbackCampaignType, amount: float | None = None) -> dict:
    amt = amount if amount is not None else DEFAULT_CASHBACK[campaign_type]
    await db.coll("users").update_one(
        {"_id": ObjectId(user_id)},
        {"$inc": {"meta.cashback_balance": amt}},
        upsert=False,
    )
    await db.coll("transactions").insert_one({
        "user_id": user_id,
        "reason": TxReason.cashback_earn.value,
        "amount": amt,
        "note": campaign_type.value,
        "created_at": datetime.now(timezone.utc),
    })
    return {"ok": True, "earned": amt}


async def compute_use(user_id: str, booking_fee: float) -> float:
    """Return how much cashback can be applied to this booking."""
    user = await db.coll("users").find_one({"_id": ObjectId(user_id)})
    bal = float((user or {}).get("meta", {}).get("cashback_balance", 0))
    return round(min(bal, booking_fee * MAX_USE_RATIO), 2)


async def apply_use(user_id: str, amount: float, booking_ref: str | None = None) -> dict:
    if amount <= 0:
        return {"applied": 0}
    await db.coll("users").update_one(
        {"_id": ObjectId(user_id)},
        {"$inc": {"meta.cashback_balance": -amount}},
    )
    await db.coll("transactions").insert_one({
        "user_id": user_id,
        "reason": TxReason.cashback_use.value,
        "amount": -amount,
        "ref_id": booking_ref,
        "created_at": datetime.now(timezone.utc),
    })
    return {"applied": amount}
