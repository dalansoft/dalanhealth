import type { QueueEntry, QueueSource } from '@/store/queue';

// --- 30-patient demo queue -------------------------------------------------
// Realistic Hindi-belt names with a mix of sources (offline majority,
// online ~30%, QR ~20%) and joined-at timestamps spread across the doctor's
// morning + early-afternoon session. Status is intentionally set to the
// initial state — the queue store re-derives Consultation / Queue / Waiting
// based on token order when setEntries() is called.

const _patients: Array<[name: string, mobile: string, source: QueueSource, joined: string]> = [
  ['Shailesh Kumar',    '+91 98765 43210', 'ONLINE',  '09:42 AM'],
  ['Raj Verma',         '+91 91234 56780', 'OFFLINE', '09:55 AM'],
  ['Saurabh Singh',     '+91 99887 12345', 'QR',      '10:05 AM'],
  ['Pooja Sharma',      '+91 98700 33445', 'ONLINE',  '10:11 AM'],
  ['Ramesh Jha',        '+91 90909 12121', 'OFFLINE', '10:18 AM'],
  ['Aman Kumar',        '+91 99110 22334', 'QR',      '10:24 AM'],
  ['Anjali Devi',       '+91 91100 33455', 'OFFLINE', '10:31 AM'],
  ['Manoj Yadav',       '+91 98345 11220', 'OFFLINE', '10:38 AM'],
  ['Pinky Kumari',      '+91 92110 88775', 'ONLINE',  '10:45 AM'],
  ['Vikas Sah',         '+91 99887 30021', 'OFFLINE', '10:52 AM'],
  ['Sumit Roy',         '+91 90065 12339', 'QR',      '10:59 AM'],
  ['Neha Singh',        '+91 98800 11223', 'ONLINE',  '11:06 AM'],
  ['Aditya Mishra',     '+91 98445 67712', 'OFFLINE', '11:13 AM'],
  ['Sunita Devi',       '+91 99775 23310', 'OFFLINE', '11:20 AM'],
  ['Rohit Paswan',      '+91 90123 44559', 'QR',      '11:27 AM'],
  ['Priya Choudhary',   '+91 92250 77881', 'ONLINE',  '11:34 AM'],
  ['Deepak Tiwari',     '+91 98221 56678', 'OFFLINE', '11:41 AM'],
  ['Kavita Singh',      '+91 99220 81134', 'OFFLINE', '11:48 AM'],
  ['Arjun Pandey',      '+91 90011 67723', 'ONLINE',  '11:55 AM'],
  ['Babita Kumari',     '+91 98889 12245', 'OFFLINE', '12:02 PM'],
  ['Naresh Gupta',      '+91 99001 22778', 'QR',      '12:09 PM'],
  ['Reshma Khatun',     '+91 92345 11876', 'OFFLINE', '12:16 PM'],
  ['Sanjay Mahto',      '+91 98778 33442', 'OFFLINE', '12:23 PM'],
  ['Geeta Devi',        '+91 99650 88712', 'OFFLINE', '12:30 PM'],
  ['Rakesh Thakur',     '+91 98012 56641', 'ONLINE',  '12:37 PM'],
  ['Mamta Sinha',       '+91 92208 11098', 'OFFLINE', '12:44 PM'],
  ['Bipin Ranjan',      '+91 98556 71223', 'QR',      '12:51 PM'],
  ['Shweta Verma',      '+91 99440 33871', 'ONLINE',  '12:58 PM'],
  ['Ankit Raj',         '+91 90112 67782', 'OFFLINE', '01:05 PM'],
  ['Kiran Bala',        '+91 98330 21109', 'QR',      '01:12 PM'],
];

export const demoQueue: QueueEntry[] = _patients.map(([name, mobile, source, joined], i) => ({
  id: `q${i + 1}`,
  token: i + 1,
  patientName: name,
  patientMobile: mobile,
  source,
  status: 'Waiting', // recomputed by useQueue.setEntries()
  joinedAt: joined,
}));

export const demoClinic = {
  name: 'Sharma ENT Clinic',
  doctor: 'Dr. Anil Sharma',
  specialization: 'ENT Specialist',
  city: 'Patna, India',
  walletBalance: 12540,
  todayRevenue: 8600,
  todayPatients: 24,
  followUps: 6,
  timing: '10 AM – 2 PM, 5 PM – 8 PM',
  bookingFee: 1,
};

// --- Per-branch overlays ---------------------------------------------------
// Each branch in the BranchSwitcher has its own queue length, wallet balance,
// daily stats, and (sometimes) a different on-duty doctor. The ClinicDashboard
// and TvDisplay read from `branchData[currentBranchId]` so switching branches
// swaps the whole dashboard context.

