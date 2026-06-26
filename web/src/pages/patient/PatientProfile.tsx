import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Pencil, Camera, User as UserIcon, Phone, Mail, Check } from 'lucide-react';
import { Card, CardHeader, CardSubtitle, CardTitle } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/store/auth';
import { demoPatient, demoBookings } from '@/services/demoData';

export function PatientProfile() {
  const user = useAuth((s) => s.user);
  const updateUser = useAuth((s) => s.updateUser);
  const logout = useAuth((s) => s.logout);
  const navigate = useNavigate();
  const onLogout = () => { logout(); navigate('/'); };

  // Display values: saved profile first, then demo defaults.
  const name = user?.name || demoPatient.name;
  const mobile = user?.mobile || demoPatient.mobile;
  const age = user?.age ?? demoPatient.age;
  const gender = user?.gender || demoPatient.gender;
  const photo = user?.photoDataUrl;

  const [editOpen, setEditOpen] = useState(false);

  return (
    <div className="space-y-5">
      <Card>
        <div className="flex items-center gap-4">
          <Avatar name={name} src={photo} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="text-lg font-semibold text-ink-900 dark:text-ink-50">{name}</div>
            <div className="text-xs text-muted">{mobile}</div>
            <div className="text-xs text-muted">{age ? `${age} · ` : ''}{gender}</div>
          </div>
          <Button size="sm" variant="outline" leftIcon={<Pencil size={14} />} onClick={() => setEditOpen(true)}>Edit</Button>
        </div>
      </Card>

      <Card padded={false}>
        <CardHeader className="px-5 pt-5">
          <div>
            <CardTitle>Booking history</CardTitle>
            <CardSubtitle>All visits</CardSubtitle>
          </div>
        </CardHeader>
        <div className="divide-y hairline">
          {demoBookings.map((b) => (
            <div key={b.id} className="px-5 py-3 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-ink-900 dark:text-ink-50">{b.clinic}</div>
                <div className="text-xs text-muted">{b.date} · {b.doctor} · #{b.token}</div>
              </div>
              <Badge tone={b.status === 'Completed' ? 'success' : b.status === 'Cancelled' ? 'danger' : 'brand'} size="sm">{b.status}</Badge>
            </div>
          ))}
        </div>
      </Card>

      <button
        type="button"
        onClick={onLogout}
        className="w-full flex items-center justify-center gap-2 rounded-2xl border hairline bg-white dark:bg-ink-900 px-4 py-3.5 text-sm font-semibold text-danger-500 hover:bg-danger-500/10 transition-colors"
      >
        <LogOut size={16} /> Logout
      </button>

      <EditProfileModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        initial={{ name, mobile, email: user?.email ?? '', age: age ? String(age) : '', gender: gender ?? 'Male', photo }}
        onSave={(v) => {
          updateUser({
            name: v.name.trim(),
            mobile: v.mobile.trim(),
            email: v.email.trim() || undefined,
            age: v.age ? Number(v.age) : undefined,
            gender: v.gender || undefined,
            photoDataUrl: v.photo || undefined,
          });
          setEditOpen(false);
        }}
      />
    </div>
  );
}

interface EditValues { name: string; mobile: string; email: string; age: string; gender: string; photo?: string }

function EditProfileModal({ open, onClose, initial, onSave }: { open: boolean; onClose: () => void; initial: EditValues; onSave: (v: EditValues) => void }) {
  const [v, setV] = useState<EditValues>(initial);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const set = <K extends keyof EditValues>(k: K, val: EditValues[K]) => setV((s) => ({ ...s, [k]: val }));

  // Re-sync when reopened with fresh data.
  const [seed, setSeed] = useState(open);
  if (open !== seed) { setSeed(open); if (open) setV(initial); setError(null); }

  const pickPhoto = (file: File) => {
    if (!file.type.startsWith('image/')) { setError('Choose an image file'); return; }
    if (file.size > 4 * 1024 * 1024) { setError('Image must be under 4 MB'); return; }
    const r = new FileReader();
    r.onload = () => set('photo', String(r.result ?? ''));
    r.readAsDataURL(file);
  };

  const save = () => {
    if (!v.name.trim()) { setError('Name is required'); return; }
    if (v.mobile.replace(/\D/g, '').length < 10) { setError('Enter a valid mobile number'); return; }
    onSave(v);
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit profile" description="Update your details — saved on this device.">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar name={v.name || 'You'} src={v.photo} size="lg" />
            <button type="button" onClick={() => fileRef.current?.click()} className="absolute -bottom-1 -right-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand-500 text-white shadow hover:bg-brand-600" aria-label="Change photo">
              <Camera size={13} />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) pickPhoto(f); e.target.value = ''; }} />
          </div>
          <div className="text-xs text-muted">Tap the camera to change your photo</div>
          {v.photo && (
            <button type="button" onClick={() => set('photo', '')} className="ml-auto text-[11px] font-semibold uppercase tracking-wider text-muted hover:text-danger-500">Remove</button>
          )}
        </div>

        <Input label="Full name" leftIcon={<UserIcon size={14} />} value={v.name} onChange={(e) => { set('name', e.target.value); setError(null); }} />
        <div>
          <div className="mb-1.5 text-xs font-medium text-ink-700 dark:text-ink-300 uppercase tracking-wide">Mobile</div>
          <div className="flex items-center gap-2 rounded-xl border hairline bg-white dark:bg-ink-900 px-3 py-2.5 focus-within:ring-2 focus-within:ring-brand-500/30">
            <Phone size={14} className="text-ink-400 shrink-0" />
            <span className="text-sm font-semibold text-ink-700 dark:text-ink-200">+91</span>
            <input
              inputMode="numeric"
              maxLength={10}
              value={v.mobile.replace(/\D/g, '').slice(-10)}
              onChange={(e) => { set('mobile', `+91 ${e.target.value.replace(/\D/g, '').slice(0, 10)}`); setError(null); }}
              placeholder="9876543210"
              className="flex-1 min-w-0 bg-transparent outline-none text-sm tracking-wider text-ink-900 dark:text-ink-50 placeholder:text-ink-400"
            />
          </div>
        </div>
        <Input label="Email (optional)" leftIcon={<Mail size={14} />} value={v.email} onChange={(e) => set('email', e.target.value)} placeholder="you@example.com" />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Age" type="number" inputMode="numeric" value={v.age} onChange={(e) => set('age', e.target.value)} />
          <div>
            <div className="mb-1.5 text-xs font-medium text-ink-700 dark:text-ink-300 uppercase tracking-wide">Gender</div>
            <div className="grid grid-cols-3 rounded-xl border hairline p-1 text-sm">
              {(['Male', 'Female', 'Other'] as const).map((g) => (
                <button key={g} type="button" onClick={() => set('gender', g)} className={`rounded-lg py-2 text-xs font-medium transition-colors ${v.gender === g ? 'bg-brand-500 text-white' : 'text-muted hover:text-ink-900 dark:hover:text-ink-50'}`}>{g}</button>
              ))}
            </div>
          </div>
        </div>
        {error && <div className="text-xs text-danger-500">{error}</div>}
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button leftIcon={<Check size={14} />} onClick={save}>Save</Button>
        </div>
      </div>
    </Modal>
  );
}
