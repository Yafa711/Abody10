import React from 'react';
import { View } from 'react-native';
import Skeleton from './Skeleton';
import { useTheme } from '../themes/ThemeContext';

export default function ProductCardSkeleton() {
  const { spacing, radius } = useTheme();

  return (
    <View
      style={{
        width: 160,
        borderRadius: radius.md,
        overflow: 'hidden',
        marginRight: spacing.md,
      }}
    >
      <Skeleton height={160} borderRadius={0} />
      <View style={{ padding: spacing.sm }}>
        <Skeleton height={14} width="80%" style={{ marginBottom: spacing.xs }} />
        <Skeleton height={12} width="50%" />
      </View>
    </View>
  );
}
