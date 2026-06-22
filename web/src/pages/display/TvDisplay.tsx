import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DalanMark } from '@/components/ui/Logo';
import { SourceBadge } from '@/components/ui/SourceBadge';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { SoundToggle } from '@/components/ui/SoundToggle';
import { VoiceLangSelect } from '@/components/ui/VoiceLangSelect';
import { NowServingAnnouncer } from '@/components/feedback/NowServingAnnouncer';
import { useQueue, tokenLabel } from '@/store/queue';
import { useQueueBoot } from '@/hooks/useQueueBoot';
import { useEta } from '@/hooks/useEta';
import { useBranch } from '@/store/branch';
import { useClinicTiming, fmtSlot } from '@/store/clinicTiming';
import { getBranchData } from '@/services/demoData';
import { useAuth } from '@/store/auth';
import { useTvAccounts, isWithinSchedule } from '@/store/tvAccounts';
import { TvClosedScreen } from './TvClosedScreen';

/**
 * TV / kiosk display for the clinic waiting room.
 *
 * Layout:
 *   - Mobile / tablet: header → token panel → up-next list → footer (stacked)
 *   - Laptop / TV:     header → [token panel | up-next list] → footer (2-col)
 * Locked to viewport on every device (no scroll); up-next list auto-fits rows.
 */
