import { Link } from 'react-router-dom';
import { Plus, Wallet } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { inr, num } from '@/lib/format';

interface Props {
  balance: number;
  perVisitRate: number;
  to?: string;
  warnAt?: number;
}

export function WalletMiniCard({ balance, perVisitRate, to = '/clinic/wallet', warnAt = 1000 }: Props) {
  const low = balance < warnAt;
  const visitsLeft = Math.floor(balance / perVisitRate);
  return (
    <Card className="relative overflow-hidden lg:h-full">
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand-500/15 blur-2xl" />
      <div className="relative flex flex-col lg:h-full">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted">Clinic wallet</div>
            <div className="mt-1 flex items-center gap-2">
              <div className="text-3xl font-extrabold tracking-tight text-ink-900 dark:text-ink-50">{inr(balance)}</div>
              {low && <Badge tone="warning" size="sm" pulse>Low</Badge>}
            </div>
            <div className="mt-1 text-[11px] text-muted">
              Capacity · ~{num(visitsLeft)} patients (₹{perVisitRate} per visit)
            </div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-brand-500/15 text-brand-600 dark:text-brand-300 flex items-center justify-center">
            <Wallet size={18} />
          </div>
        </div>
        <Link to={to} className="mt-auto pt-4">
          <Button fullWidth leftIcon={<Plus size={14} />}>Add credits</Button>
        </Link>
      </div>
    </Card>
  );
}
