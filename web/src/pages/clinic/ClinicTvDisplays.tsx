import { useEffect, useState } from 'react';
import {
  Monitor, Plus, Trash2, Copy, RefreshCw, Power, Edit3, Check,
  AlertCircle, KeyRound, Clock, Building2, ExternalLink, Megaphone, Send,
  Play, Save, RotateCcw, ChevronUp, ChevronDown,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useBranch } from '@/store/branch';
import { useSound } from '@/store/sound';
import { useQueue } from '@/store/queue';
import { useTvAccounts, type TvAccount, type TvSchedule } from '@/store/tvAccounts';
import { postAnnouncement } from '@/lib/announceBus';
import { previewVoice, hasIndianVoice, DEFAULT_TEMPLATE_EN, DEFAULT_TEMPLATE_HI, DEFAULT_TEMPLATE_BHO, LANG_META, type Lang } from '@/lib/speech';
import { unlockAudio } from '@/lib/chime';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/cn';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DEFAULT_SCHEDULE: TvSchedule = { startHour: 9, endHour: 21, daysActive: [1, 2, 3, 4, 5, 6] };

const formatHour = (h: number): string => {
  const period = h >= 12 ? 'PM' : 'AM';
  const display = h % 12 || 12;
  return `${display}:00 ${period}`;
};

const relativeTime = (iso?: string): string => {
  if (!iso) return 'Never';
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return 'Just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
};

/**
 * CLINIC › TV Displays — admin page to register and manage every wall TV.
 * Each TV gets a 6-char pairing code; the TV enters that code at `/tv/pair`
 * once and is then locked to its branch + schedule.
 */
export function ClinicTvDisplays() {
  const accounts = useTvAccounts((s) => s.accounts);
  const addTv = useTvAccounts((s) => s.addTv);
  const removeTv = useTvAccounts((s) => s.removeTv);
  const updateTv = useTvAccounts((s) => s.updateTv);
  const unpair = useTvAccounts((s) => s.unpair);
  const branches = useBranch((s) => s.branches);
  const [addingOpen, setAddingOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const paired = accounts.filter((a) => a.paired).length;

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-ink-900 dark:text-ink-50">TV Displays</h1>
          <p className="text-xs text-muted">
            Each TV pairs once with a 6-character code, then locks to a branch and runs on its own schedule. {accounts.length} registered · {paired} paired.
          </p>
        </div>
        <Button leftIcon={<Plus size={14} />} onClick={() => setAddingOpen(true)}>
          Register TV
        </Button>
      </div>

      {/* Quickstart card */}
      <Card className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-brand-500/15 blur-2xl" />
        <div className="relative flex flex-col sm:flex-row items-start gap-4">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/15 text-brand-600 dark:text-brand-300 shrink-0">
            <KeyRound size={16} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-ink-900 dark:text-ink-50">How to pair a new TV</div>
            <ol className="mt-2 text-xs text-muted list-decimal pl-4 space-y-1">
              <li>Click <span className="font-semibold text-ink-700 dark:text-ink-200">Register TV</span> and pick its branch + active hours.</li>
              <li>On the TV's browser, open <code className="font-mono bg-ink-100 dark:bg-ink-800 px-1 py-0.5 rounded">/tv/pair</code>.</li>
              <li>Enter the 6-character code shown on that TV's card below.</li>
            </ol>
          </div>
        </div>
      </Card>

      {/* Announcement voice + custom PA message */}
      <AnnouncementSettingsCard />

      {/* TV list */}
      {accounts.length === 0 ? (
        <Card>
          <div className="py-12 text-center">
            <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/15 text-brand-600 dark:text-brand-300 mb-3">
              <Monitor size={20} />
            </div>
            <div className="text-base font-semibold text-ink-900 dark:text-ink-50">No TVs registered yet</div>
            <div className="mt-1 text-xs text-muted">Register your first display to start pairing.</div>
            <div className="mt-4">
              <Button leftIcon={<Plus size={14} />} onClick={() => setAddingOpen(true)}>Register TV</Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((tv) => (
            <TvCard
              key={tv.id}
              tv={tv}
              branchName={branches.find((b) => b.id === tv.branchId)?.name ?? 'Unknown branch'}
              onDelete={() => {
                if (confirm(`Delete "${tv.name}"? The display will stop working.`)) removeTv(tv.id);
              }}
              onUnpair={() => unpair(tv.id)}
              onEdit={() => setEditingId(tv.id)}
            />
          ))}
        </div>
      )}

      <AddTvModal open={addingOpen} onClose={() => setAddingOpen(false)} onAdd={(input) => {
        addTv(input);
        setAddingOpen(false);
      }} branches={branches} />

      <EditTvModal
        open={!!editingId}
        tv={accounts.find((a) => a.id === editingId)}
        onClose={() => setEditingId(null)}
        onSave={(patch) => {
          if (editingId) updateTv(editingId, patch);
          setEditingId(null);
        }}
        branches={branches}
      />
    </div>
  );
}

