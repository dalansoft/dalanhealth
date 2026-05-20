import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Phone, ShieldCheck, Stethoscope, Headset } from 'lucide-react';
import { Card, CardTitle, CardSubtitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth, dashboardPathForRole, type Role } from '@/store/auth';

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
  const navigate = useNavigate();
  const login = useAuth((s) => s.login);
  const method = tabs.find((t) => t.id === tab)!.method;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    if (method === 'otp' && step === 'enter') {
      setStep('otp');
      setLoading(false);
      return;
    }
    const names: Record<Role, string> = {
      patient: 'Shailesh Kumar',
      clinic_admin: 'Dr. Anil Sharma',
      receptionist: 'Pooja Receptionist',
      super_admin: 'Dalan Admin',
    };
    login(
      {
        id: `u-${tab}`,
        name: names[tab],
        role: tab,
        mobile: mobile || undefined,
        email: email || undefined,
        clinicName: tab === 'patient' ? undefined : 'Sharma ENT Clinic',
      },
      'mock-jwt-token',
      false,
    );
    setLoading(false);
    navigate(dashboardPathForRole(tab));
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
                hint={`Sent to ${mobile || 'your number'} · Use 123456 in demo`}
                required
              />
            )
          ) : (
            <>
              <Input label="Email" type="email" placeholder="you@clinic.com" leftIcon={<Mail size={14} />} value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Input label="Password" type="password" placeholder="••••••••" leftIcon={<Lock size={14} />} value={password} onChange={(e) => setPassword(e.target.value)} required />
            </>
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
