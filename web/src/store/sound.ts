import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_TEMPLATE_EN, DEFAULT_TEMPLATE_HI, type AnnounceLang } from '@/lib/speech';

interface SoundState {
  /** Master switch — chime + spoken announcement when a new patient is served. */
  enabled: boolean;
  /** Language for the spoken (TTS) announcement on the TV display. */
  announceLang: AnnounceLang;
  /** Clinic-written call sentence with [Token no] / [Name] placeholders. */
  templateEn: string;
  templateHi: string;
  toggle: () => void;
  set: (v: boolean) => void;
  setLang: (l: AnnounceLang) => void;
  setTemplates: (en: string, hi: string) => void;
}

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
            announceLang?: AnnounceLang;
            templateEn?: string;
            templateHi?: string;
          } | null;
          if (!msg || msg.type !== 'sync') return;
          applyingRemote = true;
          try {
            set({
              ...(typeof msg.enabled === 'boolean' ? { enabled: msg.enabled } : {}),
              ...(msg.announceLang ? { announceLang: msg.announceLang } : {}),
              ...(typeof msg.templateEn === 'string' ? { templateEn: msg.templateEn } : {}),
              ...(typeof msg.templateHi === 'string' ? { templateHi: msg.templateHi } : {}),
            });
          } finally {
            applyingRemote = false;
          }
        });
      }

      const broadcast = () => {
        if (applyingRemote || !channel) return;
        const { enabled, announceLang, templateEn, templateHi } = get();
        try { channel.postMessage({ type: 'sync', enabled, announceLang, templateEn, templateHi }); } catch {}
      };

      return {
        enabled: true,
        announceLang: 'en',
        templateEn: DEFAULT_TEMPLATE_EN,
        templateHi: DEFAULT_TEMPLATE_HI,
        toggle: () => { set({ enabled: !get().enabled }); broadcast(); },
        set: (v) => { set({ enabled: v }); broadcast(); },
        setLang: (l) => { set({ announceLang: l }); broadcast(); },
        setTemplates: (en, hi) => {
          set({
            templateEn: en.trim() || DEFAULT_TEMPLATE_EN,
            templateHi: hi.trim() || DEFAULT_TEMPLATE_HI,
          });
          broadcast();
        },
      };
    },
    { name: 'dh-sound' },
  ),
);
