import { Link } from 'react-router-dom';
import { Card, CardSubtitle, CardTitle } from '@/components/ui/Card';
import { SourceBadge } from '@/components/ui/SourceBadge';
import { Badge } from '@/components/ui/Badge';
import { tokenLabel, type QueueEntry } from '@/store/queue';

interface Props {
  entries: QueueEntry[];
  title?: string;
  viewAllTo?: string;
  limit?: number;
}

export function QueuePreview({ entries, title = 'Live queue', viewAllTo = '/clinic/queue', limit = 6 }: Props) {
  const list = entries.slice(0, limit);
  return (
    <Card className="flex flex-col overflow-hidden lg:h-full">
      <div className="shrink-0 flex items-center justify-between mb-3">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardSubtitle>Next {list.length} in line</CardSubtitle>
        </div>
        <Link to={viewAllTo} className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-300 hover:underline">
          View all
        </Link>
      </div>
      <div className="space-y-1.5 overflow-y-auto pr-1 lg:flex-1 lg:min-h-0">
        {list.map((e, idx) => (
          <div key={e.id} className="flex items-center justify-between rounded-xl border hairline p-2.5">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`text-base font-extrabold tracking-tight w-12 text-center ${e.emergency ? 'text-danger-500' : idx === 0 ? 'text-token' : idx === 1 ? 'text-brand-600 dark:text-brand-300' : 'text-ink-500'}`}>
                {tokenLabel(e)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm font-medium text-ink-900 dark:text-ink-50 truncate">{e.patientName}</span>
                  <SourceBadge source={e.source} />
                </div>
                <div className="text-[11px] text-muted truncate">{e.patientMobile}</div>
              </div>
            </div>
            {idx === 0 && <Badge tone="success" pulse size="sm">Now</Badge>}
          </div>
        ))}
        {list.length === 0 && <div className="text-sm text-muted text-center py-6">Queue is empty.</div>}
      </div>
    </Card>
  );
}
