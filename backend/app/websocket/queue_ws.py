"""WebSocket hub for realtime queue updates.

Clients connect to /ws/queue/{clinic_id} and receive JSON broadcasts
whenever the queue changes. Patient apps and reception screens stay
in sync without polling.
"""
from collections import defaultdict
from typing import Dict, Set
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()

_connections: Dict[str, Set[WebSocket]] = defaultdict(set)


async def broadcast_clinic(clinic_id: str, message: dict) -> None:
    dead: list[WebSocket] = []
    for ws in _connections.get(clinic_id, set()):
        try:
            await ws.send_json(message)
        except Exception:
            dead.append(ws)
    for ws in dead:
        _connections[clinic_id].discard(ws)


@router.websocket("/ws/queue/{clinic_id}")
async def queue_socket(ws: WebSocket, clinic_id: str):
    await ws.accept()
    _connections[clinic_id].add(ws)
    await ws.send_json({"type": "hello", "clinic_id": clinic_id})
    # Push the current listing immediately so a freshly-opened display (e.g.
    # a wall TV on /display/clinic?clinic=…, which has no auth for the REST
    # endpoint) renders the queue without waiting for the next change.
    try:
        from app.services import queue_service

        entries = await queue_service.list_active(clinic_id)
        await ws.send_json({"type": "queue_updated", "entries": entries})
    except Exception:
        pass  # initial snapshot is best-effort; broadcasts will catch up
    try:
        while True:
            msg = await ws.receive_text()
            # echo / ping support
            if msg == "ping":
                await ws.send_text("pong")
    except WebSocketDisconnect:
        _connections[clinic_id].discard(ws)
