import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { router } from './routes';
import './styles/index.css';

// PWA self-update — the user never has to clear cache. When a new build is
// deployed: we check for it (on load, when the tab is refocused, and every few
// minutes); the updated service worker activates immediately
// (skipWaiting/clientsClaim) and we reload once so the fresh app is shown.
// Guarded so it never loops and never reloads on the first install.
if ('serviceWorker' in navigator) {
  const hadController = !!navigator.serviceWorker.controller;
  let reloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloaded) return;
    reloaded = true;
    if (hadController) window.location.reload();
  });

  const checkForUpdate = () =>
    navigator.serviceWorker.getRegistration().then((r) => r?.update()).catch(() => undefined);

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') checkForUpdate();
  });
  window.addEventListener('focus', checkForUpdate);
  setInterval(checkForUpdate, 5 * 60 * 1000);
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false } },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>,
);
