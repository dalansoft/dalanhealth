import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'dh-pwa-install-dismissed';

/**
 * Floating "Install app" chip. Appears only when the browser fires
 * beforeinstallprompt (i.e. the PWA is installable and not already installed),
 * on any device. Dismissable; the choice is remembered for the session.
 */
export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [hidden, setHidden] = useState(() => sessionStorage.getItem(DISMISS_KEY) === '1');

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setDeferred(null);
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (!deferred || hidden) return null;

  const install = async () => {
    await deferred.prompt();
    await deferred.userChoice.catch(() => undefined);
    setDeferred(null);
  };
  const dismiss = () => { setHidden(true); sessionStorage.setItem(DISMISS_KEY, '1'); };

  return (
    <div className="fixed bottom-4 right-4 z-[80] flex items-center gap-1 rounded-2xl border border-ink-200 dark:border-white/10 bg-white/95 dark:bg-ink-900/95 backdrop-blur shadow-2xl pl-1.5 pr-1 py-1">
      <button
        type="button"
        onClick={install}
        className="inline-flex items-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white px-3.5 py-2 text-sm font-semibold transition-colors"
      >
        <Download size={15} /> Install app
      </button>
      <button type="button" onClick={dismiss} aria-label="Dismiss" className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800">
        <X size={15} />
      </button>
    </div>
  );
}
