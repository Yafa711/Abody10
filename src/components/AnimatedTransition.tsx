import React, { useRef, useEffect } from 'react';
import { Animated, StyleProp, ViewStyle } from 'react-native';

interface AnimatedTransitionProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  delay?: number;
  duration?: number;
  type?: 'fade' | 'slideUp' | 'slideRight' | 'scale';
}

export function AnimatedTransition({
  children,
  style,
  delay = 0,
  duration = 300,
  type = 'fade',
}: AnimatedTransitionProps) {
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: 1,
      duration,
      delay,
      useNativeDriver: true,
    }).start();
  }, []);

  const getAnimatedStyle = () => {
    switch (type) {
      case 'fade':
        return { opacity: animValue };
      case 'slideUp':
        return {
          opacity: animValue,
          transform: [{
            translateY: animValue.interpolate({
              inputRange: [0, 1],
              outputRange: [30, 0],
            }),
          }],
        };
      case 'slideRight':
        return {
          opacity: animValue,
          transform: [{
            translateX: animValue.interpolate({
              inputRange: [0, 1],
              outputRange: [-30, 0],
            }),
          }],
        };
      case 'scale':
        return {
          opacity: animValue,
          transform: [{
            scale: animValue.interpolate({
              inputRange: [0, 1],
              outputRange: [0.9, 1],
            }),
          }],
        };
    }
  };

  return (
    <Animated.View style={[getAnimatedStyle(), style]}>
      {children}
    </Animated.View>
  );
}

export function StaggeredTransition({
  children,
  staggerDelay = 80,
  baseDelay = 0,
  type = 'slideUp',
}: {
  children: React.ReactNode[];
  staggerDelay?: number;
  baseDelay?: number;
  type?: 'fade' | 'slideUp' | 'slideRight' | 'scale';
}) {
  return (
    <>
      {React.Children.map(children, (child, index) => (
        <AnimatedTransition
          key={index}
          delay={baseDelay + index * staggerDelay}
          type={type}
        >
          {child}
        </AnimatedTransition>
      ))}
    </>
  );
}
