from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from bson import ObjectId

from app.auth.security import hash_password, verify_password, create_access_token
from app.auth.deps import get_current_user, CurrentUser
from app.config import settings
from app.database import db
from app.models.user import Role

router = APIRouter()


class SendOtpReq(BaseModel):
    mobile: str
    role: Role = Role.patient


class VerifyOtpReq(BaseModel):
    mobile: str
    otp: str
    role: Role = Role.patient
    name: str | None = None


class PasswordLoginReq(BaseModel):
    email: EmailStr
    password: str
    role: Role


class ClinicSignupReq(BaseModel):
    doctor_name: str
    clinic_name: str
    mobile: str
    email: EmailStr
    password: str = Field(min_length=6)
    city: str | None = None
    specialization: str | None = None
    plan: str = "growth"


class TokenResp(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


@router.post("/otp/send")
async def send_otp(req: SendOtpReq):
    # In production: integrate SMS gateway; in demo we always return ok.
    return {"ok": True, "demo_code": settings.otp_demo_code if settings.app_env != "production" else None}


@router.post("/otp/verify", response_model=TokenResp)
async def verify_otp(req: VerifyOtpReq):
    if req.otp != settings.otp_demo_code:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid OTP")
    users = db.coll("users")
    existing = await users.find_one({"mobile": req.mobile, "role": req.role.value})
    if not existing:
        result = await users.insert_one({
            "name": req.name or "Patient",
            "mobile": req.mobile,
            "role": req.role.value,
            "is_active": True,
            "is_demo": False,
            "created_at": datetime.now(timezone.utc),
        })
        user_id = str(result.inserted_id)
        clinic_id = None
        name = req.name or "Patient"
    else:
        user_id = str(existing["_id"])
        clinic_id = existing.get("clinic_id")
        name = existing.get("name", "Patient")

    token = create_access_token(user_id, req.role.value, clinic_id)
    return TokenResp(
        access_token=token,
        user={"id": user_id, "name": name, "role": req.role.value, "mobile": req.mobile, "clinic_id": clinic_id},
    )


@router.post("/login", response_model=TokenResp)
async def login(req: PasswordLoginReq):
    users = db.coll("users")
    user = await users.find_one({"email": req.email, "role": req.role.value})
    if not user or not user.get("password_hash") or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid credentials")
    user_id = str(user["_id"])
    clinic_id = user.get("clinic_id")
    token = create_access_token(user_id, req.role.value, clinic_id)
    return TokenResp(
        access_token=token,
        user={
            "id": user_id,
            "name": user.get("name", ""),
            "role": req.role.value,
            "email": user.get("email"),
            "clinic_id": clinic_id,
        },
    )


@router.post("/signup/clinic", response_model=TokenResp)
async def signup_clinic(req: ClinicSignupReq):
    users = db.coll("users")
    clinics = db.coll("clinics")
    existing = await users.find_one({"email": req.email, "role": Role.clinic_admin.value})
    if existing:
        raise HTTPException(status.HTTP_409_CONFLICT, "Account already exists for this email")

    clinic_doc = {
        "name": req.clinic_name,
        "doctor_name": req.doctor_name,
        "mobile": req.mobile,
        "email": req.email,
        "city": req.city,
        "specialization": req.specialization,
        "plan": req.plan,
        "wallet_balance": 0.0,
        "consultation_fee": 300,
        "booking_fee": 1,
        "is_active": True,
        "created_at": datetime.now(timezone.utc),
    }
    clinic_res = await clinics.insert_one(clinic_doc)
    clinic_id = str(clinic_res.inserted_id)

    user_doc = {
        "name": req.doctor_name,
        "role": Role.clinic_admin.value,
        "mobile": req.mobile,
        "email": req.email,
        "password_hash": hash_password(req.password),
        "clinic_id": clinic_id,
        "is_active": True,
        "is_demo": False,
        "created_at": datetime.now(timezone.utc),
    }
    user_res = await users.insert_one(user_doc)
    user_id = str(user_res.inserted_id)

    token = create_access_token(user_id, Role.clinic_admin.value, clinic_id)
    return TokenResp(
        access_token=token,
        user={
            "id": user_id,
            "name": req.doctor_name,
            "role": Role.clinic_admin.value,
            "email": req.email,
            "clinic_id": clinic_id,
            "clinic_name": req.clinic_name,
        },
    )


@router.get("/me")
async def me(user: CurrentUser = Depends(get_current_user)):
    users = db.coll("users")
    doc = await users.find_one({"_id": ObjectId(user.user_id)})
    if not doc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")
    return {
        "id": str(doc["_id"]),
        "name": doc.get("name"),
        "role": doc.get("role"),
        "email": doc.get("email"),
        "mobile": doc.get("mobile"),
        "clinic_id": doc.get("clinic_id"),
    }