const _branchQueueSlice = (start: number, count: number): QueueEntry[] => {
  // Re-tokenise a slice so tokens always begin at #1 for each branch.
  return demoQueue.slice(start, start + count).map((e, i) => ({
    ...e,
    id: `${e.id}-${i}`,
    token: i + 1,
  }));
};

export interface BranchData {
  doctor: string;
  specialization: string;
  city: string;
  timing: string;
  queue: QueueEntry[];
  walletBalance: number;
  todayRevenue: number;
  todayPatients: number;
  completedToday: number;
}

export const branchData: Record<string, BranchData> = {
  b1: {
    doctor: 'Dr. Anil Sharma',
    specialization: 'ENT Specialist',
    city: 'Boring Road, Patna',
    timing: '10 AM – 2 PM, 5 PM – 8 PM',
    queue: _branchQueueSlice(0, 30),
    walletBalance: 12540,
    todayRevenue: 8600,
    todayPatients: 24,
    completedToday: 25,
  },
  b2: {
    doctor: 'Dr. Anil Sharma',
    specialization: 'ENT Specialist',
    city: 'Kankarbagh, Patna',
    timing: '11 AM – 1 PM, 6 PM – 9 PM',
    queue: _branchQueueSlice(5, 15),
    walletBalance: 7820,
    todayRevenue: 4180,
    todayPatients: 14,
    completedToday: 12,
  },
  b3: {
    doctor: 'Dr. Priyanka Sharma',
    specialization: 'ENT Specialist',
    city: 'Civil Lines, Gaya',
    timing: '10 AM – 1 PM',
    queue: _branchQueueSlice(12, 8),
    walletBalance: 3240,
    todayRevenue: 2160,
    todayPatients: 9,
    completedToday: 7,
  },
};

/**
 * Look up branch data. For demo-seeded branches (b1/b2/b3) returns the rich
 * pre-populated data. For dynamically-added branches (via "Add new branch"),
 * returns a clean zero state using the branch's metadata so the dashboard
 * renders without bleeding data from another branch.
 */
// Cache derived results so the SAME inputs return the SAME object reference.
// Returning a fresh object on every call makes effects that depend on it loop
// forever (React error #185) — caching keeps referential stability.
const branchDataCache = new Map<string, BranchData>();

export const getBranchData = (
  branchId: string | undefined,
  branchMeta?: { name?: string; city?: string; doctors?: string[] },
): BranchData => {
  // Doctors assigned to the branch (in the branch store) win over any seeded
  // demo doctor, so the name you set on the branch is the one that shows.
  const assigned = branchMeta?.doctors?.map((d) => d.trim()).filter(Boolean) ?? [];
  const cacheKey = `${branchId ?? ''}|${branchMeta?.city ?? ''}|${assigned.join(',')}`;
  const cached = branchDataCache.get(cacheKey);
  if (cached) return cached;

  const base: BranchData = (branchId && branchData[branchId]) ? branchData[branchId] : {
    doctor: 'Doctor not assigned',
    specialization: 'Add a specialization',
    city: branchMeta?.city ?? 'City',
    timing: 'Hours not set',
    queue: [],
    walletBalance: 0,
    todayRevenue: 0,
    todayPatients: 0,
    completedToday: 0,
  };
  const result = assigned.length ? { ...base, doctor: assigned.join(', ') } : base;
  branchDataCache.set(cacheKey, result);
  return result;
};

export const demoPatient = {
  name: 'Shailesh Kumar',
  mobile: '+91 98765 43210',
  age: 28,
  gender: 'Male',
  walletBalance: 2.8,
  currentToken: 18,
  runningToken: 12,
  approxWaitMin: 38,
  doctorSittingTill: '2 PM',
  expectedConsultation: '1:10 PM',
  clinic: 'Sharma ENT Clinic',
  doctor: 'Dr. Anil Sharma',
};

export const demoSuperAdmin = {
  totalClinics: 124,
  activeClinics: 102,
  starterClinics: 78,
  growthClinics: 46,
  monthlyRevenue: 1842000,
  todayRevenue: 61000,
  walletRechargeMtd: 980000,
  notificationsSent: 184320,
  pendingIssues: 4,
  patientCount: 38240,
};

export const demoRevenueSeries = [
  { m: 'Nov', revenue: 1140000, recharge: 720000 },
  { m: 'Dec', revenue: 1350000, recharge: 820000 },
  { m: 'Jan', revenue: 1480000, recharge: 870000 },
  { m: 'Feb', revenue: 1610000, recharge: 910000 },
  { m: 'Mar', revenue: 1742000, recharge: 950000 },
  { m: 'Apr', revenue: 1842000, recharge: 980000 },
];

