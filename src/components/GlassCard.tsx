import React, { useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle, Platform, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../themes/ThemeContext';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  glowColor?: string;
  intensity?: 'light' | 'medium' | 'heavy';
  onPress?: () => void;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const tintMap = { light: 'light' as const, medium: 'light' as const, heavy: 'dark' as const };

export default function GlassCard({
  children,
  style,
  glowColor,
  intensity = 'light',
  onPress,
}: GlassCardProps) {
  const { colors, radius } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => { Animated.spring(scale, { toValue: 0.97, damping: 15, stiffness: 200, useNativeDriver: true }).start(); };
  const handlePressOut = () => { Animated.spring(scale, { toValue: 1, damping: 15, stiffness: 200, useNativeDriver: true }).start(); };

  const animStyle = { transform: [{ scale }] };

  const blurIntensity = { light: 20, medium: 40, heavy: 60 }[intensity];
  const baseStyle = {
    overflow: 'hidden' as const,
    borderRadius: radius.lg,
  };

  const glowStyle = glowColor ? {
    shadowColor: glowColor,
    shadowOffset: { width: 0, height: 0 } as any,
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
  } : null;

  const childrenWithGlow = glowColor ? (
    <>
      {children}
      <View
        style={{
          position: 'absolute',
          top: -40,
          right: -40,
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: glowColor,
          opacity: 0.08,
        }}
      />
    </>
  ) : children;

  const inner = (
    <BlurView
      intensity={blurIntensity}
      tint={tintMap[intensity]}
      style={[
        baseStyle,
        {
          borderWidth: 1,
          borderColor: Platform.OS === 'ios' ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.2)',
        },
        glowStyle,
        style,
      ]}
    >
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: radius.lg,
            backgroundColor: colors.primary,
            opacity: { light: 0.03, medium: 0.06, heavy: 0.1 }[intensity],
          },
        ]}
      />
      {childrenWithGlow}
    </BlurView>
  );

  if (onPress) {
    return (
      <AnimatedTouchable
        activeOpacity={1}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[baseStyle, animStyle]}
      >
        {inner}
      </AnimatedTouchable>
    );
  }

  return inner;
}
