import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Phone, User, Calendar, Check, Ticket, UserPlus, Users, ChevronRight,
  ChevronDown, Weight, Ruler, Droplet, Home, AlertCircle, Stethoscope,
  ShieldAlert, AlertTriangle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardSubtitle, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useQueue, type PatientDetails } from '@/store/queue';
import { demoQueue } from '@/services/demoData';
import { patientsApi, queueApi } from '@/services/api';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', 'Unknown'];

// ─── Patient history lookup ────────────────────────────────────────────────
// Combines two sources:
//   1. Demo "family records" hardcoded for a couple of test numbers, so the
//      multi-patient flow is easy to demonstrate without backend wiring.
//        * ends in 210 → 3 family members (Tier-2 family case)
//        * ends in 100 → single returning patient
//   2. The live queue itself — anyone already booked today with this mobile
//      is automatically surfaced as a returning patient. This handles the
//      receptionist asking again about someone they just booked (or about
//      a family member already in the queue).
//
// When backend lands, replace this entire block with an API call against
// the patients table filtered by mobile, plus a join on today's queue.

interface PatientRecord {
  id: string;
  name: string;
  age?: number;
  gender?: 'Male' | 'Female' | 'Other';
  relation?: string;
  visits?: number;
  lastSeen?: string;
  outstanding?: number;
  /** Set when this patient is already in today's queue. */
  inQueueToken?: number;
}

const _demoFamily = (mobile: string): PatientRecord[] => {
  const digits = mobile.replace(/\D/g, '');
  if (digits.endsWith('210')) {
    return [
      { id: 'p1', name: 'Shailesh Kumar', age: 28, gender: 'Male', relation: 'Self', visits: 6, lastSeen: '12 Jan' },
      { id: 'p2', name: 'Priya Kumar', age: 26, gender: 'Female', relation: 'Spouse', visits: 3, lastSeen: '08 Feb' },
      { id: 'p3', name: 'Aarav Kumar', age: 4, gender: 'Male', relation: 'Son', visits: 8, lastSeen: '21 Mar' },
    ];
  }
  if (digits.endsWith('100')) {
    return [
      { id: 'p4', name: 'Rajesh Singh', age: 45, gender: 'Male', relation: 'Self', visits: 2, lastSeen: '05 Apr' },
    ];
  }
  return [];
};

const _normalize = (s: string) => s.replace(/\D/g, '');

/**
 * Look up every patient associated with `mobile`. Merges hardcoded demo
 * family records with anyone already in today's queue on that number.
 * De-duplicates by case-insensitive name so a person who appears in both
 * sources isn't listed twice.
 */
const lookupHistory = (
  mobile: string,
  queueEntries: Array<{ id: string; token: number; patientName: string; patientMobile: string }>,
): PatientRecord[] => {
  const target = _normalize(mobile);
  if (!target) return [];

  const family = _demoFamily(mobile);

  // Patients already in today's queue under this mobile.
  const fromQueue: PatientRecord[] = queueEntries
    .filter((e) => _normalize(e.patientMobile) === target)
    .map((e) => ({
      id: `queue-${e.id}`,
      name: e.patientName,
      relation: 'Self',
      inQueueToken: e.token,
    }));

  // Merge + de-dup by lowercased name. Queue matches take priority because
  // we want to show the live `inQueueToken` info if it exists.
  const seen = new Set<string>();
  const merged: PatientRecord[] = [];
  for (const p of [...fromQueue, ...family]) {
    const key = p.name.trim().toLowerCase();
    if (seen.has(key)) {
      // Already added (from queue) — enrich with demo history if missing.
      const existing = merged.find((m) => m.name.trim().toLowerCase() === key);
      if (existing && !existing.visits) {
        existing.age = existing.age ?? p.age;
        existing.gender = existing.gender ?? p.gender;
        existing.visits = p.visits;
        existing.lastSeen = p.lastSeen;
      }
      continue;
    }
    seen.add(key);
    merged.push(p);
  }
  return merged;
};

type Step = 'lookup' | 'select' | 'new' | 'done';

interface AddPatientProps {
  /** Hide the wrapping Card so the form can live inside a modal/drawer. */
  embedded?: boolean;
  /** Called instead of navigating after success. When provided, the "Go to
   *  queue" button is replaced with "Close". */
  onClose?: () => void;
}

