import { useState } from 'react';
import { Save, Clock, Palette, Bell, MessageCircle, MessageSquare, Mail, Smartphone, Sparkles, Check, Plus, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardSubtitle, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useTheme } from '@/store/theme';
import { useEstimate } from '@/store/estimate';
import { useEta } from '@/hooks/useEta';
import { cn } from '@/lib/cn';
import { demoClinic } from '@/services/demoData';

interface TimeSlot { id: string; label: string; from: string; to: string }

const Toggle = ({ on, onChange, label, icon, desc }: { on: boolean; onChange: (v: boolean) => void; label: string; icon: React.ReactNode; desc?: string }) => (
  <div className="flex items-center justify-between gap-4 rounded-xl border hairline p-4">
    <div className="flex items-start gap-3 min-w-0">
      <div className="h-9 w-9 rounded-xl bg-brand-500/15 text-brand-600 dark:text-brand-300 flex items-center justify-center shrink-0">{icon}</div>
      <div className="min-w-0">
        <div className="text-sm font-semibold text-ink-900 dark:text-ink-50">{label}</div>
        {desc && <div className="text-xs text-muted">{desc}</div>}
      </div>
    </div>
    <button
      onClick={() => onChange(!on)}
      className={cn(
        'relative h-6 w-11 rounded-full transition-colors shrink-0',
        on ? 'bg-brand-500' : 'bg-ink-300 dark:bg-ink-700',
      )}
      aria-pressed={on}
    >
      <span className={cn(
        'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
        on && 'translate-x-5',
      )} />
    </button>
  </div>
);

