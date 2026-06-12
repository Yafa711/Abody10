export const Colors = {
  background: '#FFFFFF',
  surface: '#FAFAFA',
  surfaceVariant: '#F3F4F6',

  primary: '#6D28D9',
  primaryVariant: '#7C3AED',
  primaryLight: '#EDE9FE',

  secondary: '#F59E0B',
  secondaryVariant: '#D97706',
  secondaryLight: '#FEF3C7',

  onPrimary: '#FFFFFF',
  onSecondary: '#FFFFFF',
  onBackground: '#111827',
  onSurface: '#111827',
  onSurfaceVariant: '#374151',

  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',

  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#6D28D9',

  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  divider: '#E5E7EB',

  hoverOverlay: 'rgba(109, 40, 217, 0.08)',
  pressOverlay: 'rgba(109, 40, 217, 0.15)',
  disabledOverlay: 'rgba(0, 0, 0, 0.12)',

  shadow: 'rgba(0, 0, 0, 0.08)',
  transparent: 'transparent',
};

export const Typography = {
  fontFamily: {
    heading: 'System',
    body: 'System',
    mono: 'System',
  },
  fontSize: {
    displayLarge: 32,
    displayMedium: 28,
    displaySmall: 24,
    headlineLarge: 24,
    headlineMedium: 20,
    headlineSmall: 18,
    titleLarge: 18,
    titleMedium: 16,
    titleSmall: 15,
    bodyLarge: 16,
    bodyMedium: 14,
    bodySmall: 12,
    labelLarge: 14,
    labelMedium: 12,
    labelSmall: 11,
  },
  fontWeight: {
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
    black: '900',
  },
  lineHeight: {
    displayLarge: 1.2,
    displayMedium: 1.2,
    displaySmall: 1.2,
    headlineLarge: 1.3,
    headlineMedium: 1.3,
    headlineSmall: 1.3,
    titleLarge: 1.4,
    titleMedium: 1.4,
    titleSmall: 1.4,
    bodyLarge: 1.5,
    bodyMedium: 1.5,
    bodySmall: 1.4,
    labelLarge: 1.4,
    labelMedium: 1.4,
    labelSmall: 1.3,
  },
  letterSpacing: {
    displayLarge: -0.5,
    displayMedium: -0.5,
    displaySmall: -0.5,
    headlineLarge: -0.5,
    headlineMedium: -0.5,
    headlineSmall: -0.5,
    titleLarge: 0,
    titleMedium: 0,
    titleSmall: 0,
    bodyLarge: 0,
    bodyMedium: 0,
    bodySmall: 0,
    labelLarge: 0.5,
    labelMedium: 0.5,
    labelSmall: 0.5,
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
  xxxxl: 40,
};

export const Radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
};

export const Elevation = {
  none: [0, 0, 0, 0, '#000000', 0],
  1: [0, 1, 2, 0, '#000000', 0.05],
  2: [0, 2, 4, -1, '#000000', 0.06],
  3: [0, 4, 6, -2, '#000000', 0.07],
  4: [0, 6, 10, -3, '#000000', 0.08],
  6: [0, 8, 16, -4, '#000000', 0.09],
  8: [0, 12, 24, -6, '#000000', 0.10],
  10: [0, 16, 32, -8, '#000000', 0.12],
};

export const Motion = {
  duration: {
    fast: 100,
    normal: 200,
    slow: 300,
  },
  easing: {
    standard: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    easeOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    spring: 'cubic-bezier(0.4, 0, 0.2, 1)',
    snap: 'cubic-bezier(0.4, 0, 0.6, 1)',
  },
};

export const Theme = {
  dark: {
    colors: Colors,
    typography: Typography,
    spacing: Spacing,
    radius: Radius,
    elevation: Elevation,
    motion: Motion,
  },
};

export default Theme;
