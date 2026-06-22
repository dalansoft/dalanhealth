import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Ticket, IndianRupee, CheckCircle, Monitor, UserPlus, FileUp } from 'lucide-react';
import { StatTile } from '@/components/dashboard/StatTile';
import { CurrentTokenCard } from '@/components/dashboard/CurrentTokenCard';
import { WalletMiniCard } from '@/components/dashboard/WalletMiniCard';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { QueuePreview } from '@/components/dashboard/QueuePreview';
import { Button } from '@/components/ui/Button';
import { LiveClock } from '@/components/ui/LiveClock';
import { AddPatientModal } from '@/pages/receptionist/AddPatientModal';
import { NowServingAnnouncer } from '@/components/feedback/NowServingAnnouncer';
import { useQueueBoot } from '@/hooks/useQueueBoot';
import { useQueue } from '@/store/queue';
import { useAuth } from '@/store/auth';
import { useBranch, useCurrentBranch } from '@/store/branch';
import { getBranchData } from '@/services/demoData';
// Note: demoClinic kept around for legacy uses elsewhere; this page now reads
// from branchData via `data` instead.
import { clinicActivity, clinicSparklines } from '@/services/activityData';
import { inr } from '@/lib/format';

export function ClinicDashboard() {
  const { entries, setEntries, advance, skipCurrent } = useQueue();
  // Live mode when really signed in; demo data otherwise.
  const queueMode = useQueueBoot();
  const userName = useAuth((s) => s.user?.name);
  const currentBranchId = useBranch((s) => s.currentBranchId);
  const branch = useCurrentBranch();
  const data = getBranchData(currentBranchId, branch);
  const [addOpen, setAddOpen] = useState(false);

  // Demo only: branch switching swaps the demo queue overlay. In live mode
  // the backend owns the queue — branches are a demo concept for now.
  // Deps are deliberately limited to the branch id — `data` / `branch` /
  // `setEntries` are derived or stable, and including them caused an infinite
  // render loop because `getBranchData()` returns a fresh object for
  // dynamically-added branches.
  useEffect(() => {
    if (useQueue.getState().mode !== 'demo') return;
    const d = getBranchData(currentBranchId, branch);
    setEntries(d.queue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentBranchId, queueMode]);

  const current = entries[0];
  const completedToday = data.completedToday;
  const liveQueue = entries.length;

  return (
    <div className="flex flex-col gap-3 lg:h-full lg:min-h-0">
      <NowServingAnnouncer placement="panel" />
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xl font-bold tracking-tight text-ink-900 dark:text-ink-50">
            Good {greeting()}, {(userName ?? 'Doctor')} <span aria-hidden>👋</span>
          </div>
          <div className="text-xs text-muted">
            Here's what's happening at <span className="font-semibold text-ink-700 dark:text-ink-200">{branch?.name ?? 'your clinic'}</span> today
            {data.doctor && <> · attending: <span className="font-semibold text-token">{data.doctor}</span></>}.
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button size="sm" leftIcon={<UserPlus size={14} />} onClick={() => setAddOpen(true)}>
            Add patient
          </Button>
          <Link to="/clinic/prescription?upload=1">
            <Button variant="outline" size="sm" leftIcon={<FileUp size={14} />}>Upload prescription</Button>
          </Link>
          <LiveClock />
          <a href="/display/clinic" target="_blank" rel="noreferrer">
            <Button variant="outline" size="sm" leftIcon={<Monitor size={14} />}>TV display</Button>
          </a>
        </div>
      </div>

      <AddPatientModal open={addOpen} onClose={() => setAddOpen(false)} />

      <div className="shrink-0 grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatTile label="Patients today" value={data.todayPatients} hint="18 new · 14 old" icon={<Users size={14} />} accent="brand" sparkline={clinicSparklines.patients} dense />
        <StatTile label="Live queue" value={liveQueue} hint={`${liveQueue} tokens in line`} icon={<Ticket size={14} />} accent="accent" sparkline={clinicSparklines.queue} dense />
        <StatTile label="Completed" value={completedToday} hint="Successful visits" icon={<CheckCircle size={14} />} accent="success" sparkline={clinicSparklines.completed} dense />
        <StatTile label="Earnings today" value={inr(data.todayRevenue)} hint="Revenue generated" icon={<IndianRupee size={14} />} accent="warning" sparkline={clinicSparklines.earnings} dense />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 lg:flex-1 lg:min-h-0">
        <QueuePreview entries={entries} viewAllTo="/clinic/queue" limit={5} />
        <CurrentTokenCard current={current} onComplete={advance} onSkip={skipCurrent} />
        <WalletMiniCard balance={data.walletBalance} perVisitRate={9} to="/clinic/wallet" />
        <ActivityFeed items={clinicActivity} />
      </div>

    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
