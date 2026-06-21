import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Card, CardHeader, CardTitle, CardSubtitle } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { TrendingUp, IndianRupee, Wallet } from 'lucide-react';
import { demoRevenueSeries, demoSuperAdmin } from '@/services/demoData';
import { inr, inrCompact } from '@/lib/format';

export function AdminRevenue() {
  const d = demoSuperAdmin;
  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard label="MTD revenue" value={inr(d.monthlyRevenue)} accent="brand" icon={<IndianRupee size={16} />} />
        <StatCard label="Recharge MTD" value={inr(d.walletRechargeMtd)} accent="accent" icon={<Wallet size={16} />} />
        <StatCard label="MoM growth" value="+18.4%" accent="success" icon={<TrendingUp size={16} />} delta={{ value: 'vs last 6mo avg', positive: true }} />
      </div>
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Revenue trend</CardTitle>
            <CardSubtitle>Combined consultations + recharge</CardSubtitle>
          </div>
        </CardHeader>
        <div className="h-80">
          <ResponsiveContainer>
            <AreaChart data={demoRevenueSeries}>
              <defs>
                <linearGradient id="ar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(59,130,246)" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="rgb(59,130,246)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="m" stroke="currentColor" opacity={0.6} fontSize={11} />
              <YAxis stroke="currentColor" opacity={0.6} fontSize={11} tickFormatter={(v) => inrCompact(v)} />
              <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.95)', border: 'none', borderRadius: 12, color: 'white', fontSize: 12 }} formatter={(v: number) => inr(v)} />
              <Area type="monotone" dataKey="revenue" stroke="rgb(59,130,246)" strokeWidth={2.5} fill="url(#ar)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
