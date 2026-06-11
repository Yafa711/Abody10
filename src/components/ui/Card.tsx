import React from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../../themes/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'elevated' | 'outlined' | 'filled';
  padded?: boolean;
}

export default function Card({
  children,
  style,
  variant = 'elevated',
  padded = true,
}: CardProps) {
  const { colors, spacing, radius } = useTheme();

  const variantStyles: Record<string, ViewStyle> = {
    elevated: {
      backgroundColor: colors.surface,
      ...({} as ViewStyle),
    },
    outlined: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    filled: {
      backgroundColor: colors.surfaceVariant,
    },
  };

  return (
    <View
      style={[
        {
          borderRadius: radius.lg,
          padding: padded ? spacing.lg : 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 4,
        },
        variantStyles[variant],
        style,
      ]}
    >
      {children}
    </View>
  );
}
