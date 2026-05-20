from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from app.auth.deps import get_current_user, CurrentUser, require_roles
from app.database import db

router = APIRouter()


@router.get("/")
async def list_clinics(user: CurrentUser = Depends(require_roles("super_admin"))):
    clinics = db.coll("clinics")
    docs = await clinics.find({}, {"password_hash": 0}).to_list(length=500)
    return [{**d, "_id": str(d["_id"])} for d in docs]


@router.get("/me")
async def my_clinic(user: CurrentUser = Depends(get_current_user)):
    if not user.clinic_id:
        raise HTTPException(404, "No clinic for this user")
    doc = await db.coll("clinics").find_one({"_id": ObjectId(user.clinic_id)})
    if not doc:
        raise HTTPException(404, "Clinic not found")
    return {**doc, "_id": str(doc["_id"])}
