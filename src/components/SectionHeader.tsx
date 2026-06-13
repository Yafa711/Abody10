import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../themes/ThemeContext';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function SectionHeader({ title, actionLabel, onAction }: SectionHeaderProps) {
  const { colors, spacing, typography } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const handlePressIn = () => { Animated.spring(scale, { toValue: 0.95, damping: 15, stiffness: 200, useNativeDriver: true }).start(); };
  const handlePressOut = () => { Animated.spring(scale, { toValue: 1, damping: 15, stiffness: 200, useNativeDriver: true }).start(); };
  const animStyle = { transform: [{ scale }] };

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
        <AnimatedTouchable
          onPress={onAction}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
          style={[{ flexDirection: 'row', alignItems: 'center' }, animStyle]}
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
        </AnimatedTouchable>
      )}
    </View>
  );
}
