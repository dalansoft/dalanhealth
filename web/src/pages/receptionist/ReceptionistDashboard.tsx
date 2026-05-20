import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Ticket, IndianRupee, Clock, UserPlus, Receipt, FileText } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardHeader, CardSubtitle, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SourceBadge } from '@/components/ui/SourceBadge';
import { StatusPill } from '@/components/ui/StatusPill';
import { demoQueue, demoClinic } from '@/services/demoData';
import { inr } from '@/lib/format';

export function ReceptionistDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Today's patients" value={demoClinic.todayPatients} icon={<Users size={16} />} accent="brand" />
        <StatCard label="In queue now" value={demoQueue.length} icon={<Ticket size={16} />} accent="accent" />
        <StatCard label="Current token" value={`#${demoQueue[0]?.token ?? 0}`} icon={<Clock size={16} />} accent="success" />
        <StatCard label="Today's revenue" value={inr(demoClinic.todayRevenue)} icon={<IndianRupee size={16} />} accent="warning" />
      </div>

      <Card className="bg-gradient-to-br from-brand-500/8 to-accent-500/8 border-brand-500/20">
        <CardHeader>
          <div>
            <CardTitle>Quick workflow</CardTitle>
            <CardSubtitle>Big buttons. Fast clicks. Less than 5 seconds per patient.</CardSubtitle>
          </div>
          <Badge tone="brand" pulse>Live</Badge>
        </CardHeader>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: <UserPlus size={20} />, label: 'Add patient', to: '/receptionist/add', tone: 'brand' },
            { icon: <Ticket size={20} />, label: 'Queue', to: '/receptionist/queue', tone: 'accent' },
            { icon: <Receipt size={20} />, label: 'Billing', to: '/receptionist/billing', tone: 'success' },
            { icon: <FileText size={20} />, label: 'Prescription', to: '/receptionist/prescription', tone: 'warning' },
          ].map((a) => (
            <Link key={a.label} to={a.to}>
              <motion.div whileHover={{ y: -3, scale: 1.01 }} className="rounded-2xl bg-white dark:bg-ink-900 border hairline p-6 flex flex-col items-center justify-center gap-2 text-center h-32">
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${
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

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Live queue snapshot</CardTitle>
            <CardSubtitle>Next five</CardSubtitle>
          </div>
          <Link to="/receptionist/queue"><Button variant="ghost" size="sm">Open full queue →</Button></Link>
        </CardHeader>
        <div className="space-y-2">
          {demoQueue.slice(0, 5).map((q) => (
            <div key={q.id} className="flex items-center justify-between rounded-xl border hairline bg-white/60 dark:bg-ink-900/60 p-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-brand-500/15 text-brand-700 dark:text-brand-300 flex items-center justify-center font-semibold">#{q.token}</div>
                <div>
                  <div className="text-sm font-medium text-ink-900 dark:text-ink-50">{q.patientName}</div>
                  <div className="text-[11px] text-muted">{q.patientMobile}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <SourceBadge source={q.source} />
                <StatusPill status={q.status} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
