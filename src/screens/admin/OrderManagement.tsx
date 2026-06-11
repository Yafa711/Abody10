import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, RefreshControl, ActivityIndicator, Alert, Linking, ScrollView } from 'react-native';
import { useTheme } from '../../themes/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { adminService } from '../../services/adminService';
import { Order, OrderStatus } from '../../types/order';
import { Ionicons } from '@expo/vector-icons';

const statusColors: Record<string, string> = {
  pending: '#FF9500',
  processing: '#00D4AA',
  shipped: '#34C759',
  delivered: '#D4A853',
  cancelled: '#FF3B30',
};

const statusLabels: Record<string, string> = {
  pending: 'قيد الانتظار',
  processing: 'قيد التجهيز',
  shipped: 'تم الشحن',
  delivered: 'تم التوصيل',
  cancelled: 'ملغي',
};

const statusTransitions: Record<string, OrderStatus[]> = {
  pending: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

export default function OrderManagement({ navigation: _navigation }: { navigation: any }) {
  const { colors, spacing, radius } = useTheme();
  const { isAdmin } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const limit = 20;

  const loadOrders = useCallback(async (p = 1, s = '', st = 'all') => {
    try {
      const res = await adminService.listAllOrders({ status: st, search: s, page: p, limit });
      if (p === 1) setOrders(res.data);
      else setOrders(prev => [...prev, ...res.data]);
      setTotal(res.total);
    } catch (e) {
      console.error('Failed to load orders:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadOrders(page, search, statusFilter); }, [page, statusFilter]);

  const handleSearch = () => {
    setPage(1);
    setLoading(true);
    loadOrders(1, search, statusFilter);
  };

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await adminService.updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder?.id === orderId) setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
      Alert.alert('تم', 'تم تحديث حالة الطلب بنجاح');
    } catch (e) {
      Alert.alert('خطأ', 'فشل تحديث حالة الطلب');
    }
  };

  const contactWhatsApp = (phone: string, orderId: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const message = `مرحباً، بخصوص طلبك رقم #${orderId.slice(0, 8)} من متجر NewElectroStore`;
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(() => Alert.alert('خطأ', 'فشل فتح واتساب'));
  };

  if (!isAdmin) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <Ionicons name="shield-checkmark-outline" size={64} color={colors.error} />
        <Text style={{ color: colors.error, fontSize: 16, marginTop: spacing.md }}>غير مصرح بالوصول</Text>
      </View>
    );
  }

  const filters = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  const renderOrder = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={{ backgroundColor: colors.surface, borderRadius: radius.md, marginBottom: spacing.sm, padding: spacing.md }}
      onPress={() => setSelectedOrder(selectedOrder?.id === item.id ? null : item)}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: 13, color: colors.textTertiary }}>#{item.id.slice(0, 8)}</Text>
        <View style={{ backgroundColor: `${statusColors[item.status]}20`, paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.xs }}>
          <Text style={{ fontSize: 12, color: statusColors[item.status], fontWeight: '600' }}>{statusLabels[item.status]}</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs }}>
        <Text style={{ fontSize: 14, color: colors.onBackground }}>{item.full_name || 'عميل'}</Text>
        <Text style={{ fontSize: 14, fontWeight: '600', color: colors.primary }}>{item.total_amount.toFixed(2)} ريال</Text>
      </View>
      <Text style={{ fontSize: 11, color: colors.textTertiary, marginTop: 2 }}>{item.created_at ? new Date(item.created_at).toLocaleDateString('ar-SA') : ''}</Text>

      {selectedOrder?.id === item.id && (
        <View style={{ marginTop: spacing.sm, borderTopWidth: 1, borderColor: colors.border, paddingTop: spacing.sm }}>
          <View style={{ marginBottom: spacing.sm }}>
            <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 4 }}>العميل: {item.full_name}</Text>
            <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 4 }}>الهاتف: {item.phone}</Text>
            <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 4 }}>العنوان: {item.shipping_address}</Text>
            <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 4 }}>طريقة الدفع: {item.payment_method === 'cod' ? 'الدفع عند الاستلام' : 'تحويل بنكي'}</Text>
            {item.discount_amount > 0 && <Text style={{ fontSize: 13, color: colors.success }}>الخصم: {item.discount_amount} ريال</Text>}
          </View>

          {item.items?.map((orderItem, i) => (
            <View key={orderItem.id || i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Text style={{ fontSize: 12, color: colors.onBackground }}>{orderItem.product_title}</Text>
              <Text style={{ fontSize: 12, color: colors.textTertiary, marginLeft: spacing.xs }}>×{orderItem.quantity}</Text>
              <Text style={{ fontSize: 12, color: colors.primary, marginLeft: spacing.xs }}>{(orderItem.unit_price * orderItem.quantity).toFixed(2)} ريال</Text>
            </View>
          ))}

          {item.payment_proof_url && (
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs, marginBottom: spacing.sm }}
              onPress={() => Linking.openURL(item.payment_proof_url!)}
            >
              <Ionicons name="image-outline" size={16} color={colors.primary} />
              <Text style={{ fontSize: 13, color: colors.primary, marginLeft: spacing.xs }}>عرض إيصال الدفع</Text>
            </TouchableOpacity>
          )}

          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {statusTransitions[item.status]?.map(nextStatus => (
              <TouchableOpacity
                key={nextStatus}
                style={{ backgroundColor: statusColors[nextStatus], paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radius.sm, marginRight: spacing.xs, marginBottom: spacing.xs }}
                onPress={() => handleStatusUpdate(item.id, nextStatus)}
              >
                <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '600' }}>← {statusLabels[nextStatus]}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={{ backgroundColor: colors.surfaceVariant, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radius.sm, marginBottom: spacing.xs }}
              onPress={() => contactWhatsApp(item.phone, item.id)}
            >
              <Ionicons name="logo-whatsapp" size={16} color={colors.success} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: spacing.md, borderBottomWidth: 1, borderColor: colors.border }}>
        <Text style={{ fontSize: 22, fontWeight: '700', color: colors.onBackground }}>إدارة الطلبات</Text>
      </View>

      <View style={{ padding: spacing.md, flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.sm }}>
          <Ionicons name="search-outline" size={18} color={colors.textTertiary} />
          <TextInput
            style={{ flex: 1, color: colors.onBackground, fontSize: 14, paddingVertical: spacing.sm, marginLeft: spacing.xs }}
            placeholder="بحث برقم الطلب أو الاسم..."
            placeholderTextColor={colors.textTertiary}
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={handleSearch}
          />
        </View>
      </View>

      <View style={{ paddingHorizontal: spacing.md, marginBottom: spacing.sm }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filters.map(f => (
            <TouchableOpacity
              key={f}
              style={{ paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radius.pill, backgroundColor: statusFilter === f ? colors.primary : colors.surface, marginRight: spacing.xs }}
              onPress={() => { setStatusFilter(f); setPage(1); setLoading(true); }}
            >
              <Text style={{ fontSize: 13, color: statusFilter === f ? colors.onPrimary : colors.textSecondary, fontWeight: statusFilter === f ? '600' : '400' }}>
                {f === 'all' ? 'الكل' : statusLabels[f] || f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading && orders.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={item => item.id}
          renderItem={renderOrder}
          contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxxl }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadOrders(1, search, statusFilter); }} tintColor={colors.primary} />}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', justifyContent: 'center', padding: spacing.xl }}>
              <Ionicons name="receipt-outline" size={48} color={colors.textTertiary} />
              <Text style={{ color: colors.textSecondary, fontSize: 16, marginTop: spacing.md }}>لا توجد طلبات</Text>
            </View>
          }
          onEndReached={() => {
            if (orders.length < total) {
              const np = page + 1;
              setPage(np);
              loadOrders(np, search, statusFilter);
            }
          }}
          onEndReachedThreshold={0.5}
        />
      )}
    </View>
  );
}
