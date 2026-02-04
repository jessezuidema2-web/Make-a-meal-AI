import { Platform } from 'react-native';

// COLORS - White background with strategic accent
export const colors = {
  // Base
  white: '#FFFFFF',
  black: '#000000',

  // Text
  text: {
    primary: '#000000',
    secondary: '#333333',
    tertiary: '#666666',
    light: '#999999',
  },

  // Primary (keep existing blue)
  primary: '#007AFF',
  primaryLight: 'rgba(0, 122, 255, 0.1)',
  primaryMedium: 'rgba(0, 122, 255, 0.2)',

  // Accent - Blue (consistent with primary)
  accent: '#007AFF',
  accentLight: 'rgba(0, 122, 255, 0.08)',
  accentMedium: 'rgba(0, 122, 255, 0.15)',

  // Neutrals
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
  },

  // Semantic
  success: '#34C759',
  successLight: 'rgba(52, 199, 89, 0.1)',
  warning: '#FF9500',
  warningLight: 'rgba(255, 149, 0, 0.1)',
  error: '#FF3B30',
};

// TYPOGRAPHY - Platform-specific distinctive fonts
export const typography = {
  // Font families
  fonts: {
    // iOS - Avenir Next (elegant, modern)
    ios: {
      regular: 'Avenir Next',
      medium: 'AvenirNext-Medium',
      semibold: 'AvenirNext-DemiBold',
      bold: 'AvenirNext-Bold',
      heavy: 'AvenirNext-Heavy',
    },
    // Android - Roboto with extreme weights
    android: {
      thin: 'Roboto_100Thin',
      light: 'Roboto_300Light',
      regular: 'Roboto_400Regular',
      medium: 'Roboto_500Medium',
      bold: 'Roboto_700Bold',
      black: 'Roboto_900Black',
    },
  },

  // Size scale - extreme contrast
  sizes: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    '2xl': 32,
    '3xl': 40,
    '4xl': 48,
  },

  // Weight scale - use extremes
  weights: {
    light: '200' as const,
    normal: '400' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
  },

  // Line heights
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// Helper to get platform-specific font
export const getFont = (weight: 'light' | 'normal' | 'semibold' | 'bold' | 'heavy' = 'normal') => {
  if (Platform.OS === 'ios') {
    switch (weight) {
      case 'light': return typography.fonts.ios.regular;
      case 'normal': return typography.fonts.ios.regular;
      case 'semibold': return typography.fonts.ios.semibold;
      case 'bold': return typography.fonts.ios.bold;
      case 'heavy': return typography.fonts.ios.heavy;
    }
  }
  // Android - use system default with weight property instead
  return undefined;
};

// SPACING - generous whitespace
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
};

// BORDERS & RADIUS
export const borders = {
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    full: 9999,
  },
};

// SHADOWS - subtle elevation
export const shadows = {
  sm: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
  },
};
