import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Phone, User, Ticket, Loader2, CheckCircle2, AlertCircle, Navigation, Stethoscope } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { useBranch } from '@/store/branch';
import { useQueue } from '@/store/queue';
import { getBranchData } from '@/services/demoData';
import { distanceMeters, GEOFENCE_METRES, fmtDistance } from '@/lib/geo';

type GeoState = 'checking' | 'inside' | 'outside' | 'denied' | 'nocoords';

/**
 * Public patient self-booking page reached by scanning a clinic/branch QR
 * (/book?b=<branchId>). No login: enter name + mobile → token. Booking is
 * gated to within ~100 m of the clinic (geofence) so only people actually at
 * the clinic can take a token. Payment is collected by the compounder on site.
 */
export function PatientBook() {
  const [params] = useSearchParams();
  const branches = useBranch((s) => s.branches);
  const entries = useQueue((s) => s.entries);
  const addEntry = useQueue((s) => s.addEntry);

  const branchId = params.get('b') ?? params.get('branch');
  const branch = useMemo(() => branches.find((b) => b.id === branchId) ?? branches[0], [branches, branchId]);
  const data = getBranchData(branch?.id, branch);

  const [geo, setGeo] = useState<GeoState>('checking');
  const [dist, setDist] = useState<number | null>(null);
  const [override, setOverride] = useState(false); // demo: skip geofence

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [token, setToken] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Geofence check on load.
  useEffect(() => {
    if (branch?.lat == null || branch?.lng == null) { setGeo('nocoords'); return; }
    if (typeof navigator === 'undefined' || !navigator.geolocation) { setGeo('denied'); return; }
    setGeo('checking');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const d = distanceMeters({ lat: pos.coords.latitude, lng: pos.coords.longitude }, { lat: branch.lat!, lng: branch.lng! });
        setDist(d);
        setGeo(d <= GEOFENCE_METRES ? 'inside' : 'outside');
      },
      () => setGeo('denied'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
    );
  }, [branch?.id, branch?.lat, branch?.lng]);

  const canBook = geo === 'inside' || geo === 'nocoords' || override;
  const canSubmit = name.trim().length > 0 && mobile.replace(/\D/g, '').length === 10;

  const book = () => {
    if (!name.trim()) { setError('Please enter your name'); return; }
    if (mobile.replace(/\D/g, '').length !== 10) { setError('Enter a valid 10-digit mobile'); return; }
    const t = entries.reduce((m, e) => Math.max(m, e.token), 0) + 1;
    addEntry({
      id: `q-${Date.now()}`,
      token: t,
      patientName: name.trim(),
      patientMobile: `+91 ${mobile.replace(/\D/g, '').slice(0, 10)}`,
      source: 'QR',
      status: 'Waiting',
      joinedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    setToken(t);
  };

  const current = entries[0];
  const aheadOfToken = token != null ? entries.filter((e) => e.token < token).length : entries.length;
  const waitMin = Math.max(0, aheadOfToken) * 12;

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-500/10 via-white to-white dark:from-brand-500/10 dark:via-ink-950 dark:to-ink-950 flex flex-col items-center px-4 py-6">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-4"><Logo size="md" asLink={false} /></div>

        {/* Clinic / branch details */}
        <div className="rounded-3xl border hairline bg-white dark:bg-ink-900 shadow-card p-5">
          <div className="text-[11px] uppercase tracking-wider text-muted">Clinic</div>
          <div className="text-xl font-bold text-ink-900 dark:text-ink-50">{branch?.name ?? data.doctor}</div>
          <div className="text-sm text-muted inline-flex items-center gap-1.5"><Stethoscope size={12} /> {data.doctor} · {data.specialization}</div>
          {branch?.address && <div className="mt-1 text-xs text-muted inline-flex items-start gap-1.5"><MapPin size={12} className="mt-0.5" /> {branch.address}</div>}

          <div className="mt-4 grid grid-cols-3 gap-2">
            <Tile label="Timing" val={(data.timing || '—').split(',')[0]} />
            <Tile label="Now serving" val={current ? `#${current.token}` : '—'} />
            <Tile label="Est. wait" val={`~${waitMin || 5} min`} />
          </div>

          {/* Booking states */}
          {token != null ? (
            <Booked token={token} ahead={aheadOfToken} waitMin={waitMin} />
          ) : canBook ? (
            <div className="mt-5 space-y-3">
              <div className="text-sm font-semibold text-ink-900 dark:text-ink-50">Get your token — free</div>
              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted">Full name <span className="text-danger-500">*</span></label>
                <Field icon={<User size={14} />} placeholder="Your full name" value={name} onChange={(v) => { setName(v); setError(null); }} />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted">Mobile number <span className="text-danger-500">*</span></label>
                <div className="flex items-center gap-2 rounded-xl border hairline bg-white dark:bg-ink-900 px-3 py-2.5 focus-within:ring-2 focus-within:ring-brand-500/30">
                  <Phone size={14} className="text-ink-400 shrink-0" />
                  <span className="text-sm font-semibold text-ink-700 dark:text-ink-200">+91</span>
                  <input
                    inputMode="numeric"
                    maxLength={10}
                    value={mobile.replace(/\D/g, '').slice(0, 10)}
                    onChange={(e) => { setMobile(e.target.value.replace(/\D/g, '').slice(0, 10)); setError(null); }}
                    placeholder="9876543210"
                    className="flex-1 min-w-0 bg-transparent outline-none text-sm tracking-wider text-ink-900 dark:text-ink-50 placeholder:text-ink-400"
                  />
                </div>
              </div>
              {error && <div className="text-xs text-danger-500">{error}</div>}
              <Button fullWidth size="lg" leftIcon={<Ticket size={16} />} onClick={book} disabled={!canSubmit}>Get token · Free</Button>
              <div className="text-[11px] text-muted text-center">Name &amp; mobile required · No payment now — pay ₹9 + GST to the compounder at the counter.</div>
            </div>
          ) : (
            <GeoGate geo={geo} dist={dist} onOverride={() => setOverride(true)} />
          )}
        </div>

        <div className="mt-4 text-center text-[11px] text-muted">Powered by <b className="text-ink-700 dark:text-ink-200">Dalan Health</b></div>
      </div>
    </div>
  );
}

