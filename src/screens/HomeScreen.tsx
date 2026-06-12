import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '../themes/ThemeContext';
import { useProducts, useCategories, useFavorites } from '../hooks';
import { useAuth } from '../contexts/AuthContext';
import {
  HeroBanner,
  RollingProductBanner,
  ProductCard,
  SectionHeader,
  HomePageSkeleton,
} from '../components';
import { supabase } from '../services/supabase';

interface BannerItem {
  id: string;
  image_url: string;
}

function AnimatedSection({ children, delay = 0, style }: {
  children: React.ReactNode;
  delay?: number;
  style?: any;
}) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(24);

  useEffect(() => {
    const t = setTimeout(() => {
      opacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) });
      translateY.value = withSpring(0, { damping: 20, stiffness: 100 });
    }, delay);
    return () => clearTimeout(t);
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={[animStyle, style]}>{children}</Animated.View>;
}

const CATEGORY_ICONS: Record<string, string> = {
  smartphones: 'phone-portrait-outline',
  laptops: 'laptop-outline',
  headphones: 'headset-outline',
  accessories: 'watch-outline',
  'smart-watches': 'time-outline',
  tablets: 'tablet-portrait-outline',
};

export default function HomeScreen({ navigation }: any) {
  const { colors, spacing, typography, radius } = useTheme();
  const { user } = useAuth();

  const [refreshing, setRefreshing] = useState(false);
  const [banners, setBanners] = useState<BannerItem[]>([]);

  const featured = useProducts({ featured: true, limit: 10 });
  const flashSales = useProducts({ flash_sale: true, limit: 10 });
  const allCategories = useCategories(true);
  const favorites = useFavorites(user?.id);

  const fetchBanners = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('banners')
        .select('*')
        .order('sort_order', { ascending: true });
      if (data && data.length > 0) {
        setBanners(data as BannerItem[]);
        return;
      }
    } catch {
    }
    if (featured.products.length > 0) {
      setBanners(
        featured.products.slice(0, 5).map((p) => ({
          id: p.id,
          image_url: p.image_url,
        }))
      );
    }
  }, [featured.products]);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      featured.refetch(),
      flashSales.refetch(),
      allCategories.refetch(),
      fetchBanners(),
    ]);
    setRefreshing(false);
  }, []);

  const loading = featured.loading || flashSales.loading || allCategories.loading;

  if (loading && !refreshing) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <HomePageSkeleton />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Rolling Product Banner */}
        <AnimatedSection delay={0}>
          {featured.products.length > 0 && (
            <RollingProductBanner products={featured.products} />
          )}
        </AnimatedSection>

        {/* Hero Banner */}
        <AnimatedSection delay={150}>
          <HeroBanner
            items={banners}
            onPress={(item) => navigation.navigate('ProductDetails', { id: item.id })}
          />
        </AnimatedSection>

        {/* Categories - Bento Grid */}
        <AnimatedSection delay={300} style={{ marginTop: spacing.xs }}>
          <SectionHeader
            title="الأقسام"
            actionLabel="عرض الكل"
            onAction={() => navigation.navigate('ProductList', {})}
          />
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              paddingHorizontal: spacing.lg,
              gap: 10,
            }}
          >
            {allCategories.categories.slice(0, 6).map((cat, index) => {
              const iconName = CATEGORY_ICONS[cat.slug] || 'grid-outline';
              const isLarge = index === 0;
              return (
                <TouchableOpacity
                  key={cat.id}
                  activeOpacity={0.8}
                  onPress={() =>
                    navigation.navigate('ProductList', {
                      title: cat.name,
                      categoryId: cat.id,
                    })
                  }
                  style={{
                    width: isLarge ? '100%' : '48%',
                    height: isLarge ? 80 : 72,
                    borderRadius: radius.lg,
                    backgroundColor: colors.primaryLight,
                    flexDirection: isLarge ? 'row' : 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: spacing.lg,
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      backgroundColor: colors.primary,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginBottom: isLarge ? 0 : spacing.xs,
                      marginRight: isLarge ? spacing.md : 0,
                    }}
                  >
                    <Ionicons name={iconName as any} size={20} color="#FFFFFF" />
                  </View>
                  <Text
                    style={{
                      fontSize: isLarge ? typography.fontSize.titleMedium : typography.fontSize.bodySmall,
                      fontWeight: '600',
                      color: colors.textPrimary,
                    }}
                  >
                    {cat.name_ar || cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </AnimatedSection>

        {/* Flash Sales */}
        {flashSales.products.length > 0 && (
          <AnimatedSection delay={450} style={{ marginTop: spacing.xxl }}>
            <SectionHeader
              title="تخفيضات سريعة"
              actionLabel="عرض الكل"
              onAction={() => navigation.navigate('ProductList', { title: 'تخفيضات سريعة' })}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: spacing.lg }}
            >
              {flashSales.products.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  horizontal
                  index={index}
                  onPress={() => navigation.navigate('ProductDetails', { id: product.id })}
                  onFavorite={user ? () => favorites.toggle(product.id) : undefined}
                  isFavorited={favorites.isFavorited(product.id)}
                />
              ))}
            </ScrollView>
          </AnimatedSection>
        )}

        {/* Featured Products */}
        <AnimatedSection delay={600} style={{ marginTop: spacing.xxl, marginBottom: spacing.xxxl }}>
          <SectionHeader
            title="المنتجات المميزة"
            actionLabel="عرض الكل"
            onAction={() => navigation.navigate('ProductList', { title: 'المنتجات المميزة' })}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: spacing.lg }}
          >
            {featured.products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                horizontal
                index={index}
                onPress={() => navigation.navigate('ProductDetails', { id: product.id })}
                onFavorite={user ? () => favorites.toggle(product.id) : undefined}
                isFavorited={favorites.isFavorited(product.id)}
              />
            ))}
          </ScrollView>
        </AnimatedSection>
      </ScrollView>
    </View>
  );
}
