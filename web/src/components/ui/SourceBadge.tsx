import { Globe, Store, QrCode } from 'lucide-react';
import { Badge } from './Badge';
import type { QueueSource } from '@/store/queue';

export function SourceBadge({ source }: { source: QueueSource }) {
  if (source === 'ONLINE') {
    return <Badge tone="online" size="sm" icon={<Globe size={10} />}>Online</Badge>;
  }
  if (source === 'OFFLINE') {
    return <Badge tone="offline" size="sm" icon={<Store size={10} />}>Offline</Badge>;
  }
  return <Badge tone="qr" size="sm" icon={<QrCode size={10} />}>QR</Badge>;
}
