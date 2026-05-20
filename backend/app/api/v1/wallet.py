from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from app.auth.deps import get_current_user, CurrentUser
from app.services import wallet_service

router = APIRouter()


class RechargeReq(BaseModel):
    amount: float = Field(gt=0)
    note: str | None = None


@router.get("/balance")
async def get_balance(user: CurrentUser = Depends(get_current_user)):
    if not user.clinic_id:
        raise HTTPException(400, "Clinic context required")
    from bson import ObjectId
    from app.database import db
    clinic = await db.coll("clinics").find_one({"_id": ObjectId(user.clinic_id)})
    if not clinic:
        raise HTTPException(404, "Clinic not found")
    return {
        "balance": clinic.get("wallet_balance", 0),
        "plan": clinic.get("plan", "starter"),
        "warn": wallet_service.LOW_BALANCE_WARN,
        "critical": wallet_service.LOW_BALANCE_CRITICAL,
    }


@router.post("/recharge")
async def recharge(req: RechargeReq, user: CurrentUser = Depends(get_current_user)):
    if not user.clinic_id:
        raise HTTPException(400, "Clinic context required")
    return await wallet_service.recharge(user.clinic_id, req.amount, req.note)


@router.get("/history")
async def history(user: CurrentUser = Depends(get_current_user)):
    if not user.clinic_id:
        raise HTTPException(400, "Clinic context required")
    return await wallet_service.history(user.clinic_id)
