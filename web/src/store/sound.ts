import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_TEMPLATE_EN, DEFAULT_TEMPLATE_HI, DEFAULT_TEMPLATE_BHO, type AnnounceLang, type Lang } from '@/lib/speech';

interface SoundState {
  /** Master switch — chime + spoken announcement when a new patient is served. */
  enabled: boolean;
  /** Ordered languages for the spoken (TTS) announcement — first is spoken first. */
  announceLang: AnnounceLang;
  /** Clinic-written call sentence with [Token no] / [Name] placeholders. */
  templateEn: string;
  templateHi: string;
  templateBho: string;
  toggle: () => void;
  set: (v: boolean) => void;
  setLang: (l: AnnounceLang) => void;
  setTemplates: (en: string, hi: string, bho: string) => void;
}

/** Accept legacy values ('en' | 'hi' | 'both') and coerce to an ordered list. */
export const coerceLangs = (v: unknown): Lang[] => {
  if (Array.isArray(v)) {
    const out = v.filter((x): x is Lang => x === 'en' || x === 'hi' || x === 'bho');
    return out.length ? out : ['en'];
  }
  if (v === 'both') return ['hi', 'en'];
  if (v === 'en' || v === 'hi' || v === 'bho') return [v];
  return ['en'];
};

// Cross-tab sync — language / template changes saved on the clinic panel's TV
// settings retune any open TV display tab immediately. Same pattern as the
// queue / branch stores.
const CHANNEL_NAME = 'dh-sound-sync';
let channel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined') {
  try { channel = new BroadcastChannel(CHANNEL_NAME); } catch { channel = null; }
}
let applyingRemote = false;

/**
 * Per-device sound preference for queue announcements. Persisted so a TV or
 * reception machine remembers its setting across reloads. Default ON with
 * English voice — the whole point of a waiting-room TV is the audible call.
 */
export const useSound = create<SoundState>()(
  persist(
    (set, get) => {
      if (channel) {
        channel.addEventListener('message', (e) => {
          const msg = e.data as {
            type?: string;
            enabled?: boolean;
            announceLang?: unknown;
            templateEn?: string;
            templateHi?: string;
            templateBho?: string;
          } | null;
          if (!msg || msg.type !== 'sync') return;
          applyingRemote = true;
          try {
            set({
              ...(typeof msg.enabled === 'boolean' ? { enabled: msg.enabled } : {}),
              ...(msg.announceLang ? { announceLang: coerceLangs(msg.announceLang) } : {}),
              ...(typeof msg.templateEn === 'string' ? { templateEn: msg.templateEn } : {}),
              ...(typeof msg.templateHi === 'string' ? { templateHi: msg.templateHi } : {}),
              ...(typeof msg.templateBho === 'string' ? { templateBho: msg.templateBho } : {}),
            });
          } finally {
            applyingRemote = false;
          }
        });
      }

      const broadcast = () => {
        if (applyingRemote || !channel) return;
        const { enabled, announceLang, templateEn, templateHi, templateBho } = get();
        try { channel.postMessage({ type: 'sync', enabled, announceLang, templateEn, templateHi, templateBho }); } catch {}
      };

      return {
        enabled: true,
        announceLang: ['en'],
        templateEn: DEFAULT_TEMPLATE_EN,
        templateHi: DEFAULT_TEMPLATE_HI,
        templateBho: DEFAULT_TEMPLATE_BHO,
        toggle: () => { set({ enabled: !get().enabled }); broadcast(); },
        set: (v) => { set({ enabled: v }); broadcast(); },
        setLang: (l) => { set({ announceLang: coerceLangs(l) }); broadcast(); },
        setTemplates: (en, hi, bho) => {
          set({
            templateEn: en.trim() || DEFAULT_TEMPLATE_EN,
            templateHi: hi.trim() || DEFAULT_TEMPLATE_HI,
            templateBho: bho.trim() || DEFAULT_TEMPLATE_BHO,
          });
          broadcast();
        },
      };
    },
    {
      name: 'dh-sound',
      version: 2,
      // Migrate the old single-value announceLang (and pre-Bhojpuri state).
      migrate: (state) => {
        const s = (state ?? {}) as Partial<SoundState> & { announceLang?: unknown };
        return {
          ...s,
          announceLang: coerceLangs(s.announceLang),
          templateBho: s.templateBho || DEFAULT_TEMPLATE_BHO,
        } as SoundState;
      },
    },
  ),
);
