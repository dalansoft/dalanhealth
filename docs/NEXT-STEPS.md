# Next steps

This codebase is a deep foundation. Priorities to get to a production MVP:

## 1. Wire web to the real backend (1–2 days)
- Replace mock `login` in `web/src/pages/auth/Login.tsx` / `Signup.tsx` with `api.post('/auth/...')`.
- Replace `demoData.ts` consumption in dashboards with React Query hooks (`useQuery` → `/api/v1/...`).
- Add a `services/` file per resource (`auth.service.ts`, `queue.service.ts`, etc.).

## 2. Subscribe the web app to the WebSocket (half day)
- In `clinic/ClinicQueue.tsx`, on mount open `new WebSocket(VITE_WS_URL + '/queue/' + clinicId)` and dispatch `queue_updated` into the Zustand store.
- Same for `patient/TokenTracking.tsx`.

## 3. Payments (Razorpay) (1 day)
- Backend: add `POST /api/v1/payments/order` to create a Razorpay order, `POST /payments/verify` to verify signature.
- Frontend: trigger Razorpay Checkout for ₹1 booking + wallet recharges.

## 4. Notification dispatch (2–3 days)
- Models + endpoint already exist (`POST /notifications/send`).
- Implement actual senders behind the `NotificationChannel` enum: Firebase Admin SDK (push), WhatsApp Cloud API, MSG91 (SMS), AWS SES (email).
- Add a worker queue (Celery or simple background tasks) for fallback chain.

## 5. Fill placeholder modules (1 week, parallelisable)
- Clinic: patients directory, appointments, reports, staff RBAC management, notification log, settings.
- Super admin: wallet ledger, plans editor, cashback campaign builder, notification monitoring, support inbox, team management, reports builder, system health, settings.

## 6. Testing (ongoing)
- Backend: `pytest` + `httpx.AsyncClient` for API tests, freeze the queue engine.
- Web: Vitest + React Testing Library for components, Playwright for golden-path E2E.

## 7. Mobile polish
- Swap `LinearGradientLike` for `expo-linear-gradient`.
- Add `react-native-svg` + a real QR scanner (`expo-barcode-scanner`).
- Wire real API + WebSocket.

## 8. Deployment
- Backend → Azure App Service (Python 3.11+, gunicorn/uvicorn workers).
- Web → Azure Static Web App (or Vercel).
- Mongo → Atlas.
- Realtime: same FastAPI process is fine until ~1k concurrent WS; if you need more, lift WS to a dedicated socket server.

## 9. Security pre-flight
- Rotate `JWT_SECRET` per environment.
- Add rate limiting (slowapi) on auth endpoints.
- Add request validation tests + audit log table.
- HTTPS enforced at the edge.
