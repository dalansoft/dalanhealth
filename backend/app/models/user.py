from enum import Enum
from pydantic import Field
from app.models.common import BaseDoc


class Role(str, Enum):
    patient = "patient"
    clinic_admin = "clinic_admin"
    receptionist = "receptionist"
    super_admin = "super_admin"


class User(BaseDoc):
    name: str
    role: Role
    mobile: str | None = None
    email: str | None = None
    password_hash: str | None = None
    clinic_id: str | None = None
    is_active: bool = True
    is_demo: bool = False
    avatar_url: str | None = None
    meta: dict = Field(default_factory=dict)
