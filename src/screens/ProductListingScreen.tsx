import React, { useEffect, useState } from 'react';
import { View, Text, Image, ActivityIndicator, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { useTheme } from '../themes/ThemeContext';
import { supabase } from '../services/supabase';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const NUM_COLUMNS = 2;

export default function ProductListingScreen({ navigation, route }: any) {
  const { colors, spacing, radius } = useTheme();
  const { categoryId } = route.params || {};

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        let query = supabase.from('products').select('*');

        if (categoryId) {
          query = query.eq('category_id', categoryId);
        }

        const { data, error } = await query;

        if (error) {
          throw error;
        }

        setProducts(data || []);
        setLoading(false);
        setRefreshing(false);
      } catch (err: any) {
        console.error('Error fetching products:', err);
        setError(err.message || 'Failed to load products');
        setLoading(false);
        setRefreshing(false);
      }
    };

    fetchProducts();
  }, [categoryId, refreshing]);

  const renderItem = ({ item }: { item: any }) => {
    const cardWidth = (SCREEN_WIDTH - spacing.md * 3) / NUM_COLUMNS;
    return (
      <TouchableOpacity
        key={item.id}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('ProductDetails', { id: item.id })}
        style={{ width: cardWidth, marginBottom: spacing.md }}
      >
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: radius.md,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Image
            source={{ uri: item.image_url }}
            style={{ width: '100%', height: 120, resizeMode: 'cover' }}
          />
          <View style={{ padding: spacing.sm }}>
            <Text style={{ fontSize: 14, fontWeight: '500', color: colors.onBackground }}>
              {item.title}
            </Text>
            <Text style={{ marginTop: spacing.xs, fontSize: 14, fontWeight: '600', color: colors.primary }}>
              {item.price} ريال
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: spacing.lg, color: colors.onBackground }}>جاري التحميل...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: spacing.md }}>
        <Text style={{ color: colors.error, textAlign: 'center', marginBottom: spacing.md }}>فشل التحميل: {error}</Text>
        <TouchableOpacity
          style={{ backgroundColor: colors.primary, paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, borderRadius: radius.md }}
          onPress={() => setRefreshing(true)}
        >
          <Text style={{ color: colors.onBackground, fontWeight: '600' }}>أعد المحاولة</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (products.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: spacing.md }}>
        <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>لا توجد منتجات متاحة في هذا القسم</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={products}
        renderItem={renderItem}
        keyExtractor={(item: any) => item.id.toString()}
        numColumns={NUM_COLUMNS}
        contentContainerStyle={{ padding: spacing.md }}
        columnWrapperStyle={{ gap: spacing.md }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
