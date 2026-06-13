import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../themes/ThemeContext';
import { useProducts, useCategories, useFavorites } from '../hooks';
import { useAuth } from '../contexts/AuthContext';
import {
  HeroBanner,
  RollingProductBanner,
  ProductCard,
  SectionHeader,
  HomePageSkeleton,
  GlassCard,
} from '../components';
import { supabase } from '../services/supabase';

const CATEGORY_COLLAPSE_THRESHOLD = 4;

interface BannerItem {
  id: string;
  image_url: string;
}

function AnimatedSection({ children, delay = 0, style }: {
  children: React.ReactNode;
  delay?: number;
  style?: any;
}) {
  const anim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(40)).current;
  const scale = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    const t = setTimeout(() => {
      Animated.parallel([
        Animated.spring(anim, { toValue: 1, useNativeDriver: true, damping: 16, stiffness: 120 }),
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, damping: 20, stiffness: 120 }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, damping: 16, stiffness: 120 }),
      ]).start();
    }, delay);
    return () => clearTimeout(t);
  }, []);

  return (
    <Animated.View
      style={[
        { opacity: anim, transform: [{ translateY }, { scale }] },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
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
  const { colors, spacing } = useTheme();
  const { user } = useAuth();

  const [refreshing, setRefreshing] = useState(false);
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);

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
      // banners from DB unavailable, use fallback
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
  const fetchError = featured.error || flashSales.error || allCategories.error;

  if (loading && !refreshing) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <HomePageSkeleton />
      </View>
    );
  }

  const categories = allCategories.categories;
  const visibleCategories = categoriesExpanded
    ? categories
    : categories.slice(0, CATEGORY_COLLAPSE_THRESHOLD);
  const hasMoreCategories = categories.length > CATEGORY_COLLAPSE_THRESHOLD;

  if (fetchError && !loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: spacing.xl }}>
        <Ionicons name="cloud-offline-outline" size={48} color={colors.error} />
        <Text style={{ fontSize: 16, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.md, marginBottom: spacing.lg }}>
          {fetchError}
        </Text>
        <TouchableOpacity
          onPress={onRefresh}
          style={{ backgroundColor: colors.primary, paddingVertical: 12, paddingHorizontal: 32, borderRadius: 12 }}
        >
          <Text style={{ color: colors.onPrimary, fontWeight: '600' }}>إعادة المحاولة</Text>
        </TouchableOpacity>
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

        {/* Categories - Bento Grid with Contextual UI */}
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
            {visibleCategories.map((cat, index) => {
              const iconName = CATEGORY_ICONS[cat.slug] || 'grid-outline';
              const isLarge = index === 0;
              return (
                <GlassCard
                  key={cat.id}
                  glowColor={isLarge ? colors.primary : undefined}
                  onPress={() =>
                    navigation.navigate('ProductList', {
                      title: cat.name,
                      categoryId: cat.id,
                    })
                  }
                  intensity="light"
                  style={{
                    width: isLarge ? '100%' : '48%',
                    height: isLarge ? 84 : 76,
                    flexDirection: isLarge ? 'row' as any : 'column' as any,
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
                      fontSize: isLarge ? 16 : 13,
                      fontWeight: '600',
                      color: colors.textPrimary,
                    }}
                  >
                    {cat.name_ar || cat.name}
                  </Text>
                </GlassCard>
              );
            })}
          </View>
          {/* Contextual UI: Show more/less toggle */}
          {hasMoreCategories && (
            <TouchableOpacity
              onPress={() => setCategoriesExpanded(!categoriesExpanded)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: spacing.md,
                marginTop: spacing.xs,
              }}
              activeOpacity={0.7}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: colors.primary,
                  fontWeight: '600',
                }}
              >
                {categoriesExpanded ? 'عرض أقل' : `عرض الكل (${categories.length})`}
              </Text>
              <Ionicons
                name={categoriesExpanded ? 'chevron-up-outline' : 'chevron-down-outline'}
                size={16}
                color={colors.primary}
                style={{ marginLeft: 4 }}
              />
            </TouchableOpacity>
          )}
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
