import { useEffect, useState } from 'react';
import { Badge } from './Badge';

/**
 * Brand-tone badge that shows the current weekday + date + time (with seconds),
 * ticking every second. Drop into any dashboard hero row instead of the static
 * date badge so the user can read the live time at a glance.
 *
 *   WED, 21 MAY, 2026 · 02:34:56 PM
 */
export function LiveClock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const date = now.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  // Manual 12-hour clock so seconds + uppercase AM/PM stay consistent across
  // browser locales (some `toLocaleTimeString` outputs drop seconds or use
  // narrow non-breaking spaces).
  const h24 = now.getHours();
  const hour12 = String(h24 % 12 || 12).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  const second = String(now.getSeconds()).padStart(2, '0');
  const ampm = h24 >= 12 ? 'PM' : 'AM';
  const time = `${hour12}:${minute}:${second} ${ampm}`;

  return (
    <Badge tone="brand" className="tabular-nums whitespace-nowrap">
      {date} <span className="opacity-70 mx-1">·</span> {time}
    </Badge>
  );
}
