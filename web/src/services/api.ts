import axios from 'axios';
import { useAuth } from '@/store/auth';

// VITE_API_BASE_URL overrides when set at build time; otherwise production
// builds default to the live Railway API and dev builds to localhost. The
// baked-in default exists because Vercel env-var plumbing (e.g. variables
// marked "Sensitive" are hidden from the build step) silently produced
// bundles that fell back to localhost.
const baseURL =
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.PROD
    ? 'https://dalanhealth.up.railway.app/api/v1'
    : 'http://localhost:8000/api/v1');

export const api = axios.create({ baseURL, timeout: 15000 });

api.interceptors.request.use((config) => {
  const token = useAuth.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error?.response?.status === 401) {
      useAuth.getState().logout();
    }
    return Promise.reject(error);
  },
);

/** WebSocket base — wss://…/ws in production unless overridden. */
export const wsBase =
  import.meta.env.VITE_WS_URL ??
  (import.meta.env.PROD
    ? 'wss://dalanhealth.up.railway.app/ws'
    : 'ws://localhost:8000/ws');

// ─── Typed endpoint helpers ────────────────────────────────────────────────
// Thin wrappers over the live FastAPI backend. Shapes mirror the API's
// snake_case responses; mapping to UI camelCase happens in services/liveQueue.

export interface ApiUser {
  id: string;
  name: string;
  role: string;
  mobile?: string | null;
  email?: string | null;
  clinic_id?: string | null;
  clinic_name?: string | null;
}

export interface ApiAuthResponse {
  access_token: string;
  token_type: string;
  user: ApiUser;
}

export interface ApiQueueEntry {
  id: string;
  token: number;
  patient_id: string;
  patient_name: string;
  patient_mobile: string;
  source: 'OFFLINE' | 'ONLINE' | 'QR';
  status: 'waiting' | 'queued' | 'in_consultation' | 'completed' | 'skipped' | 'cancelled';
  joined_at?: string | null;
  was_skipped?: boolean;
}

export interface ApiPatient {
  id: string;
  name: string;
  mobile: string;
  age?: number | null;
  gender?: string | null;
}

export const authApi = {
  sendOtp: (mobile: string, role = 'patient') =>
    api.post<{ ok: boolean; demo_code?: string | null }>('/auth/otp/send', { mobile, role }).then((r) => r.data),
  verifyOtp: (mobile: string, otp: string, role = 'patient', name?: string) =>
    api.post<ApiAuthResponse>('/auth/otp/verify', { mobile, otp, role, name }).then((r) => r.data),
  login: (email: string, password: string, role: string) =>
    api.post<ApiAuthResponse>('/auth/login', { email, password, role }).then((r) => r.data),
  signupClinic: (input: {
    doctor_name: string;
    clinic_name: string;
    mobile: string;
    email: string;
    password: string;
    city?: string;
    specialization?: string;
    plan?: string;
  }) => api.post<ApiAuthResponse>('/auth/signup/clinic', input).then((r) => r.data),
  me: () => api.get<ApiUser>('/auth/me').then((r) => r.data),
};

export const queueApi = {
  list: () => api.get<ApiQueueEntry[]>('/queue/').then((r) => r.data),
  enqueue: (input: { patient_id: string; patient_name: string; patient_mobile: string; source: string }) =>
    api.post<ApiQueueEntry>('/queue/enqueue', input).then((r) => r.data),
  completeCurrent: () =>
    api.post<{ completed: ApiQueueEntry | null; entries: ApiQueueEntry[] }>('/queue/complete-current').then((r) => r.data),
  skipCurrent: () =>
    api.post<{ skipped: ApiQueueEntry | null; entries: ApiQueueEntry[] }>('/queue/skip-current').then((r) => r.data),
  callBack: (entryId: string) =>
    api.post<{ called_back: ApiQueueEntry; entries: ApiQueueEntry[] }>(`/queue/call-back/${entryId}`).then((r) => r.data),
};

export const patientsApi = {
  lookup: (mobile: string) =>
    api.get<{ found: boolean; patient?: ApiPatient }>('/patients/lookup', { params: { mobile } }).then((r) => r.data),
  create: (input: { name: string; mobile: string; age?: number; gender?: string; address?: string; email?: string }) =>
    api.post<ApiPatient>('/patients/', input).then((r) => r.data),
};
