import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { Card, CardHeader, CardSubtitle, CardTitle } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { Users, IndianRupee, RotateCw, Repeat } from 'lucide-react';
import { demoQueueTrend, demoSourceMix, demoFunnelWeek, demoRevenueSeries } from '@/services/demoData';
import { inr, inrCompact } from '@/lib/format';

export function ClinicReports() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Patients (7d)" value="406" icon={<Users size={16} />} accent="brand" delta={{ value: '+12% WoW', positive: true }} />
        <StatCard label="Revenue (7d)" value={inr(72200)} icon={<IndianRupee size={16} />} accent="success" delta={{ value: '+8% WoW', positive: true }} />
        <StatCard label="Follow-up rate" value="38%" icon={<Repeat size={16} />} accent="accent" />
        <StatCard label="Avg visits / patient" value="4.6" icon={<RotateCw size={16} />} accent="warning" />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Queue source mix (this week)</CardTitle>
              <CardSubtitle>Offline + Online + QR</CardSubtitle>
            </div>
            <Badge tone="brand">Stacked</Badge>
          </CardHeader>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={demoQueueTrend}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="d" stroke="currentColor" opacity={0.6} fontSize={11} />
                <YAxis stroke="currentColor" opacity={0.6} fontSize={11} />
                <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.95)', border: 'none', borderRadius: 12, color: 'white', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="offline" stackId="a" fill="#0ea5e9" name="Offline" />
                <Bar dataKey="online" stackId="a" fill="#3b82f6" name="Online" />
                <Bar dataKey="qr" stackId="a" fill="#0ea5e9" name="QR" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Source distribution</CardTitle>
              <CardSubtitle>This week</CardSubtitle>
            </div>
          </CardHeader>
          <div className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={demoSourceMix} dataKey="value" nameKey="name" outerRadius={90} innerRadius={48} paddingAngle={2}>
                  {demoSourceMix.map((s) => <Cell key={s.name} fill={s.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.95)', border: 'none', borderRadius: 12, color: 'white', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Visits vs follow-ups (this week)</CardTitle>
              <CardSubtitle>How many of today's patients return</CardSubtitle>
            </div>
          </CardHeader>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={demoFunnelWeek}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="d" stroke="currentColor" opacity={0.6} fontSize={11} />
                <YAxis stroke="currentColor" opacity={0.6} fontSize={11} />
                <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.95)', border: 'none', borderRadius: 12, color: 'white', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="visits" fill="#3b82f6" name="Visits" radius={[6, 6, 0, 0]} />
                <Bar dataKey="followups" fill="#3b82f6" name="Follow-ups" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Revenue trend (6 months)</CardTitle>
              <CardSubtitle>Consultation collections</CardSubtitle>
            </div>
          </CardHeader>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={demoRevenueSeries.map((d) => ({ m: d.m, v: Math.round(d.revenue / 200) }))}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="m" stroke="currentColor" opacity={0.6} fontSize={11} />
                <YAxis stroke="currentColor" opacity={0.6} fontSize={11} tickFormatter={(v) => inrCompact(v)} />
                <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.95)', border: 'none', borderRadius: 12, color: 'white', fontSize: 12 }} formatter={(v: number) => inr(v)} />
                <Line type="monotone" dataKey="v" stroke="#0ea5e9" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
