import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../themes/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { orderService } from '../../services/orderService';
import { Order, OrderStatus } from '../../types/order';
import { t } from '../../services/localization';
import { EmptyState } from '../../components';

const STATUS_FILTERS: { label: string; value: OrderStatus | 'all' }[] = [
  { label: t('all'), value: 'all' },
  { label: t('pending'), value: 'pending' },
  { label: t('processing'), value: 'processing' },
  { label: t('shipped'), value: 'shipped' },
  { label: t('delivered'), value: 'delivered' },
  { label: t('cancelled'), value: 'cancelled' },
];

const STATUS_COLORS: Record<string, string> = {
  pending: '#FF9500',
  processing: '#007AFF',
  shipped: '#5856D6',
  delivered: '#34C759',
  cancelled: '#FF3B30',
};

export default function OrderScreen({ navigation }: any) {
  const { colors, spacing, radius, typography } = useTheme();
  const { user } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');

  const fetchOrders = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    try {
      const data = await orderService.getOrders(user.id);
      setOrders(data);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filtered = orders.filter((o) => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        o.id.toLowerCase().includes(q) ||
        o.items.some((i) => i.product_title.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const renderItem = useCallback(
    ({ item }: { item: Order }) => (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
        style={{
          backgroundColor: colors.surface,
          borderRadius: radius.md,
          padding: spacing.md,
          marginBottom: spacing.md,
          borderLeftWidth: 3,
          borderLeftColor: STATUS_COLORS[item.status] || colors.textTertiary,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <Text style={{ fontSize: typography.fontSize.bodySmall, color: colors.textTertiary }}>
                #{item.id.slice(0, 8).toUpperCase()}
              </Text>
              <View
                style={{
                  backgroundColor: (STATUS_COLORS[item.status] || colors.textTertiary) + '20',
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 4,
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: '600',
                    color: STATUS_COLORS[item.status] || colors.textTertiary,
                  }}
                >
                  {item.status}
                </Text>
              </View>
            </View>
            <Text style={{ fontSize: typography.fontSize.bodyMedium, fontWeight: '600', color: colors.textPrimary, marginTop: spacing.sm }}>
              {item.total_amount.toFixed(2)} ريال
            </Text>
            <Text style={{ fontSize: typography.fontSize.bodySmall, color: colors.textSecondary, marginTop: spacing.xs }}>
              {item.items.length} {t('items')} • {new Date(item.created_at).toLocaleDateString('ar-SA')}
            </Text>
          </View>
          <Ionicons name="chevron-back" size={20} color={colors.textTertiary} />
        </View>

        <View style={{ flexDirection: 'row', marginTop: spacing.sm, gap: spacing.xs }}>
          {item.items.slice(0, 3).map((i) => (
            <View
              key={i.id}
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                backgroundColor: colors.surfaceVariant,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Ionicons name="cube-outline" size={18} color={colors.textTertiary} />
            </View>
          ))}
          {item.items.length > 3 && (
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                backgroundColor: colors.surfaceVariant,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 11, color: colors.textTertiary, fontWeight: '600' }}>+{item.items.length - 3}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    ),
    [colors, spacing, radius, typography, navigation]
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: spacing.lg, paddingTop: spacing.xxxl, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <Text style={{ fontSize: 24, fontWeight: '700', color: colors.textPrimary }}>{t('orders')}</Text>
      </View>

      {/* Search */}
      <View style={{ padding: spacing.md }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.surfaceVariant,
            borderRadius: radius.md,
            paddingHorizontal: spacing.md,
            height: 40,
          }}
        >
          <Ionicons name="search" size={18} color={colors.textTertiary} />
          <TextInput
            style={{
              flex: 1,
              color: colors.textPrimary,
              fontSize: 14,
              marginLeft: spacing.sm,
              height: 40,
            }}
            placeholder={t('searchOrders')}
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Status filter */}
      <FlatList
        horizontal
        data={STATUS_FILTERS}
        keyExtractor={(f) => f.value}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: spacing.md }}
        style={{ maxHeight: 40, marginBottom: spacing.sm }}
        renderItem={({ item: f }) => (
          <TouchableOpacity
            onPress={() => setStatusFilter(f.value)}
            activeOpacity={0.7}
            style={{
              paddingVertical: spacing.xs,
              paddingHorizontal: spacing.md,
              borderRadius: radius.pill,
              marginRight: spacing.sm,
              backgroundColor: statusFilter === f.value ? colors.primary : colors.surfaceVariant,
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: '500',
                color: statusFilter === f.value ? colors.onPrimary : colors.textSecondary,
              }}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: colors.textTertiary }}>{t('loading')}</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: spacing.md }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchOrders(); }}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          renderItem={renderItem}
          ListEmptyComponent={
            <EmptyState
              icon="receipt-outline"
              title={t('noOrders')}
              actionLabel={t('startShopping')}
              onAction={() => navigation.navigate('Home')}
            />
          }
        />
      )}
    </View>
  );
}
