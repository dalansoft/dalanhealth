import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Printer, Download, Share2 } from 'lucide-react';
import { Card, CardHeader, CardSubtitle, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Logo } from '@/components/ui/Logo';
import { demoClinic } from '@/services/demoData';

interface Medicine {
  name: string;
  dose: string;
  freq: string;
  days: string;
}

export function PrescriptionScreen() {
  const [patient] = useState('Shailesh Kumar');
  const [symptoms, setSymptoms] = useState('Sore throat, mild fever for 3 days');
  const [diagnosis, setDiagnosis] = useState('Acute pharyngitis');
  const [tests, setTests] = useState('CBC, throat swab');
  const [notes, setNotes] = useState('Plenty of fluids. Rest. Avoid cold drinks.');
  const [followUp, setFollowUp] = useState('5 days');
  const [meds, setMeds] = useState<Medicine[]>([
    { name: 'Azithromycin 500mg', dose: '1 tab', freq: '1-0-0', days: '5 days' },
    { name: 'Paracetamol 650mg', dose: '1 tab', freq: '1-1-1', days: '3 days' },
    { name: 'Betadine gargle', dose: '15 ml', freq: '0-1-1', days: '5 days' },
  ]);

  const addMed = () => setMeds([...meds, { name: '', dose: '', freq: '', days: '' }]);
  const removeMed = (i: number) => setMeds(meds.filter((_, idx) => idx !== i));
  const updateMed = (i: number, key: keyof Medicine, val: string) => {
    setMeds(meds.map((m, idx) => idx === i ? { ...m, [key]: val } : m));
  };

  return (
    <div className="grid lg:grid-cols-5 gap-5">
      <Card className="lg:col-span-2">
        <CardHeader>
          <div>
            <CardTitle>Prescription builder</CardTitle>
            <CardSubtitle>Doctor-grade · printable</CardSubtitle>
          </div>
          <Badge tone="brand">Draft</Badge>
        </CardHeader>
        <div className="space-y-3">
          <Input label="Symptoms" value={symptoms} onChange={(e) => setSymptoms(e.target.value)} />
          <Input label="Diagnosis" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} />
          <Input label="Tests recommended" value={tests} onChange={(e) => setTests(e.target.value)} />
          <div>
            <div className="mb-1.5 text-xs font-medium text-ink-700 dark:text-ink-300 uppercase tracking-wide">Doctor notes</div>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full rounded-xl border hairline bg-white dark:bg-ink-900/80 px-3.5 py-2.5 text-sm outline-none" />
          </div>
          <Input label="Follow-up after" value={followUp} onChange={(e) => setFollowUp(e.target.value)} />
          <div>
            <div className="mb-2 flex items-center justify-between">
              <div className="text-xs font-medium text-ink-700 dark:text-ink-300 uppercase tracking-wide">Medicines</div>
              <Button size="sm" variant="ghost" leftIcon={<Plus size={12} />} onClick={addMed}>Add</Button>
            </div>
            <div className="space-y-2">
              {meds.map((m, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-start rounded-xl border hairline p-2.5">
                  <input value={m.name} onChange={(e) => updateMed(i, 'name', e.target.value)} placeholder="Name" className="col-span-12 sm:col-span-5 bg-transparent text-sm outline-none px-1" />
                  <input value={m.dose} onChange={(e) => updateMed(i, 'dose', e.target.value)} placeholder="Dose" className="col-span-3 sm:col-span-2 bg-transparent text-sm outline-none px-1" />
                  <input value={m.freq} onChange={(e) => updateMed(i, 'freq', e.target.value)} placeholder="1-0-1" className="col-span-3 sm:col-span-2 bg-transparent text-sm outline-none px-1" />
                  <input value={m.days} onChange={(e) => updateMed(i, 'days', e.target.value)} placeholder="Days" className="col-span-4 sm:col-span-2 bg-transparent text-sm outline-none px-1" />
                  <button onClick={() => removeMed(i)} className="col-span-2 sm:col-span-1 text-ink-400 hover:text-danger-500 flex justify-end items-center">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div className="lg:col-span-3">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl bg-white dark:bg-ink-900 border hairline shadow-card p-8 print:shadow-none print:border-none">
          <div className="flex items-start justify-between border-b hairline pb-5">
            <div>
              <Logo size="md" asLink={false} />
              <div className="mt-2 text-lg font-semibold text-ink-900 dark:text-ink-50">{demoClinic.name}</div>
              <div className="text-xs text-muted">{demoClinic.doctor} · {demoClinic.specialization}</div>
              <div className="text-xs text-muted">{demoClinic.city}</div>
            </div>
            <div className="text-right">
              <div className="text-xs uppercase tracking-wider text-muted">Date</div>
              <div className="text-sm font-semibold text-ink-900 dark:text-ink-50">{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
              <div className="mt-2 text-xs uppercase tracking-wider text-muted">Patient</div>
              <div className="text-sm font-semibold text-ink-900 dark:text-ink-50">{patient}</div>
            </div>
          </div>

          <div className="mt-5 grid sm:grid-cols-2 gap-4 text-sm">
            <Field label="Symptoms" val={symptoms} />
            <Field label="Diagnosis" val={diagnosis} />
            <Field label="Tests" val={tests} />
            <Field label="Follow-up" val={followUp} />
          </div>

          <div className="mt-6">
            <div className="text-xs uppercase tracking-wider text-muted mb-2">℞ Medicines</div>
            <div className="rounded-2xl border hairline overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="bg-ink-50 dark:bg-ink-900/60 text-[11px] uppercase tracking-wider text-muted">
                  <tr>
                    <th className="text-left px-4 py-2">Medicine</th>
                    <th className="text-left px-4 py-2">Dose</th>
                    <th className="text-left px-4 py-2">Frequency</th>
                    <th className="text-left px-4 py-2">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y hairline">
                  {meds.filter((m) => m.name).map((m, i) => (
                    <tr key={i}>
                      <td className="px-4 py-2.5 font-medium text-ink-900 dark:text-ink-50">{m.name}</td>
                      <td className="px-4 py-2.5 text-ink-700 dark:text-ink-200">{m.dose}</td>
                      <td className="px-4 py-2.5 text-ink-700 dark:text-ink-200">{m.freq}</td>
                      <td className="px-4 py-2.5 text-ink-700 dark:text-ink-200">{m.days}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {notes && (
            <div className="mt-5 text-sm">
              <div className="text-xs uppercase tracking-wider text-muted mb-1">Doctor's notes</div>
              <p className="text-ink-700 dark:text-ink-200">{notes}</p>
            </div>
          )}

          <div className="mt-10 pt-5 border-t hairline flex items-end justify-between gap-4">
            <div className="text-[11px] text-muted space-y-0.5">
              <div className="whitespace-nowrap">
                Powered by{' '}
                <span className="font-bold text-ink-800 dark:text-ink-100">Dalan Health</span>
              </div>
              <div className="whitespace-nowrap">
                A Product of{' '}
                <span className="font-bold text-ink-800 dark:text-ink-100">Dalansoft Technologies</span>
              </div>
            </div>
            <div className="text-right">
              <div className="border-b border-ink-300 dark:border-ink-700 w-40 mb-1" />
              <div className="text-xs text-muted">Doctor signature</div>
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

const Field = ({ label, val }: { label: string; val: string }) => (
  <div>
    <div className="text-[11px] uppercase tracking-wider text-muted">{label}</div>
    <div className="text-sm text-ink-900 dark:text-ink-50">{val || '—'}</div>
  </div>
);
