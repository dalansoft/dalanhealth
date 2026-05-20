from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.auth.deps import get_current_user, CurrentUser
from app.database import db
from app.models.notification import NotificationChannel, NotificationEvent

router = APIRouter()


class SendReq(BaseModel):
    user_id: str | None = None
    event: NotificationEvent
    title: str
    body: str
    channel: NotificationChannel = NotificationChannel.push


@router.post("/send")
async def send(req: SendReq, user: CurrentUser = Depends(get_current_user)):
    # Production: dispatch via Firebase / WhatsApp / SMS / Email with fallback.
    doc = {
        **req.model_dump(),
        "clinic_id": user.clinic_id,
        "delivered": True,
        "created_at": datetime.now(timezone.utc),
    }
    res = await db.coll("notifications").insert_one(doc)
    return {"id": str(res.inserted_id), **{k: v for k, v in doc.items() if k != "_id"}}


@router.get("/me")
async def my_notifications(user: CurrentUser = Depends(get_current_user)):
    docs = await db.coll("notifications").find({"user_id": user.user_id}).sort("created_at", -1).to_list(100)
    return [{**d, "_id": str(d["_id"])} for d in docs]
