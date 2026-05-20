from app.models.common import BaseDoc


class Patient(BaseDoc):
    clinic_id: str
    user_id: str | None = None
    name: str
    mobile: str
    age: int | None = None
    gender: str | None = None
    address: str | None = None
    email: str | None = None
    visit_count: int = 0
    last_visit_at: str | None = None
