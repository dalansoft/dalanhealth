import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Ticket, IndianRupee, Wallet, Plus, FileText, Receipt, BellRing, Clock } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardHeader, CardSubtitle, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SourceBadge } from '@/components/ui/SourceBadge';
import { StatusPill } from '@/components/ui/StatusPill';
import { demoClinic, demoQueue, demoRevenueSeries } from '@/services/demoData';
import { inr } from '@/lib/format';

const actions = [
  { icon: <Plus size={16} />, label: 'Add patient', to: '/receptionist/add', tone: 'brand' },
  { icon: <Ticket size={16} />, label: 'Queue', to: '/clinic/queue', tone: 'accent' },
  { icon: <Receipt size={16} />, label: 'Billing', to: '/clinic/billing', tone: 'success' },
  { icon: <FileText size={16} />, label: 'Prescription', to: '/clinic/prescription', tone: 'warning' },
];

export function ClinicDashboard() {
  const c = demoClinic;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Today's patients" value={c.todayPatients} icon={<Users size={16} />} accent="brand" />
        <StatCard label="Today's revenue" value={inr(c.todayRevenue)} icon={<IndianRupee size={16} />} accent="success" />
        <StatCard label="Wallet balance" value={inr(c.walletBalance)} icon={<Wallet size={16} />} accent="accent" />
        <StatCard label="Follow-ups due" value={c.followUps} icon={<BellRing size={16} />} accent="warning" />
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Quick actions</CardTitle>
            <CardSubtitle>One click to common workflows</CardSubtitle>
          </div>
          <Badge tone="brand">{c.timing}</Badge>
        </CardHeader>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {actions.map((a) => (
            <Link key={a.label} to={a.to}>
              <motion.div whileHover={{ y: -3 }} className="rounded-2xl border hairline bg-white dark:bg-ink-900 p-5 flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                  a.tone === 'brand' ? 'bg-brand-500/15 text-brand-600 dark:text-brand-300' :
                  a.tone === 'accent' ? 'bg-accent-500/15 text-accent-600 dark:text-accent-300' :
                  a.tone === 'success' ? 'bg-success-500/15 text-success-600 dark:text-success-500' :
                  'bg-warning-500/15 text-warning-600 dark:text-warning-500'
                }`}>{a.icon}</div>
                <div>
                  <div className="text-sm font-semibold text-ink-900 dark:text-ink-50">{a.label}</div>
                  <div className="text-xs text-muted">Open</div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Live queue</CardTitle>
              <CardSubtitle>Next five patients</CardSubtitle>
            </div>
            <Link to="/clinic/queue"><Button variant="ghost" size="sm">Open queue →</Button></Link>
          </CardHeader>
          <div className="space-y-2">
            {demoQueue.slice(0, 5).map((q) => (
              <div key={q.id} className="flex items-center justify-between rounded-xl border hairline bg-white/60 dark:bg-ink-900/60 p-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-brand-500/15 text-brand-700 dark:text-brand-300 flex items-center justify-center font-semibold">#{q.token}</div>
                  <div>
                    <div className="text-sm font-medium text-ink-900 dark:text-ink-50">{q.patientName}</div>
                    <div className="text-[11px] text-muted flex items-center gap-2">
                      <SourceBadge source={q.source} />
                      <span className="inline-flex items-center gap-1"><Clock size={11} /> {q.joinedAt}</span>
                    </div>
                  </div>
                </div>
                <StatusPill status={q.status} />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Revenue (6mo)</CardTitle>
              <CardSubtitle>Trend</CardSubtitle>
            </div>
          </CardHeader>
          <div className="h-56">
            <ResponsiveContainer>
              <LineChart data={demoRevenueSeries.map((d) => ({ m: d.m, v: Math.round(d.revenue / 200) }))}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="m" stroke="currentColor" opacity={0.6} fontSize={10} />
                <YAxis stroke="currentColor" opacity={0.6} fontSize={10} />
                <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.95)', border: 'none', borderRadius: 12, color: 'white', fontSize: 12 }} formatter={(v: number) => inr(v)} />
                <Line type="monotone" dataKey="v" stroke="rgb(139,92,246)" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
