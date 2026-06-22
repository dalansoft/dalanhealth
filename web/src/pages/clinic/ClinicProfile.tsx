import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Camera, Save, RotateCcw, User as UserIcon, Phone, Mail, MapPin,
  Stethoscope, GraduationCap, Award, FileText, AlertCircle, CheckCircle2,
  Plus, Trash2, Paperclip, ShieldCheck, ScrollText,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/store/auth';
import { cn } from '@/lib/cn';

interface Cred { name: string; number: string; fileName?: string; fileUrl?: string }

interface FormState {
  name: string;
  mobile: string;
  email: string;
  address: string;
  specialization: string;
  experience: string;
  qualification: string;
  aboutMe: string;
  photoDataUrl: string;
  licenses: Cred[];
  certificates: Cred[];
}

const emptyForm: FormState = {
  name: '', mobile: '', email: '', address: '', specialization: '',
  experience: '', qualification: '', aboutMe: '', photoDataUrl: '',
  licenses: [], certificates: [],
};

const credKey = (list: Cred[]) => JSON.stringify(list.map(({ name, number, fileName }) => ({ name, number, fileName })));

/**
 * Full profile editor for the signed-in clinic admin / doctor. Lets them
 * upload a photo and edit every public-facing field. Only `name` and
 * `mobile` are required — everything else is optional and only displayed
 * when filled in.
 */
