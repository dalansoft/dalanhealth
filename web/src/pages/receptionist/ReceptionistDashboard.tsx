import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Ticket, IndianRupee, CheckCircle, UserPlus, Monitor, Receipt, FileText } from 'lucide-react';
import { StatTile } from '@/components/dashboard/StatTile';
import { CurrentTokenCard } from '@/components/dashboard/CurrentTokenCard';
import { QueuePreview } from '@/components/dashboard/QueuePreview';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { LiveClock } from '@/components/ui/LiveClock';
import { NowServingAnnouncer } from '@/components/feedback/NowServingAnnouncer';
import { useQueue } from '@/store/queue';
import { demoClinic, demoQueue } from '@/services/demoData';
import { clinicActivity, clinicSparklines } from '@/services/activityData';
import { inr } from '@/lib/format';

const actions = [
  { icon: <UserPlus size={20} />, label: 'Add patient', to: '/receptionist/add', tone: 'brand' as const },
  { icon: <Ticket size={20} />, label: 'Queue', to: '/receptionist/queue', tone: 'accent' as const },
  { icon: <Receipt size={20} />, label: 'Billing', to: '/receptionist/billing', tone: 'success' as const },
  { icon: <FileText size={20} />, label: 'Prescription', to: '/receptionist/prescription', tone: 'warning' as const },
];

export function ReceptionistDashboard() {
  const { entries, setEntries, advance, skipCurrent } = useQueue();

  useEffect(() => {
    if (entries.length === 0) setEntries(demoQueue);
  }, [entries.length, setEntries]);

  const current = entries[0];

  return (
    <div className="space-y-5">
      <NowServingAnnouncer placement="panel" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-2xl font-bold tracking-tight text-ink-900 dark:text-ink-50">Reception desk</div>
          <div className="text-sm text-muted">Five-second token generation · {demoClinic.name}</div>
        </div>
        <div className="flex items-center gap-2">
          <LiveClock />
          <Badge tone="success" pulse>Live</Badge>
          <a href="/display/clinic" target="_blank" rel="noreferrer">
            <Button variant="outline" leftIcon={<Monitor size={14} />}>TV display</Button>
          </a>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatTile label="Patients today" value={demoClinic.todayPatients} hint="Walk-ins + bookings" icon={<Users size={14} />} accent="brand" sparkline={clinicSparklines.patients} />
        <StatTile label="In queue" value={entries.length} hint="Tokens in line" icon={<Ticket size={14} />} accent="accent" sparkline={clinicSparklines.queue} />
        <StatTile label="Completed" value={25} hint="Successful visits" icon={<CheckCircle size={14} />} accent="success" sparkline={clinicSparklines.completed} />
        <StatTile label="Earnings today" value={inr(demoClinic.todayRevenue)} hint="Cash + UPI" icon={<IndianRupee size={14} />} accent="warning" sparkline={clinicSparklines.earnings} />
      </div>

      <Card className="bg-gradient-to-br from-brand-500/8 to-accent-500/8 border-brand-500/20">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="text-base font-semibold text-ink-900 dark:text-ink-50">Quick actions</div>
            <div className="text-xs text-muted">Big buttons. Few clicks. Under 5 seconds per patient.</div>
          </div>
          <Badge tone="brand" pulse>Live</Badge>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {actions.map((a) => (
            <Link key={a.label} to={a.to}>
              <motion.div whileHover={{ y: -3, scale: 1.01 }} className="rounded-2xl bg-white dark:bg-ink-900 border hairline p-5 flex flex-col items-center gap-2 text-center h-28">
                <div className={`h-11 w-11 rounded-2xl flex items-center justify-center ${
                  a.tone === 'brand' ? 'bg-brand-500/15 text-brand-600 dark:text-brand-300' :
                  a.tone === 'accent' ? 'bg-accent-500/15 text-accent-600 dark:text-accent-300' :
                  a.tone === 'success' ? 'bg-success-500/15 text-success-600 dark:text-success-500' :
                  'bg-warning-500/15 text-warning-600 dark:text-warning-500'
                }`}>{a.icon}</div>
                <div className="text-sm font-semibold text-ink-900 dark:text-ink-50">{a.label}</div>
              </motion.div>
            </Link>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <CurrentTokenCard current={current} onComplete={advance} onSkip={skipCurrent} />
        <QueuePreview entries={entries} viewAllTo="/receptionist/queue" limit={6} />
        <ActivityFeed items={clinicActivity} title="Recent activity" subtitle="Today at the desk" />
      </div>
    </div>
  );
}
