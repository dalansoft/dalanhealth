# DalanHealth

> Hybrid clinic management + patient queue platform.
> A product of **Dalansoft Technologies Pvt Ltd**, built for Indian Tier-2/Tier-3 clinics.

DalanHealth merges **offline walk-ins**, **online bookings**, and **QR queue joins** into a single unified queue, with realtime token tracking, billing, prescription, wallet recharge and cashback rewards.

---

## Repository layout

```
DalanHealth(Final)/
├── web/         # React + Vite + TS + Tailwind + Framer Motion
│                # Landing site, auth, demo selector, super-admin / clinic / receptionist / patient dashboards
├── mobile/      # Expo + React Native + TS — patient mobile app
├── backend/     # FastAPI + MongoDB + WebSocket
└── README.md
```

Each folder is independent — no monorepo workspace tooling required.

---

## Quick start

### Web (clinic + receptionist + admin + patient browser)

```powershell
cd web
npm install
copy .env.example .env
npm run dev      # http://localhost:5173
```

Visit:
- `/` — landing site
- `/demo` — one-click into any of the 4 demo dashboards (no signup)
- `/login`, `/signup` — real authentication

### Backend (FastAPI)

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
# Ensure MongoDB is running locally (or set MONGODB_URI to your Atlas cluster)
uvicorn main:app --reload --port 8000
```

Open `http://localhost:8000/docs` for the auto-generated API reference.

### Mobile (Expo)

```powershell
cd mobile
npm install
npx expo start
```

Then press `a` for Android, `i` for iOS (Mac), or `w` for web preview.

---

## What ships in this build

### Web — complete and runnable
- **Design system**: Tailwind theme + tokens, light/dark mode with persisted preference, glassmorphism, gradient accents, premium shadows, Framer Motion animations, custom scrollbar.
- **UI primitives**: `Button`, `Card`, `Input`, `Badge`, `Modal`, `Skeleton`, `Avatar`, `Tooltip`, `StatCard`, `EmptyState`, `Section`, `SourceBadge`, `StatusPill`, `ThemeToggle`, `Logo`.
- **Layouts**: `PublicLayout`, `AuthLayout`, `DashboardShell` (collapsible sidebar + topbar), `MobileShell` (bottom-tab patient layout for the web preview).
- **Landing site (Part A)**: Hero with floating dashboard mockup, problem/solution storytelling, 12-feature grid, live-demo selector, screen showcase, pricing (Starter ₹999/yr + ₹9, Growth ₹12), FAQ accordion, CTA, footer.
- **Auth (Part B)**: Tabbed login (patient OTP, clinic email/password, staff OTP, super-admin), clinic signup with plan selector, one-click demo selector with pre-filled credentials.
- **Super admin dashboard**: Revenue cards, line + stacked bar charts, top-clinics table, clinics list with filtering, revenue area chart, scaffolded modules for wallet, plans, cashback, notifications, support, team, reports, system, settings.
- **Clinic admin dashboard**: KPI cards, quick actions, live queue snapshot, revenue line chart, full unified queue view with realtime status transitions (offline / online / QR badges, Consultation / Queue / Waiting pills), wallet recharge + ledger, clinic QR + patient preview.
- **Receptionist panel**: Fast-workflow dashboard, big quick-action tiles, add-patient flow (mobile lookup → returning vs new → token generation animation).
- **Patient web pages**: Home with active token card, doctor search, doctor profile, live token tracking screen (animated running token, status step indicator), cashback wallet, profile + history.
- **Billing**: Two-pane invoice editor + live invoice preview with print/PDF/WhatsApp actions, print-ready CSS.
- **Prescription**: Doctor-grade builder with medicines table, symptoms, diagnosis, tests, follow-up, print/PDF/WhatsApp.
- **Routing**: React Router with `ProtectedRoute` enforcing role-based access.

### Backend — runnable scaffold
- **FastAPI app** with CORS, lifespan-managed Mongo connection, `/health` endpoint.
- **Auth**: JWT (HS256), OTP send/verify (demo code `123456`), clinic signup with bcrypt-hashed passwords, `/me` endpoint, role enum.
- **Models**: `User`, `Clinic`, `Patient`, `QueueEntry`, `Transaction`, `Invoice`, `Prescription`, `Notification`, `CashbackCampaign` — Pydantic v2.
- **API routes** (`/api/v1`): `auth`, `clinics`, `patients`, `queue`, `billing`, `prescriptions`, `wallet`, `notifications`, `cashback`.
- **Services**:
  - `queue_service` — sequential token assignment, status recomputation (top = Consultation, next = Queue, rest = Waiting), advance, skip.
  - `wallet_service` — recharge, consultation deduction (only on completion), low-balance thresholds (₹1000 / ₹200).
  - `cashback_service` — earn by campaign, max 50% adjustment per booking, never withdrawable.
