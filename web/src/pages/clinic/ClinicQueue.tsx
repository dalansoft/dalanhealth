import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, SkipForward, Receipt, FileText, Plus, Clock } from 'lucide-react';
import { Card, CardHeader, CardSubtitle, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SourceBadge } from '@/components/ui/SourceBadge';
import { StatusPill } from '@/components/ui/StatusPill';
import { useQueue } from '@/store/queue';
import { demoQueue } from '@/services/demoData';
import { EmptyState } from '@/components/ui/EmptyState';
import { Link } from 'react-router-dom';

export function ClinicQueue() {
  const { entries, setEntries, advance, skipCurrent } = useQueue();

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
          <Badge tone="success" pulse>Live · WebSocket</Badge>
        </CardHeader>
        {current ? (
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2 rounded-2xl bg-gradient-to-br from-brand-500/10 via-transparent to-accent-500/10 p-6 border hairline">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 text-white flex items-center justify-center text-2xl font-bold shadow-glow">
                  #{current.token}
                </div>
                <div>
                  <div className="text-xl font-semibold text-ink-900 dark:text-ink-50">{current.patientName}</div>
                  <div className="text-sm text-muted flex items-center gap-2 mt-1">
                    <SourceBadge source={current.source} />
                    <span>{current.patientMobile}</span>
                  </div>
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
              <Link to="/receptionist/add" className="mt-5 block">
                <Button variant="outline" fullWidth leftIcon={<Plus size={14} />}>Add patient</Button>
              </Link>
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
                <th className="px-5 py-3">Joined</th>
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
                    className="text-sm"
                  >
                    <td className="px-5 py-3.5 font-semibold">#{q.token}</td>
                    <td className="px-5 py-3.5 font-medium text-ink-900 dark:text-ink-50">{q.patientName}</td>
                    <td className="px-5 py-3.5 text-muted">{q.patientMobile}</td>
                    <td className="px-5 py-3.5"><SourceBadge source={q.source} /></td>
                    <td className="px-5 py-3.5 text-muted">{q.joinedAt}</td>
                    <td className="px-5 py-3.5"><StatusPill status={q.status} /></td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
