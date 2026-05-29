import { ArrowUpCircle, ArrowDownCircle, CheckCircle, UserPlus } from 'lucide-react';
import { Card, CardSubtitle, CardTitle } from '@/components/ui/Card';
import { inr } from '@/lib/format';

export type ActivityKind = 'deposit' | 'visit_end' | 'new_patient' | 'recharge';

export interface ActivityItem {
  kind: ActivityKind;
  label: string;
  detail: string;
  amount?: number;
  positive?: boolean;
  when: string;
}

const meta: Record<ActivityKind, { icon: React.ReactNode; color: string; bg: string }> = {
  deposit: { icon: <ArrowUpCircle size={14} />, color: 'text-success-600 dark:text-success-500', bg: 'bg-success-500/15' },
  recharge: { icon: <ArrowUpCircle size={14} />, color: 'text-success-600 dark:text-success-500', bg: 'bg-success-500/15' },
  visit_end: { icon: <CheckCircle size={14} />, color: 'text-brand-600 dark:text-brand-300', bg: 'bg-brand-500/15' },
  new_patient: { icon: <UserPlus size={14} />, color: 'text-accent-600 dark:text-accent-300', bg: 'bg-accent-500/15' },
};

interface Props {
  title?: string;
  subtitle?: string;
  items: ActivityItem[];
}

export function ActivityFeed({ title = 'Recent activity', subtitle = 'Today', items }: Props) {
  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <div className="shrink-0 mb-3">
        <CardTitle>{title}</CardTitle>
        <CardSubtitle>{subtitle}</CardSubtitle>
      </div>
      <div className="flex-1 min-h-0 space-y-1.5 overflow-y-auto pr-1">
        {items.map((it, i) => {
          const m = meta[it.kind];
          return (
            <div key={i} className="flex items-center gap-3 rounded-xl border hairline bg-white/40 dark:bg-ink-900/40 p-3">
              <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${m.bg} ${m.color}`}>{m.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-ink-900 dark:text-ink-50 truncate">{it.label}</div>
                <div className="text-[11px] text-muted truncate">{it.detail} · {it.when}</div>
              </div>
              {it.amount !== undefined && (
                <ArrowDownCircle aria-hidden className="hidden" />
              )}
              {it.amount !== undefined && (
                <div className={`text-sm font-semibold ${it.positive ? 'text-success-600 dark:text-success-500' : 'text-danger-500'}`}>
                  {it.positive ? '+' : '−'} {inr(Math.abs(it.amount))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
