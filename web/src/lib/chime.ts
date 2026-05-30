/**
 * Notification chime via the Web Audio API — no bundled mp3 needed, works
 * offline, and stays crisp at any volume. A gentle two-tone "bing-bong" that
 * reads as a call-bell without being jarring in a waiting room.
 *
 * Browsers block audio until the user interacts with the page (autoplay
 * policy). Call `unlockAudio()` from any click/keydown handler once to resume
 * the context; after that `playChime()` works freely. The TV display calls
 * unlock on first pointer/key event automatically.
 */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    try { ctx = new AC(); } catch { return null; }
  }
  return ctx;
}

/** Returns true if the audio context is live (sound will actually play). */
export function isAudioUnlocked(): boolean {
  return !!ctx && ctx.state === 'running';
}

/** Resume the audio context. Safe to call repeatedly; call from a user gesture. */
export function unlockAudio(): void {
  const c = getCtx();
  if (c && c.state === 'suspended') {
    c.resume().catch(() => {});
  }
}

interface Note {
  freq: number;
  /** seconds from chime start */
  at: number;
  /** seconds */
  dur: number;
}

function ring(c: AudioContext, { freq, at, dur }: Note, peak: number) {
  const t0 = c.currentTime + at;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  // Quick attack, smooth exponential decay → bell-like.
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(peak, t0 + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

/**
 * Play the call chime. No-op if audio is unavailable or still locked.
 * @param volume 0–1, defaults to a comfortable 0.5.
 */
export function playChime(volume = 0.5): void {
  const c = getCtx();
  if (!c) return;
  if (c.state === 'suspended') {
    // Try to resume opportunistically; if it succeeds the next call will ring.
    c.resume().catch(() => {});
    return;
  }
  const peak = Math.max(0.0001, Math.min(1, volume)) * 0.6;
  // Ascending two-tone: G5 → C6 (a friendly "ding-dong").
  ring(c, { freq: 784, at: 0, dur: 0.45 }, peak);
  ring(c, { freq: 1046.5, at: 0.18, dur: 0.55 }, peak);
}
