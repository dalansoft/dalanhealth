import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { AddPatient } from './AddPatient';
import type { QueueEntry } from '@/store/queue';

interface Props {
  open: boolean;
  onClose: () => void;
  /** When set, the modal opens in EDIT mode for this patient (mobile locked). */
  editEntry?: QueueEntry;
}

/**
 * Add-patient modal — reusable from any dashboard. Wraps the full AddPatient
 * flow (mobile lookup → family select → new patient form → token generated)
 * in a centred dialog so the receptionist or clinic admin never has to leave
 * the page they're on.
 *
 * Triggered from: ClinicQueue "Add patient" CTA, ClinicDashboard hero,
 * Receptionist dashboard quick action, etc.
 */
export function AddPatientModal({ open, onClose, editEntry }: Props) {
  // Esc to close.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[60] bg-ink-950/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className="fixed inset-0 z-[70] flex items-start sm:items-center justify-center p-4 sm:p-6 pointer-events-none overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-patient-modal-title"
          >
            <div className="w-full max-w-md pointer-events-auto rounded-2xl bg-white dark:bg-ink-900 border hairline shadow-2xl my-auto">
              <div className="flex items-center justify-between px-5 py-3 border-b hairline">
                <div id="add-patient-modal-title" className="text-sm font-semibold text-ink-900 dark:text-ink-50">
                  {editEntry ? 'Edit patient' : 'Add patient'}
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
              <div className="p-5 max-h-[80vh] overflow-y-auto">
                <AddPatient key={editEntry?.id ?? 'add'} embedded editEntry={editEntry} onClose={onClose} />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
