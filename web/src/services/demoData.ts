import type { QueueEntry } from '@/store/queue';

export const demoQueue: QueueEntry[] = [
  { id: 'q1', token: 1, patientName: 'Shailesh Kumar', patientMobile: '+91 98765 43210', source: 'ONLINE', status: 'Consultation', joinedAt: '10:02 AM' },
  { id: 'q2', token: 2, patientName: 'Raj Verma', patientMobile: '+91 91234 56780', source: 'OFFLINE', status: 'Queue', joinedAt: '10:05 AM' },
  { id: 'q3', token: 3, patientName: 'Saurabh Singh', patientMobile: '+91 99887 12345', source: 'QR', status: 'Waiting', joinedAt: '10:11 AM' },
  { id: 'q4', token: 4, patientName: 'Ramesh Jha', patientMobile: '+91 90909 12121', source: 'OFFLINE', status: 'Waiting', joinedAt: '10:18 AM' },
  { id: 'q5', token: 5, patientName: 'Pooja Sharma', patientMobile: '+91 98700 33445', source: 'ONLINE', status: 'Waiting', joinedAt: '10:24 AM' },
  { id: 'q6', token: 6, patientName: 'Aman Kumar', patientMobile: '+91 99110 22334', source: 'QR', status: 'Waiting', joinedAt: '10:31 AM' },
];

export const demoClinic = {
  name: 'Sharma ENT Clinic',
  doctor: 'Dr. Anil Sharma',
  specialization: 'ENT Specialist',
  city: 'Patna, Bihar',
  walletBalance: 12540,
  todayRevenue: 8600,
  todayPatients: 24,
  followUps: 6,
  timing: '10 AM – 2 PM, 5 PM – 8 PM',
  bookingFee: 1,
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