// ─── Announcement settings (voice language + custom PA message) ──────────

const ALL_LANGS: Lang[] = ['en', 'hi', 'bho'];
const LANG_PLACEHOLDER: Record<Lang, string> = {
  en: 'Token number [Token no], [Name], please go to the doctor chamber.',
  hi: 'टोकन नंबर [Token no], [Name], कृपया डॉक्टर के कक्ष में जाएँ।',
  bho: 'टोकन नंबर [Token no], [Name], कृपया डॉक्टर साहेब के कमरा में आईं।',
};

function AnnouncementSettingsCard() {
  const announceLang = useSound((s) => s.announceLang);
  const setLang = useSound((s) => s.setLang);
  const templateEn = useSound((s) => s.templateEn);
  const templateHi = useSound((s) => s.templateHi);
  const templateBho = useSound((s) => s.templateBho);
  const setTemplates = useSound((s) => s.setTemplates);

  // Drafts — edited locally, applied on Save so half-typed sentences never
  // reach a live TV.
  const [enDraft, setEnDraft] = useState(templateEn);
  const [hiDraft, setHiDraft] = useState(templateHi);
  const [bhoDraft, setBhoDraft] = useState(templateBho);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const [text, setText] = useState('');
  const [sentAt, setSentAt] = useState<number | null>(null);

  // Voices load async — check shortly after mount whether this device has any
  // Indian-accent voice; if not, the accent will be foreign (browser limit).
  const [noIndianVoice, setNoIndianVoice] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setNoIndianVoice(!hasIndianVoice()), 800);
    return () => clearTimeout(t);
  }, []);

  const dirty = enDraft !== templateEn || hiDraft !== templateHi || bhoDraft !== templateBho;

  const draftFor = (l: Lang) => (l === 'en' ? enDraft : l === 'hi' ? hiDraft : bhoDraft);
  const setDraftFor = (l: Lang, v: string) => (l === 'en' ? setEnDraft(v) : l === 'hi' ? setHiDraft(v) : setBhoDraft(v));

  // Enable/disable a language (keep at least one) and reorder the play order.
  const toggleLang = (l: Lang) => {
    if (announceLang.includes(l)) {
      if (announceLang.length > 1) setLang(announceLang.filter((x) => x !== l));
    } else {
      setLang([...announceLang, l]);
    }
  };
  const moveLang = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= announceLang.length) return;
    const copy = [...announceLang];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    setLang(copy);
  };

  // Speak the DRAFT templates with the live current patient (or sample data)
  // so the operator hears exactly what the waiting room will hear.
  const handlePreview = () => {
    unlockAudio();
    const current = useQueue.getState().entries[0];
    previewVoice(
      announceLang,
      current?.patientName,
      { templateEn: enDraft, templateHi: hiDraft, templateBho: bhoDraft },
      current?.token ?? 1,
    );
  };

  const handleSave = () => {
    setTemplates(enDraft, hiDraft, bhoDraft);
    setSavedAt(Date.now());
    setTimeout(() => setSavedAt(null), 2500);
  };

  const handleReset = () => {
    setEnDraft(DEFAULT_TEMPLATE_EN);
    setHiDraft(DEFAULT_TEMPLATE_HI);
    setBhoDraft(DEFAULT_TEMPLATE_BHO);
  };

  // Insert a placeholder chip at the end of a draft field.
  const insertInto = (which: Lang, placeholder: string) => {
    setDraftFor(which, `${draftFor(which).trimEnd()} ${placeholder}`.trimStart());
  };

  const handlePlay = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    postAnnouncement({ text: trimmed, lang: announceLang });
    setSentAt(Date.now());
    setTimeout(() => setSentAt(null), 2500);
  };

  return (
    <Card className="relative overflow-hidden">
      <div className="pointer-events-none absolute -left-20 -top-20 h-40 w-40 rounded-full bg-accent-500/15 blur-2xl" />
      <div className="relative flex flex-col sm:flex-row items-start gap-4">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent-500/15 text-accent-600 dark:text-accent-300 shrink-0">
          <Megaphone size={16} />
        </span>
        <div className="min-w-0 flex-1 space-y-4">
          <div>
            <div className="text-sm font-semibold text-ink-900 dark:text-ink-50">TV announcements</div>
            <div className="text-xs text-muted mt-0.5">
              Voice language, the call sentence the TV speaks for every patient, and a one-off message you can play now.
            </div>
          </div>

          {/* Language — pick languages + the order they're spoken in */}
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-1.5">Announcement language</div>
            <div className="flex flex-wrap gap-2">
              {ALL_LANGS.map((l) => {
                const on = announceLang.includes(l);
                return (
                  <button
                    key={l}
                    type="button"
                    onClick={() => toggleLang(l)}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors',
                      on
                        ? 'border-brand-500 bg-brand-500/10 text-brand-700 dark:text-brand-300'
                        : 'hairline text-ink-600 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-ink-800',
                    )}
                  >
                    {on ? <Check size={13} /> : <Plus size={13} />} {LANG_META[l].label}
                  </button>
                );
              })}
            </div>

            {/* Order — only matters when 2+ languages are on */}
            {announceLang.length > 1 && (
              <div className="mt-2 rounded-xl border hairline bg-ink-50/40 dark:bg-ink-900/40 p-2">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-1.5 px-1">Spoken in this order</div>
                <div className="space-y-1">
                  {announceLang.map((l, i) => (
                    <div key={l} className="flex items-center gap-2 rounded-lg bg-white dark:bg-ink-900 border hairline px-2.5 py-1.5">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-brand-500/15 text-brand-700 dark:text-brand-300 text-[11px] font-bold">{i + 1}</span>
                      <span className="text-sm font-medium text-ink-900 dark:text-ink-50 flex-1">{LANG_META[l].label}</span>
                      <button type="button" onClick={() => moveLang(i, -1)} disabled={i === 0} className="text-ink-400 hover:text-brand-600 disabled:opacity-30 disabled:cursor-not-allowed" aria-label="Move up">
                        <ChevronUp size={15} />
                      </button>
                      <button type="button" onClick={() => moveLang(i, 1)} disabled={i === announceLang.length - 1} className="text-ink-400 hover:text-brand-600 disabled:opacity-30 disabled:cursor-not-allowed" aria-label="Move down">
                        <ChevronDown size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-1 text-[10px] text-muted">Female voice · Indian accent · applies to every TV instantly. Bhojpuri uses the Hindi voice.</div>
            {noIndianVoice && (
              <div className="mt-2 flex items-start gap-1.5 rounded-lg border border-warning-500/40 bg-warning-500/5 px-3 py-2 text-[11px] text-warning-700 dark:text-warning-300">
                <AlertCircle size={13} className="mt-0.5 shrink-0" />
                <span>This device has no Indian (hi-IN / en-IN) voice, so the accent will be foreign. Install a <b>Hindi (India)</b> voice in your OS settings for a natural Indian accent — the sentence is still read in full meanwhile.</span>
              </div>
            )}
          </div>

          {/* Call sentence template — write → play → save */}
          <div className="rounded-xl border hairline bg-ink-50/40 dark:bg-ink-900/40 p-3 space-y-3">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted">Call sentence</div>
              <div className="mt-0.5 text-[10px] text-muted">
                Spoken automatically for every patient call. <span className="font-mono font-semibold text-ink-700 dark:text-ink-200">[Token no]</span> and{' '}
                <span className="font-mono font-semibold text-ink-700 dark:text-ink-200">[Name]</span> are filled in automatically — write the rest yourself.
              </div>
            </div>

            {announceLang.map((l) => (
              <TemplateField
                key={l}
                label={`${LANG_META[l].label} sentence`}
                value={draftFor(l)}
                onChange={(v) => setDraftFor(l, v)}
                onInsert={(p) => insertInto(l, p)}
                placeholder={LANG_PLACEHOLDER[l]}
              />
            ))}

            <div className="flex items-center justify-between gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-muted hover:text-ink-900 dark:hover:text-ink-50 transition-colors"
              >
                <RotateCcw size={11} /> Reset to default
              </button>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" leftIcon={<Play size={14} />} onClick={handlePreview}>
                  Play
                </Button>
                <Button
                  size="sm"
                  leftIcon={savedAt ? <Check size={14} /> : <Save size={14} />}
                  onClick={handleSave}
                  disabled={!dirty && !savedAt}
                >
                  {savedAt ? 'Saved — live on TV' : 'Save'}
                </Button>
              </div>
            </div>
          </div>

          {/* One-off PA message */}
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-1.5">One-off announcement</div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={2}
              placeholder='e.g. "Doctor will be 10 minutes late, please keep waiting." / "डॉक्टर साहब 10 मिनट में आएँगे, कृपया प्रतीक्षा करें।"'
              className="w-full rounded-xl border hairline bg-white dark:bg-ink-900 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-shadow resize-y"
            />
            <div className="mt-2 flex items-center justify-between gap-3 flex-wrap">
              <div className="text-[10px] text-muted">
                Write in any language — it's read aloud once with the voice selected above.
              </div>
              <Button
                size="sm"
                leftIcon={sentAt ? <Check size={14} /> : <Send size={14} />}
                onClick={handlePlay}
                disabled={!text.trim()}
              >
                {sentAt ? 'Playing on TV' : 'Play on TV'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

/** Template input with one-click [Token no] / [Name] placeholder chips. */
function TemplateField({ label, value, onChange, onInsert, placeholder }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onInsert: (placeholder: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">{label}</span>
        <div className="flex items-center gap-1">
          {['[Token no]', '[Name]'].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onInsert(p)}
              className="rounded-md border hairline px-1.5 py-0.5 text-[10px] font-mono text-brand-600 dark:text-brand-300 hover:bg-brand-500/10 transition-colors"
              title={`Insert ${p}`}
            >
              + {p}
            </button>
          ))}
        </div>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        placeholder={placeholder}
        className="w-full rounded-xl border hairline bg-white dark:bg-ink-900 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-shadow resize-y"
      />
    </div>
  );
}

// ─── TV card ──────────────────────────────────────────────────────────────

function TvCard({ tv, branchName, onDelete, onUnpair, onEdit }: {
  tv: TvAccount;
  branchName: string;
  onDelete: () => void;
  onUnpair: () => void;
  onEdit: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(tv.pairingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {/* ignore */}
  };

  return (
    <Card className={cn('relative overflow-hidden', tv.paired && 'ring-1 ring-success-500/30')}>
      <div className="flex items-start gap-3 mb-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500/15 text-brand-600 dark:text-brand-300">
          <Monitor size={16} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-ink-900 dark:text-ink-50 truncate">{tv.name}</div>
          <div className="text-[11px] text-muted flex items-center gap-1 mt-0.5">
            <Building2 size={10} /> {branchName}
          </div>
        </div>
        {tv.paired ? (
          <Badge tone="success" size="sm" pulse>Paired</Badge>
        ) : (
          <Badge tone="warning" size="sm">Pending</Badge>
        )}
      </div>

      {/* Pairing code box — prominent for unpaired TVs */}
      {!tv.paired && (
        <div className="rounded-xl border border-dashed border-brand-500/40 bg-brand-500/5 px-3 py-2.5 mb-3">
          <div className="text-[10px] uppercase tracking-wider text-muted mb-1">Pairing code</div>
          <div className="flex items-center justify-between gap-2">
            <div className="font-mono text-xl font-bold tracking-[0.3em] text-brand-700 dark:text-brand-300 select-all">
              {tv.pairingCode}
            </div>
            <button
              type="button"
              onClick={copyCode}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-brand-600 dark:text-brand-300 hover:bg-brand-500/10 transition-colors"
              title="Copy code"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
        </div>
      )}

      {/* Schedule */}
      {tv.schedule && (
        <div className="text-[11px] text-muted flex items-center gap-1.5 mb-2">
          <Clock size={11} className="shrink-0" />
          <span>
            {formatHour(tv.schedule.startHour)} – {formatHour(tv.schedule.endHour)}
            {' · '}
            {tv.schedule.daysActive.length === 7 ? 'Daily' : tv.schedule.daysActive.map((d) => DAY_LABELS[d]).join('/')}
          </span>
        </div>
      )}

      {/* Last seen */}
      <div className="text-[11px] text-muted mb-3">
        Last seen: <span className="font-medium text-ink-700 dark:text-ink-200">{relativeTime(tv.lastSeenAt)}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-2 pt-3 border-t hairline">
        <a
          href="/tv/pair"
          target="_blank"
          rel="noreferrer"
          className="text-[11px] font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-300 hover:underline inline-flex items-center gap-1"
        >
          <ExternalLink size={11} /> Open pair URL
        </a>
        <div className="flex items-center gap-1">
          <button type="button" onClick={onEdit} title="Edit" className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors">
            <Edit3 size={13} />
          </button>
          {tv.paired && (
            <button type="button" onClick={onUnpair} title="Unpair (generates new code)" className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-warning-500 hover:bg-warning-500/10 transition-colors">
              <Power size={13} />
            </button>
          )}
          {!tv.paired && (
            <button type="button" onClick={onUnpair} title="Regenerate code" className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-brand-500 hover:bg-brand-500/10 transition-colors">
              <RefreshCw size={13} />
            </button>
          )}
          <button type="button" onClick={onDelete} title="Delete" className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-danger-500 hover:bg-danger-500/10 transition-colors">
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </Card>
  );
}

// ─── Add modal ────────────────────────────────────────────────────────────

function AddTvModal({ open, onClose, onAdd, branches }: {
  open: boolean;
  onClose: () => void;
  onAdd: (input: { name: string; branchId: string; schedule?: TvSchedule }) => void;
  branches: { id: string; name: string }[];
}) {
  const [name, setName] = useState('');
  const [branchId, setBranchId] = useState(branches[0]?.id ?? '');
  const [schedule, setSchedule] = useState<TvSchedule>(DEFAULT_SCHEDULE);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setName('');
    setBranchId(branches[0]?.id ?? '');
    setSchedule(DEFAULT_SCHEDULE);
    setError(null);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError('Display name is required');
    if (!branchId) return setError('Pick a branch');
    onAdd({ name: name.trim(), branchId, schedule });
    reset();
  };

  return (
    <TvFormModal
      open={open}
      title="Register a new TV"
      subtitle="Generates a one-time pairing code for the display."
      onClose={() => { reset(); onClose(); }}
      onSubmit={submit}
      submitLabel="Register & generate code"
    >
      <TvFormFields
        name={name} setName={setName}
        branchId={branchId} setBranchId={setBranchId}
        schedule={schedule} setSchedule={setSchedule}
        branches={branches}
        error={error}
      />
    </TvFormModal>
  );
}

// ─── Edit modal ───────────────────────────────────────────────────────────

function EditTvModal({ open, tv, onClose, onSave, branches }: {
  open: boolean;
  tv: TvAccount | undefined;
  onClose: () => void;
  onSave: (patch: Partial<TvAccount>) => void;
  branches: { id: string; name: string }[];
}) {
  const [name, setName] = useState('');
  const [branchId, setBranchId] = useState('');
  const [schedule, setSchedule] = useState<TvSchedule>(DEFAULT_SCHEDULE);
  const [error, setError] = useState<string | null>(null);

  // Sync form fields when the target TV changes.
  useState(() => {
    if (tv) {
      setName(tv.name);
      setBranchId(tv.branchId);
      setSchedule(tv.schedule ?? DEFAULT_SCHEDULE);
    }
  });

  // useEffect would be cleaner, but we want to update synchronously when open.
  if (tv && open && name !== tv.name && branchId === '') {
    setName(tv.name);
    setBranchId(tv.branchId);
    setSchedule(tv.schedule ?? DEFAULT_SCHEDULE);
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError('Display name is required');
    if (!branchId) return setError('Pick a branch');
    onSave({ name: name.trim(), branchId, schedule });
  };

  if (!tv) return null;

  return (
    <TvFormModal
      open={open}
      title={`Edit ${tv.name}`}
      subtitle="Updates take effect on the next refresh."
      onClose={onClose}
      onSubmit={submit}
      submitLabel="Save changes"
    >
      <TvFormFields
        name={name} setName={setName}
        branchId={branchId} setBranchId={setBranchId}
        schedule={schedule} setSchedule={setSchedule}
        branches={branches}
        error={error}
      />
    </TvFormModal>
  );
}

// ─── Shared modal shell + form fields ─────────────────────────────────────

function TvFormModal({ open, title, subtitle, onClose, onSubmit, submitLabel, children }: {
  open: boolean;
  title: string;
  subtitle: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel: string;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-ink-950/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none"
            role="dialog" aria-modal="true"
          >
            <div className="w-full max-w-md pointer-events-auto rounded-2xl bg-white dark:bg-ink-900 border hairline shadow-2xl overflow-hidden">
              <div className="px-5 py-4 border-b hairline">
                <h2 className="text-base font-semibold text-ink-900 dark:text-ink-50">{title}</h2>
                <p className="text-xs text-muted mt-0.5">{subtitle}</p>
              </div>
              <form onSubmit={onSubmit} className="p-5 space-y-4">
                {children}
                <div className="flex items-center justify-end gap-2 pt-1">
                  <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                  <Button type="submit">{submitLabel}</Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function TvFormFields({ name, setName, branchId, setBranchId, schedule, setSchedule, branches, error }: {
  name: string; setName: (v: string) => void;
  branchId: string; setBranchId: (v: string) => void;
  schedule: TvSchedule; setSchedule: (v: TvSchedule) => void;
  branches: { id: string; name: string }[];
  error: string | null;
}) {
  const toggleDay = (d: number) => {
    setSchedule({
      ...schedule,
      daysActive: schedule.daysActive.includes(d)
        ? schedule.daysActive.filter((x) => x !== d)
        : [...schedule.daysActive, d].sort(),
    });
  };
  return (
    <>
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted mb-1.5">Display name</label>
        <input
          type="text" value={name} onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Reception TV"
          className="w-full rounded-xl border hairline bg-white dark:bg-ink-900 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-shadow"
        />
      </div>
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted mb-1.5">Branch</label>
        <select
          value={branchId} onChange={(e) => setBranchId(e.target.value)}
          className="w-full rounded-xl border hairline bg-white dark:bg-ink-900 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-shadow"
        >
          {branches.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted mb-1.5">Open hour</label>
          <input
            type="number" min={0} max={23} value={schedule.startHour}
            onChange={(e) => setSchedule({ ...schedule, startHour: Math.max(0, Math.min(23, Number(e.target.value))) })}
            className="w-full rounded-xl border hairline bg-white dark:bg-ink-900 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-shadow"
          />
          <div className="mt-1 text-[10px] text-muted">{formatHour(schedule.startHour)}</div>
        </div>
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted mb-1.5">Close hour</label>
          <input
            type="number" min={0} max={23} value={schedule.endHour}
            onChange={(e) => setSchedule({ ...schedule, endHour: Math.max(0, Math.min(23, Number(e.target.value))) })}
            className="w-full rounded-xl border hairline bg-white dark:bg-ink-900 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-shadow"
          />
          <div className="mt-1 text-[10px] text-muted">{formatHour(schedule.endHour)}</div>
        </div>
      </div>
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted mb-1.5">Active days</label>
        <div className="flex gap-1 flex-wrap">
          {DAY_LABELS.map((label, d) => {
            const active = schedule.daysActive.includes(d);
            return (
              <button
                key={d} type="button" onClick={() => toggleDay(d)}
                className={cn(
                  'flex-1 min-w-[40px] py-1.5 rounded-lg text-[11px] font-semibold uppercase tracking-wider transition-colors',
                  active
                    ? 'bg-brand-500 text-white'
                    : 'border hairline text-muted hover:text-ink-900 dark:hover:text-ink-50',
                )}
              >{label}</button>
            );
          })}
        </div>
      </div>
      {error && (
        <div className="text-[11px] text-danger-500 flex items-center gap-1">
          <AlertCircle size={11} /> {error}
        </div>
      )}
    </>
  );
}