export function ClinicSettings() {
  const [name, setName] = useState(demoClinic.name);
  const [doctor, setDoctor] = useState(demoClinic.doctor);
  const [spec, setSpec] = useState(demoClinic.specialization);
  const [city, setCity] = useState(demoClinic.city);
  const [slots, setSlots] = useState<TimeSlot[]>([
    { id: 's1', label: 'Morning', from: '10:00', to: '14:00' },
    { id: 's2', label: 'Evening', from: '17:00', to: '20:00' },
  ]);
  const updateSlot = (id: string, patch: Partial<TimeSlot>) => setSlots((list) => list.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  const addSlot = () => setSlots((list) => [...list, { id: `s-${Date.now()}`, label: `Slot ${list.length + 1}`, from: '09:00', to: '12:00' }]);
  const removeSlot = (id: string) => setSlots((list) => (list.length > 1 ? list.filter((s) => s.id !== id) : list));
  const [push, setPush] = useState(true);
  const [whatsapp, setWhatsapp] = useState(true);
  const [sms, setSms] = useState(true);
  const [email, setEmail] = useState(false);

  const { theme, set } = useTheme();
  const { mode, clinicMinutes, setMode, setClinicMinutes } = useEstimate();
  const { avg } = useEta();
  const [saved, setSaved] = useState(false);

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Clinic profile</CardTitle>
            <CardSubtitle>Shown to patients in the app and on prescriptions / invoices</CardSubtitle>
          </div>
          {saved && <Badge tone="success" pulse>Saved</Badge>}
        </CardHeader>
        <div className="grid md:grid-cols-2 gap-3">
          <Input label="Clinic name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Doctor name" value={doctor} onChange={(e) => setDoctor(e.target.value)} />
          <Input label="Specialization" value={spec} onChange={(e) => setSpec(e.target.value)} />
          <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} />
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Doctor timing</CardTitle>
            <CardSubtitle>Add as many sittings as you like — patients see "Doctor sitting till" and queue estimates derive from these</CardSubtitle>
          </div>
          <Clock size={16} className="text-muted" />
        </CardHeader>
        <div className="grid sm:grid-cols-2 gap-4">
          {slots.map((s) => (
            <div key={s.id} className="rounded-xl border hairline p-4">
              <div className="mb-2 flex items-center gap-2">
                <input
                  value={s.label}
                  onChange={(e) => updateSlot(s.id, { label: e.target.value })}
                  className="flex-1 min-w-0 bg-transparent text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-300 outline-none"
                  placeholder="Slot name"
                />
                {slots.length > 1 && (
                  <button type="button" onClick={() => removeSlot(s.id)} className="text-ink-400 hover:text-danger-500" aria-label="Remove timing">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input label="From" type="time" value={s.from} onChange={(e) => updateSlot(s.id, { from: e.target.value })} />
                <Input label="To" type="time" value={s.to} onChange={(e) => updateSlot(s.id, { to: e.target.value })} />
              </div>
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" leftIcon={<Plus size={14} />} onClick={addSlot} className="mt-3">
          Add timing
        </Button>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Wait-time estimate</CardTitle>
            <CardSubtitle>How each token's estimated wait is calculated and shown to patients</CardSubtitle>
          </div>
          <Clock size={16} className="text-muted" />
        </CardHeader>
        <div className="grid sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setMode('ai')}
            className={cn('rounded-xl border-2 p-4 text-left transition-all', mode === 'ai' ? 'border-brand-500 bg-brand-500/5' : 'border-transparent bg-ink-50 dark:bg-ink-900')}
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-ink-900 dark:text-ink-50">
                <Sparkles size={15} className="text-brand-600 dark:text-brand-300" /> AI auto-estimate
              </span>
              {mode === 'ai' && <Badge tone="brand" size="sm">On</Badge>}
            </div>
            <div className="mt-1 text-xs text-muted">Analyses real consultation times and updates itself — currently ~{avg} min/patient.</div>
          </button>
          <button
            type="button"
            onClick={() => setMode('clinic')}
            className={cn('rounded-xl border-2 p-4 text-left transition-all', mode === 'clinic' ? 'border-brand-500 bg-brand-500/5' : 'border-transparent bg-ink-50 dark:bg-ink-900')}
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-ink-900 dark:text-ink-50">
                <Clock size={15} className="text-brand-600 dark:text-brand-300" /> Clinic-set
              </span>
              {mode === 'clinic' && <Badge tone="brand" size="sm">On</Badge>}
            </div>
            <div className="mt-1 text-xs text-muted">You set a fixed average minutes per patient.</div>
          </button>
        </div>
        {mode === 'clinic' && (
          <div className="mt-3 max-w-xs">
            <Input
              label="Minutes per patient"
              type="number"
              inputMode="numeric"
              value={String(clinicMinutes)}
              onChange={(e) => setClinicMinutes(Math.max(1, Number(e.target.value) || 0))}
            />
          </div>
        )}
        <div className="mt-3 rounded-xl border hairline bg-ink-50/60 dark:bg-ink-900/40 px-4 py-3 text-xs text-muted">
          Shown everywhere a token appears — the queue, the TV display and the patient's tracking screen. Estimated wait = position in queue × {avg} min.
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Notifications</CardTitle>
            <CardSubtitle>Patients are notified through the first channel that succeeds</CardSubtitle>
          </div>
        </CardHeader>
        <div className="grid md:grid-cols-2 gap-3">
          <Toggle on={push} onChange={setPush} label="Push notifications" desc="Free · instant delivery via Firebase" icon={<Smartphone size={16} />} />
          <Toggle on={whatsapp} onChange={setWhatsapp} label="WhatsApp" desc="Recommended · ~₹0.50 per message" icon={<MessageCircle size={16} />} />
          <Toggle on={sms} onChange={setSms} label="SMS" desc="Fallback · ~₹0.30 per message" icon={<MessageSquare size={16} />} />
          <Toggle on={email} onChange={setEmail} label="Email" desc="Final fallback · free" icon={<Mail size={16} />} />
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Theme</CardTitle>
            <CardSubtitle>Affects only this device</CardSubtitle>
          </div>
          <Palette size={16} className="text-muted" />
        </CardHeader>
        <div className="grid grid-cols-2 gap-3 max-w-md">
          {(['light', 'dark'] as const).map((t) => (
            <button
              key={t}
              onClick={() => set(t)}
              className={cn(
                'rounded-xl border-2 p-4 text-left transition-all',
                theme === t ? 'border-brand-500 bg-brand-500/5' : 'border-transparent bg-ink-50 dark:bg-ink-900',
              )}
            >
              <div className="text-sm font-semibold text-ink-900 dark:text-ink-50 capitalize">{t}</div>
              <div className="text-xs text-muted">{t === 'dark' ? 'Reduced eye strain at night' : 'Better for sunlight'}</div>
            </button>
          ))}
        </div>
      </Card>

      <div className="sticky bottom-0 -mx-5 sm:-mx-8 px-5 sm:px-8 py-4 border-t hairline bg-white/80 dark:bg-ink-950/80 backdrop-blur-xl">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="text-xs inline-flex items-center gap-1.5">
            {saved
              ? <span className="text-success-600 dark:text-success-500 inline-flex items-center gap-1.5"><Check size={13} /> All changes saved</span>
              : <span className="text-muted inline-flex items-center gap-1.5"><Bell size={12} /> Changes apply immediately on save.</span>}
          </div>
          <Button
            variant={saved ? 'success' : 'primary'}
            leftIcon={saved ? <Check size={14} /> : <Save size={14} />}
            onClick={save}
          >
            {saved ? 'Saved' : 'Save changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}
