from enum import Enum
from app.models.common import BaseDoc


class QueueSource(str, Enum):
    OFFLINE = "OFFLINE"
    ONLINE = "ONLINE"
    QR = "QR"


class QueueStatus(str, Enum):
    waiting = "waiting"     # rendered as 'Waiting'
    queued = "queued"        # rendered as 'Queue' (up next)
    in_consultation = "in_consultation"  # rendered as 'Consultation'
    completed = "completed"
    skipped = "skipped"
    cancelled = "cancelled"


class QueueEntry(BaseDoc):
    clinic_id: str
    date_key: str               # 'YYYY-MM-DD' for the doctor session day
    token: int
    patient_id: str
    patient_name: str
    patient_mobile: str
    source: QueueSource
    status: QueueStatus = QueueStatus.waiting
    joined_at: str | None = None
