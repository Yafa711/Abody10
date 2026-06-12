import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTheme } from '../themes/ThemeContext';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function SectionHeader({ title, actionLabel, onAction }: SectionHeaderProps) {
  const { colors, spacing, typography } = useTheme();
  const scale = useSharedValue(1);
  const handlePressIn = () => { scale.value = withSpring(0.95, { damping: 15, stiffness: 200 }); };
  const handlePressOut = () => { scale.value = withSpring(1, { damping: 15, stiffness: 200 }); };
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

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
