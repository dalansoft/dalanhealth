# DalanHealth — Architecture notes

## Queue engine (authoritative on backend)

```
clinic A, date 2026-05-20
┌─────────────────────────────────────────────┐
│ token  patient    source   status           │
│ 1      Shailesh   ONLINE   Consultation     │← top of active list
│ 2      Raj        OFFLINE  Queue            │← next active
│ 3      Saurabh    QR       Waiting          │
│ 4      Ramesh     OFFLINE  Waiting          │
└─────────────────────────────────────────────┘
```

When `complete-current` fires:
1. Top entry moves `Consultation → completed` (removed from active).
2. Wallet service deducts the plan rate (9rs+gst Starter / 9rs+gst Growth).
3. `_recompute_statuses` re-walks the active list: index 0 → Consultation, index 1 → Queue, rest → Waiting.
4. WebSocket broadcasts the new active list to every subscriber on `/ws/queue/{clinic_id}`.

The web `useQueue` Zustand store mirrors the same logic client-side for demo mode, so the UI animates correctly without a backend round-trip.

## Source merging

`enqueue()` receives a `QueueSource` of `OFFLINE | ONLINE | QR`. The token is `last_token + 1` regardless of source, so a clinic always sees one sequential list. Source is preserved only for analytics + badge rendering.

## Wallet model

`clinics.wallet_balance` is the live float balance. Every change is mirrored to `transactions` with `reason ∈ {recharge, consultation_deduction, refund, ...}` and the post-change `balance_after`. This gives you an auditable ledger.

Deduction is intentionally only triggered by `queue_service.complete_current()` — never on token creation or queue join.

## Cashback math

```
applicable = min(walletBalance, bookingFee * 0.5)
patient_pays = bookingFee - applicable
```

`POST /cashback/preview-use` returns both values so the patient sees the exact split before paying.

## Tenancy

Every patient, queue entry, invoice, prescription, transaction and notification carries a `clinic_id`. All clinic-scoped routes require `current_user.clinic_id` and filter on it — no cross-tenant data leakage possible without an explicit super-admin route.

## Realtime

A single `/ws/queue/{clinic_id}` socket per clinic context. Reception screens and patient apps both connect. Server pushes JSON `{type: 'queue_updated', entries: [...]}` on every mutation. Web clients will subscribe in a follow-up pass (the broadcast side is live).

## Folder conventions

- Backend `app/api/v1/<resource>.py` — thin route layer.
- Backend `app/services/<resource>_service.py` — business logic, all async.
- Backend `app/models/<resource>.py` — Pydantic schemas (some serve as both DB shape and request body for now).
- Web `src/pages/<role>/` — pages grouped by user role.
- Web `src/components/ui/` — reusable primitives.
- Web `src/components/layout/` — shells (public, auth, dashboard, mobile).