export const demoQueueTrend = [
  { d: 'Mon', online: 12, offline: 22, qr: 9 },
  { d: 'Tue', online: 14, offline: 28, qr: 11 },
  { d: 'Wed', online: 16, offline: 24, qr: 13 },
  { d: 'Thu', online: 18, offline: 30, qr: 14 },
  { d: 'Fri', online: 22, offline: 34, qr: 18 },
  { d: 'Sat', online: 30, offline: 40, qr: 24 },
  { d: 'Sun', online: 9, offline: 14, qr: 6 },
];

export const demoDoctors = [
  { id: 'd1', name: 'Dr. Anil Sharma', specialization: 'ENT', clinic: 'Sharma ENT Clinic', city: 'Patna', timing: '10 AM – 2 PM', currentToken: 12, approxWait: 38, fee: 300 },
  { id: 'd2', name: 'Dr. Priya Gupta', specialization: 'Pediatrics', clinic: 'Gupta Child Care', city: 'Patna', timing: '5 PM – 8 PM', currentToken: 4, approxWait: 18, fee: 250 },
  { id: 'd3', name: 'Dr. Ravi Kumar', specialization: 'General Physician', clinic: 'Kumar Polyclinic', city: 'Muzaffarpur', timing: '11 AM – 3 PM', currentToken: 9, approxWait: 28, fee: 200 },
  { id: 'd4', name: 'Dr. Neha Singh', specialization: 'Dermatology', clinic: 'Skin & Smile', city: 'Gaya', timing: '12 PM – 4 PM', currentToken: 6, approxWait: 22, fee: 350 },
];

export const demoBookings = [
  { id: 'b1', date: '12 Jan', clinic: 'Sharma ENT Clinic', doctor: 'Dr. Anil Sharma', status: 'Completed' as const, token: 14 },
  { id: 'b2', date: '16 Jan', clinic: 'Gupta Child Care', doctor: 'Dr. Priya Gupta', status: 'Cancelled' as const, token: 22 },
  { id: 'b3', date: 'Today', clinic: 'Sharma ENT Clinic', doctor: 'Dr. Anil Sharma', status: 'Upcoming' as const, token: 18 },
];

export const demoClinics = [
  { id: 'c1', name: 'Sharma ENT Clinic', city: 'Patna', plan: 'Growth', wallet: 12540, patientsToday: 24, status: 'Active' },
  { id: 'c2', name: 'Gupta Child Care', city: 'Patna', plan: 'Starter', wallet: 4120, patientsToday: 16, status: 'Active' },
  { id: 'c3', name: 'Kumar Polyclinic', city: 'Muzaffarpur', plan: 'Growth', wallet: 980, patientsToday: 11, status: 'Low Wallet' },
  { id: 'c4', name: 'Skin & Smile', city: 'Gaya', plan: 'Starter', wallet: 6320, patientsToday: 9, status: 'Active' },
  { id: 'c5', name: 'Jha Eye Hospital', city: 'Darbhanga', plan: 'Growth', wallet: 18420, patientsToday: 31, status: 'Active' },
];

// --- Clinic-side demo data -------------------------------------------------

export type PatientStatus = 'Active' | 'Follow-up due' | 'New';

export const demoPatients = [
  { id: 'p1', name: 'Shailesh Kumar', mobile: '+91 98765 43210', age: 28, gender: 'Male', visits: 6, lastVisit: '12 Jan', status: 'Follow-up due' as PatientStatus, lastDx: 'Acute pharyngitis' },
  { id: 'p2', name: 'Raj Verma', mobile: '+91 91234 56780', age: 34, gender: 'Male', visits: 2, lastVisit: '8 Jan', status: 'Active' as PatientStatus, lastDx: 'Otitis media' },
  { id: 'p3', name: 'Saurabh Singh', mobile: '+91 99887 12345', age: 41, gender: 'Male', visits: 11, lastVisit: 'Today', status: 'Active' as PatientStatus, lastDx: 'Allergic rhinitis' },
  { id: 'p4', name: 'Pooja Sharma', mobile: '+91 98700 33445', age: 27, gender: 'Female', visits: 4, lastVisit: '20 Dec', status: 'Follow-up due' as PatientStatus, lastDx: 'Tonsillitis' },
  { id: 'p5', name: 'Ramesh Jha', mobile: '+91 90909 12121', age: 52, gender: 'Male', visits: 1, lastVisit: 'Today', status: 'New' as PatientStatus, lastDx: 'Hearing loss eval' },
  { id: 'p6', name: 'Neha Singh', mobile: '+91 98800 11223', age: 38, gender: 'Female', visits: 3, lastVisit: '2 Jan', status: 'Active' as PatientStatus, lastDx: 'Sinusitis' },
  { id: 'p7', name: 'Aman Kumar', mobile: '+91 99110 22334', age: 19, gender: 'Male', visits: 0, lastVisit: '—', status: 'New' as PatientStatus, lastDx: '—' },
  { id: 'p8', name: 'Anjali Devi', mobile: '+91 91100 33455', age: 64, gender: 'Female', visits: 9, lastVisit: '5 Jan', status: 'Follow-up due' as PatientStatus, lastDx: 'Vertigo' },
];

