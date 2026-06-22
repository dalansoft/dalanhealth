import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Download, Share2, Printer, MapPin, Check } from 'lucide-react';
import { Card, CardSubtitle, CardTitle, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useCurrentBranch } from '@/store/branch';
import { useQueue } from '@/store/queue';
import { useClinicTiming, fmtSlot } from '@/store/clinicTiming';
import { getBranchData } from '@/services/demoData';

export function ClinicQR() {
  const branch = useCurrentBranch();
  const data = getBranchData(branch?.id, branch);
  const entries = useQueue((s) => s.entries);
  const current = entries[0];
  const timingSlots = useClinicTiming((s) => s.slots);

  // Unique booking URL per clinic + branch.
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://dalanhealth.mlsons.in';
  const bookUrl = `${origin}/book?b=${branch?.id ?? ''}`;

  const [png, setPng] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let alive = true;
    QRCode.toDataURL(bookUrl, { width: 640, margin: 2, errorCorrectionLevel: 'M', color: { dark: '#0f172a', light: '#ffffff' } })
      .then((url) => { if (alive) setPng(url); })
      .catch(() => { if (alive) setPng(''); });
    return () => { alive = false; };
  }, [bookUrl]);

  const download = () => {
    if (!png) return;
    const a = document.createElement('a');
    a.href = png;
    a.download = `dalanhealth-qr-${(branch?.name ?? 'clinic').replace(/\s+/g, '-').toLowerCase()}.png`;
    a.click();
  };

  const printPoster = () => {
    const w = window.open('', '_blank', 'width=720,height=900');
    if (!w) return;
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${branch?.name ?? 'Clinic'} — Scan to book</title>
      <style>@page{margin:18mm}body{font-family:Inter,system-ui,sans-serif;text-align:center;color:#0f172a;margin:0}
      h1{font-size:30px;margin:8px 0 2px}.sub{color:#64748b;font-size:15px;margin:0 0 18px}
      img{width:380px;height:380px}.tag{margin-top:14px;font-size:18px;font-weight:700}.url{color:#64748b;font-size:13px;margin-top:6px;word-break:break-all}</style>
      </head><body>
      <h1>${branch?.name ?? 'Clinic'}</h1>
      <p class="sub">${data.doctor} · ${data.specialization}</p>
      <img src="${png}" />
      <div class="tag">Scan to join the queue — Free</div>
      <div class="url">${bookUrl}</div>
      </body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
  };

  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: branch?.name ?? 'Clinic', text: 'Scan to join the queue', url: bookUrl });
      else { await navigator.clipboard.writeText(bookUrl); setCopied(true); setTimeout(() => setCopied(false), 1500); }
    } catch { /* user cancelled */ }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-5">
      <Card className="text-center">
        <div className="mx-auto inline-block rounded-3xl bg-white p-6 shadow-card">
          {png
            ? <img src={png} alt="Clinic QR" className="w-56 h-56" />
            : <div className="w-56 h-56 animate-pulse rounded-xl bg-ink-100 dark:bg-ink-800" />}
        </div>
        <h3 className="mt-5 text-lg font-semibold text-ink-900 dark:text-ink-50">{branch?.name ?? data.doctor}</h3>
        <p className="text-sm text-muted">Unique to this branch. Patients scan to enter <b>this</b> queue — no login, just name + mobile (within ~100 m of the clinic).</p>
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-ink-50 dark:bg-ink-900/60 px-2.5 py-1 text-[11px] font-mono text-muted">
          <MapPin size={11} /> {bookUrl}
        </div>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Button leftIcon={<Download size={14} />} onClick={download} disabled={!png}>Download PNG</Button>
          <Button variant="outline" leftIcon={<Printer size={14} />} onClick={printPoster} disabled={!png}>Print poster</Button>
          <Button variant="ghost" leftIcon={copied ? <Check size={14} /> : <Share2 size={14} />} onClick={share}>{copied ? 'Copied' : 'Share link'}</Button>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>What patients see</CardTitle>
            <CardSubtitle>After scanning the QR</CardSubtitle>
          </div>
          <Badge tone="brand">Live preview</Badge>
        </CardHeader>
        <div className="rounded-2xl border hairline bg-white dark:bg-ink-900 p-5">
          <div className="text-xs uppercase tracking-wider text-muted">Clinic</div>
          <div className="text-xl font-semibold text-ink-900 dark:text-ink-50">{branch?.name ?? data.doctor}</div>
          <div className="text-sm text-muted">{data.doctor} · {data.specialization}</div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {timingSlots.map((s) => (
              <span key={s.id} className="rounded-md bg-brand-500/10 px-2 py-0.5 text-[11px] font-medium text-brand-700 dark:text-brand-300">{fmtSlot(s)}</span>
            ))}
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3">
            <Tile label="Timing" val={timingSlots[0] ? fmtSlot(timingSlots[0]) : '—'} />
            <Tile label="Now serving" val={current ? `#${current.token}` : '—'} />
            <Tile label="Est. wait" val={`~${Math.max(5, entries.length * 12)} min`} />
          </div>
          <div className="mt-5">
            <a href={bookUrl} target="_blank" rel="noreferrer">
              <Button fullWidth>Get token · Free</Button>
            </a>
          </div>
        </div>
      </Card>
    </div>
  );
}

const Tile = ({ label, val }: { label: string; val: string }) => (
  <div className="rounded-xl border hairline p-3">
    <div className="text-[10px] uppercase tracking-wider text-muted">{label}</div>
    <div className="text-sm font-semibold text-ink-900 dark:text-ink-50">{val}</div>
  </div>
);
