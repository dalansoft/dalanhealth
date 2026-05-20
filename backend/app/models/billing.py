from pydantic import Field
from app.models.common import BaseDoc


class InvoiceItem(BaseDoc):
    label: str
    amount: float


class Invoice(BaseDoc):
    clinic_id: str
    patient_id: str | None = None
    patient_name: str
    patient_mobile: str
    invoice_no: str
    consultation_fee: float = 0
    medicine_fee: float = 0
    extra_charges: float = 0
    discount: float = 0
    total: float = 0
    notes: str | None = None
    items: list[dict] = Field(default_factory=list)
