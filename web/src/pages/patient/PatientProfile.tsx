import { Card, CardHeader, CardSubtitle, CardTitle } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { demoPatient, demoBookings } from '@/services/demoData';

export function PatientProfile() {
  return (
    <div className="space-y-5">
      <Card>
        <div className="flex items-center gap-4">
          <Avatar name={demoPatient.name} size="lg" />
          <div>
            <div className="text-lg font-semibold text-ink-900 dark:text-ink-50">{demoPatient.name}</div>
            <div className="text-xs text-muted">{demoPatient.mobile}</div>
            <div className="text-xs text-muted">{demoPatient.age} · {demoPatient.gender}</div>
          </div>
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
    </div>
  );
}
