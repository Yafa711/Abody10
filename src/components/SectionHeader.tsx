import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View
          style={{
            width: 3,
            height: 18,
            borderRadius: 2,
            backgroundColor: colors.primary,
            marginRight: spacing.sm,
          }}
        />
        <Text
          style={{
            fontSize: typography.fontSize.headlineSmall,
            fontWeight: '700',
            color: colors.textPrimary,
          }}
        >
          {title}
        </Text>
      </View>
      {actionLabel && onAction && (
        <TouchableOpacity
          onPress={onAction}
          activeOpacity={0.7}
          style={{ flexDirection: 'row', alignItems: 'center' }}
        >
          <Text
            style={{
              fontSize: typography.fontSize.bodySmall,
              color: colors.primary,
              fontWeight: '600',
            }}
          >
            {actionLabel}
          </Text>
          <Ionicons name="chevron-back" size={16} color={colors.primary} style={{ marginRight: -2 }} />
        </TouchableOpacity>
      )}
    </View>
  );
}
