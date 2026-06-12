import React, { useEffect } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../themes/ThemeContext';
import { Product } from '../types/product';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  onFavorite?: () => void;
  isFavorited?: boolean;
  horizontal?: boolean;
  index?: number;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function ProductCard({
  product,
  onPress,
  onFavorite,
  isFavorited = false,
  horizontal = false,
  index = 0,
}: ProductCardProps) {
  const { colors, spacing, radius, typography } = useTheme();
  const scale = useSharedValue(1);
  const enterOpacity = useSharedValue(0);
  const enterTranslateY = useSharedValue(50);

  useEffect(() => {
    const delay = index * 80;
    setTimeout(() => {
      enterOpacity.value = withSpring(1, { damping: 14, stiffness: 100 });
      enterTranslateY.value = withSpring(0, { damping: 20, stiffness: 120 });
    }, delay);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const enterStyle = useAnimatedStyle(() => ({
    opacity: enterOpacity.value,
    transform: [{ translateY: enterTranslateY.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const currentPrice = product.flash_sale && product.flash_sale_price
    ? product.flash_sale_price
    : product.price;

  const hasDiscount = !!product.original_price && product.original_price > currentPrice;
  const discountPercent = hasDiscount
    ? Math.round(((product.original_price! - currentPrice) / product.original_price!) * 100)
    : 0;

  if (horizontal) {
    return (
      <AnimatedTouchable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        style={[
          {
            width: 160,
            borderRadius: radius.md,
            overflow: 'hidden',
            marginRight: spacing.md,
            backgroundColor: colors.surface,
          },
          animatedStyle,
          enterStyle,
        ]}
      >
        <View style={{ position: 'relative' }}>
          <Image
            source={{ uri: product.image_url }}
            style={{ width: 160, height: 160, resizeMode: 'cover' }}
          />
          {hasDiscount && (
            <View
              style={{
                position: 'absolute',
                top: 8,
                left: 8,
                backgroundColor: colors.error,
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 4,
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#fff' }}>
                -{discountPercent}%
              </Text>
            </View>
          )}
          {onFavorite && (
            <TouchableOpacity
              onPress={onFavorite}
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: 'rgba(0,0,0,0.4)',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={isFavorited ? 'heart' : 'heart-outline'}
                size={18}
                color={isFavorited ? colors.error : '#fff'}
              />
            </TouchableOpacity>
          )}
        </View>
        <View style={{ padding: spacing.sm }}>
          <Text
            numberOfLines={2}
            style={{
              fontSize: typography.fontSize.bodySmall,
              fontWeight: '500',
              color: colors.textPrimary,
              lineHeight: 18,
            }}
          >
            {product.title}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: spacing.xs }}>
            <Text
              style={{
                fontSize: typography.fontSize.titleSmall,
                fontWeight: '700',
                color: colors.primary,
              }}
            >
              {currentPrice} ريال
            </Text>
            {hasDiscount && (
              <Text
                style={{
                  fontSize: typography.fontSize.labelSmall,
                  color: colors.textTertiary,
                  textDecorationLine: 'line-through',
                  marginLeft: 4,
                }}
              >
                {product.original_price} ريال
              </Text>
            )}
          </View>
        </View>
      </AnimatedTouchable>
    );
  }

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
      style={[
        {
          flex: 1,
          borderRadius: radius.md,
          overflow: 'hidden',
          backgroundColor: colors.surface,
          marginBottom: spacing.md,
        },
        animatedStyle,
        enterStyle,
      ]}
    >
      <View style={{ position: 'relative' }}>
        <Image
          source={{ uri: product.image_url }}
          style={{ width: '100%', height: 180, resizeMode: 'cover' }}
        />
        {hasDiscount && (
          <View
            style={{
              position: 'absolute',
              top: 8,
              left: 8,
              backgroundColor: colors.error,
              paddingHorizontal: 6,
              paddingVertical: 2,
              borderRadius: 4,
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: '700', color: '#fff' }}>
              -{discountPercent}%
            </Text>
          </View>
        )}
        {onFavorite && (
          <TouchableOpacity
            onPress={onFavorite}
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: 'rgba(0,0,0,0.4)',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={isFavorited ? 'heart' : 'heart-outline'}
              size={18}
              color={isFavorited ? colors.error : '#fff'}
            />
          </TouchableOpacity>
        )}
      </View>
      <View style={{ padding: spacing.md }}>
        <Text
          numberOfLines={2}
          style={{
            fontSize: typography.fontSize.bodyMedium,
            fontWeight: '500',
            color: colors.textPrimary,
            lineHeight: 20,
          }}
        >
          {product.title}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: spacing.xs }}>
          <Text
            style={{
              fontSize: typography.fontSize.titleMedium,
              fontWeight: '700',
              color: colors.primary,
            }}
          >
            {currentPrice} ريال
          </Text>
          {hasDiscount && (
            <Text
              style={{
                fontSize: typography.fontSize.bodySmall,
                color: colors.textTertiary,
                textDecorationLine: 'line-through',
                marginLeft: 6,
              }}
            >
              {product.original_price} ريال
            </Text>
          )}
        </View>
        {product.stock <= 5 && product.stock > 0 && (
          <Text
            style={{
              fontSize: typography.fontSize.labelSmall,
              color: colors.warning,
              marginTop: spacing.xs,
            }}
          >
            فقط {product.stock} قطع متبقية
          </Text>
        )}
      </View>
    </AnimatedTouchable>
  );
}
