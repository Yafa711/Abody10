import { useRef } from 'react';
import { Animated } from 'react-native';

export function useScrollAnimation() {
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollDirection = useRef<'up' | 'down'>('up');

  const scrollHandler = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: true,
      listener: (event: any) => {
        const offset = event.nativeEvent.contentOffset.y;
        scrollDirection.current = offset > 0 ? 'down' : 'up';
      },
    },
  );

  return { scrollY, scrollDirection, scrollHandler };
}

export function useParallax(scrollY: Animated.Value, factor: number = 0.3) {
  return scrollY.interpolate({
    inputRange: [-100, 0, 100],
    outputRange: [factor * 100, 0, -factor * 100],
    extrapolate: 'clamp',
  });
}

export function useOpacityByScroll(
  scrollY: Animated.Value,
  start: number,
  end: number,
) {
  return scrollY.interpolate({
    inputRange: [start, end],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
}

export function useScaleByScroll(
  scrollY: Animated.Value,
  start: number,
  end: number,
) {
  return scrollY.interpolate({
    inputRange: [start, end],
    outputRange: [1, 0.85],
    extrapolate: 'clamp',
  });
}
