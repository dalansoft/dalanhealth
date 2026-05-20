from enum import Enum
from app.models.common import BaseDoc


class NotificationChannel(str, Enum):
    push = "push"
    whatsapp = "whatsapp"
    sms = "sms"
    email = "email"


class NotificationEvent(str, Enum):
    booking_created = "booking_created"
    queue_near = "queue_near"
    consultation_ready = "consultation_ready"
    visit_completed = "visit_completed"
    wallet_low = "wallet_low"
    follow_up = "follow_up"
    recharge_success = "recharge_success"
    payment_success = "payment_success"


class Notification(BaseDoc):
    user_id: str | None = None
    clinic_id: str | None = None
    event: NotificationEvent
    channel: NotificationChannel
    title: str
    body: str
    delivered: bool = False
    error: str | None = None
