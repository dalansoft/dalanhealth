import { motion } from 'framer-motion';
import { Download, Share2, Printer } from 'lucide-react';
import { Card, CardSubtitle, CardTitle, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { demoClinic } from '@/services/demoData';

export function ClinicQR() {
  return (
    <div className="grid lg:grid-cols-2 gap-5">
      <Card className="text-center">
        <div className="mx-auto inline-block rounded-3xl bg-white p-6 shadow-card">
          <QRMock />
        </div>
        <h3 className="mt-5 text-lg font-semibold text-ink-900 dark:text-ink-50">{demoClinic.name}</h3>
        <p className="text-sm text-muted">Scan with any camera. New patients install the app; returning patients land directly in your queue.</p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Button leftIcon={<Download size={14} />}>Download PNG</Button>
          <Button variant="outline" leftIcon={<Printer size={14} />}>Print poster</Button>
          <Button variant="ghost" leftIcon={<Share2 size={14} />}>Share link</Button>
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
          <div className="text-xl font-semibold text-ink-900 dark:text-ink-50">{demoClinic.name}</div>
          <div className="text-sm text-muted">{demoClinic.doctor} · {demoClinic.specialization}</div>
          <div className="mt-5 grid grid-cols-3 gap-3">
            <Tile label="Timing" val={demoClinic.timing.split(',')[0]} />
            <Tile label="Current token" val="#12" />
            <Tile label="Est. wait" val="~38 min" />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <Button>Join queue · Free</Button>
            <Button variant="outline">Book · 9rs+gst</Button>
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

function QRMock() {
  const cells = Array.from({ length: 21 * 21 });
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-[repeat(21,minmax(0,1fr))] gap-px w-56 h-56">
      {cells.map((_, i) => {
        const x = i % 21;
        const y = Math.floor(i / 21);
        const corner = (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13);
        const dotted = (x + y) % 3 === 0 || (x * y) % 7 === 1 || (x === y);
        const on = corner ? (Math.abs(x - 3) <= 2 && Math.abs(y - 3) <= 2) || (Math.abs(x - 17) <= 2 && Math.abs(y - 3) <= 2) || (Math.abs(x - 3) <= 2 && Math.abs(y - 17) <= 2) : dotted;
        return <span key={i} className={on ? 'bg-ink-900' : 'bg-white'} />;
      })}
    </motion.div>
  );
}
