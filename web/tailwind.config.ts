import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Brand — medical teal. Drives buttons, links, focus, accents app-wide.
        brand: {
          50: '#f0fdfa',
          100: '#cbfbef',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        // Secondary teal helper (kept for components referencing `teal-*`).
        teal: {
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
        },
        // Accent — emerald. Pairs with teal for gradients + secondary actions.
        accent: {
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
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
        // Deep teal-tinted navy for admin/clinic shells + TV display.
        navy: {
          400: '#163e44',
          500: '#103138',
          600: '#0b262c',
          700: '#081e23',
          800: '#06171b',
          900: '#041012',
          950: '#020a0c',
        },
        // Vivid emerald used for token numerals in the live queue.
        token: {
          400: '#34d399',
          500: '#10b981',
          DEFAULT: '#10b981',
          bright: '#5eead4',
        },
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'Inter', 'SF Pro Display', 'system-ui', 'sans-serif'],
        brand: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 10px -2px rgba(15, 23, 42, 0.06), 0 4px 24px -4px rgba(15, 23, 42, 0.05)',
        glow: '0 0 0 1px rgba(20, 184, 166, 0.15), 0 10px 40px -10px rgba(20, 184, 166, 0.4)',
        glowAccent: '0 0 0 1px rgba(16, 185, 129, 0.15), 0 10px 40px -10px rgba(16, 185, 129, 0.42)',
        glowBright: '0 0 0 1px rgba(45, 212, 191, 0.35), 0 8px 24px -4px rgba(45, 212, 191, 0.55), inset 0 1px 0 rgba(255,255,255,0.18)',
        card: '0 1px 0 rgba(15, 23, 42, 0.04), 0 8px 32px -12px rgba(15, 23, 42, 0.1)',
        cardDark: '0 1px 0 rgba(255,255,255,0.04), 0 12px 40px -16px rgba(0,0,0,0.6)',
        lift: '0 20px 50px -20px rgba(13, 148, 136, 0.35), 0 8px 24px -12px rgba(15, 23, 42, 0.15)',
      },
      backgroundImage: {
        'mesh-light':
          'radial-gradient(at 18% 8%, rgba(20,184,166,0.14) 0px, transparent 50%), radial-gradient(at 82% 0%, rgba(16,185,129,0.12) 0px, transparent 50%), radial-gradient(at 0% 92%, rgba(45,212,191,0.10) 0px, transparent 50%)',
        'mesh-dark':
          'radial-gradient(at 18% 8%, rgba(20,184,166,0.20) 0px, transparent 50%), radial-gradient(at 82% 0%, rgba(16,185,129,0.18) 0px, transparent 50%), radial-gradient(at 0% 92%, rgba(45,212,191,0.14) 0px, transparent 50%)',
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
        // Slow hue/scale drift for aurora gradient blobs.
        aurora: {
          '0%, 100%': { transform: 'translate(0,0) scale(1)', opacity: '0.8' },
          '33%': { transform: 'translate(3%,-4%) scale(1.08)', opacity: '1' },
          '66%': { transform: 'translate(-4%,3%) scale(0.96)', opacity: '0.7' },
        },
        // Diagonal light sweep across buttons/cards.
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
