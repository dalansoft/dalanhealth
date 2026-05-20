from enum import Enum
from app.models.common import BaseDoc


class TxReason(str, Enum):
    recharge = "recharge"
    consultation_deduction = "consultation_deduction"
    refund = "refund"
    cashback_earn = "cashback_earn"
    cashback_use = "cashback_use"
    booking_fee = "booking_fee"


class Transaction(BaseDoc):
    clinic_id: str | None = None
    user_id: str | None = None
    reason: TxReason
    amount: float
    balance_after: float | None = None
    note: str | None = None
    ref_id: str | None = None  # queue entry, booking, invoice
