import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../themes/ThemeContext';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { orderService } from '../../services/orderService';
import { storageService } from '../../services/storageService';
import { t } from '../../services/localization';

export default function PaymentScreen({ navigation }: any) {
  const { colors, spacing, radius, typography } = useTheme();
  const cart = useCart();
  const { user } = useAuth();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [paymentProofUri, setPaymentProofUri] = useState<string | null>(null);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = useCallback(() => {
    const e: Record<string, string> = {};
    if (!fullName.trim()) e.fullName = 'الحقل مطلوب';
    if (!phone.trim()) e.phone = 'الحقل مطلوب';
    else if (!/^05\d{8}$/.test(phone.trim())) e.phone = 'رقم جوال غير صالح';
    if (!address.trim()) e.address = 'الحقل مطلوب';
    if (!cart.selectedCity) e.city = 'اختر المدينة';
    if (paymentMethod === 'transfer' && !paymentProofUri) e.paymentProof = 'يرجى رفع إيصال الدفع';
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [fullName, phone, address, cart.selectedCity, paymentMethod, paymentProofUri]);

  const handlePickImage = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setPaymentProofUri(result.assets[0].uri);
    }
  }, []);

  const handlePlaceOrder = useCallback(async () => {
    if (!validate()) return;
    if (!user) {
      Alert.alert('', 'يجب تسجيل الدخول أولاً');
      navigation.navigate('Login');
      return;
    }

    setSubmitting(true);
    try {
      let paymentProofUrl: string | undefined;

      if (paymentMethod === 'transfer' && paymentProofUri) {
        paymentProofUrl = await storageService.uploadPaymentProof(user.id, paymentProofUri);
      }

      const orderInput = {
        items: cart.items.map((i) => ({
          product_id: i.product_id,
          quantity: i.quantity,
          unit_price: i.price,
          product_title: i.title,
          product_image: i.image_url,
        })),
        shipping_address: address.trim(),
        city_id: cart.selectedCity!.id,
        full_name: fullName.trim(),
        phone: phone.trim(),
        payment_method: paymentMethod,
        payment_proof_url: paymentProofUrl,
        coupon_code: cart.coupon?.code,
        coupon_id: cart.coupon?.id,
        discount_amount: cart.discountAmount,
        notes: notes.trim() || undefined,
      };

      await orderService.createOrder(user.id, orderInput as any);
      cart.clearCart();
      Alert.alert('', t('orderPlaced'), [
        { text: 'OK', onPress: () => navigation.navigate('Home') },
      ]);
    } catch (err: any) {
      Alert.alert('خطأ', err.message || 'فشل إنشاء الطلب');
    } finally {
      setSubmitting(false);
    }
  }, [validate, user, paymentMethod, paymentProofUri, cart, navigation, address, fullName, phone, notes]);

  const paymentMethods = [
    { key: 'cod', label: t('cashOnDelivery'), icon: 'wallet-outline', sub: 'ادفع نقداً عند الاستلام' },
    { key: 'transfer', label: t('transferReceipt'), icon: 'receipt-outline', sub: 'تحويل بنكي مع رفع الإيصال' },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} showsVerticalScrollIndicator={false}>
      <View style={{ padding: spacing.lg, paddingTop: spacing.xxxl }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: spacing.md }}>
          <Ionicons name="arrow-forward" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={{ fontSize: 24, fontWeight: '700', color: colors.textPrimary }}>{t('checkout')}</Text>
      </View>

      <View style={{ padding: spacing.lg }}>
        {/* Customer Info */}
        <Section title="معلومات العميل" colors={colors} typography={typography} spacing={spacing}>
          <InputField
            label={t('fullName')}
            value={fullName}
            onChange={setFullName}
            error={errors.fullName}
            colors={colors} spacing={spacing} radius={radius} typography={typography}
          />
          <InputField
            label={t('phone')}
            value={phone}
            onChange={setPhone}
            error={errors.phone}
            placeholder="05XXXXXXXX"
            keyboardType="phone-pad"
            colors={colors} spacing={spacing} radius={radius} typography={typography}
          />
          <InputField
            label={t('address')}
            value={address}
            onChange={setAddress}
            error={errors.address}
            colors={colors} spacing={spacing} radius={radius} typography={typography}
          />

          {/* City Selector */}
          <Text style={{ fontSize: 14, fontWeight: '500', color: colors.textPrimary, marginBottom: spacing.sm }}>
            {t('city')}
          </Text>
          <TouchableOpacity
            onPress={() => setShowCityPicker(!showCityPicker)}
            style={{
              height: 48,
              borderRadius: radius.md,
              paddingHorizontal: spacing.md,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: errors.city ? colors.error : colors.border,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Text style={{ color: cart.selectedCity ? colors.textPrimary : colors.textTertiary, fontSize: 14 }}>
              {cart.selectedCity ? cart.selectedCity.name : t('selectCity')}
            </Text>
            <Ionicons name="chevron-down" size={18} color={colors.textTertiary} />
          </TouchableOpacity>
          {!!errors.city && <Text style={{ color: colors.error, fontSize: 12, marginTop: 4 }}>{errors.city}</Text>}

          {showCityPicker && (
            <View style={{ marginTop: spacing.sm, backgroundColor: colors.surfaceVariant, borderRadius: radius.md, overflow: 'hidden' }}>
              {cart.cities.map((city) => (
                <TouchableOpacity
                  key={city.id}
                  onPress={() => {
                    cart.setSelectedCity(city);
                    setShowCityPicker(false);
                  }}
                  style={{
                    paddingVertical: spacing.md,
                    paddingHorizontal: spacing.md,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                    backgroundColor: cart.selectedCity?.id === city.id ? colors.primary + '20' : 'transparent',
                  }}
                >
                  <Text style={{ color: colors.textPrimary, fontSize: 14 }}>{city.name}</Text>
                  <Text style={{ color: colors.textTertiary, fontSize: 12, marginTop: 2 }}>
                    {t('shipping')}: {city.shipping_fee.toFixed(2)} ريال • {city.delivery_days} أيام
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <InputField
            label={t('notes')}
            value={notes}
            onChange={setNotes}
            multiline
            colors={colors} spacing={spacing} radius={radius} typography={typography}
          />
        </Section>

        {/* Payment Method */}
        <Section title={t('paymentMethod')} colors={colors} typography={typography} spacing={spacing}>
          {paymentMethods.map((pm) => (
            <TouchableOpacity
              key={pm.key}
              onPress={() => setPaymentMethod(pm.key)}
              activeOpacity={0.7}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: spacing.md,
                borderRadius: radius.md,
                marginBottom: spacing.sm,
                borderWidth: 1.5,
                borderColor: paymentMethod === pm.key ? colors.primary : colors.border,
                backgroundColor: paymentMethod === pm.key ? colors.primary + '10' : colors.surface,
              }}
            >
              <Ionicons name={pm.icon as any} size={22} color={paymentMethod === pm.key ? colors.primary : colors.textSecondary} />
              <View style={{ marginLeft: spacing.md, flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary }}>{pm.label}</Text>
                <Text style={{ fontSize: 12, color: colors.textTertiary, marginTop: 2 }}>{pm.sub}</Text>
              </View>
              <Ionicons
                name={paymentMethod === pm.key ? 'radio-button-on' : 'radio-button-off'}
                size={20}
                color={paymentMethod === pm.key ? colors.primary : colors.textTertiary}
              />
            </TouchableOpacity>
          ))}

          {paymentMethod === 'transfer' && (
            <View style={{ marginTop: spacing.md }}>
              <TouchableOpacity
                onPress={handlePickImage}
                style={{
                  height: 120,
                  borderRadius: radius.md,
                  borderWidth: 1.5,
                  borderColor: paymentProofUri ? colors.success : errors.paymentProof ? colors.error : colors.border,
                  borderStyle: 'dashed',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: colors.surface,
                }}
              >
                {paymentProofUri ? (
                  <Image
                    source={{ uri: paymentProofUri }}
                    style={{ width: '100%', height: '100%', borderRadius: radius.md }}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={{ alignItems: 'center' }}>
                    <Ionicons name="cloud-upload-outline" size={32} color={colors.textTertiary} />
                    <Text style={{ fontSize: 13, color: colors.textTertiary, marginTop: spacing.sm }}>{t('uploadHint')}</Text>
                  </View>
                )}
              </TouchableOpacity>
              {paymentProofUri && (
                <TouchableOpacity onPress={handlePickImage} style={{ marginTop: spacing.sm }}>
                  <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '500' }}>{t('changePhoto')}</Text>
                </TouchableOpacity>
              )}
              {!!errors.paymentProof && (
                <Text style={{ color: colors.error, fontSize: 12, marginTop: 4 }}>{errors.paymentProof}</Text>
              )}
            </View>
          )}
        </Section>

        {/* Order Summary */}
        <Section title={t('orderSummary')} colors={colors} typography={typography} spacing={spacing}>
          <SummaryRow label={t('subtotal')} value={`${cart.subtotal.toFixed(2)} ريال`} colors={colors} />
          <SummaryRow
            label={t('shipping')}
            value={cart.shippingFee > 0 ? `${cart.shippingFee.toFixed(2)} ريال` : t('free')}
            colors={colors}
          />
          {cart.discountAmount > 0 && (
            <SummaryRow
              label={t('discount')}
              value={`-${cart.discountAmount.toFixed(2)} ريال`}
              colors={colors}
              valueColor={colors.success}
            />
          )}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary }}>{t('total')}</Text>
            <Text style={{ fontSize: 22, fontWeight: '700', color: colors.primary }}>{cart.total.toFixed(2)} ريال</Text>
          </View>
        </Section>

        {/* Submit */}
        <TouchableOpacity
          activeOpacity={0.8}
          disabled={submitting}
          onPress={handlePlaceOrder}
          style={{
            backgroundColor: submitting ? colors.textTertiary : colors.primary,
            paddingVertical: spacing.lg,
            borderRadius: radius.md,
            alignItems: 'center',
            marginTop: spacing.lg,
            marginBottom: spacing.xxxxl,
          }}
        >
          {submitting ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <ActivityIndicator size="small" color={colors.onPrimary} />
              <Text style={{ fontSize: 18, fontWeight: '700', color: colors.onPrimary }}>{t('processing')}</Text>
            </View>
          ) : (
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.onPrimary }}>{t('placeOrder')}</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function Section({ title, children, colors, typography, spacing }: any) {
  return (
    <View style={{ marginBottom: spacing.xl }}>
      <Text style={{ fontSize: typography.fontSize.titleMedium, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.md }}>
        {title}
      </Text>
      {children}
    </View>
  );
}

function InputField({
  label, value, onChange, error, placeholder, keyboardType, multiline, colors, spacing, radius,
}: any) {
  return (
    <View style={{ marginBottom: spacing.md }}>
      <Text style={{ fontSize: 14, fontWeight: '500', color: colors.textPrimary, marginBottom: spacing.xs }}>{label}</Text>
      <TextInput
        style={{
          height: multiline ? 80 : 48,
          borderRadius: radius.md,
          paddingHorizontal: spacing.md,
          paddingTop: multiline ? spacing.md : 0,
          color: colors.textPrimary,
          fontSize: 14,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: error ? colors.error : colors.border,
          textAlignVertical: multiline ? 'top' : 'center',
        }}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        keyboardType={keyboardType}
        multiline={multiline}
      />
      {!!error && <Text style={{ color: colors.error, fontSize: 12, marginTop: 4 }}>{error}</Text>}
    </View>
  );
}

function SummaryRow({ label, value, colors, valueColor }: any) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
      <Text style={{ fontSize: 14, color: colors.textSecondary }}>{label}</Text>
      <Text style={{ fontSize: 14, fontWeight: '600', color: valueColor || colors.textPrimary }}>{value}</Text>
    </View>
  );
}
