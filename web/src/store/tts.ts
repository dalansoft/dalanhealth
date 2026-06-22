import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Optional cloud Text-to-Speech configuration.
 *
 * The static deploy speaks with the browser's built-in voices, which can't do
 * a true Indian/Bihari accent or studio quality. Point `endpoint` at a small
 * TTS proxy (your backend → Google Cloud TTS / Amazon Polly / ElevenLabs with
 * an Indian or custom Bihari voice) and every announcement automatically uses
 * it instead — no rebuild needed.
 *
 * Endpoint contract (POST JSON):
 *   request:  { text: string, lang: 'en'|'hi'|'bho', voice?: string, accent?: string }
 *   response: audio bytes (audio/mpeg|wav)  — or —
 *             JSON { audioUrl } | { audioContent: <base64 mp3> } | { audio: <data-url> }
 *
 * It can be preset at build time with VITE_TTS_ENDPOINT, or pasted at runtime
 * in TV Displays → Premium cloud voice.
 */
const ENV_ENDPOINT = (import.meta.env.VITE_TTS_ENDPOINT as string | undefined)?.trim() ?? '';

interface TtsConfig {
  endpoint: string;
  voice: string;
  accent: string;
  enabled: boolean;
}

interface TtsState extends TtsConfig {
  setConfig: (patch: Partial<TtsConfig>) => void;
}

export const useTts = create<TtsState>()(
  persist(
    (set) => ({
      endpoint: ENV_ENDPOINT,
      voice: '',
      accent: '',
      enabled: !!ENV_ENDPOINT,
      setConfig: (patch) =>
        set((s) => {
          const next = { ...s, ...patch };
          // Setting/clearing the endpoint flips enabled unless the caller said otherwise.
          if (patch.endpoint !== undefined && patch.enabled === undefined) {
            next.enabled = !!patch.endpoint.trim();
          }
          return next;
        }),
    }),
    { name: 'dh-tts' },
  ),
);

/** True when announcements should route through the cloud endpoint. */
export const cloudTtsReady = (): boolean => {
  const s = useTts.getState();
  return s.enabled && !!s.endpoint.trim();
};
