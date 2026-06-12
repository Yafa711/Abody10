import React from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../themes/ThemeContext';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  glowColor?: string;
  intensity?: 'light' | 'medium' | 'heavy';
  onPress?: () => void;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function GlassCard({
  children,
  style,
  glowColor,
  intensity = 'light',
  onPress,
}: GlassCardProps) {
  const { colors, radius } = useTheme();
  const scale = useSharedValue(1);

  const opacityMap = { light: 0.05, medium: 0.1, heavy: 0.15 };

  const handlePressIn = () => { scale.value = withSpring(0.97, { damping: 15, stiffness: 200 }); };
  const handlePressOut = () => { scale.value = withSpring(1, { damping: 15, stiffness: 200 }); };

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const content = (
    <>
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
    </>
  );

  if (onPress) {
    return (
      <AnimatedTouchable
        activeOpacity={1}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
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
          animStyle,
          style,
        ]}
      >
        {content}
      </AnimatedTouchable>
    );
  }

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
      {content}
    </View>
  );
}
