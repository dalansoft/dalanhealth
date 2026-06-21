import { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus, Printer, Download, Share2, Upload, Camera, FileText,
  File as FileIcon, X, Check, RefreshCw, Image as ImageIcon, Search, Save, Loader2,
} from 'lucide-react';
import { Card, CardHeader, CardSubtitle, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useQueue } from '@/store/queue';
import { usePrescriptions, type RxKind, type Rx, type RxMed, type RxDoc } from '@/store/prescriptions';
import { demoClinic, demoPatients } from '@/services/demoData';

type Medicine = RxMed;
type Mode = 'digital' | 'upload' | 'camera';
interface Patient { name: string; mobile: string; when: string }

const SLOTS = [
  ['morning', 'Morning'],
  ['afternoon', 'Afternoon'],
  ['evening', 'Evening'],
  ['night', 'Night'],
] as const;
type SlotKey = (typeof SLOTS)[number][0];

// Dropdown options for the medicine entry form.
const DOSE_OPTIONS: [string, string][] = [
  ['½', '½ tablet'], ['1', '1 tablet'], ['1½', '1½ tablets'], ['2', '2 tablets'], ['3', '3 tablets'],
  ['5 ml', '5 ml'], ['10 ml', '10 ml'], ['15 ml', '15 ml'], ['1 drop', '1 drop'], ['2 drops', '2 drops'], ['As directed', 'As directed'],
];
const DAY_OPTIONS = ['3 days', '5 days', '7 days', '10 days', '15 days', '1 month', 'Continuous'];
const WHEN_OPTIONS: { label: string; slots: SlotKey[] }[] = [
  { label: 'Morning', slots: ['morning'] },
  { label: 'Afternoon', slots: ['afternoon'] },
  { label: 'Evening', slots: ['evening'] },
  { label: 'Night', slots: ['night'] },
  { label: 'Morning & Night', slots: ['morning', 'night'] },
  { label: 'Morning & Afternoon', slots: ['morning', 'afternoon'] },
  { label: 'Afternoon & Night', slots: ['afternoon', 'night'] },
  { label: 'Morning, Afternoon & Night', slots: ['morning', 'afternoon', 'night'] },
  { label: 'Morning, Afternoon, Evening & Night', slots: ['morning', 'afternoon', 'evening', 'night'] },
];

const blankMed = (): Medicine => ({ name: '', dose: '1', morning: false, afternoon: false, evening: false, night: false, days: '' });
const timingText = (m: Medicine) => SLOTS.filter(([k]) => m[k]).map(([, label]) => label).join(', ');
const doseLabel = (m: Medicine) => {
  const d = m.dose.trim();
  if (!d) return '—';
  return /^[\d½¼¾.\s]+$/.test(d) ? `${d} tab` : d;
};
const selectCls = 'flex-1 min-w-0 rounded-lg border hairline bg-white dark:bg-ink-900 px-2.5 py-2 text-sm text-ink-900 dark:text-ink-50 outline-none focus:border-brand-500';
const initials = (n: string) => n.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
const fmtSize = (b: number) => (b < 1024 * 1024 ? `${Math.round(b / 1024)} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`);
const esc = (s: string) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));
const pdfName = (n: string) => `prescription-${n.replace(/\s+/g, '-')}.pdf`;

// A blank-ish doc from a record that has no structured content (seeded rows).
const docFromRx = (rx: Rx): RxDoc => ({
  clinicName: demoClinic.name, doctor: demoClinic.doctor, spec: demoClinic.specialization, city: demoClinic.city,
  patient: rx.patientName, date: rx.date,
  symptoms: '', diagnosis: rx.summary, tests: '', followUp: '', notes: '', meds: [],
});

// ─── The printable prescription "paper" — one source of truth for screen,
//     PDF and print, so they all look identical. Always light. ──────────────
const DocField = ({ label, val }: { label: string; val: string }) => (
  <div>
    <div className="text-[11px] uppercase tracking-wider" style={{ color: '#94a3b8' }}>{label}</div>
    <div className="text-sm" style={{ color: '#0f172a' }}>{val || '—'}</div>
  </div>
);

