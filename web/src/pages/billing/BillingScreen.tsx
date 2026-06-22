import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Printer, Download, Share2, Save, Receipt, Search, Check } from 'lucide-react';
import { Card, CardHeader, CardSubtitle, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Logo } from '@/components/ui/Logo';
import { useQueue } from '@/store/queue';
import { demoClinic } from '@/services/demoData';
import { inr } from '@/lib/format';

interface PatientOpt { name: string; mobile: string; when: string }

export function BillingScreen() {
  const [consultation, setConsultation] = useState(300);
  const [medicine, setMedicine] = useState(0);
  const [extra, setExtra] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');
  const [patient, setPatient] = useState('Shailesh Kumar');
  const [mobile, setMobile] = useState('+91 98765 43210');

  const completed = useQueue((s) => s.completed);
  const entries = useQueue((s) => s.entries);

  // Patients you can bill — completed visits first, then anyone still in queue.
  const patientOptions = useMemo<PatientOpt[]>(() => {
    const seen = new Set<string>();
    const out: PatientOpt[] = [];
    const push = (name: string, mob: string, when: string) => {
      const k = mob.replace(/\D/g, '').slice(-10);
      if (!k || seen.has(k)) return;
      seen.add(k);
      out.push({ name, mobile: mob, when });
    };
    completed.forEach((e) => push(e.patientName, e.patientMobile, `Completed${e.completedAt ? ` · ${e.completedAt}` : ''}`));
    entries.forEach((e) => push(e.patientName, e.patientMobile, 'In queue'));
    return out;
  }, [completed, entries]);

  const total = useMemo(() => Math.max(0, consultation + medicine + extra - discount), [consultation, medicine, extra, discount]);
  const invoiceNo = useMemo(() => `INV-${Math.floor(Math.random() * 9000 + 1000)}`, []);

  return (
    <div className="grid lg:grid-cols-5 gap-5">
      <Card className="lg:col-span-2">
        <CardHeader>
          <div>
            <CardTitle>Invoice details</CardTitle>
            <CardSubtitle>Patient & charges</CardSubtitle>
          </div>
          <Badge tone="brand">Draft</Badge>
        </CardHeader>
        <div className="space-y-3">
          <PatientPicker
            options={patientOptions}
            selected={patient}
            onPick={(o) => { setPatient(o.name); setMobile(o.mobile); }}
          />
          <Input label="Patient name" value={patient} onChange={(e) => setPatient(e.target.value)} />
          <Input label="Mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <NumberInput label="Consultation (₹)" val={consultation} onChange={setConsultation} />
            <NumberInput label="Medicine (₹)" val={medicine} onChange={setMedicine} />
            <NumberInput label="Extra charges (₹)" val={extra} onChange={setExtra} />
            <NumberInput label="Discount (₹)" val={discount} onChange={setDiscount} />
          </div>
          <div>
            <div className="mb-1.5 text-xs font-medium text-ink-700 dark:text-ink-300 uppercase tracking-wide">Notes (optional)</div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Anything to remember on this invoice"
              className="w-full rounded-xl border hairline bg-white dark:bg-ink-900/80 px-3.5 py-2.5 text-sm outline-none focus:border-brand-500/70 focus:ring-4 focus:ring-brand-500/10"
            />
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button variant="outline" leftIcon={<Save size={14} />}>Save draft</Button>
            <Button leftIcon={<Receipt size={14} />}>Generate invoice</Button>
          </div>
        </div>
      </Card>

      <div className="lg:col-span-3">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl bg-white dark:bg-ink-900 border hairline shadow-card p-8 print:shadow-none print:border-none">
          <div className="flex items-center justify-between">
            <Logo size="md" asLink={false} />
            <div className="text-right">
              <div className="text-xs uppercase tracking-wider text-muted">Invoice</div>
              <div className="text-sm font-semibold text-ink-900 dark:text-ink-50">{invoiceNo}</div>
              <div className="text-xs text-muted">{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
            </div>
          </div>
          <div className="mt-6 grid sm:grid-cols-2 gap-6">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted">From</div>
              <div className="mt-1 text-sm font-semibold text-ink-900 dark:text-ink-50">{demoClinic.name}</div>
              <div className="text-xs text-muted">{demoClinic.doctor} · {demoClinic.specialization}</div>
              <div className="text-xs text-muted">{demoClinic.city}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted">Bill to</div>
              <div className="mt-1 text-sm font-semibold text-ink-900 dark:text-ink-50">{patient}</div>
              <div className="text-xs text-muted">{mobile}</div>
            </div>
          </div>

          <div className="mt-8 overflow-x-auto rounded-2xl border hairline">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-ink-50 dark:bg-ink-900/60">
                <tr className="text-left text-[11px] uppercase tracking-wider text-muted">
                  <th className="px-4 py-2.5">Item</th>
                  <th className="px-4 py-2.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y hairline">
                <Row label="Consultation fee" amount={consultation} />
                {medicine > 0 && <Row label="Medicine" amount={medicine} />}
                {extra > 0 && <Row label="Extra charges" amount={extra} />}
                {discount > 0 && <Row label="Discount" amount={-discount} />}
              </tbody>
              <tfoot>
                <tr className="bg-ink-50 dark:bg-ink-900/60 font-semibold">
                  <td className="px-4 py-3">Total payable</td>
                  <td className="px-4 py-3 text-right text-lg">{inr(total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {notes && (
            <div className="mt-5 text-xs text-muted">
              <span className="font-semibold uppercase tracking-wider">Notes:</span> {notes}
            </div>
          )}

          <div className="mt-8 pt-6 border-t hairline flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted">
            <div className="whitespace-nowrap">
              Powered by{' '}
              <span className="font-bold text-ink-800 dark:text-ink-100">Dalan Health</span>
            </div>
            <div className="whitespace-nowrap">
              A Product of{' '}
              <span className="font-bold text-ink-800 dark:text-ink-100">Dalansoft Technologies</span>
            </div>
          </div>

          <div className="no-print mt-6 flex flex-wrap gap-2 justify-end">
            <Button variant="outline" leftIcon={<Printer size={14} />} onClick={() => window.print()}>Print</Button>
            <Button variant="outline" leftIcon={<Download size={14} />}>Download PDF</Button>
            <Button leftIcon={<Share2 size={14} />}>Share WhatsApp</Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

const Row = ({ label, amount }: { label: string; amount: number }) => (
  <tr>
    <td className="px-4 py-3 text-ink-700 dark:text-ink-200">{label}</td>
    <td className={`px-4 py-3 text-right font-medium ${amount < 0 ? 'text-success-600 dark:text-success-500' : ''}`}>{inr(amount)}</td>
  </tr>
);

const NumberInput = ({ label, val, onChange }: { label: string; val: number; onChange: (n: number) => void }) => (
  <Input label={label} type="number" value={Number.isNaN(val) ? '' : val} onChange={(e) => onChange(Number(e.target.value) || 0)} />
);

// Searchable patient picker — find a completed/queued patient and fill the
// invoice instead of typing the name + mobile by hand.
function PatientPicker({ options, selected, onPick }: { options: PatientOpt[]; selected: string; onPick: (o: PatientOpt) => void }) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const nq = norm(q);
  const filtered = nq ? options.filter((o) => norm(`${o.name} ${o.mobile}`).includes(nq)) : options;

  return (
    <div>
      <div className="mb-1.5 text-xs font-medium text-ink-700 dark:text-ink-300 uppercase tracking-wide">Select patient</div>
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search completed patient by name or mobile…"
          className="w-full pl-9 pr-3 py-2.5 rounded-xl border hairline bg-white dark:bg-ink-900 text-sm text-ink-900 dark:text-ink-50 outline-none focus:border-brand-500/70 focus:ring-4 focus:ring-brand-500/10"
        />
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-hidden />
            <div className="absolute z-20 mt-1 w-full max-h-60 overflow-auto rounded-xl border hairline bg-white dark:bg-ink-900 shadow-lg">
              {filtered.length ? filtered.map((o, i) => {
                const active = o.name === selected;
                return (
                  <button
                    key={`${o.mobile}-${i}`}
                    type="button"
                    onClick={() => { onPick(o); setQ(''); setOpen(false); }}
                    className="w-full flex items-center justify-between gap-2 px-3 py-2 text-left hover:bg-ink-50 dark:hover:bg-ink-800"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-ink-900 dark:text-ink-50 truncate">{o.name}</div>
                      <div className="text-[11px] text-muted truncate">{o.mobile} · {o.when}</div>
                    </div>
                    {active && <Check size={14} className="text-brand-600 dark:text-brand-300 shrink-0" />}
                  </button>
                );
              }) : (
                <div className="px-3 py-3 text-sm text-muted">No patients found.</div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
