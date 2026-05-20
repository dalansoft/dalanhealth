import { Badge } from './Badge';
import type { QueueStatus } from '@/store/queue';

export function StatusPill({ status }: { status: QueueStatus }) {
  if (status === 'Consultation') {
    return <Badge tone="success" pulse>In consultation</Badge>;
  }
  if (status === 'Queue') {
    return <Badge tone="brand">Up next</Badge>;
  }
  return <Badge tone="neutral">Waiting</Badge>;
}
