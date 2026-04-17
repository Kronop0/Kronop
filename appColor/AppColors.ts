/**
 * Centralized App Color Management
 * Change colors from this single file to update entire app
 */

export const AppColors = {
  // Primary Colors
  primary: {
    main: '#8B00FF',      // Purple/Violet - Main brand color
    light: '#A833FF',      // Light Purple
    dark: '#6B00CC',       // Dark Purple
  },

  // Background Colors
  background: {
    primary: '#000000',    // Deep Black
    secondary: '#0A0A0A',  // Dark Gray
    tertiary: '#141414',   // Medium Dark Gray
    elevated: '#1A1A1A',   // Elevated Surface
  },

  // Text Colors
  text: {
    primary: '#FFFFFF',    // White text
    secondary: '#CCCCCC',  // Light Gray text
    tertiary: '#999999',   // Medium Gray text
    inverse: '#000000',    // Black text
  },

  // Border Colors
  border: {
    primary: '#333333',    // Default border
    secondary: '#444444',  // Light border
    light: '#2A2A2A',      // Very light border
  },

  // Status Colors
  success: '#8B00FF',      // Purple (for success states)
  error: '#A833FF',        // Light Purple (for error states)
  warning: '#FFAA00',      // Orange/Amber
  info: '#2196F3',         // Blue (for info states)

  // Icon Colors
  icon: {
    primary: '#8B00FF',    // Purple icons
    secondary: '#666666',  // Gray icons
    active: '#8B00FF',     // Active state icons
    inactive: '#666666',   // Inactive state icons
  },

  // Special Colors
  gold: '#FFD700',         // Gold for stars/ratings
  green: '#4CAF50',       // Green for success indicators
  orange: '#FF9800',      // Orange for views/engagement
  like: '#FF3B30',         // Like color (red)

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.8)', // Dark overlay

  // Tab Bar Colors
  tabBar: {
    active: '#8B00FF',     // Active tab color
    inactive: '#666666',   // Inactive tab color
  },

  // Button Colors
  button: {
    primary: '#8B00FF',    // Primary button background
    primaryText: '#FFFFFF', // Primary button text
    border: '#8B00FF',     // Button border
    disabled: '#333333',   // Disabled button
  },

  // Loading & Refresh
  loading: '#8B00FF',     // Loading spinner color
  refresh: '#8B00FF',     // Refresh control color

  // Aliases for compatibility with live.jsa components
  cardBg: '#141414',      // Card background (same as tertiary)
  borderColor: '#333333', // Border color (same as border.primary)
  textMuted: '#999999',   // Muted text (same as text.tertiary)
  textPrimary: '#FFFFFF', // Primary text (same as text.primary)
  textSecondary: '#CCCCCC', // Secondary text (same as text.secondary)
  surface: '#0A0A0A',     // Surface color (same as background.secondary)
  primaryDim: 'rgba(139, 0, 255, 0.15)', // Dimmed primary
  bg: '#000000',          // Background (same as background.primary)
  liveRed: '#FF3B30',     // Live indicator red
  accent: '#00D4FF',      // Accent color (cyan)
  accentDim: 'rgba(0, 212, 255, 0.15)', // Dimmed accent
};

// Export individual color categories for easy access
export const { 
  primary, 
  background, 
  text, 
  border, 
  success, 
  error, 
  warning, 
  info, 
  icon, 
  gold, 
  green, 
  orange, 
  overlay, 
  tabBar, 
  button, 
  loading, 
  refresh 
} = AppColors;

// Default export
export default AppColors;
