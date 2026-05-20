from pydantic import Field
from app.models.common import BaseDoc


class Medicine(BaseDoc):
    name: str
    dose: str | None = None
    frequency: str | None = None
    duration: str | None = None


class Prescription(BaseDoc):
    clinic_id: str
    patient_id: str | None = None
    patient_name: str
    symptoms: str | None = None
    diagnosis: str | None = None
    tests: str | None = None
    notes: str | None = None
    follow_up: str | None = None
    medicines: list[dict] = Field(default_factory=list)
