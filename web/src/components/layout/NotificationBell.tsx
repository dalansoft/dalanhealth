import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, ChevronRight } from 'lucide-react';
import { useAuth } from '@/store/auth';

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  ago: string;
  unread: boolean;
}

const samples: NotificationItem[] = [
  { id: 'n1', title: 'Wallet auto-recharged', body: 'UPI top-up of ₹5,000 cleared', ago: '2 min ago', unread: true },
  { id: 'n2', title: 'New patient added', body: 'Ramesh Jha joined the queue (#9)', ago: '14 min ago', unread: true },
  { id: 'n3', title: 'Skipped patient returned', body: 'Anjali Devi is back — token #7', ago: '38 min ago', unread: false },
  { id: 'n4', title: 'Daily report ready', body: 'Yesterday\'s revenue summary', ago: '4 hr ago', unread: false },
];

/**
 * Header bell — opens a dropdown of recent notifications with a "View all"
 * footer that deep-links to the role-appropriate notifications page.
 */
export function NotificationBell() {
  const navigate = useNavigate();
  const role = useAuth((s) => s.user?.role);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>(samples);
  const containerRef = useRef<HTMLDivElement>(null);

  const unreadCount = items.filter((i) => i.unread).length;

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

  const viewAllRoute =
    role === 'super_admin'
      ? '/admin/notifications'
      : role === 'clinic_admin'
      ? '/clinic/notifications'
      : role === 'receptionist'
      ? '/clinic/notifications'
      : '/'; // patient has no notifications page yet

  const markAllRead = () => setItems((prev) => prev.map((i) => ({ ...i, unread: false })));

  const viewAll = () => {
    setOpen(false);
    navigate(viewAllRoute);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border hairline relative hover:bg-ink-50 dark:hover:bg-ink-800 transition-colors"
        aria-label={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ''}`}
        aria-expanded={open}
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-danger-500 ring-2 ring-white dark:ring-ink-950" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl border hairline bg-white dark:bg-ink-900 shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b hairline">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-ink-900 dark:text-ink-50">Notifications</span>
              {unreadCount > 0 && (
                <span className="inline-flex items-center justify-center rounded-full bg-brand-500/15 text-brand-700 dark:text-brand-300 text-[10px] font-bold px-1.5 py-0.5 min-w-[18px]">
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-[11px] font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-300 hover:underline inline-flex items-center gap-1"
              >
                <CheckCheck size={12} /> Mark all read
              </button>
            )}
          </div>

          {/* Items */}
          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <div className="p-6 text-sm text-muted text-center">You're all caught up.</div>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => {
                    setItems((prev) => prev.map((p) => (p.id === n.id ? { ...p, unread: false } : p)));
                  }}
                  className="w-full text-left flex gap-3 px-4 py-3 hover:bg-ink-50 dark:hover:bg-ink-800 border-b hairline last:border-b-0 transition-colors"
                >
                  <span
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                      n.unread ? 'bg-brand-500' : 'bg-transparent'
                    }`}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <span className={`text-sm font-semibold truncate ${n.unread ? 'text-ink-900 dark:text-ink-50' : 'text-ink-700 dark:text-ink-300'}`}>
                        {n.title}
                      </span>
                      <span className="text-[10px] text-muted whitespace-nowrap shrink-0">{n.ago}</span>
                    </div>
                    <div className="mt-0.5 text-xs text-muted line-clamp-2">{n.body}</div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          {role && role !== 'patient' && (
            <button
              type="button"
              onClick={viewAll}
              className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 border-t hairline text-xs font-semibold text-brand-600 dark:text-brand-300 hover:bg-ink-50 dark:hover:bg-ink-800 transition-colors"
            >
              View all notifications <ChevronRight size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
