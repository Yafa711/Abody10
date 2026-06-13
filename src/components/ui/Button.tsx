import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
  TextStyle,
  Animated,
} from 'react-native';
import { useTheme } from '../../themes/ThemeContext';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function Button({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
}: ButtonProps) {
  const { colors, spacing, radius, typography } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, damping: 15 }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, damping: 15 }).start();
  };

  const sizeStyles: Record<ButtonSize, { paddingVertical: number; paddingHorizontal: number; fontSize: number }> = {
    sm: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      fontSize: typography.fontSize.labelMedium,
    },
    md: {
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      fontSize: typography.fontSize.labelLarge,
    },
    lg: {
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.xxl,
      fontSize: typography.fontSize.bodyLarge,
    },
  };

  const sizeStyle = sizeStyles[size];

  const baseStyle: ViewStyle = {
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingVertical: sizeStyle.paddingVertical,
    paddingHorizontal: sizeStyle.paddingHorizontal,
  };

  const variantStyles: Record<ButtonVariant, { container: ViewStyle; text: TextStyle }> = {
    primary: {
      container: {
        backgroundColor: colors.primary,
        ...(disabled && { backgroundColor: colors.border }),
      },
      text: {
        color: colors.onPrimary,
        fontWeight: '600',
      },
    },
    secondary: {
      container: {
        backgroundColor: colors.secondary,
        ...(disabled && { backgroundColor: colors.border }),
      },
      text: {
        color: colors.onSecondary,
        fontWeight: '600',
      },
    },
    outline: {
      container: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: disabled ? colors.border : colors.primary,
      },
      text: {
        color: disabled ? colors.textTertiary : colors.primary,
        fontWeight: '600',
      },
    },
    ghost: {
      container: {
        backgroundColor: 'transparent',
      },
      text: {
        color: disabled ? colors.textTertiary : colors.primary,
        fontWeight: '500',
      },
    },
  };

  const variantStyle = variantStyles[variant];

  const animStyle = { transform: [{ scale }], opacity };

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[baseStyle, variantStyle.container, animStyle, style]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? colors.onPrimary : colors.primary}
        />
      ) : (
        <Text
          style={[
            {
              fontSize: sizeStyle.fontSize,
            },
            variantStyle.text,
            textStyle,
          ]}
        >
          {children}
        </Text>
      )}
    </AnimatedTouchable>
  );
}
