import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Phone, ShieldCheck, Stethoscope, Headset, AlertCircle } from 'lucide-react';
import { Card, CardTitle, CardSubtitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth, dashboardPathForRole, type Role } from '@/store/auth';
import { authApi } from '@/services/api';

const tabs: { id: Role; label: string; icon: React.ReactNode; method: 'otp' | 'password' }[] = [
  { id: 'patient', label: 'Patient', icon: <Phone size={14} />, method: 'otp' },
  { id: 'clinic_admin', label: 'Clinic', icon: <Stethoscope size={14} />, method: 'password' },
  { id: 'receptionist', label: 'Staff', icon: <Headset size={14} />, method: 'otp' },
  { id: 'super_admin', label: 'Admin', icon: <ShieldCheck size={14} />, method: 'password' },
];

export function LoginPage() {
  const [tab, setTab] = useState<Role>('clinic_admin');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'enter' | 'otp'>('enter');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demoHint, setDemoHint] = useState<string | null>(null);
  const navigate = useNavigate();
  const login = useAuth((s) => s.login);
  const method = tabs.find((t) => t.id === tab)!.method;

  // Real authentication against the live API. Demo browsing stays on /demo.
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (method === 'otp' && step === 'enter') {
        const sent = await authApi.sendOtp(mobile, tab);
        if (sent.demo_code) setDemoHint(sent.demo_code);
        setStep('otp');
        return;
      }
      const resp =
        method === 'otp'
          ? await authApi.verifyOtp(mobile, otp, tab)
          : await authApi.login(email, password, tab);
      login(
        {
          id: resp.user.id,
          name: resp.user.name,
          role: (resp.user.role as Role) ?? tab,
          mobile: resp.user.mobile ?? undefined,
          email: resp.user.email ?? undefined,
          clinicId: resp.user.clinic_id ?? undefined,
          clinicName: resp.user.clinic_name ?? undefined,
        },
        resp.access_token,
        false,
      );
      navigate(dashboardPathForRole(tab));
    } catch (err) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(detail ?? 'Could not reach the server — check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card padded={false} className="overflow-hidden">
      <div className="p-7 sm:p-8">
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardSubtitle>Sign in to continue to DalanHealth.</CardSubtitle>

        <div className="mt-6 grid grid-cols-4 rounded-xl bg-ink-100/70 dark:bg-ink-800/60 p-1 text-xs font-medium">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setStep('enter'); }}
              className={`inline-flex items-center justify-center gap-1.5 rounded-lg py-2 transition-all ${
                tab === t.id
                  ? 'bg-white dark:bg-ink-950 text-ink-900 dark:text-ink-50 shadow-sm'
                  : 'text-ink-500 dark:text-ink-400 hover:text-ink-900 dark:hover:text-ink-50'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="mt-6 space-y-4">
          {method === 'otp' ? (
            step === 'enter' ? (
              <Input
                label="Mobile number"
                placeholder="+91 98765 43210"
                leftIcon={<Phone size={14} />}
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                required
              />
            ) : (
              <Input
                label="OTP"
                placeholder="6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                hint={demoHint ? `Sent to ${mobile} · code: ${demoHint}` : `Sent to ${mobile || 'your number'}`}
                required
              />
            )
          ) : (
            <>
              <Input label="Email" type="email" placeholder="you@clinic.com" leftIcon={<Mail size={14} />} value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Input label="Password" type="password" placeholder="••••••••" leftIcon={<Lock size={14} />} value={password} onChange={(e) => setPassword(e.target.value)} required />
            </>
          )}

          {error && (
            <div className="rounded-xl border border-danger-500/40 bg-danger-500/5 px-3 py-2 text-xs text-danger-600 dark:text-danger-500 flex items-center gap-1.5">
              <AlertCircle size={12} className="shrink-0" /> {error}
            </div>
          )}

          <Button type="submit" size="lg" fullWidth loading={loading}>
            {method === 'otp' ? (step === 'enter' ? 'Send OTP' : 'Verify & sign in') : 'Sign in'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted">
          New to DalanHealth?{' '}
          <Link to="/signup" className="font-medium text-brand-600 dark:text-brand-300 hover:underline">Onboard your clinic</Link>
        </div>
      </div>

      <div className="border-t hairline bg-ink-50/60 dark:bg-ink-900/60 p-5 text-center text-xs text-muted">
        Want to look around without signing up? <Link to="/demo" className="font-medium text-brand-600 dark:text-brand-300 hover:underline">Try the live demo →</Link>
      </div>
    </Card>
  );
}
