import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Brand — blue. Drives buttons, links, focus, accents app-wide.
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        // Secondary sky-blue helper (kept for components referencing `teal-*`).
        teal: {
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
        },
        // Accent — sky blue. Pairs with brand blue for gradients + secondary actions.
        accent: {
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
        },
        success: { 500: '#10b981', 600: '#059669' },
        warning: { 500: '#f59e0b', 600: '#d97706' },
        danger: { 500: '#ef4444', 600: '#dc2626' },
        ink: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        // Deep navy for admin/clinic shells + TV display.
        navy: {
          400: '#1c2a52',
          500: '#152141',
          600: '#0f1a35',
          700: '#0b1530',
          800: '#080f25',
          900: '#050a1c',
          950: '#020615',
        },
        // Vivid blue used for token numerals in the live queue.
        token: {
          400: '#60a5fa',
          500: '#3b82f6',
          DEFAULT: '#3b82f6',
          bright: '#93c5fd',
        },
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'Inter', 'SF Pro Display', 'system-ui', 'sans-serif'],
        brand: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 10px -2px rgba(15, 23, 42, 0.06), 0 4px 24px -4px rgba(15, 23, 42, 0.05)',
        glow: '0 0 0 1px rgba(59, 130, 246, 0.15), 0 10px 40px -10px rgba(59, 130, 246, 0.4)',
        glowAccent: '0 0 0 1px rgba(14, 165, 233, 0.15), 0 10px 40px -10px rgba(14, 165, 233, 0.42)',
        glowBright: '0 0 0 1px rgba(96, 165, 250, 0.35), 0 8px 24px -4px rgba(96, 165, 250, 0.55), inset 0 1px 0 rgba(255,255,255,0.18)',
        card: '0 1px 0 rgba(15, 23, 42, 0.04), 0 8px 32px -12px rgba(15, 23, 42, 0.1)',
        cardDark: '0 1px 0 rgba(255,255,255,0.04), 0 12px 40px -16px rgba(0,0,0,0.6)',
        lift: '0 20px 50px -20px rgba(37, 99, 235, 0.35), 0 8px 24px -12px rgba(15, 23, 42, 0.15)',
      },
      backgroundImage: {
        'mesh-light':
          'radial-gradient(at 18% 8%, rgba(59,130,246,0.14) 0px, transparent 50%), radial-gradient(at 82% 0%, rgba(14,165,233,0.12) 0px, transparent 50%), radial-gradient(at 0% 92%, rgba(96,165,250,0.10) 0px, transparent 50%)',
        'mesh-dark':
          'radial-gradient(at 18% 8%, rgba(59,130,246,0.20) 0px, transparent 50%), radial-gradient(at 82% 0%, rgba(14,165,233,0.18) 0px, transparent 50%), radial-gradient(at 0% 92%, rgba(96,165,250,0.14) 0px, transparent 50%)',
        'grid-light':
          'linear-gradient(rgba(15,23,42,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.04) 1px, transparent 1px)',
        'grid-dark':
          'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
        'shine':
          'linear-gradient(110deg, transparent 25%, rgba(255,255,255,0.35) 50%, transparent 75%)',
      },
      backgroundSize: {
        grid: '44px 44px',
        shine: '200% 100%',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.7' },
          '50%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        aurora: {
          '0%, 100%': { transform: 'translate(0,0) scale(1)', opacity: '0.8' },
          '33%': { transform: 'translate(3%,-4%) scale(1.08)', opacity: '1' },
          '66%': { transform: 'translate(-4%,3%) scale(0.96)', opacity: '0.7' },
        },
        shine: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        pulseSoft: 'pulseSoft 2.4s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
        aurora: 'aurora 16s ease-in-out infinite',
        shine: 'shine 1.1s ease-out',
      },
    },
  },
  plugins: [],
};

export default config;
