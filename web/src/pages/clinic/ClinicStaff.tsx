import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, MoreHorizontal, UserCog, Phone, Mail } from 'lucide-react';
import { Card, CardHeader, CardSubtitle, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import { demoStaff } from '@/services/demoData';

const roles = ['Receptionist', 'Compounder', 'Billing Staff'] as const;

export function ClinicStaff() {
  const [openInvite, setOpenInvite] = useState(false);
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [role, setRole] = useState<typeof roles[number]>('Receptionist');

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Staff & roles</CardTitle>
            <CardSubtitle>Receptionists, compounders and billing staff. Role-based access enforced server-side.</CardSubtitle>
          </div>
          <Button leftIcon={<Plus size={14} />} onClick={() => setOpenInvite(true)}>Invite staff</Button>
        </CardHeader>

        <div className="overflow-x-auto rounded-xl border hairline">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-ink-50 dark:bg-ink-900/60">
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted">
                <th className="px-4 py-3">Member</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Mobile</th>
                <th className="px-4 py-3">Added</th>
                <th className="px-4 py-3">Status</th>
                <th />
              </tr>
            </thead>
            <tbody className="divide-y hairline">
              {demoStaff.map((s, i) => (
                <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                  <td className="px-4 py-3 flex items-center gap-3">
                    <Avatar name={s.name} size="sm" />
                    <span className="font-medium text-ink-900 dark:text-ink-50">{s.name}</span>
                  </td>
                  <td className="px-4 py-3"><Badge tone="brand" size="sm">{s.role}</Badge></td>
                  <td className="px-4 py-3 text-muted inline-flex items-center gap-1.5 mt-2.5"><Phone size={12} />{s.mobile}</td>
                  <td className="px-4 py-3 text-muted">{s.addedOn}</td>
                  <td className="px-4 py-3">
                    <Badge tone={s.status === 'Active' ? 'success' : 'warning'} size="sm">{s.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm"><MoreHorizontal size={14} /></Button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
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

      <Modal open={openInvite} onClose={() => setOpenInvite(false)} title="Invite staff" description="They'll receive an OTP-based invite link.">
        <div className="space-y-3">
          <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Pooja Sharma" />
          <Input label="Mobile" leftIcon={<Phone size={14} />} value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="+91…" />
          <Input label="Email (optional)" leftIcon={<Mail size={14} />} placeholder="staff@clinic.com" />
          <div>
            <div className="mb-1.5 text-xs font-medium text-ink-700 dark:text-ink-300 uppercase tracking-wide">Role</div>
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
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpenInvite(false)}>Cancel</Button>
            <Button onClick={() => setOpenInvite(false)}>Send invite</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
