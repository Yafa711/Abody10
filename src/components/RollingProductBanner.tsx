import React, { useEffect, useRef } from 'react';
import { View, Image, Dimensions, StyleSheet, Animated, Easing, TouchableOpacity } from 'react-native';
import { useTheme } from '../themes/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_HEIGHT = 340;
const PRODUCT_SIZE = 110;
const PIVOT_Y = 30;

interface Product {
  id: string;
  image_url: string;
  title?: string;
}

interface RollingProductBannerProps {
  products: Product[];
  onProductPress?: (product: Product) => void;
}

function AnimatedProduct({
  product,
  index,
  total,
  onProductPress,
}: {
  product: Product;
  index: number;
  total: number;
  onProductPress?: (product: Product) => void;
}) {
  const { colors } = useTheme();
  const swingAnim = useRef(new Animated.Value(0)).current;
  const enterAnim = useRef(new Animated.Value(0)).current;
  const [imageLoaded, setImageLoaded] = React.useState(false);

  const staggerDelay = (index / total) * 1200;

  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.spring(enterAnim, { toValue: 1, damping: 14, stiffness: 100, useNativeDriver: true }).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(swingAnim, {
            toValue: 1,
            duration: 3000 + index * 300,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(swingAnim, {
            toValue: 0,
            duration: 3000 + index * 300,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
        { iterations: -1 },
      ).start();
    }, staggerDelay);

    return () => clearTimeout(timeout);
  }, []);

  const startX = (SCREEN_WIDTH / (total + 1)) * (index + 1);
  const arcWidth = SCREEN_WIDTH * 0.35;

  // Swing: 0 → far right, 0.5 → center, 1 → far left
  const translateX = swingAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [startX + arcWidth, startX, startX - arcWidth],
  });

  const translateY = swingAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [120, 90, 120],
  });

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.productContainer,
        {
          opacity: enterAnim,
          transform: [
            { translateX },
            { translateY },
          ],
        },
      ]}
    >
      <View style={[styles.rope, { backgroundColor: colors.textTertiary }]} />
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onProductPress?.(product)}
        style={[styles.imageWrapper, { backgroundColor: colors.surface }]}
      >
        {!imageLoaded && (
          <View style={[styles.placeholder, { backgroundColor: colors.surfaceVariant }]} />
        )}
        <Image
          source={{ uri: product.image_url }}
          style={styles.productImage}
          resizeMode="contain"
          onLoad={() => setImageLoaded(true)}
        />
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function RollingProductBanner({ products, onProductPress }: RollingProductBannerProps) {
  const { colors } = useTheme();
  const displayProducts = products.slice(0, 4);
  if (displayProducts.length === 0) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.pivotBar, { backgroundColor: colors.primary }]}>
        <View style={[styles.pivotDot, { backgroundColor: colors.primary }]} />
      </View>
      {displayProducts.map((product, index) => (
        <AnimatedProduct
          key={product.id}
          product={product}
          index={index}
          total={displayProducts.length}
          onProductPress={onProductPress}
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
  pivotBar: {
    position: 'absolute',
    top: PIVOT_Y,
    left: 0,
    right: 0,
    height: 2,
    opacity: 0.3,
  },
  pivotDot: {
    position: 'absolute',
    top: PIVOT_Y - 3,
    alignSelf: 'center',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  productContainer: {
    position: 'absolute',
    top: PIVOT_Y,
    width: PRODUCT_SIZE,
    height: PRODUCT_SIZE + 100,
    alignItems: 'center',
  },
  rope: {
    width: 2,
    height: 60,
  },
  imageWrapper: {
    width: PRODUCT_SIZE,
    height: PRODUCT_SIZE,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
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
    bottom: 16,
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
