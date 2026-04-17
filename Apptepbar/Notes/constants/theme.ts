// Powered by OnSpace.AI
// Design tokens — single source of truth

export const Colors = {
  background: '#0D0D0D',
  surface: '#161B22',
  surfaceElevated: '#1C2128',
  border: '#21262D',
  borderLight: '#30363D',

  primary: '#1D9BF0',
  primaryLight: '#1A8CD8',
  primaryMuted: '#1D9BF020',

  support: '#FF6B35',
  supportMuted: '#FF6B3520',

  like: '#F91880',
  likeMuted: '#F9188020',

  comment: '#1D9BF0',
  commentMuted: '#1D9BF020',

  share: '#00BA7C',
  shareMuted: '#00BA7C20',

  textPrimary: '#E6EDF3',
  textSecondary: '#7D8590',
  textMuted: '#484F58',

  white: '#FFFFFF',
  black: '#000000',
};

export const Typography = {
  fontSizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
  },
  fontWeights: {
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
  },
  lineHeights: {
    tight: 1.3,
    normal: 1.5,
    relaxed: 1.7,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const Radius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const Shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  button: {
    shadowColor: '#1D9BF0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
};
