import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import { useTheme } from '../themes/ThemeContext';

interface SkeletonBoxProps {
  width?: number | string;
  height: number;
  borderRadius?: number;
  style?: any;
}

function SkeletonBox({ width = '100%', height, borderRadius = 8, style }: SkeletonBoxProps) {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
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
        },
        { opacity },
        style,
      ]}
    />
  );
}

export function ProductSkeleton({ horizontal = false }) {
  const { spacing } = useTheme();

  if (horizontal) {
    return (
      <View style={{ width: 160, marginRight: spacing.md }}>
        <SkeletonBox height={160} borderRadius={12} />
        <View style={{ padding: spacing.sm }}>
          <SkeletonBox height={14} width="90%" style={{ marginBottom: 6 }} />
          <SkeletonBox height={12} width="60%" />
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, marginBottom: spacing.md }}>
      <SkeletonBox height={180} borderRadius={12} />
      <View style={{ padding: spacing.md }}>
        <SkeletonBox height={16} width="85%" style={{ marginBottom: 6 }} />
        <SkeletonBox height={14} width="70%" style={{ marginBottom: 8 }} />
        <SkeletonBox height={18} width="40%" />
      </View>
    </View>
  );
}

export function BannerSkeleton() {
  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 10 }}>
      <SkeletonBox height={200} borderRadius={16} />
    </View>
  );
}

export function HomePageSkeleton() {
  const { spacing } = useTheme();
  return (
    <View style={{ padding: spacing.lg }}>
      <SkeletonBox height={200} borderRadius={16} style={{ marginBottom: spacing.xxl }} />
      <SkeletonBox height={16} width="30%" style={{ marginBottom: spacing.md }} />
      <View style={{ flexDirection: 'row', marginBottom: spacing.xxl }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBox key={i} width={64} height={64} borderRadius={32} style={{ marginRight: spacing.md }} />
        ))}
      </View>
      <SkeletonBox height={16} width="40%" style={{ marginBottom: spacing.md }} />
      <View style={{ flexDirection: 'row' }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <ProductSkeleton key={i} horizontal />
        ))}
      </View>
    </View>
  );
}

export default SkeletonBox;
