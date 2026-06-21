import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Trash2, Printer, Download, Share2, Upload, Camera, FileText,
  File as FileIcon, X, Check, RefreshCw, Image as ImageIcon,
} from 'lucide-react';
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

type Mode = 'digital' | 'upload' | 'camera';

export function PrescriptionScreen() {
  const [mode, setMode] = useState<Mode>('digital');
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

  const tabs = [
    { key: 'digital', label: 'Create digitally', icon: <FileText size={15} /> },
    { key: 'upload', label: 'Upload file', icon: <Upload size={15} /> },
    { key: 'camera', label: 'Take photo', icon: <Camera size={15} /> },
  ] as const;

  return (
    <div className="space-y-5">
      {/* Mode switcher */}
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

      {mode === 'upload' && <UploadCard patient={patient} />}
      {mode === 'camera' && <CameraCard patient={patient} />}

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
      )}
    </div>
  );
}

const Field = ({ label, val }: { label: string; val: string }) => (
  <div>
    <div className="text-[11px] uppercase tracking-wider text-muted">{label}</div>
    <div className="text-sm text-ink-900 dark:text-ink-50">{val || '—'}</div>
  </div>
);

const fmtSize = (b: number) => (b < 1024 * 1024 ? `${Math.round(b / 1024)} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`);

// ─── Upload an existing prescription (PDF / DOCX / JPG) ──────────────────────
function UploadCard({ patient }: { patient: string }) {
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
          <CardSubtitle>Attach a PDF, DOCX or JPG for {patient}</CardSubtitle>
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
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/15 text-brand-600 dark:text-brand-300">
            <Upload size={22} />
          </span>
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
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/15 text-brand-600 dark:text-brand-300">
                <FileIcon size={20} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-ink-900 dark:text-ink-50 truncate">{file.name}</div>
                <div className="text-xs text-muted">{fmtSize(file.size)} · {file.type || 'file'}</div>
              </div>
            </div>
          )}
          <div className="flex flex-wrap gap-2 justify-between">
            <Button variant="outline" leftIcon={<X size={14} />} onClick={() => pick(null)}>Remove</Button>
            <Button leftIcon={<Check size={14} />} onClick={() => setAttached(true)} disabled={attached}>
              {attached ? 'Saved to record' : 'Attach to patient record'}
            </Button>
          </div>
          {attached && (
            <div className="rounded-xl border border-success-500/30 bg-success-500/5 px-3 py-2 text-xs text-success-600 dark:text-success-500 flex items-center gap-1.5">
              <Check size={12} /> Attached to {patient}'s record.
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

// ─── Capture a prescription photo from the camera ───────────────────────────
function CameraCard({ patient }: { patient: string }) {
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

  // Stop the camera when leaving this mode (component unmounts).
  useEffect(() => () => stop(), []);

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <div>
          <CardTitle>Photograph prescription</CardTitle>
          <CardSubtitle>Open the camera and capture a paper prescription for {patient}</CardSubtitle>
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

        {error && (
          <div className="rounded-xl border border-warning-500/40 bg-warning-500/5 px-3 py-2 text-xs text-warning-700 dark:text-warning-300">
            {error}
          </div>
        )}

        <div className="flex flex-wrap gap-2 justify-between">
          <div className="flex gap-2">
            {!streaming && !photo && (
              <Button leftIcon={<Camera size={14} />} onClick={start}>Start camera</Button>
            )}
            {streaming && (
              <>
                <Button leftIcon={<Camera size={14} />} onClick={capture}>Capture</Button>
                <Button variant="outline" onClick={stop}>Stop</Button>
              </>
            )}
            {photo && (
              <Button variant="outline" leftIcon={<RefreshCw size={14} />} onClick={start}>Retake</Button>
            )}
            {/* Mobile / fallback: native camera or gallery */}
            <label className="inline-flex items-center gap-1.5 rounded-xl border hairline px-3 h-10 text-sm font-medium text-ink-700 dark:text-ink-200 hover:bg-ink-50 dark:hover:bg-ink-800 cursor-pointer">
              <ImageIcon size={14} /> Use device camera
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) { stop(); setError(null); setAttached(false); setPhoto(URL.createObjectURL(f)); }
                }}
              />
            </label>
          </div>
          {photo && (
            <Button leftIcon={<Check size={14} />} onClick={() => setAttached(true)} disabled={attached}>
              {attached ? 'Saved to record' : 'Attach to patient record'}
            </Button>
          )}
        </div>

        {attached && (
          <div className="rounded-xl border border-success-500/30 bg-success-500/5 px-3 py-2 text-xs text-success-600 dark:text-success-500 flex items-center gap-1.5">
            <Check size={12} /> Photo attached to {patient}'s record.
          </div>
        )}
      </div>
    </Card>
  );
}
