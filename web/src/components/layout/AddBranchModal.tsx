import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, MapPin, Star, AlertCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useBranch } from '@/store/branch';
import { cn } from '@/lib/cn';

interface Props {
  open: boolean;
  onClose: () => void;
  /** Called after a branch is added so the parent can switch to it. */
  onAdded?: (newBranchId: string) => void;
}

/**
 * Add-new-branch modal. Triggered from the BranchSwitcher's footer button.
 * Required: name + city. Address and "primary" flag are optional.
 *
 * On save the branch is appended to `useBranch.branches` and the parent
 * receives the new branch id (so the BranchSwitcher can auto-select it).
 */
export function AddBranchModal({ open, onClose, onAdded }: Props) {
  const branches = useBranch((s) => s.branches);
  const switchBranch = useBranch((s) => s.switchBranch);
  // We don't use addBranch because we need the new id back; instead we generate
  // it here and push directly. (zustand's set accepts a callback.)
  const setBranches = useBranch((s) => s.setBranches);

  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; city?: string }>({});
  const [saving, setSaving] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  // Reset + focus on open.
  useEffect(() => {
    if (open) {
      setName('');
      setCity('');
      setAddress('');
      setIsPrimary(false);
      setErrors({});
      setTimeout(() => nameRef.current?.focus(), 50);
    }
  }, [open]);

  // Esc closes.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const validate = (): boolean => {
    const next: typeof errors = {};
    if (!name.trim()) next.name = 'Branch name is required';
    if (!city.trim()) next.city = 'City / area is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    const newId = `b${Date.now()}`;
    // If the new branch is marked primary, demote any existing primary.
    const updatedExisting = isPrimary
      ? branches.map((b) => ({ ...b, primary: false }))
      : branches;
    setBranches([
      ...updatedExisting,
      {
        id: newId,
        name: name.trim(),
        city: city.trim(),
        address: address.trim() || undefined,
        primary: isPrimary,
      },
    ]);
    setTimeout(() => {
      setSaving(false);
      switchBranch(newId);
      onAdded?.(newId);
      onClose();
    }, 200);
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
            aria-labelledby="add-branch-title"
          >
            <div className="w-full max-w-md pointer-events-auto rounded-2xl bg-white dark:bg-ink-900 border hairline shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="px-5 py-4 border-b hairline flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/15 text-brand-700 dark:text-brand-300">
                    <Building2 size={16} />
                  </span>
                  <div>
                    <h2 id="add-branch-title" className="text-base font-semibold text-ink-900 dark:text-ink-50">
                      Add new branch
                    </h2>
                    <p className="text-xs text-muted">All branches share the same clinic account</p>
                  </div>
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
                {/* Branch name */}
                <Field
                  icon={<Building2 size={14} />}
                  label="Branch name"
                  required
                  error={errors.name}
                  value={name}
                  onChange={setName}
                  placeholder="Sharma ENT — Boring Road"
                  inputRef={nameRef}
                />

                {/* City / area */}
                <Field
                  icon={<MapPin size={14} />}
                  label="City / area"
                  required
                  error={errors.city}
                  value={city}
                  onChange={setCity}
                  placeholder="Boring Road, Patna"
                />

                {/* Full address (optional) */}
                <Field
                  icon={<MapPin size={14} />}
                  label="Full address"
                  value={address}
                  onChange={setAddress}
                  placeholder="12 Boring Road, Patna 800001"
                />

                {/* Primary toggle */}
                <label className="flex items-center gap-3 rounded-xl border hairline px-3 py-2.5 cursor-pointer hover:bg-ink-50 dark:hover:bg-ink-800 transition-colors">
                  <span className={cn(
                    'inline-flex h-5 w-5 items-center justify-center rounded border-2 transition-colors',
                    isPrimary
                      ? 'border-brand-500 bg-brand-500 text-white'
                      : 'border-ink-300 dark:border-ink-600',
                  )}>
                    {isPrimary && <Check size={12} />}
                  </span>
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={isPrimary}
                    onChange={(e) => setIsPrimary(e.target.checked)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-ink-900 dark:text-ink-50 flex items-center gap-1.5">
                      <Star size={12} className="text-warning-500" /> Set as primary branch
                    </div>
                    <div className="text-[11px] text-muted">The primary branch is the default when you sign in.</div>
                  </div>
                </label>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
                    Cancel
                  </Button>
                  <Button type="submit" leftIcon={<Building2 size={14} />} disabled={saving}>
                    {saving ? 'Adding…' : 'Add branch'}
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

// ─── Field helper ─────────────────────────────────────────────────────────
function Field({
  icon, label, required, error, value, onChange, placeholder, inputRef,
}: {
  icon: React.ReactNode;
  label: string;
  required?: boolean;
  error?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  inputRef?: React.Ref<HTMLInputElement>;
}) {
  return (
    <div>
      <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted mb-1.5">
        {label}{required && <span className="text-danger-500 ml-1">*</span>}
      </label>
      <div className={cn(
        'flex items-center gap-2 rounded-xl border bg-white dark:bg-ink-900 px-3 py-2.5 focus-within:ring-2 focus-within:ring-brand-500/30 transition-shadow',
        error ? 'border-danger-500/60' : 'hairline',
      )}>
        <span className="text-ink-400 shrink-0">{icon}</span>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 min-w-0 bg-transparent outline-none text-sm text-ink-900 dark:text-ink-50 placeholder:text-ink-400"
        />
      </div>
      {error && (
        <div className="mt-1 text-[11px] text-danger-500 flex items-center gap-1">
          <AlertCircle size={11} /> {error}
        </div>
      )}
    </div>
  );
}
