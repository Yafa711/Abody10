import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../../themes/ThemeContext';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

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
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
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

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[baseStyle, variantStyle.container, animatedStyle, style]}
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
