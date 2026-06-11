import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../themes/ThemeContext';
import { useProducts, useCategories, useFavorites } from '../hooks';
import { useAuth } from '../contexts/AuthContext';
import {
  HeroBanner,
  ProductCard,
  ProductCardSkeleton,
  SectionHeader,
} from '../components';
import { supabase } from '../services/supabase';

interface BannerItem {
  id: string;
  image_url: string;
}

export default function HomeScreen({ navigation }: any) {
  const { colors, spacing, typography } = useTheme();
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
      // fallback to featured products
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

  const renderSkeletons = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: spacing.lg }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </ScrollView>
  );

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
        {/* Hero Banner */}
        {loading ? (
          <View style={{ height: 200, backgroundColor: colors.surface }} />
        ) : (
          <HeroBanner
            items={banners}
            onPress={(item) => navigation.navigate('ProductDetails', { id: item.id })}
          />
        )}

        {/* Categories */}
        <View style={{ marginTop: spacing.xxl }}>
          <SectionHeader title="الأقسام" actionLabel="عرض الكل" onAction={() => navigation.navigate('ProductList', {})} />
          {loading ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: spacing.lg }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <View
                  key={i}
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 36,
                    backgroundColor: colors.surfaceVariant,
                    marginRight: spacing.md,
                  }}
                />
              ))}
            </ScrollView>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: spacing.lg }}
            >
              {allCategories.categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  activeOpacity={0.7}
                  onPress={() =>
                    navigation.navigate('ProductList', {
                      title: cat.name,
                      categoryId: cat.id,
                    })
                  }
                  style={{ alignItems: 'center', marginRight: spacing.lg }}
                >
                  <View
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 36,
                      backgroundColor: colors.surfaceVariant,
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    <Ionicons name="grid-outline" size={28} color={colors.primary} />
                  </View>
                  <Text
                    numberOfLines={1}
                    style={{
                      fontSize: typography.fontSize.labelMedium,
                      color: colors.textSecondary,
                      marginTop: spacing.xs,
                      textAlign: 'center',
                      width: 72,
                    }}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Flash Sales */}
        {!flashSales.loading && flashSales.products.length > 0 && (
          <View style={{ marginTop: spacing.xxl }}>
            <SectionHeader
              title="تخفيضات سريعة 🔥"
              actionLabel="عرض الكل"
              onAction={() => navigation.navigate('ProductList', { title: 'تخفيضات سريعة' })}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: spacing.lg }}
            >
              {flashSales.products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  horizontal
                  onPress={() => navigation.navigate('ProductDetails', { id: product.id })}
                  onFavorite={user ? () => favorites.toggle(product.id) : undefined}
                  isFavorited={favorites.isFavorited(product.id)}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Featured Products */}
        <View style={{ marginTop: spacing.xxl, marginBottom: spacing.xxxl }}>
          <SectionHeader
            title="المنتجات المميزة"
            actionLabel="عرض الكل"
            onAction={() => navigation.navigate('ProductList', { title: 'المنتجات المميزة' })}
          />
          {featured.loading ? (
            renderSkeletons()
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: spacing.lg }}
            >
              {featured.products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  horizontal
                  onPress={() => navigation.navigate('ProductDetails', { id: product.id })}
                  onFavorite={user ? () => favorites.toggle(product.id) : undefined}
                  isFavorited={favorites.isFavorited(product.id)}
                />
              ))}
            </ScrollView>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
