import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Printer, Download, Share2, Save, Receipt } from 'lucide-react';
import { Card, CardHeader, CardSubtitle, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Logo } from '@/components/ui/Logo';
import { demoClinic } from '@/services/demoData';
import { inr } from '@/lib/format';

export function BillingScreen() {
  const [consultation, setConsultation] = useState(300);
  const [medicine, setMedicine] = useState(0);
  const [extra, setExtra] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');
  const [patient, setPatient] = useState('Shailesh Kumar');
  const [mobile, setMobile] = useState('+91 98765 43210');

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
