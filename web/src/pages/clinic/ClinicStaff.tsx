import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Phone, Mail, UserCog, KeyRound, Check, Trash2, RefreshCw, ShieldCheck } from 'lucide-react';
import { Card, CardHeader, CardSubtitle, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import { useStaff, type StaffRole, type StaffMember } from '@/store/staff';

const roles: StaffRole[] = ['Receptionist', 'Compounder', 'Billing Staff'];

export function ClinicStaff() {
  const members = useStaff((s) => s.members);
  const invite = useStaff((s) => s.invite);
  const verifyOtp = useStaff((s) => s.verifyOtp);
  const resendOtp = useStaff((s) => s.resendOtp);
  const remove = useStaff((s) => s.remove);

  const [openInvite, setOpenInvite] = useState(false);
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<StaffRole>('Receptionist');
  const [error, setError] = useState<string | null>(null);
  // After inviting, show the generated OTP to share with the staff member.
  const [invited, setInvited] = useState<StaffMember | null>(null);

  // OTP activation modal.
  const [activating, setActivating] = useState<StaffMember | null>(null);
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);

  const resetInvite = () => { setName(''); setMobile(''); setEmail(''); setRole('Receptionist'); setError(null); setInvited(null); };

  const handleInvite = () => {
    if (!name.trim()) { setError('Full name is required'); return; }
    if (mobile.replace(/\D/g, '').length !== 10) { setError('Enter a valid 10-digit mobile'); return; }
    const m = invite({ name, mobile: `+91 ${mobile.replace(/\D/g, '').slice(0, 10)}`, email, role });
    setInvited(m); // switch the modal to the "share OTP" view
  };

  const openActivate = (m: StaffMember) => { setActivating(m); setOtpInput(''); setOtpError(null); };
  const handleActivate = () => {
    if (!activating) return;
    if (verifyOtp(activating.id, otpInput)) { setActivating(null); }
    else setOtpError('Incorrect OTP. Check the code shared by the clinic.');
  };

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Staff &amp; roles</CardTitle>
            <CardSubtitle>Invite staff with an OTP — they're active once the code is entered. Role-based access.</CardSubtitle>
          </div>
          <Button leftIcon={<Plus size={14} />} onClick={() => { resetInvite(); setOpenInvite(true); }}>Invite staff</Button>
        </CardHeader>

        <div className="overflow-x-auto rounded-xl border hairline">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-ink-50 dark:bg-ink-900/60">
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted">
                <th className="px-4 py-3">Member</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Mobile</th>
                <th className="px-4 py-3">Added</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y hairline">
              {members.map((s, i) => (
                <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={s.name} size="sm" />
                      <span className="font-medium text-ink-900 dark:text-ink-50">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><Badge tone="brand" size="sm">{s.role}</Badge></td>
                  <td className="px-4 py-3 text-muted"><span className="inline-flex items-center gap-1.5"><Phone size={12} />{s.mobile}</span></td>
                  <td className="px-4 py-3 text-muted">{s.addedOn}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Badge tone={s.status === 'Active' ? 'success' : 'warning'} size="sm">{s.status}</Badge>
                      {s.status === 'Invited' && s.otp && (
                        <span className="font-mono text-[11px] text-muted">OTP {s.otp}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {s.status === 'Invited' && (
                        <>
                          <Button size="sm" variant="outline" leftIcon={<KeyRound size={13} />} onClick={() => openActivate(s)}>
                            Activate
                          </Button>
                          <button type="button" onClick={() => resendOtp(s.id)} title="New OTP" className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800">
                            <RefreshCw size={13} />
                          </button>
                        </>
                      )}
                      <button type="button" onClick={() => { if (confirm(`Remove ${s.name}?`)) remove(s.id); }} title="Remove" className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-danger-500 hover:bg-danger-500/10">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {members.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-muted">No staff yet — invite your first team member.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {roles.map((r) => (
            <div key={r} className="rounded-xl border hairline p-4">
              <div className="flex items-center gap-2 text-brand-600 dark:text-brand-300">
                <UserCog size={14} />
                <span className="text-sm font-semibold">{r}</span>
              </div>
              <p className="mt-1 text-xs text-muted">
                {r === 'Receptionist' && 'Add patients, generate tokens, billing.'}
                {r === 'Compounder' && 'View queue, mark consultation states.'}
                {r === 'Billing Staff' && 'Create and share invoices.'}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Invite → generates an OTP to share */}
      <Modal
        open={openInvite}
        onClose={() => setOpenInvite(false)}
        title={invited ? 'Share this OTP' : 'Invite staff'}
        description={invited ? `${invited.name} enters this code to activate their account.` : "Add their details — they activate with a one-time OTP."}
      >
        {invited ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-brand-500/30 bg-brand-500/5 p-5 text-center">
              <div className="text-[11px] uppercase tracking-wider text-muted">One-time activation code</div>
              <div className="mt-1 font-mono text-4xl font-extrabold tracking-[0.3em] text-brand-700 dark:text-brand-300">{invited.otp}</div>
              <div className="mt-2 text-xs text-muted">{invited.name} · {invited.mobile} · {invited.role}</div>
            </div>
            <div className="text-[11px] text-muted flex items-start gap-1.5">
              <ShieldCheck size={13} className="mt-0.5 shrink-0 text-success-500" />
              Share this OTP with the staff member. They enter it (here via Activate, or on their own login) to start working. You can re-issue a new code anytime.
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { resetInvite(); setOpenInvite(true); }}>Invite another</Button>
              <Button leftIcon={<Check size={14} />} onClick={() => setOpenInvite(false)}>Done</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <Input label="Full name" value={name} onChange={(e) => { setName(e.target.value); setError(null); }} placeholder="Pooja Sharma" />
            <div>
              <div className="mb-1.5 text-xs font-medium text-ink-700 dark:text-ink-300 uppercase tracking-wide">Mobile</div>
              <div className="flex items-center gap-2 rounded-xl border hairline bg-white dark:bg-ink-900 px-3 py-2.5 focus-within:ring-2 focus-within:ring-brand-500/30">
                <Phone size={14} className="text-ink-400 shrink-0" />
                <span className="text-sm font-semibold text-ink-700 dark:text-ink-200">+91</span>
                <input
                  inputMode="numeric"
                  maxLength={10}
                  value={mobile.replace(/\D/g, '').slice(0, 10)}
                  onChange={(e) => { setMobile(e.target.value.replace(/\D/g, '').slice(0, 10)); setError(null); }}
                  placeholder="9876543210"
                  className="flex-1 min-w-0 bg-transparent outline-none text-sm tracking-wider text-ink-900 dark:text-ink-50 placeholder:text-ink-400"
                />
              </div>
            </div>
            <Input label="Email (optional)" leftIcon={<Mail size={14} />} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="staff@clinic.com" />
            <div>
              <div className="mb-1.5 text-xs font-medium text-ink-700 dark:text-ink-300 uppercase tracking-wide">Position / role</div>
              <div className="grid grid-cols-3 rounded-xl border hairline p-1 text-sm">
                {roles.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`rounded-lg py-2 text-xs font-medium transition-colors ${
                      role === r ? 'bg-brand-500 text-white' : 'text-muted hover:text-ink-900 dark:hover:text-ink-50'
                    }`}
                  >{r}</button>
                ))}
              </div>
            </div>
            {error && <div className="text-xs text-danger-500">{error}</div>}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpenInvite(false)}>Cancel</Button>
              <Button leftIcon={<KeyRound size={14} />} onClick={handleInvite}>Generate OTP &amp; invite</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Activate with OTP */}
      <Modal
        open={!!activating}
        onClose={() => setActivating(null)}
        title="Activate staff"
        description={activating ? `Enter the OTP shared with ${activating.name} to activate their account.` : ''}
        size="sm"
      >
        <div className="space-y-3">
          <input
            inputMode="numeric"
            maxLength={6}
            autoFocus
            value={otpInput}
            onChange={(e) => { setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6)); setOtpError(null); }}
            onKeyDown={(e) => { if (e.key === 'Enter') handleActivate(); }}
            placeholder="6-digit OTP"
            className="w-full rounded-xl border hairline bg-white dark:bg-ink-900 px-4 py-3 text-center font-mono text-2xl tracking-[0.4em] text-ink-900 dark:text-ink-50 outline-none focus:ring-2 focus:ring-brand-500/30"
          />
          {otpError && <div className="text-xs text-danger-500">{otpError}</div>}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setActivating(null)}>Cancel</Button>
            <Button leftIcon={<ShieldCheck size={14} />} onClick={handleActivate} disabled={otpInput.length !== 6}>Activate</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
