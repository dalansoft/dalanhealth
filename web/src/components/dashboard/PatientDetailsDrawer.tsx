import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, User, Phone, MapPin, Calendar, Activity, Droplet, Weight, Ruler,
  ShieldAlert, AlertTriangle, Clock, History, Receipt, FileText, Ticket,
  Users as UsersIcon, Pencil,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { SourceBadge } from '@/components/ui/SourceBadge';
import { StatusPill } from '@/components/ui/StatusPill';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import type { QueueEntry } from '@/store/queue';
import { useQueue, tokenLabel } from '@/store/queue';

interface Props {
  open: boolean;
  entry: QueueEntry | null;
  onClose: () => void;
  /** When provided, an "Edit" button opens the edit form for this patient. */
  onEdit?: (entry: QueueEntry) => void;
}

interface VisitRecord {
  date: string;       // ISO date
  token: number;
  reason: string;
  doctor: string;
  charge: number;
}

/**
 * Deterministic demo history generator. Same mobile → same history every
 * render (no flicker on re-open). Hash-based so it feels real per patient.
 */
const _hash = (s: string): number => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};

const _reasons = ['Follow-up consultation', 'Routine checkup', 'Throat infection', 'Ear pain', 'Sinus issues', 'Hearing test', 'Tonsillitis', 'Voice issues'];
const _doctors = ['Dr. Anil Sharma', 'Dr. Priyanka Sharma', 'Dr. Anil Sharma'];

const buildVisitHistory = (mobile: string): VisitRecord[] => {
  const seed = _hash(mobile);
  const visitCount = (seed % 4) + 2; // 2–5 past visits
  const visits: VisitRecord[] = [];
  const today = new Date();
  for (let i = 0; i < visitCount; i++) {
    const daysAgo = ((seed >> (i * 3)) % 90) + i * 15 + 7; // spread historically
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    visits.push({
      date: d.toISOString(),
      token: ((seed >> (i * 4)) % 30) + 1,
      reason: _reasons[(seed >> (i * 2)) % _reasons.length],
      doctor: _doctors[(seed + i) % _doctors.length],
      charge: 200 + ((seed >> i) % 6) * 50,
    });
  }
  return visits;
};

const formatDate = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatBookedAt = (joinedAt: string): string => {
  // joinedAt is already a "HH:MM" time string; pair it with today's date.
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
  return `${today} · ${joinedAt}`;
};

