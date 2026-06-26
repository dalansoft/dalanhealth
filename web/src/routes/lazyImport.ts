import { lazy, type ComponentType } from 'react';

/* Stale-chunk recovery for code-split routes.

   After a new build is deployed the hashed chunk filenames change. A browser
   that is still holding the previous `index.html` (or a stale service-worker
   precache) requests an old chunk such as `ClinicLayout-CI0S22i8.js` that no
   longer exists on the server, and Vite throws:

     "Failed to fetch dynamically imported module: .../ClinicLayout-XXXX.js"

   Without recovery this dead-ends on a blank error screen (the symptom seen on
   /clinic and /receptionist). Here we retry once for a transient blip, and on a
   genuine missing chunk we purge the SW caches and do a single hard reload so
   the fresh `index.html` (with the new chunk hashes) is fetched. A
   sessionStorage guard makes sure we never reload-loop. */

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

/** Drop service-worker registrations + Cache Storage, then hard-reload once. */
async function forceFreshReload(): Promise<void> {
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
    /* best-effort cache purge — reload regardless */
  }
  window.location.reload();
}

/** Wrap a dynamic import so missing chunks recover instead of crashing. */
export function retryImport<T>(factory: () => Promise<T>): Promise<T> {
  return factory()
    .then((mod) => {
      // A successful load means we are on a fresh build; allow future recovery.
      sessionStorage.removeItem(RELOAD_FLAG);
      return mod;
    })
    .catch(
      () =>
        // Retry once after a short delay to ride out a transient network hiccup.
        new Promise<T>((resolve, reject) => {
          setTimeout(() => {
            factory()
              .then((mod) => {
                sessionStorage.removeItem(RELOAD_FLAG);
                resolve(mod);
              })
              .catch((retryErr) => {
                if (isChunkLoadError(retryErr) && !sessionStorage.getItem(RELOAD_FLAG)) {
                  sessionStorage.setItem(RELOAD_FLAG, '1');
                  void forceFreshReload();
                  return; // leave the promise pending; the page is reloading
                }
                reject(retryErr);
              });
          }, 500);
        }),
    );
}

/** Lazy-load a named export from a module, with stale-chunk recovery. */
export function lazyNamed<M extends Record<string, unknown>>(
  factory: () => Promise<M>,
  name: keyof M,
): ReturnType<typeof lazy> {
  return lazy(() => retryImport(factory).then((m) => ({ default: m[name] as ComponentType })));
}
