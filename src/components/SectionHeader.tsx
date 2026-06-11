import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../themes/ThemeContext';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function SectionHeader({ title, actionLabel, onAction }: SectionHeaderProps) {
  const { colors, spacing, typography } = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.md,
      }}
    >
      <Text
        style={{
          fontSize: typography.fontSize.headlineMedium,
          fontWeight: '600',
          color: colors.textPrimary,
        }}
      >
        {title}
      </Text>
      {actionLabel && onAction && (
        <TouchableOpacity onPress={onAction} activeOpacity={0.7}>
          <Text
            style={{
              fontSize: typography.fontSize.bodySmall,
              color: colors.primary,
              fontWeight: '500',
            }}
          >
            {actionLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
