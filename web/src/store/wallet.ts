import { create } from 'zustand';
import { demoClinic } from '@/services/demoData';

/** Platform fee charged per completed consultation (₹). Balance ÷ this is how
 *  many more patients the clinic can see before needing a recharge. */
export const PER_VISIT_FEE = 9;
export const MIN_RECHARGE = 1000;

export interface WalletTxn {
  id: string;
  date: string;
  type: 'recharge' | 'deduction';
  amount: number;
  status: string;
  note?: string;
}

const KEY = 'dh-wallet';

const SEED_TX: WalletTxn[] = [
  { id: 't1', date: 'Today, 12:42 PM', type: 'recharge', amount: 5000, status: 'Success' },
  { id: 't2', date: 'Today, 12:30 PM', type: 'deduction', amount: PER_VISIT_FEE, status: 'Success', note: 'Consultation #14' },
  { id: 't3', date: 'Today, 12:11 PM', type: 'deduction', amount: PER_VISIT_FEE, status: 'Success', note: 'Consultation #13' },
  { id: 't4', date: 'Today, 11:54 AM', type: 'deduction', amount: PER_VISIT_FEE, status: 'Success', note: 'Consultation #12' },
  { id: 't5', date: 'Yesterday', type: 'recharge', amount: 10000, status: 'Success' },
];

interface Persisted { balance: number; txns: WalletTxn[] }

const load = (): Persisted | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (typeof p?.balance === 'number' && Array.isArray(p?.txns)) return p as Persisted;
  } catch { /* ignore */ }
  return null;
};

const nowLabel = () => `Today, ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;

interface State extends Persisted {
  recharge: (amount: number) => void;
}

export const useWallet = create<State>((set, get) => {
  const init = load() ?? { balance: demoClinic.walletBalance, txns: SEED_TX };
  return {
    balance: init.balance,
    txns: init.txns,
    recharge: (amount: number) => {
      const txn: WalletTxn = { id: `t-${Date.now()}`, date: nowLabel(), type: 'recharge', amount, status: 'Success' };
      const next: Persisted = { balance: get().balance + amount, txns: [txn, ...get().txns] };
      set(next);
      try { window.localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ }
    },
  };
});

/** How many more consultations the given balance covers. */
export const visitsLeft = (balance: number) => Math.floor(balance / PER_VISIT_FEE);
