import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, KeyRound, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { DalanMark } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/store/auth';
import { useBranch } from '@/store/branch';
import { useTvAccounts } from '@/store/tvAccounts';

/**
 * TV pairing screen at `/tv/pair`.
 * Receptionist generates a 6-character code in CLINIC › TV Displays; the TV
 * (on whatever device) opens this URL once, enters the code, and is logged
 * in as a `tv_display` session locked to that TV's branch.
 */
export function TvPair() {
  const navigate = useNavigate();
  const findByCode = useTvAccounts((s) => s.findByCode);
  const markPaired = useTvAccounts((s) => s.markPaired);
  const switchBranch = useBranch((s) => s.switchBranch);
  const login = useAuth((s) => s.login);
  const branches = useBranch((s) => s.branches);

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const tv = findByCode(code);
    if (!tv) {
      setError('That code did not match any TV. Ask the clinic admin to check it.');
      return;
    }
    if (tv.paired) {
      // Allow re-pairing (e.g. device replaced) without throwing — admin can
      // explicitly unpair if they want a single-device restriction.
    }
    // Lock the branch + sign in as the TV.
    const branch = branches.find((b) => b.id === tv.branchId);
    switchBranch(tv.branchId);
    login(
      {
        id: tv.id,
        name: tv.name,
        role: 'tv_display',
        clinicName: branch?.name,
        branchId: tv.branchId,
        tvId: tv.id,
      },
      `tv-${tv.id}`,
      false,
    );
    markPaired(tv.id);
    setSuccess(true);
    setTimeout(() => navigate('/display/clinic', { replace: true }), 600);
  };

  return (
    <div
      style={{ height: '100dvh' }}
      className="w-full overflow-hidden bg-ink-50 dark:bg-navy-950 text-ink-900 dark:text-white relative flex items-center justify-center px-4"
    >
      {/* Decorative backdrop matching the TV display */}
      <div aria-hidden className="pointer-events-none absolute -top-40 -left-40 h-[640px] w-[640px] rounded-full bg-token/15 dark:bg-token/20 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-40 -right-40 h-[640px] w-[640px] rounded-full bg-brand-500/15 dark:bg-brand-500/20 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 240, damping: 24 }}
        className="relative z-10 w-full max-w-md rounded-3xl border hairline bg-white dark:bg-ink-900 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 sm:px-8 pt-7 pb-5 text-center border-b hairline">
          <div className="flex justify-center mb-3">
            <DalanMark size={44} />
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-500/15 text-brand-700 dark:text-brand-300 text-[10px] font-bold uppercase tracking-wider mb-2">
            <Monitor size={11} /> TV Display
          </div>
          <h1 className="text-xl font-bold text-ink-900 dark:text-ink-50">Pair this display</h1>
          <p className="mt-1 text-xs text-muted">
            Enter the 6-character pairing code shown in <span className="font-semibold text-ink-700 dark:text-ink-200">Clinic › TV Displays</span> on the admin dashboard.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 sm:px-8 py-6 space-y-4">
          <div>
            <label htmlFor="tv-pair-code" className="block text-[11px] font-semibold uppercase tracking-wider text-muted mb-2 text-center">
              Pairing code
            </label>
            <div className={`relative flex items-center gap-2 rounded-2xl border px-4 py-4 focus-within:ring-2 focus-within:ring-brand-500/40 transition-shadow ${
              error ? 'border-danger-500/60' : 'hairline bg-ink-50 dark:bg-ink-800/40'
            }`}>
              <KeyRound size={18} className="text-brand-600 dark:text-brand-300 shrink-0" />
              <input
                ref={inputRef}
                id="tv-pair-code"
                type="text"
                inputMode="text"
                autoComplete="off"
                spellCheck={false}
                maxLength={6}
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  if (error) setError(null);
                }}
                placeholder="——————"
                className="flex-1 min-w-0 bg-transparent outline-none text-center text-2xl font-bold tracking-[0.4em] font-brand uppercase placeholder:text-ink-300 dark:placeholder:text-ink-600"
              />
            </div>
            {error && (
              <div className="mt-2 text-[11px] text-danger-500 flex items-center justify-center gap-1">
                <AlertCircle size={11} /> {error}
              </div>
            )}
          </div>

          <Button type="submit" size="lg" fullWidth rightIcon={<ArrowRight size={16} />} disabled={code.length < 6}>
            Pair display
          </Button>
        </form>
      </motion.div>

      {/* Success overlay */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-ink-950/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 240, damping: 18 }}
              className="rounded-2xl bg-white dark:bg-ink-900 px-8 py-6 text-center shadow-2xl"
            >
              <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-br from-success-500 to-teal-500 flex items-center justify-center text-white">
                <CheckCircle2 size={24} />
              </div>
              <div className="mt-3 text-base font-semibold text-ink-900 dark:text-ink-50">Paired — launching display…</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