function RxDocument({ doc, logo, onRemoveMed }: { doc: RxDoc; logo?: string; onRemoveMed?: (i: number) => void }) {
  const meds = doc.meds.filter((m) => m.name);
  return (
    <div style={{ color: '#0f172a', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div className="flex items-start justify-between pb-5" style={{ borderBottom: '1px solid #e2e8f0' }}>
        <div>
          <img src={logo || '/logo-full.png'} alt="Dalan Health" style={{ height: 38, width: 'auto', display: 'block' }} />
          <div className="mt-2 text-lg font-semibold">{doc.clinicName}</div>
          <div className="text-xs" style={{ color: '#64748b' }}>{doc.doctor} · {doc.spec}</div>
          <div className="text-xs" style={{ color: '#64748b' }}>{doc.city}</div>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase tracking-wider" style={{ color: '#94a3b8' }}>Date</div>
          <div className="text-sm font-semibold">{doc.date}</div>
          <div className="mt-2 text-xs uppercase tracking-wider" style={{ color: '#94a3b8' }}>Patient</div>
          <div className="text-sm font-semibold">{doc.patient}</div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4">
        <DocField label="Symptoms" val={doc.symptoms} />
        <DocField label="Diagnosis" val={doc.diagnosis} />
        <DocField label="Tests" val={doc.tests} />
        <DocField label="Follow-up" val={doc.followUp} />
      </div>

      <div className="mt-6">
        <div className="text-xs uppercase tracking-wider mb-2" style={{ color: '#64748b' }}>℞ Medicines</div>
        <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
          <table className="w-full" style={{ borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc', color: '#64748b', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                <th style={{ textAlign: 'left', padding: '8px 14px' }}>Medicine</th>
                <th style={{ textAlign: 'left', padding: '8px 14px' }}>Dose</th>
                <th style={{ textAlign: 'left', padding: '8px 14px' }}>Timing</th>
                <th style={{ textAlign: 'left', padding: '8px 14px' }}>Duration</th>
                {onRemoveMed && <th style={{ width: 1 }} />}
              </tr>
            </thead>
            <tbody>
              {meds.map((m, i) => (
                <tr key={i} className="group/medrow" style={{ borderTop: '1px solid #eef2f7' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 500 }}>{m.name}</td>
                  <td style={{ padding: '10px 14px', color: '#334155' }}>{doseLabel(m)}</td>
                  <td style={{ padding: '10px 14px', color: '#334155' }}>{timingText(m) || '—'}</td>
                  <td style={{ padding: '10px 14px', color: '#334155' }}>{m.days}</td>
                  {onRemoveMed && (
                    <td style={{ padding: '0 10px', width: 1 }}>
                      <button type="button" onClick={() => onRemoveMed(i)} aria-label="Remove medicine"
                        className="opacity-0 group-hover/medrow:opacity-100 transition-opacity"
                        style={{ color: '#ef4444', fontSize: 18, lineHeight: 1, padding: 4 }}>×</button>
                    </td>
                  )}
                </tr>
              ))}
              {meds.length === 0 && (
                <tr><td colSpan={onRemoveMed ? 5 : 4} style={{ padding: '10px 14px', color: '#94a3b8' }}>No medicines added yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {doc.notes && (
        <div className="mt-5">
          <div className="text-xs uppercase tracking-wider mb-1" style={{ color: '#64748b' }}>Doctor's notes</div>
          <p className="text-sm" style={{ color: '#334155' }}>{doc.notes}</p>
        </div>
      )}

      <div className="mt-10 pt-5 flex items-end justify-between gap-4" style={{ borderTop: '1px solid #e2e8f0' }}>
        <div className="text-[11px]" style={{ color: '#64748b' }}>
          <div>Powered by <b style={{ color: '#1e293b' }}>Dalan Health</b></div>
          <div>A Product of <b style={{ color: '#1e293b' }}>Dalansoft Technologies</b></div>
        </div>
        <div className="text-right">
          <div style={{ borderBottom: '1px solid #cbd5e1', width: 160, marginBottom: 4 }} />
          <div className="text-xs" style={{ color: '#64748b' }}>Doctor signature</div>
        </div>
      </div>
    </div>
  );
}

// Inline the logo once as a data URL so the captured document never races the
// image load (which left the logo faded/half-rendered in the PDF).
let logoDataUrlCache: string | null = null;
async function getLogoDataUrl(): Promise<string> {
  if (logoDataUrlCache !== null) return logoDataUrlCache;
  try {
    const res = await fetch('/logo-full.png');
    const blob = await res.blob();
    logoDataUrlCache = await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = reject;
      r.readAsDataURL(blob);
    });
  } catch {
    logoDataUrlCache = '';
  }
  return logoDataUrlCache;
}

// ─── Capture the real document, then print / PDF it (so they always match) ──
async function renderDocCanvas(doc: RxDoc): Promise<HTMLCanvasElement> {
  const html2canvas = (await import('html2canvas')).default;
  const logo = await getLogoDataUrl();
  const host = document.createElement('div');
  host.style.cssText = 'position:fixed;left:-10000px;top:0;z-index:-1;background:#ffffff;';
  document.body.appendChild(host);
  const target = document.createElement('div');
  target.style.cssText = 'width:794px;background:#ffffff;padding:36px;';
  host.appendChild(target);
  const root = createRoot(target);
  root.render(<RxDocument doc={doc} logo={logo} />);
  try { await (document as unknown as { fonts?: { ready: Promise<unknown> } }).fonts?.ready; } catch { /* ignore */ }
  await new Promise((r) => setTimeout(r, 60));
  // Make sure every image (the inlined logo) has decoded before capture.
  const imgs = Array.from(target.querySelectorAll('img')) as HTMLImageElement[];
  await Promise.all(imgs.map((im) => (im.complete && im.naturalWidth > 0
    ? Promise.resolve()
    : new Promise<void>((res) => { im.onload = () => res(); im.onerror = () => res(); }))));
  const canvas = await html2canvas(target, { scale: 3, backgroundColor: '#ffffff', useCORS: true, logging: false });
  root.unmount();
  host.remove();
  return canvas;
}

async function loadJsPdf() {
  const { jsPDF } = await import('jspdf');
  return { jsPDF };
}

async function exportDocPdf(doc: RxDoc, filename: string) {
  const canvas = await renderDocCanvas(doc);
  const { jsPDF } = await loadJsPdf();
  const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
  const pw = pdf.internal.pageSize.getWidth();
  const ph = pdf.internal.pageSize.getHeight();
  const imgH = (canvas.height / canvas.width) * pw;
  // PNG (lossless) — JPEG compression was softening the thin logo tagline.
  const data = canvas.toDataURL('image/png');
  if (imgH <= ph) {
    pdf.addImage(data, 'PNG', 0, 0, pw, imgH, undefined, 'FAST');
  } else {
    let position = 0;
    let remaining = imgH;
    while (remaining > 0) {
      pdf.addImage(data, 'PNG', 0, position, pw, imgH, undefined, 'FAST');
      remaining -= ph;
      if (remaining > 0) { pdf.addPage(); position -= ph; }
    }
  }
  pdf.save(filename);
}

async function exportDocPrint(doc: RxDoc) {
  const canvas = await renderDocCanvas(doc);
  printHtml(`<!doctype html><html><head><meta charset="utf-8"><style>@page{margin:12mm}html,body{margin:0}img{width:100%;display:block}</style></head><body><img src="${canvas.toDataURL('image/png')}"></body></html>`);
}

async function imagePdf(dataUrl: string, filename: string) {
  const { jsPDF } = await loadJsPdf();
  const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
  const W = pdf.internal.pageSize.getWidth();
  const H = pdf.internal.pageSize.getHeight();
  const img = await new Promise<HTMLImageElement>((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = dataUrl; });
  const ratio = Math.min((W - 60) / img.width, (H - 60) / img.height, 1);
  const w = img.width * ratio, h = img.height * ratio;
  pdf.addImage(dataUrl, dataUrl.includes('image/png') ? 'PNG' : 'JPEG', (W - w) / 2, 30, w, h);
  pdf.save(filename);
}

function fileRxHtml(rx: Rx): string {
  const src = rx.fileUrl ?? '';
  const isPdf = (rx.fileName ?? '').toLowerCase().endsWith('.pdf') || src.startsWith('data:application/pdf');
  const body = isPdf
    ? `<embed src="${src}" type="application/pdf" style="width:100%;height:100vh" />`
    : `<img src="${src}" style="max-width:100%;height:auto;display:block;margin:auto" />`;
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(rx.fileName ?? 'Prescription')}</title><style>body{margin:0;padding:12px}</style></head><body>${body}</body></html>`;
}

async function downloadFilePdf(rx: Rx) {
  const name = pdfName(rx.patientName);
  const fn = (rx.fileName ?? '').toLowerCase();
  if (!rx.fileUrl) return;
  if (fn.endsWith('.pdf') || rx.fileUrl.startsWith('data:application/pdf')) { downloadUrl(rx.fileUrl, rx.fileName ?? name); return; }
  if (rx.fileUrl.startsWith('data:image') || /\.(jpe?g|png)$/i.test(fn) || rx.fileUrl.startsWith('blob:')) { await imagePdf(rx.fileUrl, name); return; }
  downloadUrl(rx.fileUrl, rx.fileName ?? name); // e.g. DOCX
}

const printRx = (rx: Rx) => (rx.fileUrl ? printHtml(fileRxHtml(rx)) : exportDocPrint(rx.doc ?? docFromRx(rx)));
const downloadRx = (rx: Rx) => (rx.fileUrl ? downloadFilePdf(rx) : exportDocPdf(rx.doc ?? docFromRx(rx), pdfName(rx.patientName)));

function printHtml(html: string) {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
  document.body.appendChild(iframe);
  const win = iframe.contentWindow;
  const doc = win?.document;
  if (!win || !doc) { iframe.remove(); return; }
  doc.open(); doc.write(html); doc.close();
  const run = () => { try { win.focus(); win.print(); } finally { setTimeout(() => iframe.remove(), 1000); } };
  if (doc.readyState === 'complete') setTimeout(run, 350);
  else win.onload = () => setTimeout(run, 350);
}

function downloadUrl(url: string, filename: string) {
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
}

export function PrescriptionScreen() {
  const [params] = useSearchParams();
  const [mode, setMode] = useState<Mode>(params.get('upload') ? 'upload' : 'digital');
  const completed = useQueue((s) => s.completed);
  const addRx = usePrescriptions((s) => s.add);

  const completedPatients = useMemo<Patient[]>(() => {
    const seen = new Set<string>();
    const out: Patient[] = [];
    const push = (name: string, mobile: string, when: string) => {
      const k = mobile.replace(/\D/g, '');
      if (!k || seen.has(k)) return;
      seen.add(k);
      out.push({ name, mobile, when });
    };
    completed.forEach((e) => push(e.patientName, e.patientMobile, e.completedAt ?? 'Today'));
    demoPatients.forEach((p) => push(p.name, p.mobile, p.lastVisit));
    return out;
  }, [completed]);

  const [patient, setPatient] = useState<Patient>(() => completedPatients[0] ?? { name: 'Shailesh Kumar', mobile: '+91 98765 43210', when: 'Today' });

  const [symptoms, setSymptoms] = useState('Sore throat, mild fever for 3 days');
  const [diagnosis, setDiagnosis] = useState('Acute pharyngitis');
  const [tests, setTests] = useState('CBC, throat swab');
  const [notes, setNotes] = useState('Plenty of fluids. Rest. Avoid cold drinks.');
  const [followUp, setFollowUp] = useState('5 days');
  const [meds, setMeds] = useState<Medicine[]>([
    { name: 'Azithromycin 500mg', dose: '1', morning: true, afternoon: false, evening: false, night: false, days: '5 days' },
    { name: 'Paracetamol 650mg', dose: '1', morning: true, afternoon: true, evening: false, night: true, days: '3 days' },
    { name: 'Betadine gargle', dose: '15 ml', morning: false, afternoon: true, evening: false, night: true, days: '5 days' },
  ]);
  const [draft, setDraft] = useState<Medicine>(blankMed());
  const [savedDigital, setSavedDigital] = useState(false);
  const [busy, setBusy] = useState<'print' | 'pdf' | null>(null);

  const updateDraft = <K extends keyof Medicine>(key: K, val: Medicine[K]) => setDraft((d) => ({ ...d, [key]: val }));
  const activeSlots = SLOTS.filter(([k]) => draft[k]).map(([k]) => k);
  const whenValue = String(WHEN_OPTIONS.findIndex((o) => o.slots.length === activeSlots.length && o.slots.every((s) => activeSlots.includes(s))));
  const setWhen = (idx: string) => {
    const o = WHEN_OPTIONS[Number(idx)];
    setDraft((d) => ({
      ...d,
      morning: !!o?.slots.includes('morning'),
      afternoon: !!o?.slots.includes('afternoon'),
      evening: !!o?.slots.includes('evening'),
      night: !!o?.slots.includes('night'),
    }));
  };
  const addMed = () => {
    if (!draft.name.trim()) return;
    setMeds((list) => [...list, draft]);
    setDraft(blankMed());
  };
  const removeMed = (i: number) => setMeds(meds.filter((_, idx) => idx !== i));

  const currentDoc = (): RxDoc => ({
    clinicName: demoClinic.name, doctor: demoClinic.doctor, spec: demoClinic.specialization, city: demoClinic.city,
    patient: patient.name,
    date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    symptoms, diagnosis, tests, followUp, notes, meds,
  });

  const record = (kind: RxKind, summary: string, extra?: { doc?: RxDoc; fileUrl?: string; fileName?: string }) =>
    addRx({ patientName: patient.name, patientMobile: patient.mobile, kind, summary, ...extra });

  const saveDigital = () => {
    record('digital', diagnosis.trim() || 'Prescription', { doc: currentDoc() });
    setSavedDigital(true);
    setTimeout(() => setSavedDigital(false), 2000);
  };

  const doPrint = async () => { setBusy('print'); try { await exportDocPrint(currentDoc()); } finally { setBusy(null); } };
  const doPdf = async () => { setBusy('pdf'); try { await exportDocPdf(currentDoc(), pdfName(patient.name)); } finally { setBusy(null); } };

  const tabs = [
    { key: 'digital', label: 'Create digitally', icon: <FileText size={15} /> },
    { key: 'upload', label: 'Upload file', icon: <Upload size={15} /> },
    { key: 'camera', label: 'Take photo', icon: <Camera size={15} /> },
  ] as const;

  return (
    <div className="space-y-5">
      <PatientPicker patients={completedPatients} value={patient} onChange={setPatient} />

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setMode(t.key)}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${
              mode === t.key
                ? 'border-brand-500 bg-brand-500/10 text-brand-700 dark:text-brand-300'
                : 'hairline text-ink-700 dark:text-ink-200 hover:bg-ink-50 dark:hover:bg-ink-800'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Every prescription, all patients — visible up top regardless of mode */}
      <PrescriptionHistory />

      {mode === 'upload' && <UploadCard patient={patient} onAttach={(s, extra) => record('upload', s, extra)} />}
      {mode === 'camera' && <CameraCard patient={patient} onAttach={(s, extra) => record('photo', s, extra)} />}

      {mode === 'digital' && (
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
                <div className="mb-2 text-xs font-medium text-ink-700 dark:text-ink-300 uppercase tracking-wide">
                  Add medicine {meds.length > 0 && <span className="text-muted normal-case">· {meds.length} in prescription →</span>}
                </div>

                {/* One entry form — fill it, then Add. Added medicines appear in the preview only. */}
                <div className="rounded-xl border hairline p-3 space-y-2.5 bg-ink-50/50 dark:bg-ink-900/40">
                  <input value={draft.name} onChange={(e) => updateDraft('name', e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addMed(); } }} placeholder="Medicine name (e.g. Azithromycin 500mg)" className="w-full rounded-lg border hairline bg-white dark:bg-ink-900 px-3 py-2 text-sm font-medium text-ink-900 dark:text-ink-50 outline-none" />
                  <label className="flex items-center gap-2">
                    <span className="w-12 shrink-0 text-[10px] font-semibold uppercase tracking-wider text-muted">Dose</span>
                    <select value={draft.dose} onChange={(e) => updateDraft('dose', e.target.value)} className={selectCls}>
                      {DOSE_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </label>
                  <label className="flex items-center gap-2">
                    <span className="w-12 shrink-0 text-[10px] font-semibold uppercase tracking-wider text-muted">When</span>
                    <select value={whenValue} onChange={(e) => setWhen(e.target.value)} className={selectCls}>
                      <option value="-1" disabled>Select timing…</option>
                      {WHEN_OPTIONS.map((o, idx) => <option key={idx} value={idx}>{o.label}</option>)}
                    </select>
                  </label>
                  <label className="flex items-center gap-2">
                    <span className="w-12 shrink-0 text-[10px] font-semibold uppercase tracking-wider text-muted">Days</span>
                    <select value={draft.days} onChange={(e) => updateDraft('days', e.target.value)} className={selectCls}>
                      <option value="" disabled>Select duration…</option>
                      {DAY_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </label>
                  <Button size="sm" variant="outline" leftIcon={<Plus size={12} />} onClick={addMed} disabled={!draft.name.trim()} className="w-full justify-center">
                    Add medicine
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <div className="lg:col-span-3 space-y-4">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border hairline shadow-card p-8" style={{ background: '#ffffff' }}>
              <RxDocument doc={currentDoc()} onRemoveMed={removeMed} />
            </motion.div>
            <div className="flex flex-wrap gap-2 justify-end">
              <Button variant={savedDigital ? 'success' : 'primary'} leftIcon={savedDigital ? <Check size={14} /> : <Save size={14} />} onClick={saveDigital}>
                {savedDigital ? 'Saved' : 'Save prescription'}
              </Button>
              <Button variant="outline" leftIcon={busy === 'print' ? <Loader2 size={14} className="animate-spin" /> : <Printer size={14} />} onClick={doPrint} disabled={!!busy}>Print</Button>
              <Button variant="outline" leftIcon={busy === 'pdf' ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} onClick={doPdf} disabled={!!busy}>Download PDF</Button>
              <Button variant="outline" leftIcon={<Share2 size={14} />}>Share WhatsApp</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Completed-patient picker ───────────────────────────────────────────────
function PatientPicker({ patients, value, onChange }: { patients: Patient[]; value: Patient; onChange: (p: Patient) => void }) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const filtered = useMemo(() => {
    const n = q.toLowerCase().replace(/\s/g, '');
    return patients.filter((p) => !n || `${p.name}${p.mobile}`.toLowerCase().replace(/\s/g, '').includes(n)).slice(0, 8);
  }, [patients, q]);

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Patient</CardTitle>
          <CardSubtitle>Search a completed visit to prescribe or upload for — only visited patients appear</CardSubtitle>
        </div>
        <Badge tone="neutral">{patients.length} completed</Badge>
      </CardHeader>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-3 rounded-xl border hairline bg-ink-50/60 dark:bg-ink-900/40 px-3 py-2 shrink-0">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-white text-xs font-semibold">{initials(value.name)}</span>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-ink-900 dark:text-ink-50 truncate">{value.name}</div>
            <div className="text-[11px] text-muted truncate">{value.mobile}</div>
          </div>
        </div>
        <div className="relative flex-1">
          <Input
            leftIcon={<Search size={14} />}
            placeholder="Search completed patient by name or mobile…"
            value={q}
            onChange={(e) => { setQ(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
          />
          {open && (
            <div className="absolute z-20 mt-1 w-full rounded-xl border hairline bg-white dark:bg-ink-900 shadow-card max-h-64 overflow-y-auto">
              {filtered.map((p) => (
                <button
                  key={p.mobile}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => { onChange(p); setQ(''); setOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-ink-50 dark:hover:bg-ink-800/60 transition-colors"
                >
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-500/15 text-brand-600 dark:text-brand-300 text-[11px] font-semibold">{initials(p.name)}</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-ink-900 dark:text-ink-50 truncate">{p.name}</div>
                    <div className="text-[11px] text-muted truncate">{p.mobile} · completed {p.when}</div>
                  </div>
                </button>
              ))}
              {filtered.length === 0 && <div className="px-3 py-4 text-center text-sm text-muted">No completed patient found.</div>}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

const KIND_META: Record<RxKind, { label: string; tone: 'brand' | 'accent' | 'success' }> = {
  digital: { label: 'Digital', tone: 'brand' },
  upload: { label: 'Uploaded', tone: 'accent' },
  photo: { label: 'Photo', tone: 'success' },
};

function PrescriptionHistory() {
  const list = usePrescriptions((s) => s.list);
  const [q, setQ] = useState('');
  const filtered = useMemo(() => {
    const n = q.toLowerCase().replace(/\s/g, '');
    return !n ? list : list.filter((r) => `${r.patientName}${r.patientMobile}${r.summary}`.toLowerCase().replace(/\s/g, '').includes(n));
  }, [list, q]);

  return (
    <Card padded={false}>
      <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <CardTitle>Prescription history</CardTitle>
          <CardSubtitle>Every prescription, all patients</CardSubtitle>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-full sm:w-64">
            <Input leftIcon={<Search size={14} />} placeholder="Search patient or summary…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <Badge tone="neutral">{filtered.length}</Badge>
        </div>
      </div>
      <div className="overflow-x-auto border-t hairline">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-ink-50 dark:bg-ink-900/60">
            <tr className="text-left text-[11px] uppercase tracking-wider text-muted">
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Patient</th>
              <th className="px-5 py-3">Mobile</th>
              <th className="px-5 py-3">Type</th>
              <th className="px-5 py-3">Summary</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y hairline">
            {filtered.map((r) => (
              <tr key={r.id} className="hover:bg-ink-50 dark:hover:bg-ink-900/40">
                <td className="px-5 py-3 text-muted whitespace-nowrap">{r.date}</td>
                <td className="px-5 py-3 font-medium text-ink-900 dark:text-ink-50">{r.patientName}</td>
                <td className="px-5 py-3 text-muted">{r.patientMobile}</td>
                <td className="px-5 py-3"><Badge tone={KIND_META[r.kind].tone} size="sm">{KIND_META[r.kind].label}</Badge></td>
                <td className="px-5 py-3 text-ink-700 dark:text-ink-200">{r.summary}</td>
                <td className="px-5 py-3 text-right whitespace-nowrap">
                  <button type="button" onClick={() => { void printRx(r); }} title="Print prescription" className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800 hover:text-brand-600 dark:hover:text-brand-300">
                    <Printer size={14} />
                  </button>
                  <button type="button" onClick={() => { void downloadRx(r); }} title="Download PDF" className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800 hover:text-brand-600 dark:hover:text-brand-300">
                    <Download size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-sm text-muted">No prescriptions yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// ─── Upload an existing prescription (PDF / DOCX / JPG) ──────────────────────
function UploadCard({ patient, onAttach }: { patient: Patient; onAttach: (summary: string, extra?: { fileUrl?: string; fileName?: string }) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const [attached, setAttached] = useState(false);

  const pick = (f: File | null) => {
    setAttached(false);
    if (preview) URL.revokeObjectURL(preview);
    setFile(f);
    setPreview(f && f.type.startsWith('image/') ? URL.createObjectURL(f) : null);
  };
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <div>
          <CardTitle>Upload prescription</CardTitle>
          <CardSubtitle>Attach a PDF, DOCX or JPG for {patient.name}</CardSubtitle>
        </div>
        {attached && <Badge tone="success" pulse>Saved</Badge>}
      </CardHeader>

      {!file ? (
        <label
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files?.[0] ?? null); }}
          className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-12 text-center cursor-pointer transition-colors ${
            drag ? 'border-brand-500 bg-brand-500/5' : 'border-ink-300 dark:border-ink-700 hover:border-brand-500/60 hover:bg-ink-50 dark:hover:bg-ink-900/50'
          }`}
        >
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/15 text-brand-600 dark:text-brand-300"><Upload size={22} /></span>
          <div className="text-sm font-semibold text-ink-900 dark:text-ink-50">Drag &amp; drop, or click to browse</div>
          <div className="text-xs text-muted">PDF, DOCX or JPG · up to ~10 MB</div>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,application/pdf,image/jpeg,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={(e) => pick(e.target.files?.[0] ?? null)}
          />
        </label>
      ) : (
        <div className="space-y-4">
          {preview ? (
            <img src={preview} alt="Prescription preview" className="max-h-80 w-auto rounded-xl border hairline mx-auto" />
          ) : (
            <div className="flex items-center gap-3 rounded-xl border hairline p-4">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/15 text-brand-600 dark:text-brand-300"><FileIcon size={20} /></span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-ink-900 dark:text-ink-50 truncate">{file.name}</div>
                <div className="text-xs text-muted">{fmtSize(file.size)} · {file.type || 'file'}</div>
              </div>
            </div>
          )}
          <div className="flex flex-wrap gap-2 justify-between">
            <Button variant="outline" leftIcon={<X size={14} />} onClick={() => pick(null)}>Remove</Button>
            <Button leftIcon={<Check size={14} />} onClick={() => {
              setAttached(true);
              const reader = new FileReader();
              reader.onload = () => onAttach(file.name, { fileUrl: String(reader.result), fileName: file.name });
              reader.readAsDataURL(file);
            }} disabled={attached}>
              {attached ? 'Saved to record' : 'Attach to patient record'}
            </Button>
          </div>
          {attached && (
            <div className="rounded-xl border border-success-500/30 bg-success-500/5 px-3 py-2 text-xs text-success-600 dark:text-success-500 flex items-center gap-1.5">
              <Check size={12} /> Attached to {patient.name}'s record.
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

// ─── Capture a prescription photo from the camera ───────────────────────────
function CameraCard({ patient, onAttach }: { patient: Patient; onAttach: (summary: string, extra?: { fileUrl?: string; fileName?: string }) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attached, setAttached] = useState(false);

  const stop = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setStreaming(false);
  };

  const start = async () => {
    setError(null); setPhoto(null); setAttached(false);
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Camera not available on this device — use the file picker below.');
      return;
    }
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      streamRef.current = s;
      setStreaming(true);
      if (videoRef.current) { videoRef.current.srcObject = s; await videoRef.current.play().catch(() => {}); }
    } catch {
      setError('Could not access the camera. Allow camera permission, or use the file picker below.');
    }
  };

  const capture = () => {
    const v = videoRef.current;
    if (!v) return;
    const c = document.createElement('canvas');
    c.width = v.videoWidth || 1280;
    c.height = v.videoHeight || 960;
    c.getContext('2d')?.drawImage(v, 0, 0, c.width, c.height);
    setPhoto(c.toDataURL('image/jpeg', 0.9));
    stop();
  };

  useEffect(() => () => stop(), []);

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <div>
          <CardTitle>Photograph prescription</CardTitle>
          <CardSubtitle>Capture a paper prescription for {patient.name}</CardSubtitle>
        </div>
        {attached && <Badge tone="success" pulse>Saved</Badge>}
      </CardHeader>

      <div className="space-y-4">
        <div className="relative rounded-2xl overflow-hidden bg-ink-900 aspect-video flex items-center justify-center">
          {photo ? (
            <img src={photo} alt="Captured prescription" className="h-full w-full object-contain" />
          ) : (
            <>
              <video ref={videoRef} playsInline muted className={`h-full w-full object-cover ${streaming ? '' : 'hidden'}`} />
              {!streaming && (
                <div className="text-center text-white/70 px-6">
                  <Camera size={28} className="mx-auto mb-2 opacity-80" />
                  <div className="text-sm">Camera is off</div>
                </div>
              )}
            </>
          )}
        </div>

        {error && <div className="rounded-xl border border-warning-500/40 bg-warning-500/5 px-3 py-2 text-xs text-warning-700 dark:text-warning-300">{error}</div>}

        <div className="flex flex-wrap gap-2 justify-between">
          <div className="flex gap-2">
            {!streaming && !photo && <Button leftIcon={<Camera size={14} />} onClick={start}>Start camera</Button>}
            {streaming && (
              <>
                <Button leftIcon={<Camera size={14} />} onClick={capture}>Capture</Button>
                <Button variant="outline" onClick={stop}>Stop</Button>
              </>
            )}
            {photo && <Button variant="outline" leftIcon={<RefreshCw size={14} />} onClick={start}>Retake</Button>}
            <label className="inline-flex items-center gap-1.5 rounded-xl border hairline px-3 h-10 text-sm font-medium text-ink-700 dark:text-ink-200 hover:bg-ink-50 dark:hover:bg-ink-800 cursor-pointer">
              <ImageIcon size={14} /> Use device camera
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { stop(); setError(null); setAttached(false); setPhoto(URL.createObjectURL(f)); } }} />
            </label>
          </div>
          {photo && (
            <Button leftIcon={<Check size={14} />} onClick={() => { setAttached(true); onAttach('Camera photo', { fileUrl: photo ?? undefined, fileName: 'prescription.jpg' }); }} disabled={attached}>
              {attached ? 'Saved to record' : 'Attach to patient record'}
            </Button>
          )}
        </div>

        {attached && (
          <div className="rounded-xl border border-success-500/30 bg-success-500/5 px-3 py-2 text-xs text-success-600 dark:text-success-500 flex items-center gap-1.5">
            <Check size={12} /> Photo attached to {patient.name}'s record.
          </div>
        )}
      </div>
    </Card>
  );
}
