import { TextStyle } from 'react-native';

interface ThemeColors {
  background: string;
  surface: string;
  surfaceVariant: string;
  primary: string;
  primaryVariant: string;
  secondary: string;
  secondaryVariant: string;
  onPrimary: string;
  onSecondary: string;
  onBackground: string;
  onSurface: string;
  onSurfaceVariant: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  border: string;
  borderLight: string;
  divider: string;
  hoverOverlay: string;
  pressOverlay: string;
  disabledOverlay: string;
  shadow: string;
  transparent: string;
}

interface ThemeTypography {
  fontFamily: {
    heading: string;
    body: string;
    mono: string;
  };
  fontSize: Record<string, number>;
  fontWeight: Record<string, TextStyle['fontWeight']>;
  lineHeight: Record<string, number>;
  letterSpacing: Record<string, number>;
}

interface ThemeSpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
  xxxl: number;
  xxxxl: number;
  [key: string]: number;
}

interface ThemeRadius {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxxl: number;
  pill: number;
  [key: string]: number;
}

interface ThemeElevation {
  none: [number, number, number, number, string, number];
  [key: number]: [number, number, number, number, string, number];
}

interface ThemeMotion {
  duration: {
    fast: number;
    normal: number;
    slow: number;
  };
  easing: {
    standard: string;
    easeOut: string;
    easeIn: string;
    spring: string;
    snap: string;
  };
}

interface Theme {
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  radius: ThemeRadius;
  elevation: ThemeElevation;
  motion: ThemeMotion;
}

export function useTheme(): Theme;
export const ThemeContext: React.Context<Theme>;
export const ThemeProvider: React.FC<{ children: React.ReactNode; themeName?: string }>;
