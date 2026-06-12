import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Check, AlertCircle } from 'lucide-react';
import { Card, CardSubtitle, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/store/auth';
import { authApi } from '@/services/api';
import { cn } from '@/lib/cn';

type Plan = 'starter' | 'growth';

const plans: Record<Plan, { title: string; price: string; period: string; perks: string[] }> = {
  starter: { title: 'Starter', price: '₹15', period: '/visit', perks: ['Unified queue', 'Billing', '2 staff'] },
  growth: { title: 'Growth', price: '₹15', period: '/visit', perks: ['Unlimited staff', 'Analytics', 'WhatsApp + Push'] },
};

export function SignupPage() {
  const [doctor, setDoctor] = useState('');
  const [clinic, setClinic] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [spec, setSpec] = useState('');
  const [password, setPassword] = useState('');
  const [plan, setPlan] = useState<Plan>('growth');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const login = useAuth((s) => s.login);

  // Creates a REAL clinic account on the live API (Postgres-backed).
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const resp = await authApi.signupClinic({
        doctor_name: doctor,
        clinic_name: clinic,
        mobile,
        email,
        password,
        city: city || undefined,
        specialization: spec || undefined,
        plan,
      });
      login(
        {
          id: resp.user.id,
          name: resp.user.name,
          role: 'clinic_admin',
          email: resp.user.email ?? email,
          mobile,
          clinicId: resp.user.clinic_id ?? undefined,
          clinicName: resp.user.clinic_name ?? clinic,
        },
        resp.access_token,
        false,
      );
      navigate('/clinic');
    } catch (err) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(detail ?? 'Could not reach the server — check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card padded={false} className="overflow-hidden w-full max-w-3xl">
      <div className="grid md:grid-cols-5">
        <div className="md:col-span-3 p-7 sm:p-8">
          <Badge tone="brand" icon={<Sparkles size={11} />}>Onboard your clinic</Badge>
          <CardTitle className="mt-4 text-2xl">Let's set up your clinic.</CardTitle>
          <CardSubtitle>Takes about 90 seconds. You can edit anything later.</CardSubtitle>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Doctor name" placeholder="Dr. Anil Sharma" value={doctor} onChange={(e) => setDoctor(e.target.value)} required />
              <Input label="Clinic name" placeholder="Sharma ENT Clinic" value={clinic} onChange={(e) => setClinic(e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Mobile" placeholder="+91 98765 43210" value={mobile} onChange={(e) => setMobile(e.target.value)} required />
              <Input label="Email" type="email" placeholder="you@clinic.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="City" placeholder="Patna" value={city} onChange={(e) => setCity(e.target.value)} />
              <Input label="Specialization" placeholder="ENT, Pediatrics…" value={spec} onChange={(e) => setSpec(e.target.value)} />
            </div>
            <Input label="Password" type="password" placeholder="At least 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} required />

            {error && (
              <div className="rounded-xl border border-danger-500/40 bg-danger-500/5 px-3 py-2 text-xs text-danger-600 dark:text-danger-500 flex items-center gap-1.5">
                <AlertCircle size={12} className="shrink-0" /> {error}
              </div>
            )}

            <Button type="submit" size="lg" fullWidth loading={loading}>Create clinic account</Button>
          </form>
          <div className="mt-5 text-center text-sm text-muted">
            Already on DalanHealth? <Link to="/login" className="font-medium text-brand-600 dark:text-brand-300 hover:underline">Sign in</Link>
          </div>
        </div>

        <div className="md:col-span-2 border-t md:border-t-0 md:border-l hairline bg-gradient-to-br from-brand-500/8 to-accent-500/8 p-7 sm:p-8">
          <div className="text-xs font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-300">Choose your plan</div>
          <div className="mt-3 space-y-3">
            {(['starter', 'growth'] as Plan[]).map((id) => {
              const p = plans[id];
              const active = plan === id;
              return (
                <motion.button
                  type="button"
                  key={id}
                  onClick={() => setPlan(id)}
                  whileHover={{ y: -2 }}
                  className={cn(
                    'w-full text-left rounded-2xl p-4 border transition-all',
                    active
                      ? 'border-brand-500/60 bg-white dark:bg-ink-900 shadow-glow'
                      : 'hairline bg-white/70 dark:bg-ink-900/70 hover:border-brand-400/50',
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-ink-900 dark:text-ink-50">{p.title}</div>
                    {active && <Badge tone="brand" size="sm" icon={<Check size={10} />}>Selected</Badge>}
                  </div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-2xl font-semibold text-ink-900 dark:text-ink-50">{p.price}</span>
                    <span className="text-xs text-muted">{p.period}</span>
                  </div>
                  <ul className="mt-2 space-y-1">
                    {p.perks.map((perk) => (
                      <li key={perk} className="flex items-center gap-1.5 text-xs text-muted"><Check size={11} className="text-success-500" /> {perk}</li>
                    ))}
                  </ul>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
}
