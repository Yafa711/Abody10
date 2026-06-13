import React, { useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Animated } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GAP = 12;
const PADDING = 16;
const AVAILABLE_WIDTH = SCREEN_WIDTH - PADDING * 2;

interface BentoItem {
  key: string;
  span: 1 | 2;
  height: number;
  children: React.ReactNode;
  onPress?: () => void;
}

interface BentoGridProps {
  items: BentoItem[];
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

function BentoCell({ item, index, columnWidth }: { item: BentoItem; index: number; columnWidth: number }) {
  const scale = useRef(new Animated.Value(1)).current;
  const handlePressIn = () => { Animated.spring(scale, { toValue: 0.97, damping: 15, stiffness: 200, useNativeDriver: true }).start(); };
  const handlePressOut = () => { Animated.spring(scale, { toValue: 1, damping: 15, stiffness: 200, useNativeDriver: true }).start(); };
  const animStyle = { transform: [{ scale }] };

  const width = item.span === 2 ? AVAILABLE_WIDTH : columnWidth;
  const cellStyle = {
    width,
    height: item.height,
    marginRight: index % 2 === 0 && item.span === 1 ? GAP : 0,
    marginBottom: GAP,
    overflow: 'hidden' as const,
  };

  if (item.onPress) {
    return (
      <AnimatedTouchable
        activeOpacity={0.95}
        onPress={item.onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[cellStyle, animStyle]}
      >
        {item.children}
      </AnimatedTouchable>
    );
  }

  return <View style={cellStyle}>{item.children}</View>;
}

export default function BentoGrid({ items }: BentoGridProps) {
  const columnWidth = (AVAILABLE_WIDTH - GAP) / 2;

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {items.map((item, index) => (
          <BentoCell key={item.key} item={item} index={index} columnWidth={columnWidth} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: PADDING,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    marginBottom: GAP,
    overflow: 'hidden',
  },
});
