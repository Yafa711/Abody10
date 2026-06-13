import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../themes/ThemeContext';
import { useProduct, useFavorites } from '../hooks';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import {
  ImageGallery,
  QuantitySelector,
  ProductCard,
  SectionHeader,
  Skeleton,
} from '../components';
import { productService } from '../services/productService';
import { recommendationService } from '../services/recommendationService';
import { hapticService } from '../services/hapticService';
import { Product } from '../types/product';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ProductDetailScreen({ navigation, route }: any) {
  const { colors, spacing, radius, typography } = useTheme();
  const { user } = useAuth();
  const productId: string | undefined = route.params?.id;
  const layoutW = route.params?.layoutW;

  const imageScale = useRef(new Animated.Value(layoutW ? layoutW / SCREEN_WIDTH : 1)).current;
  const imageTranslateX = useRef(new Animated.Value(route.params?.layoutX ?? 0)).current;
  const imageTranslateY = useRef(new Animated.Value(route.params?.layoutY ?? 0)).current;
  const imageOpacity = useRef(new Animated.Value(layoutW ? 0 : 1)).current;
  const imageHeight = useRef(new Animated.Value(route.params?.layoutH ?? SCREEN_HEIGHT * 0.4)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (layoutW) {
      Animated.parallel([
        Animated.spring(imageScale, { toValue: 1, damping: 18, stiffness: 120, useNativeDriver: true }),
        Animated.spring(imageTranslateX, { toValue: 0, damping: 18, stiffness: 120, useNativeDriver: true }),
        Animated.spring(imageTranslateY, { toValue: 0, damping: 18, stiffness: 120, useNativeDriver: true }),
        Animated.spring(imageOpacity, { toValue: 1, damping: 14, stiffness: 100, useNativeDriver: true }),
      ]).start();
    }
    setTimeout(() => {
      Animated.spring(contentOpacity, { toValue: 1, damping: 16, stiffness: 120, useNativeDriver: true }).start();
    }, 200);
  }, []);

  const { product, loading, error } = useProduct(productId);
  const favorites = useFavorites(user?.id);
  const { addItem } = useCart();

  const [images, setImages] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!product) return;
    const fetchImages = async () => {
      try {
        const imgs = await productService.getImages(product.id);
        setImages(
          imgs.length > 0
            ? imgs.map((i: { url: string }) => i.url)
            : [product.image_url]
        );
      } catch {
        setImages([product.image_url]);
      }
    };
    fetchImages();
  }, [product]);

  useEffect(() => {
    if (!product) return;
    productService.getRelated(product.id, product.category_id, 6)
      .then(setRelatedProducts)
      .catch(() => {});
    recommendationService.addRecentlyViewed(product.id).catch(() => {});
  }, [product]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ height: SCREEN_HEIGHT * 0.4, backgroundColor: colors.surface }} />
        <View style={{ padding: spacing.lg }}>
          <Skeleton height={24} width="70%" style={{ marginBottom: spacing.md }} />
          <Skeleton height={32} width="40%" style={{ marginBottom: spacing.lg }} />
          <Skeleton height={16} width="100%" style={{ marginBottom: spacing.xs }} />
          <Skeleton height={16} width="100%" style={{ marginBottom: spacing.xs }} />
          <Skeleton height={16} width="60%" />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: spacing.lg }}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
        <Text style={{ fontSize: typography.fontSize.bodyLarge, color: colors.error, marginTop: spacing.md, textAlign: 'center' }}>{error}</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginTop: spacing.lg, backgroundColor: colors.primary, paddingVertical: spacing.md, paddingHorizontal: spacing.xxl, borderRadius: radius.md }}
        >
          <Text style={{ color: colors.onPrimary, fontWeight: '600' }}>رجوع</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: typography.fontSize.bodyLarge, color: colors.textSecondary }}>المنتج غير موجود</Text>
      </View>
    );
  }

  const currentPrice = product.flash_sale && product.flash_sale_price
    ? product.flash_sale_price
    : product.price;

  const hasDiscount = !!product.original_price && product.original_price > currentPrice;
  const discountPercent = hasDiscount
    ? Math.round(((product.original_price! - currentPrice) / product.original_price!) * 100)
    : 0;

  const isFavorited = favorites.isFavorited(product.id);
  const outOfStock = product.stock === 0;

  const variantOptions = [
    { label: 'أسود', value: 'black' },
    { label: 'أبيض', value: 'white' },
    { label: 'ذهبي', value: 'gold' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Animated.View
          style={{
            height: imageHeight,
            transform: [
              { scale: imageScale },
              { translateX: imageTranslateX },
              { translateY: imageTranslateY },
            ],
            opacity: imageOpacity,
          }}
        >
          <ImageGallery images={images} />
        </Animated.View>

        <Animated.View style={[{ padding: spacing.lg }, { opacity: contentOpacity }]}>
          <Text
            style={{
              fontSize: typography.fontSize.headlineSmall,
              fontWeight: '600',
              color: colors.textPrimary,
              lineHeight: 28,
            }}
          >
            {product.title}
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: spacing.md }}>
            <Text
              style={{
                fontSize: typography.fontSize.displaySmall,
                fontWeight: '700',
                color: colors.primary,
              }}
            >
              {currentPrice} ريال
            </Text>
            {hasDiscount && (
              <>
                <Text
                  style={{
                    fontSize: typography.fontSize.titleMedium,
                    color: colors.textTertiary,
                    textDecorationLine: 'line-through',
                    marginLeft: spacing.sm,
                  }}
                >
                  {product.original_price} ريال
                </Text>
                <View
                  style={{
                    backgroundColor: colors.error,
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    borderRadius: 4,
                    marginLeft: spacing.sm,
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#fff' }}>
                    -{discountPercent}%
                  </Text>
                </View>
              </>
            )}
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.md, gap: spacing.lg }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="star" size={16} color={colors.warning} />
              <Text style={{ fontSize: typography.fontSize.bodySmall, color: colors.textSecondary, marginLeft: 4 }}>
                {product.rating || '4.5'} ({product.reviews_count || 0} تقييم)
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="eye-outline" size={16} color={colors.textTertiary} />
              <Text style={{ fontSize: typography.fontSize.bodySmall, color: colors.textTertiary, marginLeft: 4 }}>
                {product.views || 0} مشاهدة
              </Text>
            </View>
          </View>

          <View
            style={{
              marginTop: spacing.md,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: outOfStock ? colors.error : product.stock <= 5 ? colors.warning : colors.success,
                marginRight: 6,
              }}
            />
            <Text
              style={{
                fontSize: typography.fontSize.bodySmall,
                color: outOfStock ? colors.error : product.stock <= 5 ? colors.warning : colors.success,
                fontWeight: '500',
              }}
            >
              {outOfStock ? 'نفذت الكمية' : product.stock <= 5 ? `فقط ${product.stock} قطع متبقية` : 'متوفر'}
            </Text>
          </View>

          <View style={{ marginTop: spacing.xl }}>
            <Text style={{ fontSize: typography.fontSize.bodyMedium, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.sm }}>
              اللون
            </Text>
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              {variantOptions.map((v) => (
                <TouchableOpacity
                  key={v.value}
                  onPress={() => setSelectedVariant(v.value)}
                  activeOpacity={0.7}
                  style={{
                    paddingVertical: spacing.sm,
                    paddingHorizontal: spacing.lg,
                    borderRadius: radius.md,
                    borderWidth: 1.5,
                    borderColor: selectedVariant === v.value ? colors.primary : colors.border,
                    backgroundColor: selectedVariant === v.value ? `${colors.primary}15` : colors.surface,
                  }}
                >
                  <Text
                    style={{
                      fontSize: typography.fontSize.bodySmall,
                      color: selectedVariant === v.value ? colors.primary : colors.textSecondary,
                      fontWeight: selectedVariant === v.value ? '600' : '400',
                    }}
                  >
                    {v.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={{ marginTop: spacing.xl }}>
            <Text style={{ fontSize: typography.fontSize.bodyMedium, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.sm }}>
              الكمية
            </Text>
            <QuantitySelector
              quantity={quantity}
              onIncrement={() => setQuantity((q) => Math.min(q + 1, product.stock))}
              onDecrement={() => setQuantity((q) => Math.max(q - 1, 1))}
              min={1}
              max={product.stock}
            />
          </View>

          <View style={{ marginTop: spacing.xl }}>
            <Text style={{ fontSize: typography.fontSize.bodyMedium, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.sm }}>
              الوصف
            </Text>
            <Text
              style={{
                fontSize: typography.fontSize.bodyMedium,
                color: colors.textSecondary,
                lineHeight: 24,
              }}
            >
              {product.description}
            </Text>
          </View>

          <View style={{ marginTop: spacing.xxl, gap: spacing.md }}>
            <TouchableOpacity
              activeOpacity={0.8}
              disabled={outOfStock}
              style={{
                backgroundColor: colors.primary,
                paddingVertical: spacing.lg,
                borderRadius: radius.md,
                alignItems: 'center',
                opacity: outOfStock ? 0.5 : 1,
              }}
              onPress={() => {
                addItem({
                  product_id: product.id,
                  title: product.title,
                  price: currentPrice,
                  image_url: product.image_url,
                  quantity,
                  stock: product.stock,
                });
                navigation.navigate('Checkout');
              }}
            >
              <Text style={{ fontSize: typography.fontSize.bodyLarge, fontWeight: '700', color: colors.onPrimary }}>
                شراء الآن
              </Text>
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              <TouchableOpacity
                activeOpacity={0.8}
                disabled={outOfStock}
                style={{
                  flex: 1,
                  paddingVertical: spacing.lg,
                  borderRadius: radius.md,
                  alignItems: 'center',
                  borderWidth: 1.5,
                  borderColor: colors.primary,
                  opacity: outOfStock ? 0.5 : 1,
                }}
                onPress={() => {
                  hapticService.medium();
                  addItem({
                    product_id: product.id,
                    title: product.title,
                    price: currentPrice,
                    image_url: product.image_url,
                    quantity,
                    stock: product.stock,
                  });
                }}
              >
                <Text style={{ fontSize: typography.fontSize.bodyMedium, fontWeight: '600', color: colors.primary }}>
                  أضف إلى العربة
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => { hapticService.light(); favorites.toggle(product.id); }}
                activeOpacity={0.7}
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: radius.md,
                  borderWidth: 1.5,
                  borderColor: isFavorited ? colors.error : colors.border,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: isFavorited ? `${colors.error}15` : colors.surface,
                }}
              >
                <Ionicons
                  name={isFavorited ? 'heart' : 'heart-outline'}
                  size={22}
                  color={isFavorited ? colors.error : colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        {relatedProducts.length > 0 && (
          <View style={{ marginTop: spacing.xl, marginBottom: spacing.xxxl }}>
            <SectionHeader title="منتجات مشابهة" />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: spacing.lg }}
            >
              {relatedProducts.map((rp) => (
                <ProductCard
                  key={rp.id}
                  product={rp}
                  horizontal
                  onPress={() => navigation.push('ProductDetails', { id: rp.id })}
                  onFavorite={user ? () => favorites.toggle(rp.id) : undefined}
                  isFavorited={favorites.isFavorited(rp.id)}
                />
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
