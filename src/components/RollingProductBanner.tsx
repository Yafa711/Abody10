import React, { useEffect, useRef } from 'react';
import { View, Image, Dimensions, StyleSheet, Animated, Easing } from 'react-native';
import { useTheme } from '../themes/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_HEIGHT = 420;
const ROPE_TOP = 20;
const ROPE_LENGTH = 120;

interface Product {
  id: string;
  image_url: string;
  title?: string;
}

interface RollingProductBannerProps {
  products: Product[];
}

function AnimatedProduct({
  product,
  index,
  total,
}: {
  product: Product;
  index: number;
  total: number;
}) {
  const { colors } = useTheme();
  const enterScale = useRef(new Animated.Value(0)).current;
  const enterOpacity = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(SCREEN_WIDTH + 200)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const swingAnim = useRef(new Animated.Value(0)).current;

  const staggerDelay = (index / total) * 3000;

  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.parallel([
        Animated.spring(enterScale, { toValue: 1, damping: 12, stiffness: 100, useNativeDriver: true }),
        Animated.spring(enterOpacity, { toValue: 1, damping: 12, stiffness: 100, useNativeDriver: true }),
      ]).start();

      Animated.loop(
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: -300,
            duration: 6000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(rotate, {
            toValue: 720,
            duration: 6000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(swingAnim, {
            toValue: 1,
            duration: 6000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
        { iterations: -1 },
      ).start();
    }, staggerDelay);

    return () => clearTimeout(timeout);
  }, []);

  const swingY = swingAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 60],
  });

  const ropeAngle = swingAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0rad', '0.3rad', '0rad'],
  });

  const [imageLoaded, setImageLoaded] = React.useState(false);

  return (
    <Animated.View
      style={[
        styles.productContainer,
        {
          opacity: enterOpacity,
          transform: [
            { scale: enterScale },
            { translateX },
            { translateY: Animated.add(ROPE_LENGTH, swingY) },
            { rotate: rotate.interpolate({ inputRange: [0, 720], outputRange: ['0deg', '720deg'] }) },
            { rotate: ropeAngle },
          ],
        },
      ]}
    >
      <View style={styles.rope} />
      <View style={styles.imageWrapper}>
        {!imageLoaded && (
          <View style={[styles.placeholder, { backgroundColor: colors.surfaceVariant }]} />
        )}
        <Image
          source={{ uri: product.image_url }}
          style={styles.productImage}
          resizeMode="contain"
          onLoad={() => setImageLoaded(true)}
        />
      </View>
    </Animated.View>
  );
}

export default function RollingProductBanner({ products }: RollingProductBannerProps) {
  const { colors } = useTheme();
  const displayProducts = products.slice(0, 5);
  if (displayProducts.length === 0) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.gradientOverlay}>
        <View style={[styles.accentBar, { backgroundColor: colors.primary }]} />
      </View>

      <View style={styles.ropeAnchor}>
        <View style={[styles.ropeTopBar, { backgroundColor: colors.primary }]} />
      </View>

      {displayProducts.map((product, index) => (
        <AnimatedProduct
          key={product.id}
          product={product}
          index={index}
          total={displayProducts.length}
        />
      ))}

      <View style={styles.taglineContainer}>
        <View style={[styles.taglineBadge, { backgroundColor: colors.primary }]}>
          <Animated.Text style={styles.taglineText}>
            أحدث المنتجات
          </Animated.Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: BANNER_HEIGHT,
    overflow: 'hidden',
    position: 'relative',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: BANNER_HEIGHT,
  },
  accentBar: {
    height: 4,
    width: '100%',
    opacity: 0.15,
  },
  ropeAnchor: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  ropeTopBar: {
    width: 2,
    height: ROPE_TOP,
  },
  productContainer: {
    position: 'absolute',
    top: ROPE_TOP,
    width: 140,
    height: 140,
    alignItems: 'center',
  },
  rope: {
    width: 2,
    height: ROPE_LENGTH,
    backgroundColor: '#D1D5DB',
    position: 'absolute',
    top: -ROPE_LENGTH,
  },
  imageWrapper: {
    width: 140,
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  placeholder: {
    ...StyleSheet.absoluteFillObject,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  taglineContainer: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  taglineBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  taglineText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1,
  },
});
