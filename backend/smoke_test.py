"""Local smoke test — boots the app on SQLite and exercises the full flow.

Run:  .venv\\Scripts\\python smoke_test.py
Not a pytest suite (yet) — a fast end-to-end sanity check used after the
Mongo→Postgres rewrite and before deploys.
"""

import os
import sys

os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///./smoke_test.db"

if os.path.exists("smoke_test.db"):
    os.remove("smoke_test.db")

from fastapi.testclient import TestClient  # noqa: E402

import main  # noqa: E402

failures: list[str] = []


def check(label: str, ok: bool, detail: str = "") -> None:
    print(f"{'PASS' if ok else 'FAIL'}  {label}{(' — ' + detail) if detail and not ok else ''}")
    if not ok:
        failures.append(label)


with TestClient(main.app) as client:
    # Health
    r = client.get("/health")
    check("GET /health", r.status_code == 200 and r.json()["status"] == "ok", r.text)
    r = client.get("/health/database")
    check("GET /health/database", r.status_code == 200, r.text)

    # Clinic signup
    r = client.post("/api/v1/auth/signup/clinic", json={
        "doctor_name": "Dr. Anil Sharma",
        "clinic_name": "Sharma ENT Clinic",
        "mobile": "+919876543210",
        "email": "anil@sharmaent.in",
        "password": "secret123",
        "city": "Patna",
        "specialization": "ENT",
    })
    check("POST /auth/signup/clinic", r.status_code == 200, r.text)
    token = r.json()["access_token"]
    clinic_id = r.json()["user"]["clinic_id"]
    auth = {"Authorization": f"Bearer {token}"}

    # Duplicate signup must 409
    r = client.post("/api/v1/auth/signup/clinic", json={
        "doctor_name": "X", "clinic_name": "Y", "mobile": "1",
        "email": "anil@sharmaent.in", "password": "secret123",
    })
    check("duplicate signup → 409", r.status_code == 409, r.text)

    # Login
    r = client.post("/api/v1/auth/login", json={
        "email": "anil@sharmaent.in", "password": "secret123", "role": "clinic_admin",
    })
    check("POST /auth/login", r.status_code == 200, r.text)

    # /me
    r = client.get("/api/v1/auth/me", headers=auth)
    check("GET /auth/me", r.status_code == 200 and r.json()["clinic_id"] == clinic_id, r.text)

    # Wallet recharge
    r = client.post("/api/v1/wallet/recharge", json={"amount": 500}, headers=auth)
    check("POST /wallet/recharge", r.status_code == 200 and r.json()["balance"] == 500, r.text)

    # Patients
    r = client.post("/api/v1/patients/", json={"name": "Shailesh Raj", "mobile": "+917564041018"}, headers=auth)
    check("POST /patients", r.status_code == 200, r.text)
    patient_id = r.json()["id"]
    r = client.get("/api/v1/patients/lookup", params={"mobile": "+917564041018"}, headers=auth)
    check("GET /patients/lookup", r.status_code == 200 and r.json()["found"], r.text)
    r = client.get("/api/v1/patients/", params={"q": "shailesh"}, headers=auth)
    check("GET /patients?q= (ilike)", r.status_code == 200 and len(r.json()) == 1, r.text)

    # Queue: enqueue two patients
    r = client.post("/api/v1/queue/enqueue", json={
        "patient_id": patient_id, "patient_name": "Shailesh Raj",
        "patient_mobile": "+917564041018", "source": "OFFLINE",
    }, headers=auth)
    check("POST /queue/enqueue #1", r.status_code == 200 and r.json()["token"] == 1, r.text)
    r = client.post("/api/v1/queue/enqueue", json={
        "patient_id": patient_id, "patient_name": "Raj Verma",
        "patient_mobile": "+919123456780", "source": "QR",
    }, headers=auth)
    check("POST /queue/enqueue #2", r.status_code == 200 and r.json()["token"] == 2, r.text)

    # Statuses: #1 in_consultation, #2 queued
    r = client.get("/api/v1/queue/", headers=auth)
    entries = r.json()
    check(
        "queue statuses recomputed",
        [e["status"] for e in entries] == ["in_consultation", "queued"],
        str(entries),
    )

    # Complete → wallet deducted at the per-visit rate (9rs+gst)
    r = client.post("/api/v1/queue/complete-current", headers=auth)
    check("POST /queue/complete-current", r.status_code == 200 and r.json()["completed"]["token"] == 1, r.text)
    r = client.get("/api/v1/wallet/balance", headers=auth)
    check("wallet deducted on completion", r.json()["balance"] == 491, r.text)

    # Skip semantics: token is patient-visible and NEVER changes; only the
    # queue position moves. Enqueue a 3rd patient so there are two active.
    r = client.post("/api/v1/queue/enqueue", json={
        "patient_id": patient_id, "patient_name": "Pooja Sharma",
        "patient_mobile": "+919870033445", "source": "ONLINE",
    }, headers=auth)
    check("POST /queue/enqueue #3", r.status_code == 200 and r.json()["token"] == 3, r.text)

    r = client.post("/api/v1/queue/skip-current", headers=auth)
    skipped = r.json().get("skipped") or {}
    check(
        "skip keeps token + flags was_skipped",
        r.status_code == 200 and skipped.get("token") == 2 and skipped.get("was_skipped") is True,
        r.text,
    )
    entries_after_skip = r.json()["entries"]
    check(
        "skip reorders (3 now first, 2 last)",
        [e["token"] for e in entries_after_skip] == [3, 2],
        str(entries_after_skip),
    )

    # Call-back = "next in line" — slots right behind the patient currently in
    # consultation (never interrupts them). Token + skipped-mark preserved.
    r = client.post(f"/api/v1/queue/call-back/{skipped['id']}", headers=auth)
    cb = r.json().get("called_back") or {}
    cb_entries = r.json()["entries"]
    check(
        "call-back → next in line, token unchanged",
        r.status_code == 200 and cb.get("token") == 2 and cb.get("was_skipped") is True
        and [e["token"] for e in cb_entries] == [3, 2]
        and cb_entries[1]["status"] == "queued",
        r.text,
    )

    # Billing + prescription
    r = client.post("/api/v1/billing/", json={
        "patient_name": "Shailesh Raj", "patient_mobile": "+917564041018",
        "consultation_fee": 300, "discount": 50,
    }, headers=auth)
    check("POST /billing (total calc)", r.status_code == 200 and r.json()["total"] == 250, r.text)
    r = client.post("/api/v1/prescriptions/", json={
        "patient_name": "Shailesh Raj",
        "medicines": [{"name": "Azithromycin", "dose": "500mg"}],
    }, headers=auth)
    check("POST /prescriptions (JSON col)", r.status_code == 200 and r.json()["medicines"][0]["name"] == "Azithromycin", r.text)

    # OTP login (patient) + cashback
    r = client.post("/api/v1/auth/otp/verify", json={"mobile": "+917564041018", "otp": "123456"})
    check("POST /auth/otp/verify", r.status_code == 200, r.text)
    p_auth = {"Authorization": f"Bearer {r.json()['access_token']}"}
    r = client.post("/api/v1/cashback/earn", json={"campaign_type": "first_booking"}, headers=p_auth)
    check("POST /cashback/earn", r.status_code == 200 and r.json()["earned"] == 1.0, r.text)
    r = client.post("/api/v1/cashback/preview-use", json={"booking_fee": 9.0}, headers=p_auth)
    check("cashback 50% cap", r.status_code == 200 and r.json()["applicable"] == 1.0, r.text)

    # Wallet history + transactions recorded
    r = client.get("/api/v1/wallet/history", headers=auth)
    check("GET /wallet/history", r.status_code == 200 and len(r.json()) == 2, r.text)

    # WebSocket — a freshly-connected display (no auth) must receive the
    # current queue snapshot immediately (how wall TVs get their data).
    with client.websocket_connect(f"/ws/queue/{clinic_id}") as ws_conn:
        hello = ws_conn.receive_json()
        snapshot = ws_conn.receive_json()
        check(
            "WS hello + initial queue snapshot",
            hello.get("type") == "hello"
            and snapshot.get("type") == "queue_updated"
            and [e["token"] for e in snapshot.get("entries", [])] == [3, 2],
            f"{hello} / {snapshot}",
        )

print()
if failures:
    print(f"❌ {len(failures)} failure(s): {failures}")
    sys.exit(1)
print("✅ All smoke checks passed — Postgres data layer works end to end.")
