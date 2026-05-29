import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, User as UserIcon, Phone, Mail, Briefcase } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/store/auth';

interface Props {
  open: boolean;
  onClose: () => void;
}

/**
 * Edit-profile modal triggered from the sidebar user row.
 * Lets the signed-in user update name / mobile / email.
 * Role is shown read-only — changing role is an admin operation.
 */
export function ProfileEditModal({ open, onClose }: Props) {
  const user = useAuth((s) => s.user);
  const updateUser = useAuth((s) => s.updateUser);

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  // Reset form state whenever the modal opens with the latest user data.
  useEffect(() => {
    if (open && user) {
      setName(user.name ?? '');
      setMobile(user.mobile ?? '');
      setEmail(user.email ?? '');
      setSaved(false);
      // Focus the first field on next tick.
      setTimeout(() => nameRef.current?.focus(), 50);
    }
  }, [open, user]);

  // Close on Esc.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!user) return null;

  const dirty = name !== (user.name ?? '') || mobile !== (user.mobile ?? '') || email !== (user.email ?? '');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dirty) {
      onClose();
      return;
    }
    setSaving(true);
    // Demo: persist locally. In production, await an API call here before
    // updating the store so we can surface server-side validation errors.
    updateUser({
      name: name.trim() || user.name,
      mobile: mobile.trim() || undefined,
      email: email.trim() || undefined,
    });
    // Brief saved confirmation, then close.
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        onClose();
      }, 600);
    }, 250);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[60] bg-ink-950/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none"
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-modal-title"
          >
            <div className="w-full max-w-md pointer-events-auto rounded-2xl bg-white dark:bg-ink-900 border hairline shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="px-5 py-4 border-b hairline flex items-center justify-between">
                <div>
                  <h2 id="profile-modal-title" className="text-base font-semibold text-ink-900 dark:text-ink-50">
                    Edit profile
                  </h2>
                  <p className="text-xs text-muted">Update your personal details</p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Body */}
              <form onSubmit={handleSave} className="p-5 space-y-4">
                {/* Avatar + role banner */}
                <div className="flex items-center gap-4 rounded-xl border hairline bg-ink-50 dark:bg-ink-800/40 px-4 py-3">
                  <Avatar name={name || user.name} src={user.photoDataUrl} size="lg" />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-ink-900 dark:text-ink-50 truncate">
                      {name || user.name || 'Unnamed user'}
                    </div>
                    <div className="mt-0.5 inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-ink-500 dark:text-ink-400">
                      <Briefcase size={10} /> {user.role.replace('_', ' ')}
                    </div>
                  </div>
                </div>

                {/* Name */}
                <Field icon={<UserIcon size={14} />} label="Full name" htmlFor="profile-name">
                  <input
                    ref={nameRef}
                    id="profile-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Dr. Anil Sharma"
                    className="w-full bg-transparent outline-none text-sm text-ink-900 dark:text-ink-50 placeholder:text-ink-400"
                  />
                </Field>

                {/* Mobile */}
                <Field icon={<Phone size={14} />} label="Mobile" htmlFor="profile-mobile">
                  <input
                    id="profile-mobile"
                    type="tel"
                    inputMode="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-transparent outline-none text-sm text-ink-900 dark:text-ink-50 placeholder:text-ink-400"
                  />
                </Field>

                {/* Email */}
                <Field icon={<Mail size={14} />} label="Email" htmlFor="profile-email">
                  <input
                    id="profile-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="anil@sharmaent.in"
                    className="w-full bg-transparent outline-none text-sm text-ink-900 dark:text-ink-50 placeholder:text-ink-400"
                  />
                </Field>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
                    Cancel
                  </Button>
                  <Button type="submit" leftIcon={<Save size={14} />} disabled={saving || (!dirty && !saved)}>
                    {saved ? 'Saved!' : saving ? 'Saving…' : 'Save changes'}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Small Field helper ────────────────────────────────────────────────────
function Field({
  icon,
  label,
  htmlFor,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-[11px] font-semibold uppercase tracking-wider text-muted mb-1.5">
        {label}
      </label>
      <div className="flex items-center gap-2 rounded-xl border hairline bg-white dark:bg-ink-900 px-3 py-2.5 focus-within:ring-2 focus-within:ring-brand-500/30 transition-shadow">
        <span className="text-ink-400 shrink-0">{icon}</span>
        {children}
      </div>
    </div>
  );
}
