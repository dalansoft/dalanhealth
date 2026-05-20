from datetime import datetime, timezone
import secrets
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.auth.deps import get_current_user, CurrentUser
from app.database import db

router = APIRouter()


class InvoiceIn(BaseModel):
    patient_id: str | None = None
    patient_name: str
    patient_mobile: str
    consultation_fee: float = 0
    medicine_fee: float = 0
    extra_charges: float = 0
    discount: float = 0
    notes: str | None = None


@router.post("/")
async def create_invoice(inv: InvoiceIn, user: CurrentUser = Depends(get_current_user)):
    if not user.clinic_id:
        raise HTTPException(400, "Clinic context required")
    total = max(0.0, inv.consultation_fee + inv.medicine_fee + inv.extra_charges - inv.discount)
    invoice_no = f"INV-{secrets.token_hex(3).upper()}"
    doc = {
        **inv.model_dump(),
        "clinic_id": user.clinic_id,
        "total": total,
        "invoice_no": invoice_no,
        "created_at": datetime.now(timezone.utc),
    }
    res = await db.coll("invoices").insert_one(doc)
    return {"id": str(res.inserted_id), **{k: v for k, v in doc.items() if k != "_id"}}


@router.get("/")
async def list_invoices(user: CurrentUser = Depends(get_current_user), limit: int = 50):
    if not user.clinic_id:
        raise HTTPException(400, "Clinic context required")
    docs = await db.coll("invoices").find({"clinic_id": user.clinic_id}).sort("created_at", -1).to_list(limit)
    return [{**d, "_id": str(d["_id"])} for d in docs]
