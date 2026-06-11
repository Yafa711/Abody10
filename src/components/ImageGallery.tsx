import React, { useRef, useState } from 'react';
import {
  View,
  Image,
  ScrollView,
  Dimensions,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../themes/ThemeContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ImageGalleryProps {
  images: string[];
  initialIndex?: number;
}

export default function ImageGallery({ images, initialIndex = 0 }: ImageGalleryProps) {
  const { colors } = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [modalVisible, setModalVisible] = useState(false);

  const handleScroll = (e: any) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveIndex(idx);
  };

  if (images.length === 0) return null;

  return (
    <>
      <View style={{ position: 'relative', height: SCREEN_HEIGHT * 0.4 }}>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          scrollEventThrottle={16}
        >
          {images.map((uri, index) => (
            <TouchableOpacity
              key={index}
              activeOpacity={0.95}
              onPress={() => setModalVisible(true)}
              style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT * 0.4 }}
            >
              <Image
                source={{ uri }}
                style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT * 0.4, resizeMode: 'cover' }}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>

        {images.length > 1 && (
          <View
            style={{
              position: 'absolute',
              bottom: 16,
              left: 0,
              right: 0,
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            {images.map((_, i) => (
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

      <Modal visible={modalVisible} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.95)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <TouchableOpacity
            onPress={() => setModalVisible(false)}
            style={{
              position: 'absolute',
              top: 50,
              right: 20,
              zIndex: 10,
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(255,255,255,0.15)',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>

          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentOffset={{ x: activeIndex * SCREEN_WIDTH, y: 0 }}
          >
            {images.map((uri, index) => (
              <ScrollView
                key={index}
                style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
                contentContainerStyle={{
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                maximumZoomScale={3}
                minimumZoomScale={1}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                bouncesZoom
              >
                <Image
                  source={{ uri }}
                  style={{
                    width: SCREEN_WIDTH,
                    height: SCREEN_WIDTH,
                    resizeMode: 'contain',
                  }}
                />
              </ScrollView>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}
