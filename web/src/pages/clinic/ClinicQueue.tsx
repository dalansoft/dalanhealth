import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, SkipForward, Receipt, FileText, Plus, Clock, Monitor, RotateCcw } from 'lucide-react';
import { Card, CardHeader, CardSubtitle, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SourceBadge } from '@/components/ui/SourceBadge';
import { StatusPill } from '@/components/ui/StatusPill';
import { useQueue, type QueueEntry } from '@/store/queue';
import { demoQueue } from '@/services/demoData';
import { EmptyState } from '@/components/ui/EmptyState';
import { Link, useSearchParams } from 'react-router-dom';
import { PatientDetailsDrawer } from '@/components/dashboard/PatientDetailsDrawer';
import { AddPatientModal } from '@/pages/receptionist/AddPatientModal';

export function ClinicQueue() {
  const { entries, setEntries, advance, skipCurrent, callBack } = useQueue();
  const [selectedEntry, setSelectedEntry] = useState<QueueEntry | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  // Deep-link support: navigating here as `?patient=<id>` (from the header
  // GlobalSearch) auto-opens the patient drawer with that entry's history.
  // Clearing the param when the drawer closes keeps refreshes clean.
  useEffect(() => {
    const id = searchParams.get('patient');
    if (!id) return;
    const match = entries.find((e) => e.id === id);
    if (match) setSelectedEntry(match);
  }, [searchParams, entries]);

  const closeDrawer = () => {
    setSelectedEntry(null);
    if (searchParams.get('patient')) {
      const next = new URLSearchParams(searchParams);
      next.delete('patient');
      setSearchParams(next, { replace: true });
    }
  };

  useEffect(() => {
    if (entries.length === 0) setEntries(demoQueue);
  }, [entries.length, setEntries]);

  const current = entries[0];
  const upNext = entries[1];

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Now serving</CardTitle>
            <CardSubtitle>Doctor session live</CardSubtitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone="success" pulse>Live · WebSocket</Badge>
            <a href="/display/clinic" target="_blank" rel="noreferrer">
              <Button variant="outline" size="sm" leftIcon={<Monitor size={14} />}>Open TV display</Button>
            </a>
          </div>
        </CardHeader>
        {current ? (
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2 rounded-2xl bg-gradient-to-br from-brand-500/10 via-transparent to-token/10 p-6 border hairline relative overflow-hidden">
              <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-token/15 blur-3xl" />
              <div className="relative flex items-center gap-5">
                <div className="text-5xl sm:text-6xl font-extrabold leading-none tracking-tight text-token drop-shadow-[0_0_24px_rgba(34,197,94,0.45)]">
                  #{current.token}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xl font-semibold text-ink-900 dark:text-ink-50">{current.patientName}</span>
                    <SourceBadge source={current.source} />
                  </div>
                  <div className="text-sm text-muted mt-1">{current.patientMobile}</div>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <Button variant="success" leftIcon={<Check size={14} />} onClick={advance}>Complete consultation</Button>
                <Button variant="outline" leftIcon={<SkipForward size={14} />} onClick={skipCurrent}>Skip</Button>
                <Link to="/clinic/billing"><Button variant="outline" leftIcon={<Receipt size={14} />}>Billing</Button></Link>
                <Link to="/clinic/prescription"><Button variant="outline" leftIcon={<FileText size={14} />}>Prescription</Button></Link>
              </div>
            </div>
            <div className="rounded-2xl border hairline bg-white dark:bg-ink-900 p-5">
              <div className="text-xs uppercase tracking-wider text-muted">Up next</div>
              {upNext ? (
                <>
                  <div className="mt-3 text-lg font-semibold text-ink-900 dark:text-ink-50">#{upNext.token} · {upNext.patientName}</div>
                  <div className="text-xs text-muted">{upNext.patientMobile}</div>
                  <div className="mt-3"><SourceBadge source={upNext.source} /></div>
                </>
              ) : (
                <div className="mt-3 text-sm text-muted">No one queued.</div>
              )}
              <Button
                variant="outline"
                fullWidth
                leftIcon={<Plus size={14} />}
                onClick={() => setAddOpen(true)}
                className="mt-5"
              >
                Add patient
              </Button>
            </div>
          </div>
        ) : (
          <EmptyState icon={<Clock size={22} />} title="Queue is empty" description="When patients arrive (offline, online or QR), they'll appear here." />
        )}
      </Card>

      <Card padded={false}>
        <div className="px-5 py-4 border-b hairline flex items-center justify-between">
          <div>
            <CardTitle>All entries</CardTitle>
            <CardSubtitle>Sequential token order</CardSubtitle>
          </div>
          <Badge tone="neutral">{entries.length} in queue</Badge>
        </div>
        <div className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 dark:bg-ink-900/60">
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted">
                <th className="px-5 py-3">Token</th>
                <th className="px-5 py-3">Patient</th>
                <th className="px-5 py-3">Mobile</th>
                <th className="px-5 py-3">Source</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y hairline">
              <AnimatePresence initial={false}>
                {entries.map((q) => (
                  <motion.tr
                    key={q.id}
                    layout
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 26 }}
                    onClick={() => setSelectedEntry(q)}
                    className={`text-sm cursor-pointer transition-colors hover:bg-ink-50 dark:hover:bg-ink-900/60 ${q.wasSkipped ? 'bg-warning-500/5' : ''}`}
                    title="Click for full patient details & visit history"
                  >
                    <td className="px-5 py-3.5 font-semibold">#{q.token}</td>
                    <td className="px-5 py-3.5 font-medium text-ink-900 dark:text-ink-50">
                      <div className="flex items-center gap-2">
                        <span>{q.patientName}</span>
                        {q.wasSkipped && (
                          <Badge tone="warning" size="sm">Skipped</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-muted">{q.patientMobile}</td>
                    <td className="px-5 py-3.5"><SourceBadge source={q.source} /></td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <StatusPill status={q.status} />
                        {q.wasSkipped && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); callBack(q.id); }}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold text-brand-600 dark:text-brand-300 hover:bg-brand-500/10 transition-colors"
                            title="Bring this patient back to the front of the queue"
                          >
                            <RotateCcw size={11} /> Call back
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Per-patient detail drawer — opens on any row click */}
      <PatientDetailsDrawer
        open={!!selectedEntry}
        entry={selectedEntry}
        onClose={closeDrawer}
      />

      {/* Inline Add patient modal — keeps the receptionist on the same page,
          no route switch into /receptionist/add */}
      <AddPatientModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}

// ─── Inline Add Patient modal ─────────────────────────────────────────────

