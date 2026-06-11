import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, RefreshControl, ActivityIndicator, Image, Alert } from 'react-native';
import { useTheme } from '../../themes/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { adminService } from '../../services/adminService';
import { Product } from '../../types/product';
import { Ionicons } from '@expo/vector-icons';

export default function ProductManagement({ navigation }: { navigation: any }) {
  const { colors, spacing, radius } = useTheme();
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;

  const loadProducts = useCallback(async (p = 1, s = '') => {
    try {
      const res = await adminService.listProducts(s, p, limit);
      if (p === 1) setProducts(res.data);
      else setProducts(prev => [...prev, ...res.data]);
      setTotal(res.total);
    } catch (e) {
      console.error('Failed to load products:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadProducts(page, search); }, [page]);

  const handleSearch = () => {
    setPage(1);
    setLoading(true);
    loadProducts(1, search);
  };

  const handleDelete = (product: Product) => {
    Alert.alert('تأكيد الحذف', `هل أنت متأكد من حذف "${product.title}"؟`, [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'حذف', style: 'destructive', onPress: async () => {
        try {
          await adminService.deleteProduct(product.id);
          setProducts(prev => prev.filter(p => p.id !== product.id));
          setTotal(prev => prev - 1);
        } catch (e) {
          Alert.alert('خطأ', 'فشل حذف المنتج');
        }
      }},
    ]);
  };

  if (!isAdmin) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <Ionicons name="shield-checkmark-outline" size={64} color={colors.error} />
        <Text style={{ color: colors.error, fontSize: 16, marginTop: spacing.md }}>غير مصرح بالوصول</Text>
      </View>
    );
  }

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={{ backgroundColor: colors.surface, borderRadius: radius.md, marginBottom: spacing.sm, padding: spacing.md }}>
      <View style={{ flexDirection: 'row' }}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={{ width: 72, height: 72, borderRadius: radius.sm, marginRight: spacing.md }} />
        ) : (
          <View style={{ width: 72, height: 72, borderRadius: radius.sm, marginRight: spacing.md, backgroundColor: colors.surfaceVariant, justifyContent: 'center', alignItems: 'center' }}>
            <Ionicons name="image-outline" size={28} color={colors.textTertiary} />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: colors.onBackground }} numberOfLines={2}>{item.title}</Text>
          <Text style={{ fontSize: 14, color: colors.primary, fontWeight: '600', marginTop: 4 }}>{item.price.toFixed(2)} ريال</Text>
          <View style={{ flexDirection: 'row', marginTop: 4 }}>
            <Text style={{ fontSize: 12, color: colors.textTertiary }}>المخزون: {item.stock}</Text>
            {item.featured && <Text style={{ fontSize: 12, color: colors.warning, marginLeft: spacing.sm }}>مميز</Text>}
            {item.flash_sale && <Text style={{ fontSize: 12, color: colors.error, marginLeft: spacing.sm }}>عرض</Text>}
          </View>
        </View>
      </View>
      <View style={{ flexDirection: 'row', marginTop: spacing.sm }}>
        <TouchableOpacity
          style={{ flex: 1, height: 36, backgroundColor: colors.primary, borderRadius: radius.sm, justifyContent: 'center', alignItems: 'center', marginRight: spacing.xs }}
          onPress={() => navigation.navigate('ProductEditor', { product: item })}
        >
          <Text style={{ color: colors.onPrimary, fontSize: 13, fontWeight: '600' }}>تعديل</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ flex: 1, height: 36, backgroundColor: colors.error, borderRadius: radius.sm, justifyContent: 'center', alignItems: 'center', marginLeft: spacing.xs }}
          onPress={() => handleDelete(item)}
        >
          <Text style={{ color: colors.onPrimary, fontSize: 13, fontWeight: '600' }}>حذف</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: spacing.md, borderBottomWidth: 1, borderColor: colors.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: 22, fontWeight: '700', color: colors.onBackground }}>إدارة المنتجات</Text>
        <TouchableOpacity
          style={{ backgroundColor: colors.primary, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radius.sm }}
          onPress={() => navigation.navigate('ProductEditor', { product: null })}
        >
          <Text style={{ color: colors.onPrimary, fontSize: 13, fontWeight: '600' }}>+ إضافة</Text>
        </TouchableOpacity>
      </View>

      <View style={{ padding: spacing.md, flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.sm }}>
          <Ionicons name="search-outline" size={18} color={colors.textTertiary} />
          <TextInput
            style={{ flex: 1, color: colors.onBackground, fontSize: 14, paddingVertical: spacing.sm, marginLeft: spacing.xs }}
            placeholder="بحث عن منتج..."
            placeholderTextColor={colors.textTertiary}
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={handleSearch}
          />
        </View>
        <TouchableOpacity onPress={handleSearch} style={{ marginLeft: spacing.sm, backgroundColor: colors.surface, padding: spacing.sm, borderRadius: radius.sm }}>
          <Ionicons name="search-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <Text style={{ paddingHorizontal: spacing.md, fontSize: 12, color: colors.textTertiary, marginBottom: spacing.sm }}>
        {total} منتج{total !== 1 ? '' : ''}
      </Text>

      {loading && products.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={item => item.id}
          renderItem={renderProduct}
          contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxxl }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadProducts(1, search); }} tintColor={colors.primary} />}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', justifyContent: 'center', padding: spacing.xl }}>
              <Ionicons name="cube-outline" size={48} color={colors.textTertiary} />
              <Text style={{ color: colors.textSecondary, fontSize: 16, marginTop: spacing.md }}>لا توجد منتجات</Text>
            </View>
          }
          onEndReached={() => {
            if (products.length < total) {
              const nextPage = page + 1;
              setPage(nextPage);
              loadProducts(nextPage, search);
            }
          }}
          onEndReachedThreshold={0.5}
        />
      )}
    </View>
  );
}
