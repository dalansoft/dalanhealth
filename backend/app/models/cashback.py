from enum import Enum
from app.models.common import BaseDoc


class CashbackCampaignType(str, Enum):
    normal = "normal"
    festival = "festival"
    doctor_promo = "doctor_promo"
    first_booking = "first_booking"


DEFAULT_CASHBACK = {
    CashbackCampaignType.normal: 0.10,
    CashbackCampaignType.festival: 0.25,
    CashbackCampaignType.doctor_promo: 0.50,
    CashbackCampaignType.first_booking: 1.00,
}


class CashbackCampaign(BaseDoc):
    name: str
    type: CashbackCampaignType
    amount: float
    is_active: bool = True
    clinic_id: str | None = None
    doctor_id: str | None = None
    valid_from: str | None = None
    valid_to: str | None = None
