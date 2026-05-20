from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from bson import ObjectId
from app.auth.deps import get_current_user, CurrentUser
from app.database import db

router = APIRouter()


class PatientIn(BaseModel):
    name: str
    mobile: str
    age: int | None = None
    gender: str | None = None
    address: str | None = None
    email: str | None = None


@router.get("/lookup")
async def lookup(mobile: str, user: CurrentUser = Depends(get_current_user)):
    if not user.clinic_id:
        raise HTTPException(400, "Clinic context required")
    doc = await db.coll("patients").find_one({"clinic_id": user.clinic_id, "mobile": mobile})
    if not doc:
        return {"found": False}
    return {"found": True, "patient": {**doc, "_id": str(doc["_id"])}}


@router.post("/")
async def create_patient(p: PatientIn, user: CurrentUser = Depends(get_current_user)):
    if not user.clinic_id:
        raise HTTPException(400, "Clinic context required")
    doc = {
        **p.model_dump(),
        "clinic_id": user.clinic_id,
        "visit_count": 0,
        "created_at": datetime.now(timezone.utc),
    }
    res = await db.coll("patients").insert_one(doc)
    return {"id": str(res.inserted_id), **{k: v for k, v in doc.items() if k != "_id"}}


@router.get("/")
async def list_patients(q: str | None = None, user: CurrentUser = Depends(get_current_user)):
    if not user.clinic_id:
        raise HTTPException(400, "Clinic context required")
    query: dict = {"clinic_id": user.clinic_id}
    if q:
        query["$or"] = [{"name": {"$regex": q, "$options": "i"}}, {"mobile": {"$regex": q}}]
    docs = await db.coll("patients").find(query).sort("created_at", -1).to_list(length=200)
    return [{**d, "_id": str(d["_id"])} for d in docs]