export function TvDisplay() {
  const { entries, setEntries } = useQueue();
  const [now, setNow] = useState(new Date());
  const user = useAuth((s) => s.user);
  const authToken = useAuth((s) => s.token);
  const isDemo = useAuth((s) => s.isDemo);
  const [searchParams] = useSearchParams();
  const switchBranch = useBranch((s) => s.switchBranch);
  const branches = useBranch((s) => s.branches);
  const storeBranchId = useBranch((s) => s.currentBranchId);
  const tvAccounts = useTvAccounts((s) => s.accounts);
  const touchTv = useTvAccounts((s) => s.touch);

  // ─── TV account binding ────────────────────────────────────────────────
  // If a TV is signed in (role=tv_display), its session pins the branch.
  // Otherwise (e.g. a clinic admin previewing the display) we fall back to
  // whichever branch the dashboard has selected. This is the line that keeps
  // multiple TVs at multiple branches independent of each other.
  const tvAccount = user?.role === 'tv_display' && user.tvId
    ? tvAccounts.find((a) => a.id === user.tvId)
    : undefined;
  // Depend on these stable primitives, NOT the tvAccount object — touchTv()
  // replaces that object every heartbeat, and depending on the object made the
  // effects re-run → touch → re-render forever (React error #185).
  const tvAccountId = tvAccount?.id;
  const tvAccountBranchId = tvAccount?.branchId;
  const effectiveBranchId = tvAccountBranchId ?? user?.branchId ?? storeBranchId;
  const branch = branches.find((b) => b.id === effectiveBranchId);
  const data = getBranchData(effectiveBranchId, branch);

  // If a TV session locks to a branch different from the dashboard's stored
  // selection, sync the branch store so QueuePreview / Profile / etc. line up.
  useEffect(() => {
    if (tvAccountBranchId && tvAccountBranchId !== storeBranchId) {
      switchBranch(tvAccountBranchId);
    }
  }, [tvAccountBranchId, storeBranchId, switchBranch]);

  // Heartbeat: stamp lastSeenAt so admins can see this TV is alive. Every
  // 60s is plenty — we're not building Datadog.
  useEffect(() => {
    if (!tvAccountId) return;
    touchTv(tvAccountId);
    const id = setInterval(() => touchTv(tvAccountId), 60_000);
    return () => clearInterval(id);
  }, [tvAccountId, touchTv]);

  // ─── Live vs demo data source ─────────────────────────────────────────
  // A physical wall TV opens /display/clinic?clinic=<clinic-id> — no login
  // needed; the queue arrives over WebSocket (the server pushes the current
  // listing on connect). A signed-in clinic admin previewing the display
  // gets their own clinic's live queue automatically. Demo browsing keeps
  // the local demo queue.
  const liveClinicId =
    searchParams.get('clinic') ??
    (authToken && !isDemo ? user?.clinicId ?? null : null);
  const queueMode = useQueueBoot(liveClinicId);

  // Demo only: seed this branch's queue, but never clobber a queue that's
  // already live. The dashboard and TV share one store (BroadcastChannel +
  // localStorage), so skips, recalls, completes and added patients must flow
  // through to the TV — we only (re)seed when there's nothing yet, or when the
  // branch actually changes.
  const seededBranchRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (useQueue.getState().mode !== 'demo') return;
    const branchChanged = seededBranchRef.current !== undefined && seededBranchRef.current !== effectiveBranchId;
    if (useQueue.getState().entries.length === 0 || branchChanged) {
      setEntries(getBranchData(effectiveBranchId, branch).queue);
    }
    seededBranchRef.current = effectiveBranchId;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveBranchId, queueMode]);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const current = entries[0];
  const eta = useEta();

  // Auto-fit row count for the up-next list.
  const listRef = useRef<HTMLDivElement>(null);
  const firstRowRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(8);

  useLayoutEffect(() => {
    const compute = () => {
      if (!listRef.current) return;
      const h = listRef.current.clientHeight;
      const measured = firstRowRef.current?.offsetHeight ?? 0;
      const w = window.innerWidth;
      const estimated = w >= 1280 ? 64 : w >= 1024 ? 58 : 48;
      const rowH = measured || estimated;
      const gap = 8;
      const fits = Math.max(1, Math.floor((h + gap) / (rowH + gap)));
      setVisibleCount(fits);
    };
    compute();
    const ro = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(() => compute())
      : null;
    if (ro && listRef.current) ro.observe(listRef.current);
    if (ro && firstRowRef.current) ro.observe(firstRowRef.current);
    window.addEventListener('resize', compute);
    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener('resize', compute);
    };
  }, []);

  const totalWaiting = Math.max(0, entries.length - (current ? 1 : 0));
  // Render ALL waiting patients in the up-next list; the list scrolls
  // internally if more exist than the visible window can hold.
  const upNext = entries.slice(1);
  // visibleCount is still computed (above) so we know how many fit without
  // scrolling — used to flag the overflow indicator in the panel footer.
  const overflow = Math.max(0, upNext.length - visibleCount);

  // Clock — manual format so seconds + uppercase AM/PM stay consistent.
  const h24 = now.getHours();
  const hour12 = String(h24 % 12 || 12).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  const second = String(now.getSeconds()).padStart(2, '0');
  const ampm = h24 >= 12 ? 'PM' : 'AM';
  const time = `${hour12}:${minute}:${second} ${ampm}`;
  const date = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const year = now.getFullYear();

  // Doctor sitting blocks come from the shared timing store (edited in
  // Settings), so adding a 3rd sitting reflects on the TV / QR / booking.
  const timingSlots = useClinicTiming((s) => s.slots);
  const timingBlocks = timingSlots.map(fmtSlot);

  const statusFor = (idx: number) => {
    if (idx === 0) return { label: 'Get ready', tone: 'text-brand-600 dark:text-brand-300' };
    if (idx === 1) return { label: 'Queue', tone: 'text-token' };
    return { label: 'Waiting', tone: 'text-ink-500 dark:text-white/55' };
  };

  // ─── After-hours guard ────────────────────────────────────────────────
  // Only paired TVs are subject to a schedule. Anonymous or admin previews
  // always see the live display (so admins can debug at any hour).
  if (tvAccount && !isWithinSchedule(tvAccount.schedule, now)) {
    return <TvClosedScreen schedule={tvAccount.schedule} tvName={tvAccount.name} />;
  }

  return (
    <div
      // Phones scroll naturally (min-h); laptops/TVs lock to the viewport so
      // the wall display never shows a scrollbar.
      className="w-full grid grid-rows-[auto_1fr_auto] min-h-[100dvh] lg:h-[100dvh] lg:min-h-0 lg:overflow-hidden bg-ink-50 dark:bg-navy-950 text-ink-900 dark:text-white relative"
    >
      {/* Decorative backdrop */}
      <div aria-hidden className="pointer-events-none absolute -top-40 -left-40 h-[640px] w-[640px] rounded-full bg-token/15 dark:bg-token/20 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-40 -right-40 h-[640px] w-[640px] rounded-full bg-brand-500/15 dark:bg-brand-500/20 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute inset-0 grid-bg opacity-10" />

      {/* Chime + spoken call + toast when the served token changes */}
      <NowServingAnnouncer placement="tv" speak />

      {/* Header — 3 sections on lg+ (clinic | time | doctor + toggle).
          On mobile: clinic + doctor + toggle on row 1, time centred row 2. */}
      {/* z-30 (above main's z-10) so header dropdowns — voice language picker —
          paint over the queue panels instead of being clipped behind them. */}
      <header className="relative z-30 px-4 sm:px-6 md:px-10 lg:px-14 py-3 sm:py-4 lg:py-5 grid grid-cols-1 sm:grid-cols-[1fr_auto] lg:grid-cols-3 lg:items-center gap-x-3 gap-y-2 sm:gap-y-3 lg:gap-6 border-b border-ink-200 dark:border-white/10">
        {/* LEFT — logo + clinic name + city. No truncation: names always wrap
            in full so nothing is hidden behind "…". `title` gives a hover/long-
            press tooltip on every device. */}
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 min-w-0">
          <DalanMark size={44} />
          <div className="min-w-0 flex-1">
            <div
              title={(branch?.name ?? '')}
              className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-extrabold tracking-tight font-brand leading-tight break-words"
            >
              {(branch?.name ?? '')}
            </div>
            <div
              title={data.city}
              className="mt-0.5 text-[11px] sm:text-xs lg:text-sm text-ink-500 dark:text-white/55 break-words"
            >
              {data.city}
            </div>
          </div>
        </div>

        {/* RIGHT (mobile order 2) — doctor + theme toggle. On phones this is
            its own full-width row: doctor info left, controls right. */}
        <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 lg:gap-4 min-w-0 lg:order-3">
          <div className="text-left sm:text-right min-w-0">
            <div
              title={data.doctor}
              className="text-sm sm:text-base lg:text-lg xl:text-xl font-bold text-token leading-tight break-words"
            >
              {data.doctor}
            </div>
            <div
              title={data.specialization}
              className="mt-0.5 text-[11px] sm:text-xs lg:text-sm text-ink-600 dark:text-white/70 break-words"
            >
              {data.specialization}
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <VoiceLangSelect />
            <SoundToggle />
            <ThemeToggle />
          </div>
        </div>

        {/* CENTRE (mobile order 3, spans both cols) — time + date */}
        <div className="sm:col-span-2 lg:col-span-1 lg:order-2 text-center min-w-0">
          <div className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold tabular-nums leading-none font-brand whitespace-nowrap">{time}</div>
          <div className="mt-1 text-[11px] sm:text-xs lg:text-sm text-ink-600 dark:text-white/60 whitespace-nowrap">{date}</div>
        </div>
      </header>

      {/* Main — Mobile: stack [token-panel | up-next] vertically with token sized
                  to content and up-next filling remaining.
                  Laptop: 2-col grid 1.5fr / 1fr. */}
      {/* Phones: rows size to content (page scrolls if needed) so the served
          panel never paints over the doctor-sitting box; lg+ keeps the locked
          two-column TV layout. */}
      <main className="relative z-10 min-h-0 px-4 sm:px-6 md:px-10 lg:px-14 py-3 sm:py-4 md:py-6 lg:py-8 grid grid-rows-[auto_auto] lg:grid-rows-1 lg:grid-cols-[1.5fr_1fr] gap-3 sm:gap-4 md:gap-6 lg:gap-8 lg:overflow-hidden">
        {/* TOKEN PANEL: Now serving + Doctor sitting. Tints warm-yellow when
            the current patient was previously skipped + called back, so the
            audit trail is visible on the wall display too. */}
        <section className={`rounded-2xl sm:rounded-3xl border backdrop-blur-xl p-3 sm:p-5 lg:p-8 flex flex-col relative overflow-hidden min-h-0 shadow-card dark:shadow-none ${
          current?.wasSkipped
            ? 'border-warning-500/50 bg-warning-500/10 dark:bg-warning-500/15'
            : 'border-ink-200 dark:border-white/10 bg-white dark:bg-white/[0.04]'
        }`}>
          <div aria-hidden className={`absolute inset-0 -z-10 ${
            current?.wasSkipped
              ? 'bg-gradient-to-br from-warning-500/10 via-transparent to-warning-500/15'
              : 'bg-gradient-to-br from-token/8 via-transparent to-brand-500/8 dark:from-token/10 dark:to-brand-500/10'
          }`} />

          <div className={`flex items-center justify-center gap-2 text-[10px] lg:text-xs uppercase tracking-[0.32em] font-semibold ${
            current?.wasSkipped ? 'text-warning-700 dark:text-warning-300' : 'text-token'
          }`}>
            <span className="relative inline-flex h-2 w-2">
              <span className={`absolute inset-0 inline-flex h-full w-full rounded-full opacity-60 animate-ping ${
                current?.wasSkipped ? 'bg-warning-500' : 'bg-token'
              }`} />
              <span className={`relative inline-flex h-2 w-2 rounded-full ${
                current?.wasSkipped ? 'bg-warning-500' : 'bg-token'
              }`} />
            </span>
            {current?.wasSkipped ? 'Called back · Now serving' : 'Now serving'}
          </div>

          <div className="flex-1 min-h-0 flex flex-col items-center justify-center text-center py-4 lg:py-0">
            <AnimatePresence mode="wait">
              {current ? (
                <motion.div
                  key={current.token}
                  initial={{ scale: 0.7, opacity: 0, y: 12 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 1.15, opacity: 0, y: -16 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 20 }}
                  className="flex flex-col items-center"
                >
                  <div
                    className={`font-extrabold leading-none tracking-tight font-brand ${
                      current.emergency
                        ? 'text-danger-500 lg:drop-shadow-[0_0_60px_rgba(239,68,68,0.45)]'
                        : current.wasSkipped
                        ? 'text-warning-600 dark:text-warning-300 lg:drop-shadow-[0_0_60px_rgba(245,158,11,0.45)]'
                        : 'text-token lg:drop-shadow-[0_0_60px_rgba(59,130,246,0.45)]'
                    }`}
                    style={{ fontSize: 'clamp(2.25rem, 7vh, 14rem)' }}
                  >
                    {tokenLabel(current)}
                  </div>
                  <div className="mt-2 sm:mt-3 lg:mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3 lg:gap-4">
                    <div className={`text-xl sm:text-2xl lg:text-4xl xl:text-5xl font-bold ${
                      current.wasSkipped ? 'text-warning-700 dark:text-warning-200' : ''
                    }`}>{current.patientName}</div>
                    <SourceBadge source={current.source} />
                    {current.emergency && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-danger-500/20 text-danger-700 dark:text-danger-300 px-2 py-0.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                        Emergency
                      </span>
                    )}
                    {current.wasSkipped && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-warning-500/20 text-warning-700 dark:text-warning-200 px-2 py-0.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                        Skipped
                      </span>
                    )}
                  </div>
                  <div className={`mt-2 sm:mt-3 lg:mt-5 inline-flex items-center gap-2 rounded-full px-3 sm:px-4 lg:px-5 py-1 sm:py-1.5 lg:py-2 font-semibold uppercase tracking-wider text-[10px] sm:text-xs lg:text-sm text-center ${
                    current.wasSkipped
                      ? 'bg-warning-500/15 text-warning-700 dark:text-warning-300'
                      : 'bg-token/15 text-token'
                  }`}>
                    Please proceed to the consultation room
                  </div>
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-ink-500 dark:text-white/40 text-2xl lg:text-3xl">
                  Waiting for the next patient…
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Doctor sitting */}
          <div className="mt-2 sm:mt-3 lg:mt-6 rounded-xl sm:rounded-2xl border border-ink-200 dark:border-white/10 bg-white dark:bg-white/[0.04] px-3 sm:px-5 lg:px-8 py-2 sm:py-3 lg:py-4 shrink-0">
            <div className="text-[10px] lg:text-xs uppercase tracking-wider text-ink-500 dark:text-white/60 text-center">Doctor sitting</div>
            <div className="mt-1.5 grid grid-cols-2 gap-x-3 sm:gap-x-6 lg:gap-x-10 gap-y-1.5 items-center">
              {timingBlocks.map((t, i) => {
                const isLastOdd = i === timingBlocks.length - 1 && timingBlocks.length % 2 === 1;
                const align = isLastOdd
                  ? 'col-span-2 text-center'
                  : i % 2 === 0
                  ? 'text-left'
                  : 'text-right';
                return (
                  <div key={i} className={`text-base sm:text-lg lg:text-2xl font-bold tracking-tight whitespace-nowrap ${align}`}>
                    {t}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* UP NEXT — auto-fit rows */}
        <section className="rounded-2xl sm:rounded-3xl bg-white dark:bg-white/[0.04] border border-ink-200 dark:border-white/10 backdrop-blur-xl p-3 sm:p-5 lg:p-7 flex flex-col min-h-0 overflow-hidden shadow-card dark:shadow-none">
          <div className="shrink-0 flex items-center justify-between mb-3 sm:mb-4">
            <div className="text-[10px] lg:text-xs uppercase tracking-[0.32em] text-brand-600 dark:text-brand-300 font-semibold">Up next</div>
            <span className="text-xs text-ink-500 dark:text-white/60">{totalWaiting} waiting</span>
          </div>

          <div
            ref={listRef}
            style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y', overscrollBehavior: 'contain' }}
            // Phones cap the list height (internal scroll); lg+ lets flex fill
            // the locked panel and the auto-fit row count takes over.
            className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1 max-h-[44dvh] lg:max-h-none"
          >
            <AnimatePresence initial={false}>
              {upNext.map((e, idx) => {
                const s = statusFor(idx);
                const isLead = idx === 0;
                const skipped = e.wasSkipped === true;
                // Skipped patients win the styling regardless of position so
                // staff and patients in the waiting room can spot a deferred
                // token at a glance — they need a "they were skipped, watch
                // for them to come back" cue even from across the room.
                const rowBg = e.emergency
                  ? 'border-danger-500/50 bg-danger-500/15 dark:bg-danger-500/20'
                  : skipped
                  ? 'border-warning-500/50 bg-warning-500/15 dark:bg-warning-500/20'
                  : isLead
                  ? 'border-brand-500/40 bg-brand-500/10 dark:bg-brand-500/15'
                  : 'border-ink-200 dark:border-white/10 bg-ink-50 dark:bg-white/[0.02]';
                const tokenColor = e.emergency
                  ? 'text-danger-600 dark:text-danger-400'
                  : skipped
                  ? 'text-warning-700 dark:text-warning-300'
                  : isLead
                  ? 'text-brand-600 dark:text-brand-300'
                  : 'text-ink-500 dark:text-white/70';
                const statusToneClass = skipped
                  ? 'text-warning-700 dark:text-warning-300'
                  : s.tone;
                const statusLabel = skipped ? 'Skipped' : s.label;
                return (
                  <motion.div
                    key={e.id}
                    ref={idx === 0 ? firstRowRef : undefined}
                    layout
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                    className={`flex items-center gap-3 lg:gap-4 rounded-2xl border px-3 lg:px-4 py-2.5 lg:py-3 ${rowBg}`}
                  >
                    <div className={`w-14 lg:w-16 xl:w-20 text-center text-2xl lg:text-3xl xl:text-4xl font-extrabold tabular-nums leading-none font-brand ${tokenColor}`}>
                      {tokenLabel(e)}
                    </div>
                    <div className="flex-1 min-w-0 flex items-center gap-2 lg:gap-3">
                      <div className={`text-base lg:text-lg font-semibold truncate min-w-0 ${skipped ? 'text-warning-700 dark:text-warning-200' : ''}`}>
                        {e.patientName}
                      </div>
                      <SourceBadge source={e.source} />
                    </div>
                    <div className="shrink-0 text-right">
                      <div className={`text-[10px] lg:text-xs uppercase tracking-wider font-bold ${statusToneClass}`}>
                        {statusLabel}
                      </div>
                      <div className="text-[10px] lg:text-xs text-ink-500 dark:text-white/55 mt-0.5">{eta.waitLabel(idx + 1)}</div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {upNext.length === 0 && (
              <div className="text-ink-500 dark:text-white/50 text-base lg:text-lg text-center py-10">No further patients in queue.</div>
            )}
          </div>

          <div className="shrink-0 mt-3 pt-3 border-t border-ink-200 dark:border-white/10 flex items-center justify-between gap-3">
            <div className="text-xs lg:text-sm font-bold uppercase tracking-wider text-ink-700 dark:text-white/75">
              {overflow > 0 ? `+ ${overflow} more waiting` : ''}
            </div>
            <div className="text-[11px] lg:text-xs text-ink-500 dark:text-white/55 whitespace-nowrap">
              <span className="font-bold text-ink-700 dark:text-white/75">
                Total — {entries.length} patient{entries.length === 1 ? '' : 's'}
              </span>{' '}
              in today's queue
            </div>
          </div>
        </section>
      </main>

      {/* Page footer — 2-col rows (brand left, contact right) + centred © below */}
      <footer className="relative z-10 border-t border-ink-200 dark:border-white/10 bg-white/70 dark:bg-black/30 backdrop-blur">
        <div className="px-4 sm:px-6 md:px-10 lg:px-14 py-2 sm:py-3 text-[11px] lg:text-xs text-ink-600 dark:text-white/60">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-0.5 text-center sm:text-left">
            <div className="whitespace-nowrap">
              Powered by{' '}
              <span className="font-bold text-ink-800 dark:text-white/85">Dalan Health</span>
            </div>
            <a
              href="https://dalanhealth.com"
              target="_blank"
              rel="noreferrer"
              className="sm:text-right whitespace-nowrap hover:text-brand-600 dark:hover:text-brand-300 transition-colors"
            >
              dalanhealth.com
            </a>
            <div className="whitespace-nowrap">
              A Product of{' '}
              <span className="font-bold text-ink-800 dark:text-white/85">Dalansoft Technologies</span>
            </div>
            <a
              href="mailto:info@dalanhealth.com"
              className="sm:text-right whitespace-nowrap hover:text-brand-600 dark:hover:text-brand-300 transition-colors"
            >
              info@dalanhealth.com
            </a>
          </div>
          <div className="mt-1 text-center whitespace-nowrap">
            © {year} Dalansoft Technologies
          </div>
        </div>
      </footer>
    </div>
  );
}
