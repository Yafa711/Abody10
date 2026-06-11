import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../themes/ThemeContext';
import Button from './ui/Button';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon = 'heart-outline',
  title,
  message,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const { colors, spacing, typography } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
      }}
    >
      <Ionicons name={icon} size={64} color={colors.textTertiary} />
      <Text
        style={{
          fontSize: typography.fontSize.titleLarge,
          fontWeight: '600',
          color: colors.textPrimary,
          marginTop: spacing.lg,
          textAlign: 'center',
        }}
      >
        {title}
      </Text>
      {message && (
        <Text
          style={{
            fontSize: typography.fontSize.bodyMedium,
            color: colors.textSecondary,
            marginTop: spacing.sm,
            textAlign: 'center',
            lineHeight: 22,
          }}
        >
          {message}
        </Text>
      )}
      {actionLabel && onAction && (
        <View style={{ marginTop: spacing.xl }}>
          <Button onPress={onAction}>{actionLabel}</Button>
        </View>
      )}
    </View>
  );
}