export function ClinicProfile() {
  const user = useAuth((s) => s.user);
  const updateUser = useAuth((s) => s.updateUser);

  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hydrate form whenever the user object changes (login, store update, etc.).
  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name ?? '',
      mobile: user.mobile ?? '',
      email: user.email ?? '',
      address: user.address ?? '',
      specialization: user.specialization ?? '',
      experience: user.experience ?? '',
      qualification: user.qualification ?? '',
      aboutMe: user.aboutMe ?? '',
      photoDataUrl: user.photoDataUrl ?? '',
      licenses: (user.licenses ?? []).map((c) => ({ ...c })),
      certificates: (user.certificates ?? []).map((c) => ({ ...c })),
    });
    setErrors({});
  }, [user]);

  const dirty = useMemo(() => {
    if (!user) return false;
    return (
      form.name !== (user.name ?? '') ||
      form.mobile !== (user.mobile ?? '') ||
      form.email !== (user.email ?? '') ||
      form.address !== (user.address ?? '') ||
      form.specialization !== (user.specialization ?? '') ||
      form.experience !== (user.experience ?? '') ||
      form.qualification !== (user.qualification ?? '') ||
      form.aboutMe !== (user.aboutMe ?? '') ||
      form.photoDataUrl !== (user.photoDataUrl ?? '') ||
      credKey(form.licenses) !== credKey(user.licenses ?? []) ||
      credKey(form.certificates) !== credKey(user.certificates ?? [])
    );
  }, [form, user]);

  if (!user) {
    return <Card>You need to be signed in to edit your profile.</Card>;
  }

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handlePhotoPick = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrors((e) => ({ ...e, photoDataUrl: 'Please choose an image file' }));
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setErrors((e) => ({ ...e, photoDataUrl: 'Image must be under 4 MB' }));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      set('photoDataUrl', String(reader.result ?? ''));
      setErrors((e) => ({ ...e, photoDataUrl: undefined }));
    };
    reader.readAsDataURL(file);
  };

  const validate = (): boolean => {
    const next: typeof errors = {};
    if (!form.name.trim()) next.name = 'Name is required';
    if (!form.mobile.trim()) next.mobile = 'Mobile is required';
    else if (form.mobile.replace(/\D/g, '').length !== 10) next.mobile = 'Mobile must be exactly 10 digits';
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = 'Enter a valid email';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    // Demo: persist locally via the auth store (which uses zustand persist →
    // localStorage). Swap for an API call when the backend is wired up.
    updateUser({
      name: form.name.trim(),
      mobile: form.mobile.trim(),
      email: form.email.trim() || undefined,
      address: form.address.trim() || undefined,
      specialization: form.specialization.trim() || undefined,
      experience: form.experience.trim() || undefined,
      qualification: form.qualification.trim() || undefined,
      aboutMe: form.aboutMe.trim() || undefined,
      photoDataUrl: form.photoDataUrl || undefined,
      licenses: form.licenses.filter((c) => c.name.trim() || c.number.trim()).map(({ name, number, fileName }) => ({ name: name.trim(), number: number.trim(), fileName })),
      certificates: form.certificates.filter((c) => c.name.trim() || c.number.trim()).map(({ name, number, fileName }) => ({ name: name.trim(), number: number.trim(), fileName })),
    });
    setTimeout(() => {
      setSaving(false);
      setSavedAt(Date.now());
    }, 300);
  };

  const handleReset = () => {
    if (!user) return;
    setForm({
      name: user.name ?? '', mobile: user.mobile ?? '', email: user.email ?? '',
      address: user.address ?? '', specialization: user.specialization ?? '',
      experience: user.experience ?? '', qualification: user.qualification ?? '',
      aboutMe: user.aboutMe ?? '', photoDataUrl: user.photoDataUrl ?? '',
      licenses: (user.licenses ?? []).map((c) => ({ ...c })),
      certificates: (user.certificates ?? []).map((c) => ({ ...c })),
    });
    setErrors({});
    setSavedAt(null);
  };

  return (
    <form onSubmit={handleSave} className="space-y-5 pb-24 max-w-4xl">
      {/* Photo + identity card */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-5">
          {/* Photo */}
          <div className="shrink-0">
            <div className="relative w-28 h-28 rounded-2xl overflow-hidden bg-gradient-to-br from-brand-500/15 to-accent-500/10 ring-1 ring-ink-200 dark:ring-white/10">
              {form.photoDataUrl ? (
                <img src={form.photoDataUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Avatar name={form.name || user.name} size="lg" />
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-1 right-1 inline-flex items-center justify-center h-8 w-8 rounded-full bg-brand-500 text-white shadow-lg hover:bg-brand-600 transition-colors"
                aria-label="Change photo"
              >
                <Camera size={14} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handlePhotoPick(file);
                  e.target.value = '';
                }}
              />
            </div>
            {errors.photoDataUrl && (
              <div className="mt-2 text-xs text-danger-500 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.photoDataUrl}
              </div>
            )}
            {form.photoDataUrl && (
              <button
                type="button"
                onClick={() => set('photoDataUrl', '')}
                className="mt-2 text-[11px] uppercase tracking-wider font-semibold text-muted hover:text-danger-500 transition-colors"
              >
                Remove photo
              </button>
            )}
          </div>

          {/* Title block */}
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted">Public profile</div>
            <h1 className="mt-1 text-xl font-bold text-ink-900 dark:text-ink-50">
              {form.name || user.name || 'Your name'}
            </h1>
            {form.specialization && (
              <div className="mt-0.5 text-sm text-token font-semibold">{form.specialization}</div>
            )}
            <div className="mt-3 text-sm text-muted">
              Add the details you want patients and your team to see. Name and mobile are required; everything else is optional.
            </div>
          </div>
        </div>
      </Card>

      {/* Required fields */}
      <Card>
        <SectionHeader title="Basic details" subtitle="Name and mobile are mandatory" />
        <div className="grid sm:grid-cols-2 gap-4">
          <Field
            icon={<UserIcon size={14} />}
            label="Full name"
            required
            error={errors.name}
            value={form.name}
            onChange={(v) => set('name', v)}
            placeholder="Dr. Anil Sharma"
          />
          <Field
            icon={<Phone size={14} />}
            label="Mobile"
            required
            error={errors.mobile}
            value={form.mobile.replace(/\D/g, '').slice(0, 10)}
            onChange={(v) => set('mobile', v.replace(/\D/g, '').slice(0, 10))}
            placeholder="9876543210"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            prefix="+91"
          />
        </div>
      </Card>

      {/* Optional contact + work */}
      <Card>
        <SectionHeader title="Contact & practice" subtitle="All optional" />
        <div className="grid sm:grid-cols-2 gap-4">
          <Field
            icon={<Mail size={14} />}
            label="Email"
            error={errors.email}
            value={form.email}
            onChange={(v) => set('email', v)}
            placeholder="anil@sharmaent.in"
            type="email"
          />
          <Field
            icon={<Stethoscope size={14} />}
            label="Specialization"
            value={form.specialization}
            onChange={(v) => set('specialization', v)}
            placeholder="ENT Specialist"
          />
          <Field
            icon={<GraduationCap size={14} />}
            label="Highest qualification"
            value={form.qualification}
            onChange={(v) => set('qualification', v)}
            placeholder="MBBS, MS (ENT)"
          />
          <Field
            icon={<Award size={14} />}
            label="Experience"
            value={form.experience}
            onChange={(v) => set('experience', v)}
            placeholder="12 years"
          />
          <div className="sm:col-span-2">
            <Field
              icon={<MapPin size={14} />}
              label="Clinic address"
              value={form.address}
              onChange={(v) => set('address', v)}
              placeholder="Boring Road, Patna"
            />
          </div>
        </div>
      </Card>

      {/* Licenses / registrations */}
      <Card>
        <CredSection
          title="Licenses & registrations"
          subtitle="Add each medical license / registration — name, number and an attachment."
          icon={<ShieldCheck size={14} />}
          nameLabel="License name"
          namePlaceholder="e.g. Medical Council Registration"
          addLabel="Add license"
          items={form.licenses}
          onChange={(list) => set('licenses', list)}
        />
      </Card>

      {/* Certificates */}
      <Card>
        <CredSection
          title="Certificates"
          subtitle="Add certificates / qualifications — name, number and an attachment."
          icon={<ScrollText size={14} />}
          nameLabel="Certificate name"
          namePlaceholder="e.g. Fellowship in Rhinology"
          addLabel="Add certificate"
          items={form.certificates}
          onChange={(list) => set('certificates', list)}
        />
      </Card>

      {/* About me */}
      <Card>
        <SectionHeader title="About me" subtitle="Short bio for patients (optional)" />
        <div className="rounded-xl border hairline bg-white dark:bg-ink-900 px-3 py-2.5 focus-within:ring-2 focus-within:ring-brand-500/30 transition-shadow">
          <div className="flex items-start gap-2">
            <FileText size={14} className="text-ink-400 mt-1 shrink-0" />
            <textarea
              value={form.aboutMe}
              onChange={(e) => set('aboutMe', e.target.value)}
              placeholder="e.g. 12+ years experience treating chronic ENT conditions. Trained at AIIMS Delhi, ex-Apollo Hyderabad."
              rows={4}
              className="w-full bg-transparent outline-none text-sm text-ink-900 dark:text-ink-50 placeholder:text-ink-400 resize-y"
            />
          </div>
          <div className="mt-1 text-[10px] text-muted text-right">{form.aboutMe.length} / 500</div>
        </div>
      </Card>

      {/* Sticky save bar */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-[244px] z-20 border-t hairline bg-white/90 dark:bg-ink-950/90 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="text-xs text-muted">
            {savedAt && !dirty ? (
              <span className="inline-flex items-center gap-1 text-success-600 dark:text-success-500 font-semibold">
                <CheckCircle2 size={12} /> Saved
              </span>
            ) : dirty ? (
              <span>You have unsaved changes</span>
            ) : (
              <span>All saved</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" leftIcon={<RotateCcw size={14} />} onClick={handleReset} disabled={!dirty || saving}>
              Reset
            </Button>
            <Button type="submit" leftIcon={<Save size={14} />} disabled={!dirty || saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-base font-semibold text-ink-900 dark:text-ink-50">{title}</h2>
      {subtitle && <p className="text-xs text-muted mt-0.5">{subtitle}</p>}
    </div>
  );
}

function Field({
  icon, label, required, error, value, onChange, placeholder, type = 'text', inputMode, maxLength, prefix,
}: {
  icon: React.ReactNode;
  label: string;
  required?: boolean;
  error?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  inputMode?: 'numeric' | 'text' | 'tel' | 'email';
  maxLength?: number;
  prefix?: string;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
      <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted mb-1.5">
        {label}
        {required && <span className="text-danger-500 ml-1">*</span>}
      </label>
      <div className={cn(
        'flex items-center gap-2 rounded-xl border bg-white dark:bg-ink-900 px-3 py-2.5 focus-within:ring-2 focus-within:ring-brand-500/30 transition-shadow',
        error ? 'border-danger-500/60' : 'hairline',
      )}>
        <span className="text-ink-400 shrink-0">{icon}</span>
        {prefix && <span className="text-sm font-semibold text-ink-700 dark:text-ink-200 shrink-0">{prefix}</span>}
        <input
          type={type}
          inputMode={inputMode}
          maxLength={maxLength}
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
    </motion.div>
  );
}

// ─── Repeatable credential section (licenses / certificates) ────────────────
function CredSection({
  title, subtitle, icon, nameLabel, namePlaceholder, addLabel, items, onChange,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  nameLabel: string;
  namePlaceholder: string;
  addLabel: string;
  items: Cred[];
  onChange: (list: Cred[]) => void;
}) {
  const update = (i: number, patch: Partial<Cred>) => onChange(items.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, { name: '', number: '' }]);

  const attach = (i: number, file: File) => {
    const reader = new FileReader();
    reader.onload = () => update(i, { fileName: file.name, fileUrl: String(reader.result ?? '') });
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <SectionHeader title={title} subtitle={subtitle} />
      <div className="space-y-3">
        {items.map((c, i) => (
          <div key={i} className="rounded-xl border hairline p-3 space-y-3 bg-ink-50/40 dark:bg-ink-900/40">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">{icon} {title.split(' ')[0]} {i + 1}</span>
              <button type="button" onClick={() => remove(i)} className="text-ink-400 hover:text-danger-500" aria-label="Remove">
                <Trash2 size={14} />
              </button>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted mb-1.5">{nameLabel}</label>
                <input
                  value={c.name}
                  onChange={(e) => update(i, { name: e.target.value })}
                  placeholder={namePlaceholder}
                  className="w-full rounded-xl border hairline bg-white dark:bg-ink-900 px-3 py-2.5 text-sm text-ink-900 dark:text-ink-50 outline-none focus:ring-2 focus:ring-brand-500/30"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted mb-1.5">Number</label>
                <input
                  value={c.number}
                  onChange={(e) => update(i, { number: e.target.value })}
                  placeholder="Registration / certificate no."
                  className="w-full rounded-xl border hairline bg-white dark:bg-ink-900 px-3 py-2.5 text-sm text-ink-900 dark:text-ink-50 outline-none focus:ring-2 focus:ring-brand-500/30"
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="inline-flex items-center gap-1.5 rounded-lg border hairline px-3 py-2 text-xs font-semibold text-ink-700 dark:text-ink-200 hover:bg-ink-100 dark:hover:bg-ink-800 cursor-pointer transition-colors">
                <Paperclip size={13} /> {c.fileName ? 'Replace file' : 'Attach file'}
                <input
                  type="file"
                  accept="image/*,application/pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) attach(i, f); e.target.value = ''; }}
                />
              </label>
              {c.fileName && (
                <span className="inline-flex items-center gap-1.5 text-xs text-muted">
                  <FileText size={12} className="text-brand-600 dark:text-brand-300" /> {c.fileName}
                  <button type="button" onClick={() => update(i, { fileName: undefined, fileUrl: undefined })} className="text-ink-400 hover:text-danger-500">×</button>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      <Button type="button" variant="outline" size="sm" leftIcon={<Plus size={14} />} onClick={add} className="mt-3">
        {addLabel}
      </Button>
    </div>
  );
}
