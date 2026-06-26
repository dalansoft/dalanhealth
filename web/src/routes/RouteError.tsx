import { useEffect } from 'react';
import { useRouteError } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

const RELOAD_FLAG = 'dh:chunk-reloaded';

function isChunkLoadError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    /Failed to fetch dynamically imported module/i.test(msg) ||
    /error loading dynamically imported module/i.test(msg) ||
    /Importing a module script failed/i.test(msg) ||
    /'text\/html' is not a valid JavaScript MIME type/i.test(msg)
  );
}

async function hardReload(): Promise<void> {
  try {
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
    }
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
  } catch {
    /* best-effort cache purge */
  }
  window.location.reload();
}

/* Router-level error boundary. Its main job is to catch a stale code-split
   chunk left over from a previous deploy and recover by purging caches and
   reloading once (guarded against loops). Any other error shows a simple
   retry screen rather than a blank page. */
export function RouteError() {
  const error = useRouteError();
  const stale = isChunkLoadError(error);

  useEffect(() => {
    if (stale && !sessionStorage.getItem(RELOAD_FLAG)) {
      sessionStorage.setItem(RELOAD_FLAG, '1');
      void hardReload();
    }
  }, [stale]);

  return (
    <div className="min-h-screen bg-mesh-light dark:bg-mesh-dark flex items-center justify-center px-5">
      <div className="max-w-md text-center">
        <div className="text-2xl font-semibold text-ink-900 dark:text-white">
          {stale ? 'Updating to the latest version…' : 'Something went wrong'}
        </div>
        <div className="mt-2 text-muted">
          {stale
            ? 'A new version was just released. Reloading to get the latest app.'
            : 'Please reload the page. If the problem continues, try again in a moment.'}
        </div>
        <Button className="mt-6" onClick={() => void hardReload()}>
          Reload now
        </Button>
      </div>
    </div>
  );
}
