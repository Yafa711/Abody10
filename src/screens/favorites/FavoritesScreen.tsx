import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../themes/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useFavorites } from '../../hooks';
import { EmptyState, Skeleton } from '../../components';
import { productService } from '../../services/productService';
import { Product } from '../../types/product';

export default function FavoritesScreen({ navigation }: any) {
  const { colors, spacing, typography } = useTheme();
  const { user } = useAuth();
  const favorites = useFavorites(user?.id);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFavoriteProducts = useCallback(async () => {
    if (!user) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const favIds = favorites.favorites;
    if (favIds.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    try {
      const results = await productService.getProductsByIds(favIds);
      setProducts(results);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFavoriteProducts();
  }, [fetchFavoriteProducts]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchFavoriteProducts();
    setRefreshing(false);
  }, [fetchFavoriteProducts]);

  const handleRemove = async (productId: string) => {
    await favorites.toggle(productId);
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const renderHeader = () => (
    <View
      style={{
        padding: spacing.lg,
        paddingTop: spacing.xxxl,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <Text style={{ fontSize: typography.fontSize.headlineLarge, fontWeight: '700', color: colors.textPrimary }}>
        المفضلة
      </Text>
      <Text style={{ fontSize: typography.fontSize.bodySmall, color: colors.textSecondary, marginTop: spacing.xs }}>
        {products.length > 0 ? `${products.length} منتج` : ''}
      </Text>
    </View>
  );

  if (!user) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        {renderHeader()}
        <EmptyState
          icon="heart-outline"
          title="سجل الدخول"
          message="قم بتسجيل الدخول لعرض المنتجات المفضلة"
          actionLabel="تسجيل الدخول"
          onAction={() => navigation.navigate('Login')}
        />
      </View>
    );
  }

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        {renderHeader()}
        <View style={{ padding: spacing.lg }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <View key={i} style={{ marginBottom: spacing.md }}>
              <Skeleton height={100} borderRadius={12} />
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {renderHeader()}
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing.lg }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('ProductDetails', { id: item.id })}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.surface,
              borderRadius: 12,
              marginBottom: spacing.md,
              overflow: 'hidden',
            }}
          >
            <View style={{ width: 100, height: 100 }}>
              <View
                style={{
                  flex: 1,
                  backgroundColor: colors.surfaceVariant,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Ionicons name="image-outline" size={32} color={colors.textTertiary} />
              </View>
            </View>
            <View style={{ flex: 1, padding: spacing.md }}>
              <Text
                numberOfLines={2}
                style={{
                  fontSize: typography.fontSize.bodyMedium,
                  fontWeight: '500',
                  color: colors.textPrimary,
                  lineHeight: 20,
                }}
              >
                {item.title}
              </Text>
              <Text
                style={{
                  fontSize: typography.fontSize.titleSmall,
                  fontWeight: '700',
                  color: colors.primary,
                  marginTop: spacing.xs,
                }}
              >
                {item.price} ريال
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => handleRemove(item.id)}
              activeOpacity={0.7}
              style={{
                padding: spacing.md,
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="trash-outline" size={20} color={colors.error} />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="heart-outline"
            title="المفضلة فارغة"
            message="أضف منتجات إلى المفضلة لتتمكن من مشاهدتها لاحقاً"
            actionLabel="تسوق الآن"
            onAction={() => navigation.navigate('Home')}
          />
        }
      />
    </View>
  );
}
