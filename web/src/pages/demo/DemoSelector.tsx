import { useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Smartphone, ShieldCheck, Stethoscope, Headset, ArrowRight, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Logo } from '@/components/ui/Logo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useAuth, dashboardPathForRole, type Role } from '@/store/auth';

const demos: { role: Role; title: string; subtitle: string; mobile?: string; email?: string; preset: string; features: string[]; icon: any; tone: string; color: string; name: string }[] = [
  {
    role: 'patient',
    title: 'Patient app',
    subtitle: 'Mobile-first experience',
    mobile: '+91 98765 43210',
    preset: 'OTP: 123456',
    features: ['Doctor search', 'QR join queue', 'Live token tracking', '₹1 booking + cashback'],
    icon: Smartphone,
    tone: 'from-brand-500/20 to-brand-500/0',
    color: 'text-brand-600 dark:text-brand-300',
    name: 'Shailesh Kumar',
  },
  {
    role: 'super_admin',
    title: 'Super admin',
    subtitle: 'Company-wide control',
    email: 'admin@dalanhealth.demo',
    preset: 'Password: Dalan@123',
    features: ['Revenue analytics', 'Clinic monitoring', 'Cashback campaigns', 'Support tracking'],
    icon: ShieldCheck,
    tone: 'from-accent-500/20 to-accent-500/0',
    color: 'text-accent-600 dark:text-accent-300',
    name: 'Dalan Admin',
  },
  {
    role: 'clinic_admin',
    title: 'Clinic admin',
    subtitle: 'Doctor & owner view',
    email: 'doctor@dalanhealth.demo',
    preset: 'Password: Dalan@123',
    features: ['Queue management', 'Billing + prescription', 'Wallet & reports', 'Staff & QR'],
    icon: Stethoscope,
    tone: 'from-teal-500/20 to-teal-500/0',
    color: 'text-teal-600 dark:text-teal-400',
    name: 'Dr. Anil Sharma',
  },
  {
    role: 'receptionist',
    title: 'Receptionist',
    subtitle: 'Fastest workflow',
    mobile: '+91 91234 56780',
    preset: 'OTP: 123456',
    features: ['Add patient', 'Generate token', 'Billing & prescription', 'Queue control'],
    icon: Headset,
    tone: 'from-success-500/20 to-success-500/0',
    color: 'text-success-600 dark:text-success-500',
    name: 'Pooja Receptionist',
  },
];

export function DemoSelector() {
  const [params] = useSearchParams();
  const presetRole = params.get('role') as Role | null;
  const navigate = useNavigate();
  const login = useAuth((s) => s.login);

  const openDemo = (role: Role) => {
    const d = demos.find((x) => x.role === role)!;
    login(
      {
        id: `demo-${role}`,
        name: d.name,
        role,
        mobile: d.mobile,
        email: d.email,
        clinicName: role === 'patient' || role === 'super_admin' ? undefined : 'Sharma ENT Clinic',
      },
      'demo-token',
      true,
    );
    navigate(dashboardPathForRole(role));
  };

  useEffect(() => {
    if (presetRole && demos.some((d) => d.role === presetRole)) {
      openDemo(presetRole);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presetRole]);

  return (
    <div className="min-h-screen bg-mesh-light dark:bg-mesh-dark relative overflow-hidden">
      <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[520px] w-[820px] rounded-full bg-brand-500/20 blur-3xl" />

      <header className="relative z-10">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 h-16 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link to="/" className="text-sm font-medium text-ink-600 dark:text-ink-300 hover:text-brand-600 dark:hover:text-brand-300">← Back to home</Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-5 sm:px-8 py-12 md:py-20">
        <div className="text-center max-w-2xl mx-auto">
          <Badge tone="brand" icon={<Sparkles size={11} />}>One click. Real data. No signup.</Badge>
          <h1 className="mt-5 text-4xl sm:text-5xl font-semibold tracking-tight text-ink-900 dark:text-ink-50">Pick a perspective.</h1>
          <p className="mt-4 text-muted">Each demo opens a fully interactive dashboard with realistic clinic data. Switch any time.</p>
        </div>

        <div className="mt-12 grid sm:grid-cols-2 gap-5">
          {demos.map((d, i) => (
            <motion.div
              key={d.role}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Card hover className="relative overflow-hidden h-full">
                <div className={`absolute -right-16 -top-16 h-44 w-44 rounded-full bg-gradient-to-br ${d.tone} blur-2xl`} />
                <div className="relative flex flex-col h-full">
                  <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${d.tone} flex items-center justify-center ${d.color}`}>
                    <d.icon size={22} />
                  </div>
                  <div className="mt-5">
                    <div className="text-lg font-semibold text-ink-900 dark:text-ink-50">{d.title}</div>
                    <div className="text-sm text-muted">{d.subtitle}</div>
                  </div>
                  <ul className="mt-4 space-y-1.5 text-sm text-ink-600 dark:text-ink-300 flex-1">
                    {d.features.map((f) => <li key={f}>· {f}</li>)}
                  </ul>
                  <div className="mt-5 rounded-xl border hairline bg-ink-50/60 dark:bg-ink-900/40 p-3 text-xs">
                    <div className="text-muted">Pre-filled credentials</div>
                    <div className="font-mono text-ink-800 dark:text-ink-100">
                      {d.email ?? d.mobile}<br />
                      {d.preset}
                    </div>
                  </div>
                  <button
                    onClick={() => openDemo(d.role)}
                    className="mt-5 group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-brand-600 to-accent-500 text-white py-3 text-sm font-semibold shadow-glow hover:shadow-glowAccent transition-all"
                  >
                    Open demo
                    <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
