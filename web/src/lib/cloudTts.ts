import { useTts } from '@/store/tts';
import type { Lang } from '@/lib/speech';

/**
 * Cloud Text-to-Speech client. Talks to the optional TTS proxy configured in
 * the tts store (see store/tts.ts for the request/response contract). When no
 * endpoint is set this whole module is inert and speech falls back to the
 * browser's Web Speech API.
 */

export interface CloudCfg {
  endpoint: string;
  voice?: string;
  accent?: string;
}

/** Resolve the active cloud config, or null when cloud TTS is off. */
export function cloudConfig(): CloudCfg | null {
  const { endpoint, voice, accent, enabled } = useTts.getState();
  const ep = endpoint.trim();
  if (!enabled || !ep) return null;
  return { endpoint: ep, voice: voice.trim() || undefined, accent: accent.trim() || undefined };
}

// Synthesised clips are cached per (lang+voice+accent+text) for the session so
// the same call isn't re-fetched on every patient with that token/name combo.
const cache = new Map<string, string>();

/** Fetch synthesized audio for one sentence; returns a playable URL or throws. */
export async function synthesize(text: string, lang: Lang, cfg: CloudCfg): Promise<string> {
  const key = `${lang}|${cfg.voice ?? ''}|${cfg.accent ?? ''}|${text}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const res = await fetch(cfg.endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, lang, voice: cfg.voice, accent: cfg.accent }),
  });
  if (!res.ok) throw new Error(`TTS endpoint returned ${res.status}`);

  const ct = (res.headers.get('content-type') ?? '').toLowerCase();
  let url: string;
  if (ct.includes('json')) {
    const j = (await res.json()) as { audioUrl?: string; audioContent?: string; audio?: string };
    if (j.audioUrl) url = j.audioUrl;
    else if (j.audioContent) url = `data:audio/mpeg;base64,${j.audioContent}`; // Google Cloud TTS shape
    else if (j.audio) url = j.audio;
    else throw new Error('TTS response had no audio');
  } else {
    url = URL.createObjectURL(await res.blob());
  }
  cache.set(key, url);
  return url;
}

// ─── Sequential playback (one HTMLAudioElement at a time) ───────────────────
let current: HTMLAudioElement | null = null;
let playToken = 0;

/** Stop any cloud audio in progress (used by cancelSpeech / mute). */
export function cancelCloudAudio(): void {
  playToken++;
  if (current) {
    try { current.pause(); } catch { /* ignore */ }
    current = null;
  }
}

/** Play a list of clip URLs back-to-back, honouring cancellation. */
export async function playUrls(urls: string[]): Promise<void> {
  const mine = ++playToken;
  for (const url of urls) {
    if (mine !== playToken) return; // a newer call superseded us
    await new Promise<void>((resolve) => {
      const audio = new Audio(url);
      current = audio;
      audio.onended = () => resolve();
      audio.onerror = () => resolve();
      audio.play().catch(() => resolve());
    });
  }
  if (mine === playToken) current = null;
}
