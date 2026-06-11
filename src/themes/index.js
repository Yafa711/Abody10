// Theme configuration for NewElectroStore
// Following the UI/UX Pro Max skill recommendations for luxury e-commerce

/**
 * Color palette based on UI/UX Pro Max principles
 * Deep graphite background with warm amber-gold accent for premium feel
 */
export const Colors = {
  // Primary palette
  background: '#0D0D0D',          // Deep Graphite - main background
  surface: '#141414',             // Slightly Lighter Graphite - cards, containers
  surfaceVariant: '#1C1C1C',      // For elevated surfaces

  // Accent colors
  primary: '#D4A853',             // Warm Amber-Gold - primary accent
  primaryVariant: '#B88C3A',      // Darker Amber for pressed states
  secondary: '#00D4AA',           // Electric Teal - secondary accent
  secondaryVariant: '#00B898',    // Darker Teal for pressed states

  // Text colors
  onPrimary: '#FFFFFF',           // White text on primary background
  onSecondary: '#000000',         // Black text on secondary background
  onBackground: '#FFFFFF',        // White text on background
  onSurface: '#FFFFFF',           // White text on surface
  onSurfaceVariant: '#E0E0E0',    // Light gray text on surface variant

  // Text hierarchy
  textPrimary: '#FFFFFF',         // Primary text
  textSecondary: '#E0E0E0',       // Secondary text
  textTertiary: '#B0B0B0',        // Tertiary text (hints, disabled)

  // Status colors
  success: '#34C759',             // Green for positive actions
  warning: '#FF9500',             // Orange for cautionary actions
  error: '#FF3B30',               // Red for destructive actions
  info: '#00D4AA',                // Teal for informational actions

  // Border and divider
  border: '#2C2C2C',              // Subtle separation
  borderLight: '#3C3C3C',         // Lighter border for subtle separation
  divider: '#1C1C1C',             // Divider between sections

  // Interactive states
  hoverOverlay: 'rgba(212, 168, 83, 0.1)',   // 10% amber overlay for hover
  pressOverlay: 'rgba(212, 168, 83, 0.2)',   // 20% amber overlay for press
  disabledOverlay: 'rgba(0, 0, 0, 0.3)',    // 30% black overlay for disabled

  // Shadows (for elevation)
  shadow: 'rgba(0, 0, 0, 0.25)',

  // Transparent
  transparent: 'transparent',
};

/**
 * Typography scale based on UI/UX Pro Max recommendations
 * Base size: 16px
 */
export const Typography = {
  // Font families (would need to be configured in app.json or via expo-font)
  // For now, using system fonts with similar characteristics
  fontFamily: {
    heading: 'System',      // Would be Cormorant Garamond or Playfair Display
    body: 'System',         // Would be Inter or SF Pro Text
    mono: 'System',         // For code-like text
  },

  // Font sizes
  fontSize: {
    displayLarge: 32,       // Splash/onboarding headers
    displayMedium: 28,
    displaySmall: 24,
    headlineLarge: 24,      // Main screen titles
    headlineMedium: 20,     // Section headers
    headlineSmall: 18,      // Card titles, product names
    titleLarge: 18,
    titleMedium: 16,
    titleSmall: 15,
    bodyLarge: 16,          // Primary text
    bodyMedium: 14,
    bodySmall: 12,
    labelLarge: 14,
    labelMedium: 12,
    labelSmall: 11,
  },

  // Font weights
  fontWeight: {
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
    black: '900',
  },

  // Line heights (unitless)
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

  // Letter spacing (in pixels)
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
    labelLarge: 0.5,        // Uppercase letter spacing
    labelMedium: 0.5,
    labelSmall: 0.5,
  },
};

/**
 * Spacing system based on 8-point grid
 */
export const Spacing = {
  xs: 4,   // 0.5 unit
  sm: 8,   // 1 unit
  md: 12,  // 1.5 units
  lg: 16,  // 2 units
  xl: 20,  // 2.5 units
  xxl: 24, // 3 units
  xxxl: 32,// 4 units
  xxxxl: 40,// 5 units
};

/**
 * Border radius values
 */
export const Radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999, // For pills and circles
};

/**
 * Elevation/shadow values (for Android) or iOS shadow equivalents
 * Format: [width, height, blur, spread, color, opacity]
 */
export const Elevation = {
  none: [0, 0, 0, 0, '#000000', 0],
  1: [0, 1, 2, 0, '#000000', 0.05],
  2: [0, 2, 4, -1, '#000000', 0.08],
  3: [0, 3, 6, -3, '#000000', 0.11],
  4: [0, 4, 8, -5, '#000000', 0.14],
  6: [0, 6, 12, -8, '#000000', 0.18],
  8: [0, 8, 16, -10, '#000000', 0.20],
  9: [0, 9, 18, -10, '#000000', 0.22],
  10: [0, 10, 20, -10, '#000000', 0.23],
  12: [0, 12, 24, -12, '#000000', 0.25],
  16: [0, 16, 32, -12, '#000000', 0.27],
  24: [0, 24, 48, -16, '#000000', 0.30],
};

/**
 * Duration and easing for animations
 */
export const Motion = {
  // Duration in milliseconds
  duration: {
    fast: 100,
    normal: 200,
    slow: 300,
  },

  // Easing functions (CSS cubic-bezier format)
  easing: {
    // Standard ease-in-out for most transitions
    standard: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    // Ease-out for entrances
    easeOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
    // Ease-in for exits
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    // Spring-like for interactive elements
    spring: 'cubic-bezier(0.4, 0, 0.2, 1)',
    // Quick snap for toggles
    snap: 'cubic-bezier(0.4, 0, 0.6, 1)',
  },
};

/**
 * Theme object combining all design tokens
 */
export const Theme = {
  dark: {
    colors: Colors,
    typography: Typography,
    spacing: Spacing,
    radius: Radius,
    elevation: Elevation,
    motion: Motion,
  },

  // Light theme could be added here if needed
  // light: { ... }
};

// Export individual categories for easy access

// Default export is the theme
export default Theme;