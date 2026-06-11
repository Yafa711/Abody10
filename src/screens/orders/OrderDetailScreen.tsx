import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../themes/ThemeContext';
import { orderService } from '../../services/orderService';
import { Order, OrderStatus } from '../../types/order';
import { t } from '../../services/localization';

const STATUS_ORDER: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered'];
const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: t('pending'),
  processing: t('processing'),
  shipped: t('shipped'),
  delivered: t('delivered'),
  cancelled: t('cancelled'),
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: '#FF9500',
  processing: '#007AFF',
  shipped: '#5856D6',
  delivered: '#34C759',
  cancelled: '#FF3B30',
};

export default function OrderDetailScreen({ navigation, route }: any) {
  const { colors, spacing, radius } = useTheme();
  const orderId: string = route.params?.orderId;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;
    try {
      const data = await orderService.getOrder(orderId);
      setOrder(data);
    } catch {
      setOrder(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrder();
  }, [fetchOrder]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: colors.textSecondary }}>{t('error')}</Text>
      </View>
    );
  }

  const isCancelled = order.status === 'cancelled';
  const currentStep = isCancelled ? -1 : STATUS_ORDER.indexOf(order.status);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ padding: spacing.lg, paddingTop: spacing.xxxl, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: spacing.md }}>
          <Ionicons name="arrow-forward" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={{ fontSize: 24, fontWeight: '700', color: colors.textPrimary }}>{t('orderDetails')}</Text>
        <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: spacing.xs }}>
          #{order.id.slice(0, 8).toUpperCase()}
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />
        }
      >
        {/* Status Timeline */}
        <View style={{ padding: spacing.lg }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.lg }}>
            {t('orderStatus')}
          </Text>

          {isCancelled ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md }}>
              <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: STATUS_COLORS.cancelled, justifyContent: 'center', alignItems: 'center' }}>
                <Ionicons name="close" size={18} color="#fff" />
              </View>
              <Text style={{ fontSize: 16, fontWeight: '600', color: STATUS_COLORS.cancelled, marginLeft: spacing.md }}>
                {t('cancelled')}
              </Text>
            </View>
          ) : (
            STATUS_ORDER.map((status, index) => {
              const isActive = index <= currentStep;
              const isLast = index === STATUS_ORDER.length - 1;
              return (
                <View key={status} style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  <View style={{ alignItems: 'center', width: 32 }}>
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        backgroundColor: isActive ? STATUS_COLORS[status] : colors.surfaceVariant,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      {isActive && <Ionicons name="checkmark" size={14} color="#fff" />}
                    </View>
                    {!isLast && (
                      <View
                        style={{
                          width: 2,
                          flex: 1,
                          backgroundColor: isActive ? STATUS_COLORS[status] : colors.surfaceVariant,
                          minHeight: 30,
                        }}
                      />
                    )}
                  </View>
                  <View style={{ marginLeft: spacing.md, flex: 1, paddingBottom: isLast ? 0 : spacing.lg }}>
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: isActive ? '600' : '400',
                        color: isActive ? colors.textPrimary : colors.textTertiary,
                      }}
                    >
                      {STATUS_LABELS[status]}
                    </Text>
                    {isActive && index === currentStep && (
                      <Text style={{ fontSize: 12, color: STATUS_COLORS[status], marginTop: 2 }}>
                        الحالي
                      </Text>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Order Details */}
        <View style={{ padding: spacing.lg }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.md }}>
            {t('orderDetails')}
          </Text>
          <DetailRow label={t('orderDate')} value={new Date(order.created_at).toLocaleDateString('ar-SA')} colors={colors} />
          <DetailRow label={t('orderTotal')} value={`${order.total_amount.toFixed(2)} ريال`} colors={colors} />
          <DetailRow label={t('paymentMethod')} value={order.payment_method === 'cod' ? t('cashOnDelivery') : t('transferReceipt')} colors={colors} />
          <DetailRow label={t('fullName')} value={order.full_name} colors={colors} />
          <DetailRow label={t('phone')} value={order.phone} colors={colors} />
          <DetailRow label={t('address')} value={order.shipping_address} colors={colors} />
          {order.city_name && <DetailRow label={t('city')} value={order.city_name} colors={colors} />}
          {order.notes && <DetailRow label={t('notes')} value={order.notes} colors={colors} />}
        </View>

        {/* Payment Proof */}
        {order.payment_proof_url && (
          <View style={{ padding: spacing.lg }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.md }}>
              {t('paymentProof')}
            </Text>
            <Image
              source={{ uri: order.payment_proof_url }}
              style={{ width: '100%', height: 200, borderRadius: radius.md, backgroundColor: colors.surface }}
              resizeMode="contain"
            />
          </View>
        )}

        {/* Items */}
        <View style={{ padding: spacing.lg, marginBottom: spacing.xxxl }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.md }}>
            {t('items')} ({order.items.length})
          </Text>
          {order.items.map((item) => (
            <View
              key={item.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.surface,
                borderRadius: radius.md,
                padding: spacing.md,
                marginBottom: spacing.sm,
              }}
            >
              <Image
                source={{ uri: item.product_image }}
                style={{ width: 60, height: 60, borderRadius: radius.sm, backgroundColor: colors.surfaceVariant }}
              />
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text numberOfLines={2} style={{ fontSize: 14, fontWeight: '500', color: colors.textPrimary }}>
                  {item.product_title}
                </Text>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.primary, marginTop: spacing.xs }}>
                  {item.unit_price.toFixed(2)} ريال × {item.quantity}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function DetailRow({ label, value, colors }: any) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
      <Text style={{ fontSize: 14, color: colors.textSecondary }}>{label}</Text>
      <Text style={{ fontSize: 14, fontWeight: '500', color: colors.textPrimary, flex: 1, textAlign: 'right' }}>{value}</Text>
    </View>
  );
}
