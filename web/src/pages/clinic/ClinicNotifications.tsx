import { useState } from 'react';
import { Bell, Smartphone, MessageCircle, Mail, MessageSquare } from 'lucide-react';
import { Card, CardSubtitle, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { demoClinicNotifications } from '@/services/demoData';

const channelIcon: Record<string, React.ReactNode> = {
  Push: <Smartphone size={14} />,
  WhatsApp: <MessageCircle size={14} />,
  SMS: <MessageSquare size={14} />,
  Email: <Mail size={14} />,
};

const channels = ['All', 'Push', 'WhatsApp', 'SMS', 'Email'] as const;

export function ClinicNotifications() {
  const [filter, setFilter] = useState<typeof channels[number]>('All');
  const filtered = demoClinicNotifications.filter((n) => filter === 'All' || n.channel === filter);

  const delivered = demoClinicNotifications.filter((n) => n.status === 'Delivered').length;
  const failed = demoClinicNotifications.length - delivered;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Sent today" value={demoClinicNotifications.length} icon={<Bell size={16} />} accent="brand" />
        <StatCard label="Delivered" value={delivered} accent="success" />
        <StatCard label="Failed" value={failed} accent="danger" />
        <StatCard label="Avg delivery" value="2.4s" accent="accent" />
      </div>

      <Card padded={false}>
        <div className="px-5 pt-5 pb-3 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <CardTitle>Notification log</CardTitle>
            <CardSubtitle>Push → WhatsApp → SMS → Email fallback chain</CardSubtitle>
          </div>
          <div className="inline-flex rounded-xl border hairline p-1 text-sm">
            {channels.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filter === c ? 'bg-brand-500 text-white' : 'text-muted hover:text-ink-900 dark:hover:text-ink-50'
                }`}
              >{c}</button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-ink-50 dark:bg-ink-900/60">
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted">
                <th className="px-5 py-3">Time</th>
                <th className="px-5 py-3">Channel</th>
                <th className="px-5 py-3">Recipient</th>
                <th className="px-5 py-3">Event</th>
                <th className="px-5 py-3">Body</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y hairline">
              {filtered.map((n) => (
                <tr key={n.id}>
                  <td className="px-5 py-3 text-muted">{n.time}</td>
                  <td className="px-5 py-3"><span className="inline-flex items-center gap-1.5 text-ink-700 dark:text-ink-200 text-xs">{channelIcon[n.channel]} {n.channel}</span></td>
                  <td className="px-5 py-3">{n.recipient}</td>
                  <td className="px-5 py-3"><Badge tone="neutral" size="sm">{n.event}</Badge></td>
                  <td className="px-5 py-3 text-muted text-xs max-w-md truncate">{n.body}</td>
                  <td className="px-5 py-3"><Badge tone={n.status === 'Delivered' ? 'success' : 'danger'} size="sm">{n.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
