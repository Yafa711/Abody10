import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Alert, ActivityIndicator, Modal, Switch, ScrollView } from 'react-native';
import { useTheme } from '../../themes/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { adminService } from '../../services/adminService';
import { Coupon } from '../../types/coupon';
import { Ionicons } from '@expo/vector-icons';

export default function CouponsAdminScreen({ navigation }: { navigation: any }) {
  const { colors, spacing, radius } = useTheme();
  const { isAdmin } = useAuth();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editItem, setEditItem] = useState<Coupon | null>(null);
  const [code, setCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState('');
  const [maxUses, setMaxUses] = useState('');
  const [minPurchase, setMinPurchase] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      const data = await adminService.listCoupons();
      setCoupons(data);
    } catch (e) {
      console.error('Failed to load coupons:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const openCreate = () => {
    setEditItem(null);
    setCode('');
    setDiscountPercent('');
    setMaxUses('');
    setMinPurchase('');
    setExpiresAt('');
    setActive(true);
    setModalVisible(true);
  };

  const openEdit = (item: Coupon) => {
    setEditItem(item);
    setCode(item.code);
    setDiscountPercent(item.discount_percent.toString());
    setMaxUses(item.max_uses.toString());
    setMinPurchase(item.min_purchase.toString());
    setExpiresAt(item.expires_at.split('T')[0]);
    setActive(item.active);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!code.trim()) { Alert.alert('خطأ', 'يرجى إدخال كود الخصم'); return; }
    setSaving(true);
    try {
      const data: Partial<Coupon> = {
        code: code.trim().toUpperCase(),
        discount_percent: parseFloat(discountPercent) || 0,
        max_uses: parseInt(maxUses, 10) || 1,
        min_purchase: parseFloat(minPurchase) || 0,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : new Date(Date.now() + 365 * 86400000).toISOString(),
        active,
      };
      if (editItem) {
        await adminService.updateCoupon(editItem.id, data);
      } else {
        await adminService.createCoupon(data);
      }
      setModalVisible(false);
      loadData();
    } catch (e: any) {
      Alert.alert('خطأ', e.message || 'فشل الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (item: Coupon) => {
    Alert.alert('تأكيد الحذف', `حذف الكوبون "${item.code}"؟`, [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'حذف', style: 'destructive', onPress: async () => {
        try { await adminService.deleteCoupon(item.id); setCoupons(prev => prev.filter(c => c.id !== item.id)); }
        catch (e) { Alert.alert('خطأ', 'فشل الحذف'); }
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

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: spacing.md, borderBottomWidth: 1, borderColor: colors.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: spacing.md }}>
          <Ionicons name="arrow-forward" size={24} color={colors.onBackground} />
        </TouchableOpacity>
        <Text style={{ flex: 1, fontSize: 22, fontWeight: '700', color: colors.onBackground }}>إدارة الكوبونات</Text>
        <TouchableOpacity style={{ backgroundColor: colors.primary, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radius.sm }} onPress={openCreate}>
          <Text style={{ color: colors.onPrimary, fontSize: 13, fontWeight: '600' }}>+ إضافة</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : (
        <FlatList
          data={coupons}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: spacing.md }}
          renderItem={({ item }) => {
            const isExpired = new Date(item.expires_at) < new Date();
            return (
              <View style={{ backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: colors.primary, letterSpacing: 1 }}>{item.code}</Text>
                    {!item.active && <Text style={{ fontSize: 11, color: colors.error, marginLeft: spacing.sm }}>غير نشط</Text>}
                    {isExpired && <Text style={{ fontSize: 11, color: colors.warning, marginLeft: spacing.sm }}>منتهي</Text>}
                  </View>
                  <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity onPress={() => openEdit(item)} style={{ padding: spacing.xs }}><Ionicons name="create-outline" size={18} color={colors.primary} /></TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item)} style={{ padding: spacing.xs }}><Ionicons name="trash-outline" size={18} color={colors.error} /></TouchableOpacity>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', marginTop: spacing.xs }}>
                  <Text style={{ fontSize: 13, color: colors.textSecondary }}>{item.discount_percent}% خصم</Text>
                  <Text style={{ fontSize: 13, color: colors.textTertiary, marginHorizontal: spacing.sm }}>|</Text>
                  <Text style={{ fontSize: 13, color: colors.textSecondary }}>استخدام: {item.current_uses}/{item.max_uses}</Text>
                  <Text style={{ fontSize: 13, color: colors.textTertiary, marginHorizontal: spacing.sm }}>|</Text>
                  <Text style={{ fontSize: 13, color: colors.textSecondary }}>أقل شراء: {item.min_purchase} ريال</Text>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', padding: spacing.xl }}>
              <Ionicons name="pricetag-outline" size={48} color={colors.textTertiary} />
              <Text style={{ color: colors.textSecondary, fontSize: 16, marginTop: spacing.md }}>لا توجد كوبونات</Text>
            </View>
          }
        />
      )}

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}>
          <ScrollView style={{ backgroundColor: colors.background, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.lg, maxHeight: '80%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: colors.onBackground }}>{editItem ? 'تعديل كوبون' : 'إضافة كوبون'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}><Ionicons name="close-outline" size={24} color={colors.textSecondary} /></TouchableOpacity>
            </View>

            <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: spacing.xs }}>كود الخصم</Text>
            <TextInput style={{ backgroundColor: colors.surface, color: colors.onBackground, borderRadius: radius.sm, padding: spacing.md, fontSize: 14, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md }} value={code} onChangeText={setCode} placeholder="SUMMER25" placeholderTextColor={colors.textTertiary} autoCapitalize="characters" />

            <View style={{ flexDirection: 'row' }}>
              <View style={{ flex: 1, marginRight: spacing.sm }}>
                <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: spacing.xs }}>نسبة الخصم %</Text>
                <TextInput style={{ backgroundColor: colors.surface, color: colors.onBackground, borderRadius: radius.sm, padding: spacing.md, fontSize: 14, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md }} value={discountPercent} onChangeText={setDiscountPercent} keyboardType="decimal-pad" />
              </View>
              <View style={{ flex: 1, marginLeft: spacing.sm }}>
                <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: spacing.xs }}>أقصى استخدام</Text>
                <TextInput style={{ backgroundColor: colors.surface, color: colors.onBackground, borderRadius: radius.sm, padding: spacing.md, fontSize: 14, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md }} value={maxUses} onChangeText={setMaxUses} keyboardType="number-pad" />
              </View>
            </View>

            <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: spacing.xs }}>أقل قيمة للشراء (ريال)</Text>
            <TextInput style={{ backgroundColor: colors.surface, color: colors.onBackground, borderRadius: radius.sm, padding: spacing.md, fontSize: 14, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md }} value={minPurchase} onChangeText={setMinPurchase} keyboardType="decimal-pad" />

            <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: spacing.xs }}>تاريخ الانتهاء (YYYY-MM-DD)</Text>
            <TextInput style={{ backgroundColor: colors.surface, color: colors.onBackground, borderRadius: radius.sm, padding: spacing.md, fontSize: 14, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md }} value={expiresAt} onChangeText={setExpiresAt} placeholder="2026-12-31" placeholderTextColor={colors.textTertiary} />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg }}>
              <Text style={{ fontSize: 14, color: colors.onBackground }}>نشط</Text>
              <Switch value={active} onValueChange={setActive} trackColor={{ false: colors.surfaceVariant, true: `${colors.primary}60` }} thumbColor={active ? colors.primary : colors.textTertiary} />
            </View>

            <TouchableOpacity style={{ backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', opacity: saving ? 0.6 : 1, marginBottom: spacing.lg }} onPress={handleSave} disabled={saving}>
              {saving ? <ActivityIndicator size="small" color={colors.onPrimary} /> : <Text style={{ color: colors.onPrimary, fontSize: 16, fontWeight: '600' }}>{editItem ? 'تحديث' : 'إنشاء'}</Text>}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
