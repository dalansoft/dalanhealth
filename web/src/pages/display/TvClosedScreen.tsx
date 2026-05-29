import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Moon, Clock, Calendar } from 'lucide-react';
import { DalanMark } from '@/components/ui/Logo';
import { useCurrentBranch } from '@/store/branch';
import type { TvSchedule } from '@/store/tvAccounts';

interface Props {
  schedule?: TvSchedule;
  tvName?: string;
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const formatHour = (h: number): string => {
  const period = h >= 12 ? 'PM' : 'AM';
  const display = h % 12 || 12;
  return `${display}:00 ${period}`;
};

/**
 * Full-screen "we're closed" placard shown when the TV is outside its
 * scheduled active hours. Replaces the queue display, keeps clock + clinic
 * identity visible so staff can tell at a glance that the TV is alive and
 * just dormant (not crashed).
 */
export function TvClosedScreen({ schedule, tvName }: Props) {
  const branch = useCurrentBranch();
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const date = now.toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div
      style={{ height: '100dvh' }}
      className="w-full overflow-hidden bg-ink-50 dark:bg-navy-950 text-ink-900 dark:text-white relative flex flex-col items-center justify-center px-4"
    >
      {/* Decorative backdrop */}
      <div aria-hidden className="pointer-events-none absolute -top-40 -left-40 h-[640px] w-[640px] rounded-full bg-brand-500/10 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-40 -right-40 h-[640px] w-[640px] rounded-full bg-accent-500/10 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 text-center max-w-xl"
      >
        <div className="flex justify-center mb-6">
          <DalanMark size={64} />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ink-200/60 dark:bg-white/10 text-ink-700 dark:text-white/80 text-xs font-bold uppercase tracking-[0.2em] mb-4">
          <Moon size={12} /> Outside clinic hours
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
          We're closed for now
        </h1>

        {branch && (
          <p className="mt-3 text-base sm:text-lg text-muted">
            {branch.name} · {date}
          </p>
        )}

        {schedule && (
          <div className="mt-8 inline-flex flex-col sm:flex-row gap-4 rounded-2xl border hairline bg-white/60 dark:bg-ink-900/60 backdrop-blur-xl px-6 py-4 text-left">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/15 text-brand-600 dark:text-brand-300">
                <Clock size={16} />
              </span>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted">Daily hours</div>
                <div className="text-sm font-semibold text-ink-900 dark:text-ink-50">
                  {formatHour(schedule.startHour)} – {formatHour(schedule.endHour)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-accent-500/15 text-accent-600 dark:text-accent-300">
                <Calendar size={16} />
              </span>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted">Active days</div>
                <div className="text-sm font-semibold text-ink-900 dark:text-ink-50">
                  {schedule.daysActive.map((d) => DAY_NAMES[d]).join(', ')}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-10 text-xs text-muted">
          {tvName ? `${tvName} · ` : ''}Display will resume automatically when we open.
        </div>
      </motion.div>
    </div>
  );
}