export function PatientDetailsDrawer({ open, entry, onClose, onEdit }: Props) {
  // Close on Esc.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Count how many patients are currently in the queue under the same mobile
  // (family on one number). Read live from the store.
  const familyOnMobile = useQueue((s) =>
    entry ? s.entries.filter((e) => e.patientMobile === entry.patientMobile) : [],
  );

  if (!entry) return null;

  const d = entry.details;
  const visits = buildVisitHistory(entry.patientMobile);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[60] bg-ink-950/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />

          {/* Drawer — right-side panel */}
          <motion.aside
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed inset-y-0 right-0 z-[70] w-full max-w-md sm:max-w-lg bg-white dark:bg-ink-950 border-l hairline shadow-2xl flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-labelledby="patient-drawer-title"
          >
            {/* Sticky header */}
            <div className="shrink-0 px-5 py-4 border-b hairline flex items-center justify-between gap-3 bg-white/95 dark:bg-ink-950/95 backdrop-blur-xl">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar name={entry.patientName} size="md" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 id="patient-drawer-title" className="text-base font-semibold text-ink-900 dark:text-ink-50 truncate">
                      {entry.patientName}
                    </h2>
                    <Badge tone={entry.emergency ? 'danger' : 'brand'} size="sm">{tokenLabel(entry)}</Badge>
                  </div>
                  <div className="text-[11px] text-muted flex items-center gap-1 mt-0.5">
                    <Phone size={10} /> {entry.patientMobile}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => onEdit(entry)}
                    className="inline-flex items-center gap-1.5 rounded-xl border hairline px-3 h-9 text-xs font-semibold text-ink-700 dark:text-ink-200 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors"
                  >
                    <Pencil size={13} /> Edit
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Booking snapshot */}
              <Section title="This visit" icon={<Ticket size={14} />}>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <Stat label="Token" value={tokenLabel(entry)} />
                  <Stat label="Source" value={<SourceBadge source={entry.source} />} />
                  <Stat label="Status" value={<StatusPill status={entry.status} />} />
                  <Stat
                    label="Booked at"
                    value={
                      <div className="flex items-center gap-1 text-[11px] text-ink-700 dark:text-ink-200 font-medium">
                        <Clock size={11} /> {formatBookedAt(entry.joinedAt)}
                      </div>
                    }
                  />
                </div>
                {entry.wasSkipped && (
                  <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-warning-500/15 text-warning-700 dark:text-warning-300 px-2 py-1 text-[10px] font-bold uppercase tracking-wider">
                    <ShieldAlert size={11} /> Skipped earlier
                  </div>
                )}
              </Section>

              {/* Personal */}
              {(d?.age || d?.gender || d?.weight || d?.height || d?.bloodGroup) && (
                <Section title="Personal" icon={<User size={14} />}>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                    {d?.age != null && <Stat label="Age" value={`${d.age} yr`} />}
                    {d?.gender && <Stat label="Gender" value={d.gender} />}
                    {d?.bloodGroup && (
                      <Stat
                        label="Blood group"
                        value={
                          <span className="inline-flex items-center gap-1 font-semibold text-danger-500">
                            <Droplet size={11} /> {d.bloodGroup}
                          </span>
                        }
                      />
                    )}
                    {d?.weight != null && (
                      <Stat
                        label="Weight"
                        value={
                          <span className="inline-flex items-center gap-1 font-semibold">
                            <Weight size={11} className="text-ink-400" /> {d.weight} kg
                          </span>
                        }
                      />
                    )}
                    {d?.height != null && (
                      <Stat
                        label="Height"
                        value={
                          <span className="inline-flex items-center gap-1 font-semibold">
                            <Ruler size={11} className="text-ink-400" /> {d.height} cm
                          </span>
                        }
                      />
                    )}
                  </div>
                </Section>
              )}

              {/* Address */}
              {d?.address && (
                <Section title="Address" icon={<MapPin size={14} />}>
                  <p className="text-sm text-ink-800 dark:text-ink-200">{d.address}</p>
                </Section>
              )}

              {/* Medical alerts */}
              {(d?.allergies || d?.conditions) && (
                <Section title="Medical alerts" icon={<Activity size={14} />} tone="warning">
                  <div className="space-y-2">
                    {d?.allergies && (
                      <AlertRow icon={<ShieldAlert size={12} />} label="Allergies" body={d.allergies} />
                    )}
                    {d?.conditions && (
                      <AlertRow icon={<AlertTriangle size={12} />} label="Existing conditions" body={d.conditions} />
                    )}
                  </div>
                </Section>
              )}

              {/* Emergency contact */}
              {(d?.emergencyName || d?.emergencyMobile) && (
                <Section title="Emergency contact" icon={<Phone size={14} />}>
                  <div className="rounded-xl border hairline bg-ink-50/60 dark:bg-ink-900/40 p-3">
                    <div className="text-sm font-semibold text-ink-900 dark:text-ink-50">
                      {d.emergencyName ?? '—'}
                    </div>
                    {d?.emergencyMobile && (
                      <div className="text-xs text-muted flex items-center gap-1 mt-0.5">
                        <Phone size={11} /> {d.emergencyMobile}
                      </div>
                    )}
                  </div>
                </Section>
              )}

              {/* Family on this mobile */}
              {familyOnMobile.length > 1 && (
                <Section title="Others on this mobile" icon={<UsersIcon size={14} />}>
                  <div className="space-y-1.5">
                    {familyOnMobile
                      .filter((m) => m.id !== entry.id)
                      .map((m) => (
                        <div key={m.id} className="flex items-center justify-between rounded-xl border hairline px-3 py-2 text-sm">
                          <div className="flex items-center gap-2 min-w-0">
                            <Badge tone="brand" size="sm">#{m.token}</Badge>
                            <span className="font-medium truncate">{m.patientName}</span>
                          </div>
                          <StatusPill status={m.status} />
                        </div>
                      ))}
                  </div>
                </Section>
              )}

              {/* Visit history */}
              <Section title={`Visit history (${visits.length})`} icon={<History size={14} />}>
                <div className="space-y-2">
                  {visits.map((v, i) => (
                    <div key={i} className="rounded-xl border hairline px-3 py-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-300 text-[10px] font-bold">
                            #{v.token}
                          </span>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-ink-900 dark:text-ink-50 truncate">{v.reason}</div>
                            <div className="text-[11px] text-muted flex items-center gap-2 flex-wrap">
                              <span className="inline-flex items-center gap-1"><Calendar size={10} /> {formatDate(v.date)}</span>
                              <span>·</span>
                              <span>{v.doctor}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-[11px] font-semibold text-success-600 dark:text-success-500 whitespace-nowrap">
                          ₹{v.charge}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            </div>

            {/* Sticky actions */}
            <div className="shrink-0 px-5 py-3 border-t hairline bg-white/95 dark:bg-ink-950/95 backdrop-blur-xl">
              <div className="grid grid-cols-2 gap-2">
                <Link to="/clinic/billing" onClick={onClose}>
                  <Button variant="outline" fullWidth leftIcon={<Receipt size={14} />}>Billing</Button>
                </Link>
                <Link to="/clinic/prescription" onClick={onClose}>
                  <Button fullWidth leftIcon={<FileText size={14} />}>Prescription</Button>
                </Link>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function Section({ title, icon, children, tone }: { title: string; icon?: React.ReactNode; children: React.ReactNode; tone?: 'warning' }) {
  return (
    <div>
      <div className={`mb-2 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${
        tone === 'warning' ? 'text-warning-600 dark:text-warning-500' : 'text-muted'
      }`}>
        {icon}
        <span>{title}</span>
      </div>
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] uppercase tracking-wider text-muted mb-0.5">{label}</div>
      <div className="text-sm font-semibold text-ink-900 dark:text-ink-50 truncate">{value}</div>
    </div>
  );
}

function AlertRow({ icon, label, body }: { icon: React.ReactNode; label: string; body: string }) {
  return (
    <div className="rounded-xl border border-warning-500/30 bg-warning-500/5 px-3 py-2">
      <div className="text-[10px] font-bold uppercase tracking-wider text-warning-700 dark:text-warning-300 mb-0.5 flex items-center gap-1">
        {icon} {label}
      </div>
      <div className="text-sm text-ink-800 dark:text-ink-200">{body}</div>
    </div>
  );
}
