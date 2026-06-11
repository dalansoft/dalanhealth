from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.auth.deps import get_current_user, CurrentUser
from app.models.queue import QueueSource
from app.services import queue_service
from app.websocket.queue_ws import broadcast_clinic

router = APIRouter()


class EnqueueReq(BaseModel):
    patient_id: str
    patient_name: str
    patient_mobile: str
    source: QueueSource = QueueSource.OFFLINE


@router.get("/")
async def get_queue(user: CurrentUser = Depends(get_current_user)):
    if not user.clinic_id:
        raise HTTPException(400, "Clinic context required")
    return await queue_service.list_active(user.clinic_id)


@router.post("/enqueue")
async def enqueue(req: EnqueueReq, user: CurrentUser = Depends(get_current_user)):
    if not user.clinic_id:
        raise HTTPException(400, "Clinic context required")
    entry = await queue_service.enqueue(
        user.clinic_id, req.patient_id, req.patient_name, req.patient_mobile, req.source,
    )
    listing = await queue_service.list_active(user.clinic_id)
    await broadcast_clinic(user.clinic_id, {"type": "queue_updated", "entries": listing})
    return entry


@router.post("/complete-current")
async def complete_current(user: CurrentUser = Depends(get_current_user)):
    if not user.clinic_id:
        raise HTTPException(400, "Clinic context required")
    completed = await queue_service.complete_current(user.clinic_id)
    listing = await queue_service.list_active(user.clinic_id)
    await broadcast_clinic(user.clinic_id, {"type": "queue_updated", "entries": listing})
    return {"completed": completed, "entries": listing}


@router.post("/skip-current")
async def skip_current(user: CurrentUser = Depends(get_current_user)):
    if not user.clinic_id:
        raise HTTPException(400, "Clinic context required")
    skipped = await queue_service.skip_current(user.clinic_id)
    listing = await queue_service.list_active(user.clinic_id)
    await broadcast_clinic(user.clinic_id, {"type": "queue_updated", "entries": listing})
    return {"skipped": skipped, "entries": listing}


@router.post("/call-back/{entry_id}")
async def call_back(entry_id: str, user: CurrentUser = Depends(get_current_user)):
    """Bring a skipped patient back to the front of the queue."""
    if not user.clinic_id:
        raise HTTPException(400, "Clinic context required")
    entry = await queue_service.call_back(user.clinic_id, entry_id)
    if not entry:
        raise HTTPException(404, "Queue entry not found or not active")
    listing = await queue_service.list_active(user.clinic_id)
    await broadcast_clinic(user.clinic_id, {"type": "queue_updated", "entries": listing})
    return {"called_back": entry, "entries": listing}
