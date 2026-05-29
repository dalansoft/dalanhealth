import { useEffect, useRef, useState } from 'react';
import { Building2, ChevronsUpDown, Check, MapPin, Star } from 'lucide-react';
import { useBranch, useCurrentBranch } from '@/store/branch';
import { cn } from '@/lib/cn';

/**
 * Multi-branch switcher chip for the dashboard header. Click to open a
 * dropdown listing every branch on the clinic account; the active branch
 * is shown in the chip and ticked in the menu.
 *
 * Branch selection persists across reloads via the `dh-branch` zustand
 * storage so a refresh keeps the user in the same context.
 */
export function BranchSwitcher() {
  const branches = useBranch((s) => s.branches);
  const switchBranch = useBranch((s) => s.switchBranch);
  const current = useCurrentBranch();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click-outside or Esc.
  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // No chip when there's only one branch — manage / add via CLINIC › Branches.
  if (!current || branches.length <= 1) return null;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 rounded-xl border hairline bg-white/70 dark:bg-ink-900/60 px-3 py-2 text-sm text-ink-700 dark:text-ink-200 hover:border-brand-500/40 hover:bg-white dark:hover:bg-ink-900 transition-colors max-w-[260px]"
        aria-haspopup="listbox"
        aria-expanded={open}
        title={current.address ?? current.name}
      >
        <Building2 size={14} className="text-brand-600 dark:text-brand-300 shrink-0" />
        <div className="min-w-0 flex flex-col items-start leading-tight">
          <span className="text-[10px] uppercase tracking-wider text-muted">Branch</span>
          <span className="text-xs font-semibold truncate max-w-[180px]">{current.name}</span>
        </div>
        <ChevronsUpDown size={14} className="text-ink-400 shrink-0" />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 w-80 rounded-2xl border hairline bg-white dark:bg-ink-900 shadow-2xl z-50 overflow-hidden">
          <div className="px-3 py-2 border-b hairline text-[10px] uppercase tracking-wider text-muted font-semibold flex items-center justify-between">
            <span>Switch branch</span>
            <span className="normal-case tracking-normal text-muted/80">{branches.length} total</span>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {branches.map((b) => {
              const active = b.id === current.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    switchBranch(b.id);
                    setOpen(false);
                  }}
                  className={cn(
                    'w-full text-left flex items-start gap-3 px-3 py-2.5 transition-colors',
                    active
                      ? 'bg-brand-500/10 dark:bg-brand-500/15'
                      : 'hover:bg-ink-50 dark:hover:bg-ink-800',
                  )}
                >
                  <span
                    className={cn(
                      'mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-xl shrink-0',
                      active
                        ? 'bg-brand-500/20 text-brand-700 dark:text-brand-300'
                        : 'bg-ink-100 dark:bg-ink-800 text-ink-500 dark:text-ink-400',
                    )}
                  >
                    <Building2 size={14} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className={cn(
                        'text-sm font-semibold truncate',
                        active ? 'text-ink-900 dark:text-ink-50' : 'text-ink-800 dark:text-ink-100',
                      )}>
                        {b.name}
                      </span>
                      {b.primary && (
                        <Star size={11} className="text-warning-500 shrink-0" aria-label="Primary branch" />
                      )}
                    </div>
                    <div className="mt-0.5 text-[11px] text-muted truncate flex items-center gap-1">
                      <MapPin size={10} className="shrink-0" /> {b.city}
                    </div>
                  </div>
                  {active && (
                    <Check size={16} className="text-brand-600 dark:text-brand-300 shrink-0 mt-1" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
