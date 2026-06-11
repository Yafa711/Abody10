import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../themes/ThemeContext';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export function SkeletonLoader({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
}: SkeletonLoaderProps) {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: colors.surfaceVariant,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function CardSkeleton({ style }: { style?: StyleProp<ViewStyle> }) {
  const { spacing, radius } = useTheme();

  return (
    <View
      style={[
        {
          backgroundColor: 'transparent',
          borderRadius: radius.md,
          padding: spacing.md,
        },
        style,
      ]}
    >
      <SkeletonLoader height={160} borderRadius={radius.sm} style={{ marginBottom: spacing.sm }} />
      <SkeletonLoader width="70%" height={16} style={{ marginBottom: spacing.xs }} />
      <SkeletonLoader width="50%" height={14} />
    </View>
  );
}

export function ListSkeleton({ count = 4 }: { count?: number }) {
  const { spacing } = useTheme();
  return (
    <View style={{ padding: spacing.md }}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} style={{ marginBottom: spacing.md }} />
      ))}
    </View>
  );
}