export const demoAppointments = [
  { id: 'a1', patient: 'Shailesh Kumar', mobile: '+91 98765 43210', when: 'Today · 10:30 AM', source: 'ONLINE' as const, fee: 1, status: 'Upcoming' },
  { id: 'a2', patient: 'Pooja Sharma', mobile: '+91 98700 33445', when: 'Today · 11:00 AM', source: 'ONLINE' as const, fee: 1, status: 'Confirmed' },
  { id: 'a3', patient: 'Saurabh Singh', mobile: '+91 99887 12345', when: 'Today · 11:30 AM', source: 'QR' as const, fee: 0, status: 'Confirmed' },
  { id: 'a4', patient: 'Anjali Devi', mobile: '+91 91100 33455', when: 'Tomorrow · 10:00 AM', source: 'ONLINE' as const, fee: 1, status: 'Upcoming' },
  { id: 'a5', patient: 'Neha Singh', mobile: '+91 98800 11223', when: 'Tomorrow · 6:15 PM', source: 'ONLINE' as const, fee: 1, status: 'Upcoming' },
  { id: 'a6', patient: 'Raj Verma', mobile: '+91 91234 56780', when: '23 May · 5:30 PM', source: 'ONLINE' as const, fee: 1, status: 'Upcoming' },
];

export const demoStaff = [
  { id: 's1', name: 'Pooja Receptionist', role: 'Receptionist', mobile: '+91 91234 56780', status: 'Active', addedOn: '4 Jan' },
  { id: 's2', name: 'Vikas Compounder', role: 'Compounder', mobile: '+91 99887 71122', status: 'Active', addedOn: '12 Jan' },
  { id: 's3', name: 'Asha Helper', role: 'Billing Staff', mobile: '+91 90901 22334', status: 'Invited', addedOn: '18 May' },
];

export const demoClinicNotifications = [
  { id: 'n1', time: '12:42 PM', channel: 'Push', recipient: 'Shailesh Kumar', event: 'queue_near', body: 'Your turn is next. Please stay nearby.', status: 'Delivered' },
  { id: 'n2', time: '12:30 PM', channel: 'WhatsApp', recipient: 'Pooja Sharma', event: 'booking_created', body: 'Token #18 booked at Sharma ENT for today 10:30 AM.', status: 'Delivered' },
  { id: 'n3', time: '12:18 PM', channel: 'SMS', recipient: 'Saurabh Singh', event: 'consultation_ready', body: 'It is your turn now. Please proceed to doctor room.', status: 'Delivered' },
  { id: 'n4', time: '11:54 AM', channel: 'Push', recipient: 'Raj Verma', event: 'visit_completed', body: 'Thank you for visiting. Get well soon.', status: 'Delivered' },
  { id: 'n5', time: '11:20 AM', channel: 'WhatsApp', recipient: 'Ramesh Jha', event: 'follow_up', body: 'Your follow-up visit is due. Please book appointment.', status: 'Failed' },
  { id: 'n6', time: 'Yesterday', channel: 'Email', recipient: 'Dr. Anil Sharma', event: 'wallet_low', body: 'Wallet balance ₹840 — please recharge.', status: 'Delivered' },
];

export const demoSourceMix = [
  { name: 'Offline', value: 56, color: '#0ea5e9' },
  { name: 'Online', value: 28, color: '#3b82f6' },
  { name: 'QR', value: 16, color: '#0ea5e9' },
];

export const demoFunnelWeek = [
  { d: 'Mon', visits: 43, followups: 12 },
  { d: 'Tue', visits: 53, followups: 14 },
  { d: 'Wed', visits: 51, followups: 18 },
  { d: 'Thu', visits: 62, followups: 22 },
  { d: 'Fri', visits: 74, followups: 28 },
  { d: 'Sat', visits: 94, followups: 41 },
  { d: 'Sun', visits: 29, followups: 9 },
];

// --- Super admin demo data -------------------------------------------------