export function AddPatient({ embedded = false, onClose }: AddPatientProps = {}) {
  const [mobile, setMobile] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  // Extended details — collected only if receptionist expands the optional
  // section. All values stay as strings until submit so the inputs remain
  // controllable + empty-friendly.
  const [showMore, setShowMore] = useState(false);
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [address, setAddress] = useState('');
  const [allergies, setAllergies] = useState('');
  const [conditions, setConditions] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyMobile, setEmergencyMobile] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [step, setStep] = useState<Step>('lookup');
  const [family, setFamily] = useState<PatientRecord[]>([]);
  const [generatedToken, setGeneratedToken] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const { entries, setEntries, addEntry, mode } = useQueue();
  const navigate = useNavigate();

  // Lookup field accepts only 10 digits — country code is always +91.
  // Reject any non-digit input and stop appending after the 10th character.
  const handleMobileChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 10);
    setMobile(digits);
  };
  // Emergency contact mobile inside the "More details" section uses the same
  // input policy.
  const handleEmergencyMobileChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 10);
    setEmergencyMobile(digits);
  };
  // Pretty form for downstream storage / display: "+91 75640 41018".
  const formatStoredMobile = (digits: string): string =>
    digits.length === 10 ? `+91 ${digits.slice(0, 5)} ${digits.slice(5)}` : `+91 ${digits}`;

  const submitLookup = async (e: FormEvent) => {
    e.preventDefault();
    if (mobile.length !== 10) return;
    setFormError(null);
    const formatted = formatStoredMobile(mobile);

    if (mode === 'live') {
      // Real lookup against the clinic's patient table; anyone already in
      // today's live queue with this mobile is surfaced with their token.
      setBusy(true);
      try {
        const resp = await patientsApi.lookup(formatted);
        const inQueue = entries.find(
          (en) => _normalize(en.patientMobile) === _normalize(formatted),
        );
        const found: PatientRecord[] = resp.found && resp.patient
          ? [{
              id: resp.patient.id,
              name: resp.patient.name,
              age: resp.patient.age ?? undefined,
              gender: (resp.patient.gender as PatientRecord['gender']) ?? undefined,
              relation: 'Self',
              inQueueToken: inQueue?.token,
            }]
          : [];
        setFamily(found);
        setStep(found.length > 0 ? 'select' : 'new');
      } catch {
        setFormError('Could not reach the server — try again.');
      } finally {
        setBusy(false);
      }
      return;
    }

    const found = lookupHistory(formatted, entries);
    setFamily(found);
    setStep(found.length > 0 ? 'select' : 'new');
  };

  const generateTokenFor = async (
    patient: { id?: string; name: string; age?: number; gender?: string },
    details?: PatientDetails,
  ) => {
    if (mode === 'live') {
      // Server owns tokens: ensure the patient exists, then enqueue. The
      // WebSocket broadcast updates every device's queue automatically.
      setBusy(true);
      setFormError(null);
      try {
        const formatted = formatStoredMobile(mobile);
        let patientId = patient.id;
        if (!patientId) {
          const created = await patientsApi.create({
            name: patient.name || 'New patient',
            mobile: formatted,
            age: patient.age,
            gender: patient.gender,
            address: details?.address,
          });
          patientId = created.id;
        }
        const entry = await queueApi.enqueue({
          patient_id: patientId,
          patient_name: patient.name || 'New patient',
          patient_mobile: formatted,
          source: 'OFFLINE',
        });
        setName(patient.name);
        setGeneratedToken(entry.token);
        setStep('done');
      } catch {
        setFormError('Could not reach the server — the patient was NOT added. Try again.');
      } finally {
        setBusy(false);
      }
      return;
    }

    if (entries.length === 0) setEntries(demoQueue);
    const list = entries.length === 0 ? demoQueue : entries;
    const nextToken = list.reduce((m, e) => Math.max(m, e.token), 0) + 1;
    addEntry({
      id: `q-${Date.now()}`,
      token: nextToken,
      patientName: patient.name || 'New patient',
      patientMobile: formatStoredMobile(mobile),
      source: 'OFFLINE',
      status: 'Waiting',
      joinedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      details,
    });
    setName(patient.name);
    if (patient.age != null) setAge(String(patient.age));
    setGeneratedToken(nextToken);
    setStep('done');
  };

  // Validate + build details object from new-patient form, then submit.
  const handleSaveNewPatient = () => {
    setFormError(null);
    if (!name.trim()) {
      setFormError('Full name is required');
      return;
    }
    if (mobile.length !== 10) {
      setFormError('Mobile must be exactly 10 digits');
      return;
    }
    if (emergencyMobile && emergencyMobile.length !== 10) {
      setFormError('Emergency mobile must be exactly 10 digits');
      return;
    }
    const details: PatientDetails = {
      age: age ? Number(age) : undefined,
      gender,
      weight: weight ? Number(weight) : undefined,
      height: height ? Number(height) : undefined,
      bloodGroup: bloodGroup || undefined,
      address: address.trim() || undefined,
      allergies: allergies.trim() || undefined,
      conditions: conditions.trim() || undefined,
      emergencyName: emergencyName.trim() || undefined,
      emergencyMobile: emergencyMobile ? formatStoredMobile(emergencyMobile) : undefined,
    };
    generateTokenFor({ name: name.trim(), age: details.age, gender }, details);
  };

  const reset = () => {
    setStep('lookup');
    setMobile('');
    setName('');
    setAge('');
    setShowMore(false);
    setWeight('');
    setHeight('');
    setBloodGroup('');
    setAddress('');
    setAllergies('');
    setConditions('');
    setEmergencyName('');
    setEmergencyMobile('');
    setFormError(null);
    setFamily([]);
    setGeneratedToken(null);
  };

  // ⚠ Don't define `Wrapper` as a component inside this function — React
  // would see a fresh component reference on every render and unmount the
  // entire form tree (including the MobileInput) on every keystroke, which
  // caused a visible blink/refocus flicker. Inline the conditional instead.
  const body = (
    <>
        {!embedded && (
          <CardHeader>
            <div>
              <CardTitle>Add patient</CardTitle>
              <CardSubtitle>Mobile-first. 5 seconds to generate a token.</CardSubtitle>
            </div>
            <Badge tone="brand">Offline source</Badge>
          </CardHeader>
        )}

        <AnimatePresence mode="wait">
          {/* ─── Step 1: lookup by mobile ─────────────────────────── */}
          {step === 'lookup' && (
            <motion.form key="lookup" onSubmit={submitLookup} className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <MobileInput
                label="Mobile number"
                required
                value={mobile}
                onChange={handleMobileChange}
                autoFocus
              />
              {mode === 'demo' && (
                <div className="text-xs text-muted">
                  Try <code className="font-mono">9876543210</code> for a family with 3 patients,
                  or <code className="font-mono">9876543100</code> for a single returning patient.
                </div>
              )}
              {formError && (
                <div className="rounded-xl border border-danger-500/40 bg-danger-500/5 px-3 py-2 text-xs text-danger-600 dark:text-danger-500 flex items-center gap-1.5">
                  <AlertCircle size={12} /> {formError}
                </div>
              )}
              <Button type="submit" size="lg" fullWidth disabled={mobile.length !== 10} loading={busy}>
                Continue
              </Button>
            </motion.form>
          )}

          {/* ─── Step 2: select which patient on this mobile ──────── */}
          {step === 'select' && (
            <motion.div key="select" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <Users size={14} className="text-brand-600 dark:text-brand-300 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-ink-900 dark:text-ink-50">
                      {family.length === 1 ? 'Returning patient' : `${family.length} patients on this mobile`}
                    </div>
                    <div className="text-[11px] text-muted truncate">{mobile} · select who's visiting today</div>
                  </div>
                </div>
                <Badge tone="brand" size="sm">{family.length} record{family.length === 1 ? '' : 's'}</Badge>
              </div>

              <div className="space-y-2">
                {family.map((p) => {
                  const alreadyBooked = p.inQueueToken != null;
                  // Build the meta line conditionally so we never show
                  // "undefined · undefined" for queue-only patients with
                  // no demo history.
                  const meta = [
                    p.age != null && p.gender ? `${p.age} · ${p.gender}` : null,
                    p.visits != null ? `${p.visits} visit${p.visits === 1 ? '' : 's'}` : null,
                    p.lastSeen ? `last ${p.lastSeen}` : null,
                  ].filter(Boolean).join(' · ');
                  return (
                    <motion.button
                      key={p.id}
                      type="button"
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      onClick={() => generateTokenFor(p)}
                      disabled={alreadyBooked}
                      className={`w-full group flex items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                        alreadyBooked
                          ? 'hairline bg-success-500/5 dark:bg-success-500/10 border-success-500/30 cursor-not-allowed'
                          : 'hairline bg-white/60 dark:bg-ink-900/40 hover:border-brand-500/40 hover:bg-brand-50/60 dark:hover:bg-brand-500/10'
                      }`}
                    >
                      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-white text-sm font-semibold">
                        {p.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-ink-900 dark:text-ink-50 truncate">{p.name}</span>
                          {p.relation && (
                            <Badge tone="neutral" size="sm">{p.relation}</Badge>
                          )}
                          {alreadyBooked && (
                            <Badge tone="success" size="sm" pulse>
                              In queue · #{p.inQueueToken}
                            </Badge>
                          )}
                        </div>
                        {meta && (
                          <div className="text-[11px] text-muted">{meta}</div>
                        )}
                        {alreadyBooked && (
                          <div className="text-[11px] text-success-600 dark:text-success-500 font-medium mt-0.5">
                            Already booked today — token #{p.inQueueToken}
                          </div>
                        )}
                      </div>
                      {!alreadyBooked && (
                        <ChevronRight size={16} className="text-ink-400 group-hover:text-brand-600 dark:group-hover:text-brand-300 shrink-0" />
                      )}
                    </motion.button>
                  );
                })}

                {/* Add new family member on same mobile */}
                <button
                  type="button"
                  onClick={() => setStep('new')}
                  className="w-full flex items-center gap-3 rounded-xl border-2 border-dashed border-ink-300 dark:border-ink-700 p-3 text-left hover:border-brand-500/60 hover:bg-brand-50/40 dark:hover:bg-brand-500/5 transition-colors"
                >
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500/15 text-brand-600 dark:text-brand-300">
                    <UserPlus size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-brand-700 dark:text-brand-300">Add new family member</div>
                    <div className="text-[11px] text-muted">Different person, same mobile</div>
                  </div>
                  <ChevronRight size={16} className="text-brand-500 shrink-0" />
                </button>
              </div>

              <Button size="lg" variant="outline" fullWidth onClick={reset}>Back</Button>
            </motion.div>
          )}

          {/* ─── Step 3: register new patient ─────────────────────── */}
          {step === 'new' && (
            <motion.div key="new" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="rounded-xl border hairline bg-ink-50/60 dark:bg-ink-900/60 p-3 text-xs text-muted">
                {family.length > 0 ? (
                  <>Registering an additional patient on <span className="font-semibold text-ink-700 dark:text-ink-200">{mobile}</span>.</>
                ) : (
                  <>No record found for <span className="font-semibold text-ink-700 dark:text-ink-200">{mobile}</span>. Quick add below.</>
                )}
              </div>

              {/* Required + basic */}
              <Input
                label={renderRequiredLabel('Full name')}
                leftIcon={<User size={14} />}
                value={name}
                onChange={(e) => { setName(e.target.value); if (formError) setFormError(null); }}
                required
                hint="Required"
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Age"
                  leftIcon={<Calendar size={14} />}
                  type="number"
                  inputMode="numeric"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  hint="Optional"
                />
                <div>
                  <div className="mb-1.5 text-xs font-medium text-ink-700 dark:text-ink-300 uppercase tracking-wide">Gender</div>
                  <div className="grid grid-cols-3 rounded-xl border hairline p-1 text-sm">
                    {(['Male', 'Female', 'Other'] as const).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGender(g)}
                        className={`rounded-lg py-2 transition-all ${gender === g ? 'bg-brand-500 text-white' : 'text-muted hover:text-ink-900 dark:hover:text-ink-50'}`}
                      >{g}</button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Expandable optional details */}
              <button
                type="button"
                onClick={() => setShowMore((v) => !v)}
                className="w-full flex items-center justify-between gap-2 rounded-xl border hairline px-3 py-2.5 text-sm font-semibold text-ink-700 dark:text-ink-200 hover:bg-ink-50 dark:hover:bg-ink-800 transition-colors"
              >
                <span className="inline-flex items-center gap-2">
                  <Stethoscope size={14} className="text-brand-600 dark:text-brand-300" />
                  More details
                  <span className="text-[10px] uppercase tracking-wider text-muted font-medium ml-1">Optional</span>
                </span>
                <ChevronDown size={14} className={`transition-transform ${showMore ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence initial={false}>
                {showMore && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-4 pt-1">
                      {/* Vitals */}
                      <div className="grid grid-cols-3 gap-3">
                        <Input
                          label="Weight (kg)"
                          leftIcon={<Weight size={14} />}
                          type="number" inputMode="decimal" step="0.1"
                          value={weight} onChange={(e) => setWeight(e.target.value)}
                          placeholder="65"
                        />
                        <Input
                          label="Height (cm)"
                          leftIcon={<Ruler size={14} />}
                          type="number" inputMode="numeric"
                          value={height} onChange={(e) => setHeight(e.target.value)}
                          placeholder="170"
                        />
                        <div>
                          <div className="mb-1.5 text-xs font-medium text-ink-700 dark:text-ink-300 uppercase tracking-wide">Blood group</div>
                          <div className="relative">
                            <Droplet size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
                            <select
                              value={bloodGroup}
                              onChange={(e) => setBloodGroup(e.target.value)}
                              className="w-full pl-9 pr-3 py-2.5 rounded-xl border hairline bg-white dark:bg-ink-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-shadow"
                            >
                              <option value="">—</option>
                              {BLOOD_GROUPS.map((bg) => <option key={bg} value={bg}>{bg}</option>)}
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Address */}
                      <Input
                        label="Address"
                        leftIcon={<Home size={14} />}
                        value={address} onChange={(e) => setAddress(e.target.value)}
                        placeholder="Boring Road, Patna"
                      />

                      {/* Allergies */}
                      <div>
                        <div className="mb-1.5 text-xs font-medium text-ink-700 dark:text-ink-300 uppercase tracking-wide flex items-center gap-1.5">
                          <ShieldAlert size={12} className="text-warning-500" /> Known allergies
                        </div>
                        <textarea
                          value={allergies} onChange={(e) => setAllergies(e.target.value)}
                          placeholder="e.g. penicillin, peanuts, dust"
                          rows={2}
                          className="w-full rounded-xl border hairline bg-white dark:bg-ink-900 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-shadow resize-y"
                        />
                      </div>

                      {/* Existing conditions */}
                      <div>
                        <div className="mb-1.5 text-xs font-medium text-ink-700 dark:text-ink-300 uppercase tracking-wide flex items-center gap-1.5">
                          <AlertTriangle size={12} className="text-warning-500" /> Existing conditions
                        </div>
                        <textarea
                          value={conditions} onChange={(e) => setConditions(e.target.value)}
                          placeholder="e.g. diabetes, hypertension, asthma"
                          rows={2}
                          className="w-full rounded-xl border hairline bg-white dark:bg-ink-900 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-shadow resize-y"
                        />
                      </div>

                      {/* Emergency contact */}
                      <div className="rounded-xl border hairline bg-ink-50/40 dark:bg-ink-900/40 p-3">
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-2">Emergency contact</div>
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            label="Name"
                            leftIcon={<User size={14} />}
                            value={emergencyName} onChange={(e) => setEmergencyName(e.target.value)}
                            placeholder="Family member"
                          />
                          <MobileInput
                            label="Mobile"
                            value={emergencyMobile}
                            onChange={handleEmergencyMobileChange}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {formError && (
                <div className="rounded-xl border border-danger-500/40 bg-danger-500/5 px-3 py-2 text-xs text-danger-600 dark:text-danger-500 flex items-center gap-1.5">
                  <AlertCircle size={12} /> {formError}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  size="lg"
                  fullWidth
                  leftIcon={<Ticket size={16} />}
                  onClick={handleSaveNewPatient}
                  loading={busy}
                >
                  Save & generate token
                </Button>
                <Button size="lg" variant="outline" onClick={() => setStep(family.length > 0 ? 'select' : 'lookup')}>
                  Back
                </Button>
              </div>
            </motion.div>
          )}

          {/* ─── Step 4: done ─────────────────────────────────────── */}
          {step === 'done' && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 280, damping: 18 }}
                className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-success-500 to-teal-500 flex items-center justify-center text-white shadow-glow"
              >
                <Check size={28} />
              </motion.div>
              <h3 className="mt-5 text-xl font-semibold text-ink-900 dark:text-ink-50">Token generated</h3>
              <p className="text-sm text-muted">{name || 'Patient'} added to the queue</p>
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mx-auto mt-6 inline-flex flex-col items-center rounded-3xl border hairline bg-white dark:bg-navy-900 px-10 py-6 shadow-card"
              >
                <div className="text-[11px] uppercase tracking-wider text-muted">Your token</div>
                <div className="text-6xl font-extrabold tracking-tight text-token drop-shadow-[0_0_24px_rgba(34,197,94,0.5)]">#{generatedToken}</div>
              </motion.div>
              <div className="mt-6 flex justify-center gap-2">
                <Button variant="outline" onClick={reset}>Add another</Button>
                {onClose ? (
                  <Button onClick={onClose}>Close</Button>
                ) : (
                  <Button onClick={() => navigate('/receptionist/queue')}>Go to queue</Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
    </>
  );

  return embedded
    ? <div className="space-y-4">{body}</div>
    : <div className="max-w-2xl mx-auto"><Card>{body}</Card></div>;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Render a label with a red "*" suffix to flag a mandatory field. Returned
 *  as a string-typed ReactNode so it slots cleanly into <Input label={…}>. */
function renderRequiredLabel(text: string): React.ReactNode {
  return (
    <>
      {text} <span className="text-danger-500">*</span>
    </>
  );
}

/** Mobile number input with a baked-in +91 prefix, digit-only filter, and a
 *  hard cap of 10 characters. Used wherever a clinic captures an Indian
 *  mobile (lookup form, emergency contact, etc.). */
function MobileInput({
  label, value, onChange, required, autoFocus,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  autoFocus?: boolean;
}) {
  return (
    <div className="w-full">
      <label className="mb-1.5 block text-xs font-medium text-ink-700 dark:text-ink-300 uppercase tracking-wide">
        {label}
        {required && <span className="text-danger-500 ml-1">*</span>}
      </label>
      {/* No `transition-all` here — it was animating every keystroke and
          reading as a flicker. Only animate the focus ring + border colour. */}
      <div className="group relative flex items-center rounded-xl border bg-white dark:bg-ink-900/80 transition-[box-shadow,border-color] duration-150 border-ink-200 dark:border-ink-800 focus-within:border-brand-500/70 focus-within:ring-4 focus-within:ring-brand-500/10 dark:focus-within:ring-brand-500/15">
        <span className="pl-3 pr-2 flex items-center gap-1.5 text-ink-400 dark:text-ink-500">
          <Phone size={14} />
          <span className="text-sm font-semibold text-ink-700 dark:text-ink-200">+91</span>
          <span className="h-5 w-px bg-ink-200 dark:bg-ink-700 ml-1" aria-hidden />
        </span>
        <input
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder="9876543210"
          maxLength={10}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          // Block alpha entirely — paste of "abcd" or typing "L" both no-op.
          onKeyDown={(e) => {
            const allowed = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', 'Home', 'End', 'Enter'];
            if (allowed.includes(e.key)) return;
            if (e.ctrlKey || e.metaKey) return; // copy/paste shortcuts
            if (!/^\d$/.test(e.key)) e.preventDefault();
          }}
          autoFocus={autoFocus}
          className="w-full bg-transparent px-2 py-2.5 text-sm tracking-wider text-ink-900 dark:text-ink-50 placeholder:text-ink-400 dark:placeholder:text-ink-500 outline-none"
        />
        {/* Fixed-width counter (w-[44px]) so going from "1/10" → "10/10" can't
            jiggle the input's right edge. */}
        <span className="pr-3 text-[11px] font-mono text-muted tabular-nums whitespace-nowrap text-right w-[44px] shrink-0">
          {value.length}/10
        </span>
      </div>
    </div>
  );
}
