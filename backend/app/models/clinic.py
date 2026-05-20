from enum import Enum
from pydantic import Field
from app.models.common import BaseDoc


class Plan(str, Enum):
    starter = "starter"
    growth = "growth"


PLAN_RATE = {Plan.starter: 9, Plan.growth: 12}


class DoctorTiming(BaseDoc):
    start: str  # "10:00"
    end: str    # "14:00"


class Clinic(BaseDoc):
    name: str
    doctor_name: str
    specialization: str | None = None
    city: str | None = None
    state: str | None = None
    address: str | None = None
    mobile: str
    email: str | None = None
    plan: Plan = Plan.starter
    wallet_balance: float = 0.0
    consultation_fee: int = 300
    booking_fee: int = 1
    timings: list[dict] = Field(default_factory=list)  # [{start, end}]
    is_active: bool = True
