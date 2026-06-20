import { BarChart, Bar, LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { Card, CardHeader, CardSubtitle, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/ui/StatCard';
import { Download, TrendingUp, Users, Building2, IndianRupee } from 'lucide-react';
import { demoRevenueSeries, demoQueueTrend, demoClinics } from '@/services/demoData';
import { inr, inrCompact, num } from '@/lib/format';

export function AdminReports() {
  const totalPatientsToday = demoClinics.reduce((s, c) => s + c.patientsToday, 0);
  const totalWallet = demoClinics.reduce((s, c) => s + c.wallet, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
          <StatCard label="Patients today (all)" value={num(totalPatientsToday)} icon={<Users size={16} />} accent="brand" />
          <StatCard label="Active clinics" value={demoClinics.length} icon={<Building2 size={16} />} accent="accent" />
          <StatCard label="MTD revenue" value={inrCompact(1_842_000)} icon={<IndianRupee size={16} />} accent="success" />
          <StatCard label="MoM growth" value="+18.4%" icon={<TrendingUp size={16} />} accent="warning" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Available reports</CardTitle>
            <CardSubtitle>Generate and export — CSV or PDF</CardSubtitle>
          </div>
          <Button variant="outline" leftIcon={<Download size={14} />}>Export current view</Button>
        </CardHeader>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            'Revenue by clinic (MTD)',
            'Revenue by city',
            'Revenue by plan',
            'Source mix (offline vs online vs QR)',
            'Follow-up funnel',
            'Cashback issuance',
            'Wallet recharge log',
            'Notification delivery rate',
            'Support response time',
          ].map((r) => (
            <button key={r} className="text-left rounded-xl border hairline p-4 hover:border-brand-400/50 hover:bg-brand-500/5 transition-colors">
              <div className="text-sm font-semibold text-ink-900 dark:text-ink-50">{r}</div>
              <div className="text-xs text-muted mt-0.5">Click to open</div>
            </button>
          ))}
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Revenue trend</CardTitle>
              <CardSubtitle>6 months · all clinics combined</CardSubtitle>
            </div>
          </CardHeader>
          <div className="h-72">
            <ResponsiveContainer>
              <LineChart data={demoRevenueSeries}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="m" stroke="currentColor" opacity={0.6} fontSize={11} />
                <YAxis stroke="currentColor" opacity={0.6} fontSize={11} tickFormatter={(v) => inrCompact(v)} />
                <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.95)', border: 'none', borderRadius: 12, color: 'white', fontSize: 12 }} formatter={(v: number) => inr(v)} />
                <Line type="monotone" dataKey="revenue" stroke="#14b8a6" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="recharge" stroke="#10b981" strokeWidth={2.5} strokeDasharray="4 4" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Queue source distribution</CardTitle>
              <CardSubtitle>This week · all clinics</CardSubtitle>
            </div>
          </CardHeader>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={demoQueueTrend}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="d" stroke="currentColor" opacity={0.6} fontSize={11} />
                <YAxis stroke="currentColor" opacity={0.6} fontSize={11} />
                <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.95)', border: 'none', borderRadius: 12, color: 'white', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="offline" stackId="a" fill="#10b981" name="Offline" />
                <Bar dataKey="online" stackId="a" fill="#14b8a6" name="Online" />
                <Bar dataKey="qr" stackId="a" fill="#10b981" name="QR" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Wallet snapshot</CardTitle>
            <CardSubtitle>Total prepaid balance across clinics: {inr(totalWallet)}</CardSubtitle>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}
