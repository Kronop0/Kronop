import { Platform } from 'react-native';

// Local AppColors definition to stay within live.jsa folder
const AppColors = {
  primary: {
    main: '#8B00FF',
    light: '#A833FF',
    dark: '#6B00CC',
  },
  background: {
    primary: '#000000',
    secondary: '#0A0A0A',
    tertiary: '#141414',
    elevated: '#1A1A1A',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#CCCCCC',
    tertiary: '#999999',
    inverse: '#000000',
  },
  border: {
    primary: '#333333',
    secondary: '#444444',
    light: '#2A2A2A',
  },
  success: '#8B00FF',
  error: '#A833FF',
  warning: '#FFAA00',
  info: '#2196F3',
  icon: {
    primary: '#8B00FF',
    secondary: '#666666',
    active: '#8B00FF',
    inactive: '#666666',
  },
  gold: '#FFD700',
  green: '#4CAF50',
  orange: '#FF9800',
  overlay: 'rgba(0, 0, 0, 0.8)',
  tabBar: {
    active: '#8B00FF',
    inactive: '#666666',
  },
  button: {
    primary: '#8B00FF',
    primaryText: '#FFFFFF',
    border: '#8B00FF',
    disabled: '#333333',
  },
  loading: '#8B00FF',
  refresh: '#8B00FF',
};

export const theme = {
  colors: AppColors,
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  typography: {
    fontSize: {
      xs: 11,
      sm: 12,
      md: 14,
      lg: 16,
      xl: 18,
      xxl: 20,
      xxxl: 24,
      huge: 28,
    },
    fontWeight: {
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
    },
  },
  iconSize: {
    sm: 16,
    md: 20,
    lg: 24,
    xl: 28,
    xxl: 32,
  },
  hitSlop: {
    sm: { top: 8, bottom: 8, left: 8, right: 8 },
    md: { top: 12, bottom: 12, left: 12, right: 12 },
    lg: { top: 16, bottom: 16, left: 16, right: 16 },
  },
  elevation: {
    sm: {},
    md: {},
  },
} as const;

// Export Colors object that matches what live.jsa components expect
export const Colors = {
  bg: AppColors.background.primary,
  surface: AppColors.background.elevated,
  cardBg: AppColors.background.secondary,
  border: AppColors.border.primary,
  textPrimary: AppColors.text.primary,
  textMuted: AppColors.text.secondary,
  primary: AppColors.primary.main,
  primaryDim: AppColors.primary.light,
  gold: AppColors.gold,
  liveRed: '#FF0000', // Add this if needed for live indicator
  text: {
    primary: AppColors.text.primary,
    secondary: AppColors.text.secondary,
  },
} as const;

// Export additional theme constants that live.jsa components expect
export const Spacing = theme.spacing;
export const Radius = theme.borderRadius;
export const FontSize = theme.typography.fontSize;
