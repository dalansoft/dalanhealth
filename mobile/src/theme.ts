import { Appearance } from 'react-native';

const palette = {
  brand: '#2f7fff',
  brandDark: '#5ba3ff',
  accent: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  white: '#ffffff',
  ink50: '#f8fafc',
  ink100: '#f1f5f9',
  ink200: '#e2e8f0',
  ink400: '#94a3b8',
  ink600: '#475569',
  ink800: '#1e293b',
  ink900: '#0f172a',
  ink950: '#020617',
};

export const getTheme = (mode: 'light' | 'dark' = (Appearance.getColorScheme() as any) ?? 'light') => ({
  mode,
  bg: mode === 'dark' ? palette.ink950 : palette.ink50,
  card: mode === 'dark' ? palette.ink900 : palette.white,
  border: mode === 'dark' ? palette.ink800 : palette.ink200,
  text: mode === 'dark' ? palette.ink50 : palette.ink900,
  muted: mode === 'dark' ? palette.ink400 : palette.ink600,
  ...palette,
});

export type Theme = ReturnType<typeof getTheme>;

export const spacing = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32,
};

export const radius = {
  sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, full: 999,
};

export const typography = {
  display: { fontSize: 32, fontWeight: '700' as const },
  h1: { fontSize: 24, fontWeight: '700' as const },
  h2: { fontSize: 18, fontWeight: '600' as const },
  body: { fontSize: 15, fontWeight: '400' as const },
  small: { fontSize: 13, fontWeight: '400' as const },
  caption: { fontSize: 11, fontWeight: '500' as const, letterSpacing: 0.5 },
};
