import React, { useEffect, useRef, useState } from 'react';
import { View, Image, ScrollView, Dimensions, TouchableOpacity, Animated } from 'react-native';
import { useTheme } from '../themes/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_HEIGHT = 220;

interface HeroBannerItem {
  id: string;
  image_url: string;
}

interface HeroBannerProps {
  items: HeroBannerItem[];
  onPress?: (item: HeroBannerItem) => void;
  interval?: number;
}

function BannerSlide({ item, index, activeIndex, onPress }: {
  item: HeroBannerItem;
  index: number;
  activeIndex: number;
  onPress?: (item: HeroBannerItem) => void;
}) {
  const scale = useRef(new Animated.Value(0.85)).current;
  const opacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const isActive = index === activeIndex;
    Animated.spring(scale, { toValue: isActive ? 1 : 0.85, damping: 15, stiffness: 100, useNativeDriver: true }).start();
    Animated.spring(opacity, { toValue: isActive ? 1 : 0.6, damping: 15, stiffness: 100, useNativeDriver: true }).start();
  }, [activeIndex]);

  return (
    <Animated.View style={[{ width: SCREEN_WIDTH - 32, marginHorizontal: 16, height: BANNER_HEIGHT }, { transform: [{ scale }], opacity }]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => onPress?.(item)}
        style={{ flex: 1, borderRadius: 16, overflow: 'hidden' }}
      >
        <Image
          source={{ uri: item.image_url }}
          style={{ width: '100%', height: BANNER_HEIGHT, resizeMode: 'cover' }}
        />
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 80,
            backgroundColor: 'rgba(0,0,0,0.15)',
          }}
        />
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function HeroBanner({ items, onPress, interval = 4000 }: HeroBannerProps) {
  const { colors } = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (items.length <= 1) return;
    timerRef.current = setInterval(() => {
      const nextIndex = (activeIndex + 1) % items.length;
      scrollRef.current?.scrollTo({ x: nextIndex * SCREEN_WIDTH, animated: true });
      setActiveIndex(nextIndex);
    }, interval);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeIndex, items.length, interval]);

  const handleScroll = (e: any) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (idx !== activeIndex) setActiveIndex(idx);
  };

  if (items.length === 0) return null;

  return (
    <View style={{ position: 'relative', height: BANNER_HEIGHT + 20, paddingVertical: 10 }}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={SCREEN_WIDTH}
      >
        {items.map((item, index) => (
          <BannerSlide
            key={item.id}
            item={item}
            index={index}
            activeIndex={activeIndex}
            onPress={onPress}
          />
        ))}
      </ScrollView>

      {items.length > 1 && (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 6,
            marginTop: 8,
          }}
        >
          {items.map((_, i) => {
            const isActive = i === activeIndex;
            return (
              <View
                key={i}
                style={{
                  width: isActive ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: isActive ? colors.primary : colors.border,
                }}
              />
            );
          })}
        </View>
      )}
    </View>
  );
}
