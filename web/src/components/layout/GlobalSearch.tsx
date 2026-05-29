import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { SourceBadge } from '@/components/ui/SourceBadge';
import { useQueue } from '@/store/queue';
import { useAuth } from '@/store/auth';

/**
 * Header search input shared by every dashboard shell.
 *
 * Filters the live queue store (patient name, token number, mobile) and shows
 * results in a dropdown. Clicking a result navigates to the role-appropriate
 * queue page so the user lands somewhere they can act on the match.
 *
 * State is local (no global search context) because the queue store is the
 * single source of truth — searching it directly keeps results in sync with
 * everything else automatically, including cross-tab updates via
 * BroadcastChannel.
 */
export function GlobalSearch() {
  const navigate = useNavigate();
  const role = useAuth((s) => s.user?.role);
  const { entries } = useQueue();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    return entries
      .filter(
        (e) =>
          e.patientName.toLowerCase().includes(q) ||
          String(e.token).includes(q) ||
          e.patientMobile.replace(/\D/g, '').includes(q.replace(/\D/g, '')),
      )
      .slice(0, 8);
  }, [entries, query]);

  // Click-outside closes the dropdown.
  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [open]);

  // Cmd/Ctrl+K focuses the search like a typical app.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // Where to deep-link a search hit so the drawer with the patient's history
  // can open. The clinic queue page has the PatientDetailsDrawer wired up and
  // reads `?patient=<id>` to auto-open it; admins and patients land on routes
  // without a drawer, so they get the list view as a fallback.
  const buildPatientRoute = (id: string): string => {
    switch (role) {
      case 'super_admin': return '/admin/clinics';
      case 'patient': return '/patient/queue';
      case 'receptionist':
      case 'clinic_admin':
      default:
        return `/clinic/queue?patient=${encodeURIComponent(id)}`;
    }
  };

  const handleSelect = (entryId: string) => {
    setQuery('');
    setOpen(false);
    inputRef.current?.blur();
    navigate(buildPatientRoute(entryId));
  };

  const clear = () => {
    setQuery('');
    setOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="w-full inline-flex items-center gap-2 rounded-xl border hairline bg-white/70 dark:bg-ink-900/60 px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-brand-500/30 transition-shadow">
        <Search size={14} className="text-ink-500 dark:text-ink-400 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search patients, tokens, invoices…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setOpen(false);
              inputRef.current?.blur();
            }
            if (e.key === 'Enter' && results.length > 0) {
              handleSelect(results[0].id);
            }
          }}
          className="flex-1 min-w-0 bg-transparent outline-none text-ink-900 dark:text-ink-50 placeholder:text-ink-500 dark:placeholder:text-ink-400"
          aria-label="Search patients, tokens, invoices"
        />
        {query && (
          <button
            type="button"
            onClick={clear}
            className="text-ink-400 hover:text-ink-700 dark:hover:text-ink-200 shrink-0"
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
        <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded border hairline text-[10px] font-mono text-ink-500 dark:text-ink-400 shrink-0">
          Ctrl K
        </kbd>
      </div>

      {open && query.trim() && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-xl border hairline bg-white dark:bg-ink-900 shadow-2xl z-50 max-h-96 overflow-y-auto">
          {results.length === 0 ? (
            <div className="p-5 text-sm text-muted text-center">
              No matches for "<span className="font-semibold text-ink-700 dark:text-ink-200">{query}</span>"
            </div>
          ) : (
            <>
              <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-muted border-b hairline flex items-center justify-between">
                <span>{results.length} {results.length === 1 ? 'match' : 'matches'}</span>
                <span className="text-[10px]">Enter to open</span>
              </div>
              {results.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleSelect(r.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-ink-50 dark:hover:bg-ink-800 text-left transition-colors"
                >
                  <span className="font-extrabold text-token text-base tabular-nums w-12 text-center">
                    #{r.token}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm font-semibold text-ink-900 dark:text-ink-50 truncate">{r.patientName}</span>
                      <SourceBadge source={r.source} />
                    </div>
                    <div className="text-[11px] text-muted truncate">{r.patientMobile}</div>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-muted shrink-0">{r.status}</span>
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
