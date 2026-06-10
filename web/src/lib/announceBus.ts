import type { AnnounceLang } from '@/lib/speech';

/**
 * Cross-tab bus for operator-written PA announcements. The clinic panel's
 * "TV announcements" card posts a message; every open TV display tab picks it
 * up and speaks it aloud.
 *
 * Demo note: BroadcastChannel reaches tabs of the same browser on the same
 * machine — exactly how the queue/branch sync works in this build. In
 * production this becomes a WebSocket event from the backend so it reaches
 * physical TVs on other devices.
 */

export interface CustomAnnouncement {
  text: string;
  lang: AnnounceLang;
}

const CHANNEL_NAME = 'dh-announce';

let channel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined') {
  try { channel = new BroadcastChannel(CHANNEL_NAME); } catch { channel = null; }
}

/** Send a custom announcement to every listening TV display tab. */
export function postAnnouncement(a: CustomAnnouncement): void {
  if (!channel) return;
  try { channel.postMessage({ type: 'custom', ...a }); } catch {}
}

/** Listen for announcements. Returns an unsubscribe function. */
export function subscribeAnnouncements(cb: (a: CustomAnnouncement) => void): () => void {
  if (!channel) return () => {};
  const handler = (e: MessageEvent) => {
    const msg = e.data as { type?: string; text?: string; lang?: AnnounceLang } | null;
    if (msg && msg.type === 'custom' && typeof msg.text === 'string' && msg.lang) {
      cb({ text: msg.text, lang: msg.lang });
    }
  };
  channel.addEventListener('message', handler);
  return () => channel?.removeEventListener('message', handler);
}
