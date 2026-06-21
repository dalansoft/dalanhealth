import { motion } from 'framer-motion';
import { Check, SkipForward, Phone } from 'lucide-react';
import { Card, CardSubtitle, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SourceBadge } from '@/components/ui/SourceBadge';
import { tokenLabel, type QueueEntry } from '@/store/queue';

interface Props {
  current?: QueueEntry;
  onComplete?: () => void;
  onSkip?: () => void;
  onEndVisit?: () => void;
}

/**
 * Big green "CURRENT TOKEN" spotlight modelled on the reference video.
 * Used on clinic + receptionist dashboards.
 */
export function CurrentTokenCard({ current, onComplete, onSkip }: Props) {
  return (
    <Card className="relative overflow-hidden h-full">
      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-token/15 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 -bottom-16 h-40 w-40 rounded-full bg-brand-500/10 blur-3xl" />
      <div className="relative flex flex-col h-full">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted">Current token</div>
            <CardTitle className="text-base mt-0.5">Now serving</CardTitle>
          </div>
          {current && <Badge tone="success" pulse>In consultation</Badge>}
        </div>

        {current ? (
          <>
            <div className="flex flex-col items-center justify-center text-center flex-1 py-4">
              <motion.div
                key={current.token}
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 240, damping: 18 }}
                className={`text-7xl sm:text-8xl font-extrabold leading-none tracking-tight ${current.emergency ? 'text-danger-500 drop-shadow-[0_0_36px_rgba(239,68,68,0.45)]' : 'text-token drop-shadow-[0_0_36px_rgba(59,130,246,0.45)]'}`}
              >
                {tokenLabel(current)}
              </motion.div>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <span className="text-lg font-semibold text-ink-900 dark:text-ink-50">{current.patientName}</span>
                <SourceBadge source={current.source} />
              </div>
              <div className="mt-1 inline-flex items-center gap-1 text-xs text-muted">
                <Phone size={11} />{current.patientMobile}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button variant="success" leftIcon={<Check size={14} />} onClick={onComplete}>End visit</Button>
              <Button variant="outline" leftIcon={<SkipForward size={14} />} onClick={onSkip}>Skip</Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
            <div className="text-5xl font-extrabold text-token/30">#—</div>
            <CardSubtitle className="mt-3">No active consultation</CardSubtitle>
          </div>
        )}
      </div>
    </Card>
  );
}
