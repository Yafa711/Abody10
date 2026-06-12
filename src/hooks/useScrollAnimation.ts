import { useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';

export function useScrollAnimation() {
  const scrollY = useSharedValue(0);
  const scrollDirection = useSharedValue<'up' | 'down'>('up');
  const previousOffset = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const offset = event.contentOffset.y;
      scrollDirection.value = offset > previousOffset.value ? 'down' : 'up';
      scrollY.value = offset;
      previousOffset.value = offset;
    },
  });

  return { scrollY, scrollDirection, scrollHandler };
}

export function useParallax(scrollY: { value: number }, factor: number = 0.3) {
  'worklet';
  return -scrollY.value * factor;
}

export function useOpacityByScroll(
  scrollY: { value: number },
  start: number,
  end: number,
) {
  'worklet';
  const clamped = Math.max(0, Math.min(1, (scrollY.value - start) / (end - start)));
  return 1 - clamped;
}

export function useScaleByScroll(
  scrollY: { value: number },
  start: number,
  end: number,
) {
  'worklet';
  const progress = Math.max(0, Math.min(1, (scrollY.value - start) / (end - start)));
  return 1 - progress * 0.15;
}
