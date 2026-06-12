import { Bell, Smartphone, MessageCircle, MessageSquare, Mail } from 'lucide-react';
import { Card, CardSubtitle, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { demoAdminNotifications } from '@/services/demoData';
import { num } from '@/lib/format';

const channelIcon: Record<string, React.ReactNode> = {
  Push: <Smartphone size={14} />,
  WhatsApp: <MessageCircle size={14} />,
  SMS: <MessageSquare size={14} />,
  Email: <Mail size={14} />,
};

export function AdminNotifications() {
  const totalSent = demoAdminNotifications.reduce((s, n) => s + n.delivered + n.failed, 0);
  const totalDelivered = demoAdminNotifications.reduce((s, n) => s + n.delivered, 0);
  const totalFailed = demoAdminNotifications.reduce((s, n) => s + n.failed, 0);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Sent today" value={num(totalSent)} icon={<Bell size={16} />} accent="brand" />
        <StatCard label="Delivered" value={num(totalDelivered)} accent="success" />
        <StatCard label="Failed" value={totalFailed} accent="danger" />
        <StatCard label="Avg delivery" value="2.1s" accent="accent" />
      </div>

      <Card className="bg-brand-500/5 border-brand-500/20">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-xl bg-brand-500/15 text-brand-600 dark:text-brand-300 flex items-center justify-center"><Bell size={16} /></div>
          <div>
            <div className="text-sm font-semibold text-ink-900 dark:text-ink-50">Fallback chain</div>
            <p className="mt-1 text-xs text-muted">
              For each event we attempt Push → WhatsApp → SMS → Email. The first channel to acknowledge delivery wins.
              Per-clinic toggles in <code className="font-mono">clinic/settings</code> override the chain.
            </p>
          </div>
        </div>
      </Card>

      <Card padded={false}>
        <div className="px-5 pt-5 pb-3">
          <CardTitle>Recent dispatches</CardTitle>
          <CardSubtitle>Aggregate sends across clinics</CardSubtitle>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-ink-50 dark:bg-ink-900/60">
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted">
                <th className="px-5 py-3">When</th>
                <th className="px-5 py-3">Channel</th>
                <th className="px-5 py-3">Recipients</th>
                <th className="px-5 py-3">Event</th>
                <th className="px-5 py-3 text-right">Delivered</th>
                <th className="px-5 py-3 text-right">Failed</th>
              </tr>
            </thead>
            <tbody className="divide-y hairline">
              {demoAdminNotifications.map((n) => (
                <tr key={n.id}>
                  <td className="px-5 py-3 text-muted">{n.time}</td>
                  <td className="px-5 py-3"><span className="inline-flex items-center gap-1.5 text-ink-700 dark:text-ink-200 text-xs">{channelIcon[n.channel]} {n.channel}</span></td>
                  <td className="px-5 py-3">{n.recipient}</td>
                  <td className="px-5 py-3"><Badge tone="neutral" size="sm">{n.event}</Badge></td>
                  <td className="px-5 py-3 text-right text-success-600 dark:text-success-500 font-semibold">{n.delivered}</td>
                  <td className={`px-5 py-3 text-right font-semibold ${n.failed > 0 ? 'text-danger-500' : 'text-muted'}`}>{n.failed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
