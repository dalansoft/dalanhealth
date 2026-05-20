import { motion } from 'framer-motion';
import { Building2, IndianRupee, Wallet, Bell, Users, AlertCircle, TrendingUp, Activity } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardSubtitle, CardTitle, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { demoClinics, demoRevenueSeries, demoQueueTrend, demoSuperAdmin } from '@/services/demoData';
import { inr, inrCompact, num } from '@/lib/format';

export function AdminDashboard() {
  const d = demoSuperAdmin;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total clinics" value={num(d.totalClinics)} delta={{ value: '+8 this month', positive: true }} icon={<Building2 size={16} />} accent="brand" />
        <StatCard label="Today's revenue" value={inr(d.todayRevenue)} delta={{ value: '+12% vs yesterday', positive: true }} icon={<IndianRupee size={16} />} accent="success" />
        <StatCard label="MTD revenue" value={inrCompact(d.monthlyRevenue)} delta={{ value: '+18% MoM', positive: true }} icon={<TrendingUp size={16} />} accent="accent" />
        <StatCard label="Wallet recharge MTD" value={inrCompact(d.walletRechargeMtd)} icon={<Wallet size={16} />} accent="teal" />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Revenue & recharge</CardTitle>
              <CardSubtitle>Trailing 6 months</CardSubtitle>
            </div>
            <Badge tone="success" pulse>Live</Badge>
          </CardHeader>
          <div className="h-72">
            <ResponsiveContainer>
              <LineChart data={demoRevenueSeries}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgb(47,127,255)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="rgb(47,127,255)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="m" stroke="currentColor" opacity={0.6} fontSize={11} />
                <YAxis stroke="currentColor" opacity={0.6} fontSize={11} tickFormatter={(v) => inrCompact(v)} />
                <Tooltip
                  contentStyle={{ background: 'rgba(15,23,42,0.95)', border: 'none', borderRadius: 12, color: 'white', fontSize: 12 }}
                  formatter={(v: number) => inr(v)}
                />
                <Line type="monotone" dataKey="revenue" stroke="rgb(47,127,255)" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="recharge" stroke="rgb(139,92,246)" strokeWidth={2.5} strokeDasharray="4 4" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Queue source mix</CardTitle>
              <CardSubtitle>This week</CardSubtitle>
            </div>
            <Activity size={14} className="text-muted" />
          </CardHeader>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={demoQueueTrend}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="d" stroke="currentColor" opacity={0.6} fontSize={11} />
                <YAxis stroke="currentColor" opacity={0.6} fontSize={11} />
                <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.95)', border: 'none', borderRadius: 12, color: 'white', fontSize: 12 }} />
                <Bar dataKey="online" stackId="a" fill="rgb(47,127,255)" radius={[0,0,0,0]} />
                <Bar dataKey="offline" stackId="a" fill="rgb(16,185,129)" radius={[0,0,0,0]} />
                <Bar dataKey="qr" stackId="a" fill="rgb(139,92,246)" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Top clinics today</CardTitle>
              <CardSubtitle>By patient throughput</CardSubtitle>
            </div>
          </CardHeader>
          <div className="overflow-hidden rounded-xl border hairline">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 dark:bg-ink-900/60">
                <tr className="text-left text-[11px] uppercase tracking-wider text-muted">
                  <th className="px-4 py-2.5">Clinic</th>
                  <th className="px-4 py-2.5">City</th>
                  <th className="px-4 py-2.5">Plan</th>
                  <th className="px-4 py-2.5 text-right">Wallet</th>
                  <th className="px-4 py-2.5 text-right">Patients</th>
                  <th className="px-4 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y hairline">
                {demoClinics.map((c) => (
                  <motion.tr key={c.id} whileHover={{ backgroundColor: 'rgba(148,163,184,0.05)' }} className="text-sm">
                    <td className="px-4 py-3 font-medium text-ink-900 dark:text-ink-50">{c.name}</td>
                    <td className="px-4 py-3 text-muted">{c.city}</td>
                    <td className="px-4 py-3"><Badge tone={c.plan === 'Growth' ? 'brand' : 'neutral'} size="sm">{c.plan}</Badge></td>
                    <td className="px-4 py-3 text-right font-medium">{inr(c.wallet)}</td>
                    <td className="px-4 py-3 text-right font-medium">{c.patientsToday}</td>
                    <td className="px-4 py-3">
                      <Badge tone={c.status === 'Active' ? 'success' : 'warning'} size="sm">{c.status}</Badge>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-4">
          <StatCard label="Patients (total)" value={num(d.patientCount)} icon={<Users size={16} />} accent="brand" />
          <StatCard label="Notifications sent" value={`${num(d.notificationsSent / 1000)}K`} icon={<Bell size={16} />} accent="accent" />
          <StatCard label="Pending issues" value={d.pendingIssues} icon={<AlertCircle size={16} />} accent="warning" />
        </div>
      </div>
    </div>
  );
}