function Booked({ token, ahead, waitMin }: { token: number; ahead: number; waitMin: number }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="mt-5 text-center">
      <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-success-500/15 text-success-600 dark:text-success-400 mb-3">
        <CheckCircle2 size={26} />
      </div>
      <div className="text-[11px] uppercase tracking-wider text-muted">Your token</div>
      <div className="text-6xl font-extrabold tracking-tight text-token">#{token}</div>
      <div className="mt-2 text-sm text-muted">{ahead} ahead of you · ~{waitMin || 5} min wait</div>
      <div className="mt-4 rounded-xl border border-warning-500/40 bg-warning-500/5 px-3 py-2.5 text-xs text-warning-700 dark:text-warning-300">
        Please pay <b>₹9 + GST</b> to the <b>compounder</b> at the clinic counter to confirm your visit.
      </div>
    </motion.div>
  );
}

function GeoGate({ geo, dist, onOverride }: { geo: GeoState; dist: number | null; onOverride: () => void }) {
  if (geo === 'checking') {
    return (
      <div className="mt-5 flex items-center justify-center gap-2 text-sm text-muted py-4">
        <Loader2 size={16} className="animate-spin" /> Checking you're at the clinic…
      </div>
    );
  }
  const title = geo === 'outside' ? 'You are not at the clinic' : 'Location needed';
  const body =
    geo === 'outside'
      ? `QR booking only works within ~100 m of the clinic.${dist != null ? ` You're ${fmtDistance(dist)} away.` : ''} Please book from the clinic premises.`
      : 'Allow location access so we can confirm you are at the clinic, then reload this page.';
  return (
    <div className="mt-5">
      <div className="rounded-xl border border-danger-500/30 bg-danger-500/5 p-4 text-center">
        <div className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-danger-500/15 text-danger-600 dark:text-danger-400 mb-2">
          {geo === 'outside' ? <Navigation size={20} /> : <AlertCircle size={20} />}
        </div>
        <div className="text-sm font-semibold text-ink-900 dark:text-ink-50">{title}</div>
        <div className="mt-1 text-xs text-muted">{body}</div>
      </div>
      {/* Demo only — a real deploy enforces the geofence server-side. */}
      <button type="button" onClick={onOverride} className="mt-3 w-full text-center text-[11px] text-muted underline hover:text-ink-700 dark:hover:text-ink-200">
        Continue anyway (demo)
      </button>
    </div>
  );
}

const Tile = ({ label, val }: { label: string; val: string }) => (
  <div className="rounded-xl border hairline p-2.5 text-center">
    <div className="text-[9px] uppercase tracking-wider text-muted">{label}</div>
    <div className="text-sm font-semibold text-ink-900 dark:text-ink-50">{val}</div>
  </div>
);

function Field({ icon, value, onChange, placeholder }: { icon: React.ReactNode; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border hairline bg-white dark:bg-ink-900 px-3 py-2.5 focus-within:ring-2 focus-within:ring-brand-500/30">
      <span className="text-ink-400 shrink-0">{icon}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="flex-1 min-w-0 bg-transparent outline-none text-sm text-ink-900 dark:text-ink-50 placeholder:text-ink-400" />
    </div>
  );
}

export default PatientBook;
