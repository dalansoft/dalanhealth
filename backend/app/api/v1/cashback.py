from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.auth.deps import get_current_user, CurrentUser
from app.models.cashback import CashbackCampaignType
from app.services import cashback_service

router = APIRouter()


class EarnReq(BaseModel):
    campaign_type: CashbackCampaignType
    amount: float | None = None


class UsePreviewReq(BaseModel):
    booking_fee: float


@router.get("/balance")
async def balance(user: CurrentUser = Depends(get_current_user)):
    from bson import ObjectId
    from app.database import db
    doc = await db.coll("users").find_one({"_id": ObjectId(user.user_id)})
    bal = float((doc or {}).get("meta", {}).get("cashback_balance", 0))
    return {"balance": round(bal, 2)}


@router.post("/earn")
async def earn(req: EarnReq, user: CurrentUser = Depends(get_current_user)):
    return await cashback_service.earn(user.user_id, req.campaign_type, req.amount)


@router.post("/preview-use")
async def preview_use(req: UsePreviewReq, user: CurrentUser = Depends(get_current_user)):
    applicable = await cashback_service.compute_use(user.user_id, req.booking_fee)
    return {"applicable": applicable, "patient_pays": round(req.booking_fee - applicable, 2)}
