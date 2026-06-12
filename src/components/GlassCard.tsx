import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../themes/ThemeContext';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  glowColor?: string;
  intensity?: 'light' | 'medium' | 'heavy';
}

export default function GlassCard({
  children,
  style,
  glowColor,
  intensity = 'light',
}: GlassCardProps) {
  const { colors, radius } = useTheme();

  const opacityMap = { light: 0.05, medium: 0.1, heavy: 0.15 };

  return (
    <View
      style={[
        {
          position: 'relative',
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.3)',
          backgroundColor: 'rgba(255,255,255,0.7)',
          borderRadius: radius.lg,
        },
        glowColor ? {
          shadowColor: glowColor,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.3,
          shadowRadius: 20,
          elevation: 10,
        } : null,
        style,
      ]}
    >
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: radius.lg,
            backgroundColor: colors.primary,
            opacity: opacityMap[intensity],
          },
        ]}
      />
      {children}
    </View>
  );
}
