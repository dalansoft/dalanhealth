from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.auth.deps import get_current_user, CurrentUser
from app.database import db

router = APIRouter()


class MedicineIn(BaseModel):
    name: str
    dose: str | None = None
    frequency: str | None = None
    duration: str | None = None


class PrescriptionIn(BaseModel):
    patient_id: str | None = None
    patient_name: str
    symptoms: str | None = None
    diagnosis: str | None = None
    tests: str | None = None
    notes: str | None = None
    follow_up: str | None = None
    medicines: list[MedicineIn] = []


@router.post("/")
async def create_prescription(p: PrescriptionIn, user: CurrentUser = Depends(get_current_user)):
    if not user.clinic_id:
        raise HTTPException(400, "Clinic context required")
    doc = {
        **p.model_dump(),
        "clinic_id": user.clinic_id,
        "created_at": datetime.now(timezone.utc),
    }
    res = await db.coll("prescriptions").insert_one(doc)
    return {"id": str(res.inserted_id), **{k: v for k, v in doc.items() if k != "_id"}}


@router.get("/")
async def list_prescriptions(user: CurrentUser = Depends(get_current_user), limit: int = 50):
    if not user.clinic_id:
        raise HTTPException(400, "Clinic context required")
    docs = await db.coll("prescriptions").find({"clinic_id": user.clinic_id}).sort("created_at", -1).to_list(limit)
    return [{**d, "_id": str(d["_id"])} for d in docs]
