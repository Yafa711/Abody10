import React, { useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../themes/ThemeContext';
import { useCart, CartItem } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { EmptyState } from '../components';
import { t } from '../services/localization';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CartScreen({ navigation }: any) {
  const { colors, spacing, radius, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const cart = useCart();
  const { user } = useAuth();
  const handleIncrement = useCallback(
    (item: CartItem) => cart.updateQuantity(item.product_id, item.quantity + 1),
    [cart]
  );

  const handleDecrement = useCallback(
    (item: CartItem) => {
      if (item.quantity <= 1) {
        Alert.alert(t('confirmDelete'), '', [
          { text: t('cancel'), style: 'cancel' },
          { text: t('yes'), onPress: () => cart.removeItem(item.product_id) },
        ]);
      } else {
        cart.updateQuantity(item.product_id, item.quantity - 1);
      }
    },
    [cart]
  );

  const handleRemove = useCallback(
    (productId: string) => {
      Alert.alert(t('confirmDelete'), '', [
        { text: t('cancel'), style: 'cancel' },
        { text: t('yes'), onPress: () => cart.removeItem(productId) },
      ]);
    },
    [cart]
  );

  const renderItem = useCallback(
    ({ item }: { item: CartItem }) => (
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: colors.surface,
          borderRadius: radius.md,
          marginBottom: spacing.md,
          overflow: 'hidden',
        }}
      >
        <Image
          source={{ uri: item.image_url }}
          style={{ width: 100, height: 100, resizeMode: 'cover' }}
        />
        <View style={{ flex: 1, padding: spacing.md }}>
          <Text
            numberOfLines={2}
            style={{
              fontSize: typography.fontSize.bodyMedium,
              fontWeight: '600',
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
            {item.price.toFixed(2)} ريال
          </Text>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: spacing.sm,
              gap: spacing.md,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: radius.sm,
                overflow: 'hidden',
              }}
            >
              <TouchableOpacity
                onPress={() => handleDecrement(item)}
                style={{
                  width: 32,
                  height: 32,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: colors.surfaceVariant,
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary }}>-</Text>
              </TouchableOpacity>
              <View
                style={{
                  width: 36,
                  height: 32,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderLeftWidth: 1,
                  borderRightWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary }}>
                  {item.quantity}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => handleIncrement(item)}
                style={{
                  width: 32,
                  height: 32,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: colors.surfaceVariant,
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary }}>+</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => handleRemove(item.product_id)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="trash-outline" size={18} color={colors.error} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    ),
    [colors, spacing, radius, typography, handleDecrement, handleIncrement, handleRemove]
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      <View
        style={{
          padding: spacing.lg,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <Text style={{ fontSize: 24, fontWeight: '700', color: colors.textPrimary }}>
          {t('cart')}
        </Text>
        {cart.items.length > 0 && (
          <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: spacing.xs }}>
            {cart.items.length} {t('items')}
          </Text>
        )}
      </View>

      {cart.items.length === 0 ? (
        <EmptyState
          icon="cart-outline"
          title={t('cartEmpty')}
          actionLabel={t('startShopping')}
          onAction={() => navigation.navigate('Home')}
        />
      ) : (
        <FlatList
          data={cart.items}
          keyExtractor={(item) => item.product_id}
          contentContainerStyle={{ padding: spacing.lg }}
          showsVerticalScrollIndicator={false}
          renderItem={renderItem}
          ListFooterComponent={
            <View style={{ marginTop: spacing.md }}>
              {/* Coupon */}
              <View
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: radius.md,
                  padding: spacing.lg,
                  marginBottom: spacing.md,
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.sm }}>
                  {t('couponCode')}
                </Text>
                <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                  <View
                    style={{
                      flex: 1,
                      height: 44,
                      borderRadius: radius.sm,
                      borderWidth: 1,
                      borderColor: cart.coupon ? colors.success : colors.border,
                      paddingHorizontal: spacing.md,
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ color: colors.textPrimary, fontSize: 14 }}>{cart.couponCode || ''}</Text>
                  </View>
                  {cart.coupon ? (
                    <TouchableOpacity
                      onPress={cart.removeCoupon}
                      style={{
                        height: 44,
                        paddingHorizontal: spacing.md,
                        borderRadius: radius.sm,
                        backgroundColor: colors.error + '20',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ color: colors.error, fontSize: 13, fontWeight: '600' }}>إلغاء</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={() => cart.applyCoupon().catch(() => {})}
                      style={{
                        height: 44,
                        paddingHorizontal: spacing.lg,
                        borderRadius: radius.sm,
                        backgroundColor: colors.primary,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ color: colors.onPrimary, fontSize: 13, fontWeight: '600' }}>{t('apply')}</Text>
                    </TouchableOpacity>
                  )}
                </View>
                {cart.coupon && (
                  <Text style={{ color: colors.success, fontSize: 12, marginTop: spacing.xs }}>
                    {t('validCoupon')}: خصم {cart.coupon.discount_percent}%
                  </Text>
                )}
              </View>

              {/* Order Summary */}
              <View
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: radius.lg,
                  padding: spacing.lg,
                }}
              >
                <Text style={{ fontSize: 18, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.md }}>
                  {t('orderSummary')}
                </Text>

                <Row label={t('subtotal')} value={`${cart.subtotal.toFixed(2)} ريال`} colors={colors} />
                <Row label={t('shipping')} value={cart.shippingFee > 0 ? `${cart.shippingFee.toFixed(2)} ريال` : t('free')} colors={colors} />

                {cart.discountAmount > 0 && (
                  <Row
                    label={t('discount')}
                    value={`-${cart.discountAmount.toFixed(2)} ريال`}
                    colors={colors}
                    valueColor={colors.success}
                  />
                )}

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: spacing.md,
                    paddingTop: spacing.md,
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                  }}
                >
                  <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary }}>
                    {t('total')}
                  </Text>
                  <Text style={{ fontSize: 22, fontWeight: '700', color: colors.primary }}>
                    {cart.total.toFixed(2)} ريال
                  </Text>
                </View>
              </View>

              {/* Checkout button */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  if (!user) {
                    navigation.navigate('Login');
                    return;
                  }
                  navigation.navigate('Checkout');
                }}
                style={{
                  backgroundColor: colors.primary,
                  paddingVertical: spacing.lg,
                  borderRadius: radius.md,
                  alignItems: 'center',
                  marginTop: spacing.lg,
                  marginBottom: spacing.xxxl,
                }}
              >
                <Text style={{ fontSize: 18, fontWeight: '700', color: colors.onPrimary }}>
                  {t('checkout')}
                </Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
}

function Row({
  label,
  value,
  colors,
  valueColor,
}: {
  label: string;
  value: string;
  colors: any;
  valueColor?: string;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
      }}
    >
      <Text style={{ fontSize: 14, color: colors.textSecondary }}>{label}</Text>
      <Text
        style={{
          fontSize: 14,
          fontWeight: '600',
          color: valueColor || colors.textPrimary,
        }}
      >
        {value}
      </Text>
    </View>
  );
}
