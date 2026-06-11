import React, { useEffect, useRef, useState } from 'react';
import { View, Image, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { useTheme } from '../themes/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface HeroBannerItem {
  id: string;
  image_url: string;
}

interface HeroBannerProps {
  items: HeroBannerItem[];
  onPress?: (item: HeroBannerItem) => void;
  interval?: number;
}

export default function HeroBanner({ items, onPress, interval = 3000 }: HeroBannerProps) {
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
    setActiveIndex(idx);
  };

  if (items.length === 0) return null;

  return (
    <View style={{ position: 'relative', height: 200 }}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
      >
        {items.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.9}
            onPress={() => onPress?.(item)}
            style={{ width: SCREEN_WIDTH, height: 200 }}
          >
            <Image
              source={{ uri: item.image_url }}
              style={{ width: SCREEN_WIDTH, height: 200, resizeMode: 'cover' }}
            />
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 60,
                backgroundColor: 'rgba(0,0,0,0.3)',
              }}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {items.length > 1 && (
        <View
          style={{
            position: 'absolute',
            bottom: 12,
            left: 0,
            right: 0,
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          {items.map((_, i) => (
            <View
              key={i}
              style={{
                width: i === activeIndex ? 20 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: i === activeIndex ? colors.primary : 'rgba(255,255,255,0.4)',
              }}
            />
          ))}
        </View>
      )}
    </View>
  );
}