export const demoAllRecharges = [
  { id: 'r1', clinic: 'Sharma ENT Clinic', amount: 5000, method: 'UPI', when: 'Today, 12:42 PM', status: 'Success' },
  { id: 'r2', clinic: 'Jha Eye Hospital', amount: 10000, method: 'NetBanking', when: 'Today, 11:30 AM', status: 'Success' },
  { id: 'r3', clinic: 'Gupta Child Care', amount: 3000, method: 'UPI', when: 'Today, 10:14 AM', status: 'Success' },
  { id: 'r4', clinic: 'Kumar Polyclinic', amount: 1500, method: 'Card', when: 'Yesterday', status: 'Failed' },
  { id: 'r5', clinic: 'Skin & Smile', amount: 4000, method: 'UPI', when: 'Yesterday', status: 'Success' },
];

export const demoCashbackCampaigns = [
  { id: 'cb1', name: 'Welcome Reward', type: 'first_booking', amount: 1.0, scope: 'All patients', active: true, claimed: 1820 },
  { id: 'cb2', name: 'Holi Special', type: 'festival', amount: 0.25, scope: 'All clinics', active: true, claimed: 642 },
  { id: 'cb3', name: 'Chhath Pooja', type: 'festival', amount: 0.25, scope: 'Regional clinics', active: false, claimed: 510 },
  { id: 'cb4', name: 'Dr. Sharma Boost', type: 'doctor_promo', amount: 0.50, scope: 'Sharma ENT', active: true, claimed: 88 },
  { id: 'cb5', name: 'Default', type: 'normal', amount: 0.10, scope: 'All bookings', active: true, claimed: 14820 },
];

export const demoAdminNotifications = [
  { id: 'an1', time: 'Today, 12:42', channel: 'Push', recipient: '198 patients', event: 'queue_near', delivered: 196, failed: 2 },
  { id: 'an2', time: 'Today, 12:30', channel: 'WhatsApp', recipient: '74 patients', event: 'booking_created', delivered: 73, failed: 1 },
  { id: 'an3', time: 'Today, 12:00', channel: 'SMS', recipient: '88 patients', event: 'consultation_ready', delivered: 86, failed: 2 },
  { id: 'an4', time: 'Today, 11:18', channel: 'Email', recipient: '12 clinics', event: 'wallet_low', delivered: 12, failed: 0 },
];

export const demoSupport = [
  { id: 't1', clinic: 'Kumar Polyclinic', subject: 'Cannot recharge wallet via UPI', priority: 'High', status: 'Open', when: '14 min ago', assignee: 'Vikram' },
  { id: 't2', clinic: 'Gupta Child Care', subject: 'Patient app stuck on OTP screen', priority: 'Medium', status: 'In progress', when: '1 hr ago', assignee: 'Riya' },
  { id: 't3', clinic: 'Sharma ENT Clinic', subject: 'Print prescription not working', priority: 'Low', status: 'Open', when: '3 hr ago', assignee: '—' },
  { id: 't4', clinic: 'Skin & Smile', subject: 'Need additional staff seats', priority: 'Low', status: 'Resolved', when: 'Yesterday', assignee: 'Vikram' },
];

export const demoCompanyAdmins = [
  { id: 'ca1', name: 'Shailesh Kumar', email: 'shailesh@dalansoft.com', role: 'Owner', lastSeen: 'just now' },
  { id: 'ca2', name: 'Vikram Rao', email: 'vikram@dalansoft.com', role: 'Support Admin', lastSeen: '2 min ago' },
  { id: 'ca3', name: 'Riya Mehta', email: 'riya@dalansoft.com', role: 'Sales Admin', lastSeen: '15 min ago' },
  { id: 'ca4', name: 'Anjali Pandey', email: 'anjali@dalansoft.com', role: 'Finance Admin', lastSeen: '3 hr ago' },
  { id: 'ca5', name: 'Karan Iyer', email: 'karan@dalansoft.com', role: 'Technical Admin', lastSeen: 'Yesterday' },
];

export const demoSystemHealth = {
  apiLatencyMs: 124,
  apiUptime: 99.98,
  wsConnections: 312,
  dbWriteOpsPerSec: 84,
  notifBacklog: 4,
  errorRate: 0.03,
  services: [
    { name: 'API', status: 'Operational', latency: 124 },
    { name: 'WebSocket', status: 'Operational', latency: 38 },
    { name: 'MongoDB', status: 'Operational', latency: 12 },
    { name: 'Notifications', status: 'Degraded', latency: 940 },
    { name: 'Razorpay', status: 'Operational', latency: 220 },
  ],
};
