// Design Tokens - Dark Theme (Black + Purple)
export const colors = {
  gradientStart: '#000000',
  gradientEnd: '#0d0d0d',
  background: '#000000',
  surface: '#1a1a1a',
  surfaceElevated: '#222222',
  glassBackground: 'rgba(255,255,255,0.04)',
  glassBorder: 'rgba(255,255,255,0.08)',
  textPrimary: '#ffffff',
  textSecondary: '#888888',
  textMuted: '#555555',
  primary: '#8B2BE2',
  primaryLight: '#A64DFF',
  primaryDark: '#6A1FB0',
  playButton: '#8B2BE2',
  playButtonDark: '#6A1FB0',
  divider: '#2a2a2a',
  progressBackground: 'rgba(255,255,255,0.1)',
  progressFill: '#8B2BE2',
  iconActive: '#8B2BE2',
  iconInactive: '#555555',
};

export const spacing = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48, xxxl: 64,
};

export const typography = {
  title: 22, subtitle: 18, body: 16, caption: 14, small: 12,
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const borderRadius = {
  sm: 8, md: 12, lg: 20, xl: 32, full: 9999,
};

export const shadows = {
  small: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 4, elevation: 3 },
  medium: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 6, elevation: 5 },
  large: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.6, shadowRadius: 12, elevation: 10 },
  glow: { shadowColor: '#8B2BE2', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 16, elevation: 10 },
};
