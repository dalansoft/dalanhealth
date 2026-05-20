import { Outlet, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Logo } from '@/components/ui/Logo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-mesh-light dark:bg-mesh-dark relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-32 -left-24 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-accent-500/20 blur-3xl" />

      <header className="relative z-10">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 h-16 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link to="/demo" className="text-sm font-medium text-ink-600 dark:text-ink-300 hover:text-brand-600 dark:hover:text-brand-300">Try demo →</Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center px-5 py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <Outlet />
        </motion.div>
      </main>

      <footer className="relative z-10">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-6 text-center text-xs text-muted">
          © {new Date().getFullYear()} Dalansoft Technologies Pvt Ltd
        </div>
      </footer>
    </div>
  );
}
