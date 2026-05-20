import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, User, Calendar, Check, Ticket } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardSubtitle, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useQueue } from '@/store/queue';
import { demoQueue } from '@/services/demoData';

export function AddPatient() {
  const [mobile, setMobile] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [step, setStep] = useState<'lookup' | 'new' | 'existing' | 'done'>('lookup');
  const [generatedToken, setGeneratedToken] = useState<number | null>(null);
  const { entries, setEntries, addEntry } = useQueue();
  const navigate = useNavigate();

  const isReturning = mobile && mobile.endsWith('210');

  const submitLookup = (e: FormEvent) => {
    e.preventDefault();
    if (!mobile) return;
    setStep(isReturning ? 'existing' : 'new');
    if (isReturning) {
      setName('Shailesh Kumar');
      setAge('28');
    }
  };

  const generateToken = () => {
    if (entries.length === 0) setEntries(demoQueue);
    const list = entries.length === 0 ? demoQueue : entries;
    const nextToken = list.reduce((m, e) => Math.max(m, e.token), 0) + 1;
    addEntry({
      id: `q-${Date.now()}`,
      token: nextToken,
      patientName: name || 'New patient',
      patientMobile: mobile,
      source: 'OFFLINE',
      status: 'Waiting',
      joinedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    setGeneratedToken(nextToken);
    setStep('done');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Add patient</CardTitle>
            <CardSubtitle>Mobile-first. 5 seconds to generate a token.</CardSubtitle>
          </div>
          <Badge tone="brand">Offline source</Badge>
        </CardHeader>

        <AnimatePresence mode="wait">
          {step === 'lookup' && (
            <motion.form key="lookup" onSubmit={submitLookup} className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Input label="Mobile number" leftIcon={<Phone size={14} />} placeholder="+91 ..." value={mobile} onChange={(e) => setMobile(e.target.value)} autoFocus required />
              <div className="text-xs text-muted">Try a number ending in <code className="font-mono">210</code> to simulate a returning patient.</div>
              <Button type="submit" size="lg" fullWidth>Continue</Button>
            </motion.form>
          )}

          {step === 'existing' && (
            <motion.div key="existing" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              <div className="rounded-2xl border hairline bg-brand-50/60 dark:bg-brand-500/10 p-5">
                <Badge tone="brand" size="sm">Returning patient</Badge>
                <div className="mt-2 text-lg font-semibold text-ink-900 dark:text-ink-50">{name}</div>
                <div className="text-sm text-muted">{age} · Male · {mobile}</div>
                <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
                  <Mini label="Visits" val="6" />
                  <Mini label="Last seen" val="12 Jan" />
                  <Mini label="Outstanding" val="₹0" />
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="lg" fullWidth leftIcon={<Ticket size={16} />} onClick={generateToken}>Generate token</Button>
                <Button size="lg" variant="outline" onClick={() => setStep('lookup')}>Back</Button>
              </div>
            </motion.div>
          )}

          {step === 'new' && (
            <motion.div key="new" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="rounded-xl border hairline bg-ink-50/60 dark:bg-ink-900/60 p-3 text-xs text-muted">No record found for {mobile}. Quick add below.</div>
              <Input label="Full name" leftIcon={<User size={14} />} value={name} onChange={(e) => setName(e.target.value)} required />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Age" leftIcon={<Calendar size={14} />} type="number" value={age} onChange={(e) => setAge(e.target.value)} />
                <div>
                  <div className="mb-1.5 text-xs font-medium text-ink-700 dark:text-ink-300 uppercase tracking-wide">Gender</div>
                  <div className="grid grid-cols-3 rounded-xl border hairline p-1 text-sm">
                    {(['Male', 'Female', 'Other'] as const).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGender(g)}
                        className={`rounded-lg py-2 transition-all ${gender === g ? 'bg-brand-500 text-white' : 'text-muted hover:text-ink-900 dark:hover:text-ink-50'}`}
                      >{g}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="lg" fullWidth leftIcon={<Ticket size={16} />} onClick={generateToken}>Save & generate token</Button>
                <Button size="lg" variant="outline" onClick={() => setStep('lookup')}>Back</Button>
              </div>
            </motion.div>
          )}

          {step === 'done' && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 280, damping: 18 }}
                className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-success-500 to-teal-500 flex items-center justify-center text-white shadow-glow"
              >
                <Check size={28} />
              </motion.div>
              <h3 className="mt-5 text-xl font-semibold text-ink-900 dark:text-ink-50">Token generated</h3>
              <p className="text-sm text-muted">{name || 'Patient'} added to the queue</p>
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mx-auto mt-6 inline-flex flex-col items-center rounded-3xl bg-gradient-to-br from-brand-500 to-accent-500 text-white px-10 py-6 shadow-glow"
              >
                <div className="text-[11px] uppercase tracking-wider opacity-90">Your token</div>
                <div className="text-5xl font-bold">#{generatedToken}</div>
              </motion.div>
              <div className="mt-6 flex justify-center gap-2">
                <Button variant="outline" onClick={() => { setStep('lookup'); setMobile(''); setName(''); setAge(''); setGeneratedToken(null); }}>Add another</Button>
                <Button onClick={() => navigate('/receptionist/queue')}>Go to queue</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
}

const Mini = ({ label, val }: { label: string; val: string }) => (
  <div className="rounded-lg bg-white/60 dark:bg-ink-900/60 p-2">
    <div className="text-[10px] uppercase tracking-wider text-muted">{label}</div>
    <div className="text-sm font-semibold text-ink-900 dark:text-ink-50">{val}</div>
  </div>
);