- **WebSocket**: `/ws/queue/{clinic_id}` broadcasts queue changes to subscribed clients in realtime.
- **Indexes** created on startup for users, clinics, patients, queue, bookings, transactions, notifications.

### Mobile — Expo scaffold
- **Routing**: `expo-router` with auth gate → tabs (`Home`, `Search`, `Queue`, `Wallet`, `Profile`) and a `doctor/[id]` modal route.
- **Theme**: light/dark aware tokens, spacing, radius, typography.
- **Screens**: OTP login (demo `123456`), home with active token card, doctor search, doctor profile, live queue, rewards wallet, profile + logout.
- **Components**: `Card`, `Button`, `TokenCard`, `LinearGradientLike` (a lightweight gradient stand-in until `expo-linear-gradient` is added).
- **Auth state** persisted via `AsyncStorage`.

---

## Honest status — complete vs. stubbed vs. left for later

| Area | Status |
|---|---|
| Design system (web) | ✅ Complete |
| Landing site | ✅ Complete |
| Login / signup / demo selector | ✅ Complete (mock auth wired; real backend ready) |
| Super-admin dashboard + clinics + revenue | ✅ Complete |
| Super-admin: wallet, plans, cashback, notifications, support, team, reports, system, settings | 🟡 Placeholder cards |
| Clinic dashboard + queue + wallet + QR | ✅ Complete |
| Clinic: patients, appointments, reports, staff, notifications, settings | 🟡 Placeholder cards |
| Receptionist dashboard + add-patient | ✅ Complete |
| Patient web (home, search, doctor profile, queue, wallet, profile) | ✅ Complete |
| Billing + prescription | ✅ Complete with print/share affordances |
| FastAPI backend (auth, queue, billing, prescription, wallet, cashback, notifications, WebSocket) | ✅ Routes + services implemented, runnable |
| Mobile patient app (Expo) | ✅ Scaffolded with auth, navigation, all 5 tabs + doctor profile |
| Wiring frontend → real backend (replace mock auth with API calls) | 🔴 Left for next session |
| Payments (Razorpay) | 🔴 Stubbed in env, not implemented |
| Notification dispatch (Firebase / WhatsApp / SMS) | 🔴 Models + endpoint exist; senders not implemented |
| WebSocket client subscription in web app | 🔴 Server is broadcasting; web client doesn't subscribe yet |
| Tests | 🔴 Not added |
| Azure deployment manifests | 🔴 Not added |

The mocked authentication uses local state with realistic demo data, so every dashboard works end-to-end without the backend running. As soon as you point `VITE_API_BASE_URL` at the FastAPI server and replace the mock login handlers with real `api.post('/auth/...')` calls, the UI is ready.

---

## Pricing model (built in)

| Plan | Yearly | Per visit | Notes |
|---|---|---|---|
| Starter | ₹999 | ₹9 | 2 staff, basic reports |
| Growth | — | ₹12 | Unlimited staff, WhatsApp+Push, advanced analytics |

| Patient action | Fee |
|---|---|
| App / home booking | ₹1 |
| QR join (same day) | Free |
| Offline walk-in | Free |

Wallet auto-deducts on **consultation complete** only. Low-balance warning at ₹1,000, critical at ₹200.

---

## Cashback rules (enforced server-side)

- Earn: `0.10` normal, `0.25` festival, `0.50` doctor promo, `1.00` first booking.
- Use: booking fee adjustment **only**. Max **50%** of the booking fee per use.
- Never withdrawable to bank / UPI.

---

## Tech stack

| Layer | Technology |
|---|---|
| Web | React 18, Vite, TypeScript, Tailwind CSS, Framer Motion, React Router, Zustand, React Query, recharts, lucide-react |
| Mobile | React Native (Expo SDK 51), TypeScript, expo-router, Zustand, AsyncStorage |
| Backend | FastAPI, Motor (async Mongo driver), Pydantic v2, python-jose (JWT), passlib (bcrypt) |
| Database | MongoDB |
| Realtime | WebSocket (native FastAPI) |
| Auth | JWT + OTP + RBAC |
| Notifications | Firebase / WhatsApp / SMS / Email fallback chain (interfaces ready) |
| Payments | Razorpay (interface ready) |
| Hosting | Azure App Service + Static Web App + Blob Storage |

---

## License

© Dalansoft Technologies Pvt Ltd. All rights reserved.
