import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef6ff',
          100: '#d9eaff',
          200: '#bcdcff',
          300: '#8ec5ff',
          400: '#5ba3ff',
          500: '#2f7fff',
          600: '#1a5ff0',
          700: '#1549c4',
          800: '#173d99',
          900: '#173678',
          950: '#0f2150',
        },
        teal: {
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
        },
        accent: {
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
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
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', 'system-ui', 'sans-serif'],
        display: ['Inter', 'SF Pro Display', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 10px -2px rgba(15, 23, 42, 0.06), 0 4px 24px -4px rgba(15, 23, 42, 0.05)',
        glow: '0 0 0 1px rgba(47, 127, 255, 0.15), 0 10px 40px -10px rgba(47, 127, 255, 0.35)',
        glowAccent: '0 0 0 1px rgba(139, 92, 246, 0.15), 0 10px 40px -10px rgba(139, 92, 246, 0.4)',
        card: '0 1px 0 rgba(15, 23, 42, 0.04), 0 8px 32px -12px rgba(15, 23, 42, 0.1)',
        cardDark: '0 1px 0 rgba(255,255,255,0.04), 0 12px 40px -16px rgba(0,0,0,0.6)',
      },
      backgroundImage: {
        'mesh-light':
          'radial-gradient(at 20% 10%, rgba(47,127,255,0.10) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(139,92,246,0.10) 0px, transparent 50%), radial-gradient(at 0% 90%, rgba(6,182,212,0.08) 0px, transparent 50%)',
        'mesh-dark':
          'radial-gradient(at 20% 10%, rgba(47,127,255,0.16) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(139,92,246,0.18) 0px, transparent 50%), radial-gradient(at 0% 90%, rgba(6,182,212,0.12) 0px, transparent 50%)',
        'grid-light':
          'linear-gradient(rgba(15,23,42,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.04) 1px, transparent 1px)',
        'grid-dark':
          'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
      },
      backgroundSize: {
        grid: '44px 44px',
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
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        pulseSoft: 'pulseSoft 2.4s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
