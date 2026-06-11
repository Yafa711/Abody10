import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Alert, ActivityIndicator, Modal, Switch } from 'react-native';
import { useTheme } from '../../themes/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { adminService } from '../../services/adminService';
import { City } from '../../types/city';
import { Ionicons } from '@expo/vector-icons';

export default function ShippingAdminScreen({ navigation }: { navigation: any }) {
  const { colors, spacing, radius } = useTheme();
  const { isAdmin } = useAuth();
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editItem, setEditItem] = useState<City | null>(null);
  const [name, setName] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [shippingFee, setShippingFee] = useState('');
  const [deliveryDays, setDeliveryDays] = useState('');
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      const data = await adminService.listCities();
      setCities(data);
    } catch (e) {
      console.error('Failed to load cities:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const openCreate = () => {
    setEditItem(null);
    setName(''); setNameAr(''); setShippingFee(''); setDeliveryDays(''); setActive(true);
    setModalVisible(true);
  };

  const openEdit = (item: City) => {
    setEditItem(item);
    setName(item.name);
    setNameAr(item.name_ar);
    setShippingFee(item.shipping_fee.toString());
    setDeliveryDays(item.delivery_days.toString());
    setActive(item.active);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('خطأ', 'يرجى إدخال اسم المدينة'); return; }
    setSaving(true);
    try {
      const data: Partial<City> = {
        name: name.trim(),
        name_ar: nameAr.trim() || name.trim(),
        shipping_fee: parseFloat(shippingFee) || 0,
        delivery_days: parseInt(deliveryDays, 10) || 1,
        active,
      };
      if (editItem) {
        await adminService.updateCity(editItem.id, data);
      } else {
        await adminService.createCity(data);
      }
      setModalVisible(false);
      loadData();
    } catch (e: any) {
      Alert.alert('خطأ', e.message || 'فشل الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (item: City) => {
    Alert.alert('تأكيد الحذف', `حذف مدينة "${item.name_ar || item.name}"؟`, [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'حذف', style: 'destructive', onPress: async () => {
        try { await adminService.deleteCity(item.id); setCities(prev => prev.filter(c => c.id !== item.id)); }
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
        <Text style={{ flex: 1, fontSize: 22, fontWeight: '700', color: colors.onBackground }}>إدارة الشحن</Text>
        <TouchableOpacity style={{ backgroundColor: colors.primary, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radius.sm }} onPress={openCreate}>
          <Text style={{ color: colors.onPrimary, fontSize: 13, fontWeight: '600' }}>+ إضافة</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : (
        <FlatList
          data={cities}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: spacing.md }}
          renderItem={({ item }) => (
            <View style={{ backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: colors.onBackground }}>{item.name_ar || item.name}</Text>
                <View style={{ flexDirection: 'row', marginTop: 4 }}>
                  <Text style={{ fontSize: 12, color: colors.primary, fontWeight: '600' }}>{item.shipping_fee.toFixed(2)} ريال</Text>
                  <Text style={{ fontSize: 12, color: colors.textTertiary, marginHorizontal: spacing.xs }}>•</Text>
                  <Text style={{ fontSize: 12, color: colors.textSecondary }}>{item.delivery_days} يوم</Text>
                  {!item.active && (
                    <>
                      <Text style={{ fontSize: 12, color: colors.textTertiary, marginHorizontal: spacing.xs }}>•</Text>
                      <Text style={{ fontSize: 12, color: colors.error }}>غير نشط</Text>
                    </>
                  )}
                </View>
              </View>
              <TouchableOpacity onPress={() => openEdit(item)} style={{ padding: spacing.sm }}><Ionicons name="create-outline" size={20} color={colors.primary} /></TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item)} style={{ padding: spacing.sm }}><Ionicons name="trash-outline" size={20} color={colors.error} /></TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', padding: spacing.xl }}>
              <Ionicons name="car-outline" size={48} color={colors.textTertiary} />
              <Text style={{ color: colors.textSecondary, fontSize: 16, marginTop: spacing.md }}>لا توجد مدن</Text>
            </View>
          }
        />
      )}

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: colors.background, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.lg }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: colors.onBackground }}>{editItem ? 'تعديل مدينة' : 'إضافة مدينة'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}><Ionicons name="close-outline" size={24} color={colors.textSecondary} /></TouchableOpacity>
            </View>

            <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: spacing.xs }}>الاسم (إنجليزي)</Text>
            <TextInput style={{ backgroundColor: colors.surface, color: colors.onBackground, borderRadius: radius.sm, padding: spacing.md, fontSize: 14, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md }} value={name} onChangeText={setName} placeholder="City name" placeholderTextColor={colors.textTertiary} />

            <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: spacing.xs }}>الاسم (عربي)</Text>
            <TextInput style={{ backgroundColor: colors.surface, color: colors.onBackground, borderRadius: radius.sm, padding: spacing.md, fontSize: 14, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md }} value={nameAr} onChangeText={setNameAr} placeholder="اسم المدينة" placeholderTextColor={colors.textTertiary} />

            <View style={{ flexDirection: 'row' }}>
              <View style={{ flex: 1, marginRight: spacing.sm }}>
                <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: spacing.xs }}>رسوم الشحن (ريال)</Text>
                <TextInput style={{ backgroundColor: colors.surface, color: colors.onBackground, borderRadius: radius.sm, padding: spacing.md, fontSize: 14, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md }} value={shippingFee} onChangeText={setShippingFee} keyboardType="decimal-pad" />
              </View>
              <View style={{ flex: 1, marginLeft: spacing.sm }}>
                <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: spacing.xs }}>أيام التوصيل</Text>
                <TextInput style={{ backgroundColor: colors.surface, color: colors.onBackground, borderRadius: radius.sm, padding: spacing.md, fontSize: 14, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md }} value={deliveryDays} onChangeText={setDeliveryDays} keyboardType="number-pad" />
              </View>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg }}>
              <Text style={{ fontSize: 14, color: colors.onBackground }}>نشط</Text>
              <Switch value={active} onValueChange={setActive} trackColor={{ false: colors.surfaceVariant, true: `${colors.primary}60` }} thumbColor={active ? colors.primary : colors.textTertiary} />
            </View>

            <TouchableOpacity style={{ backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', opacity: saving ? 0.6 : 1, marginBottom: spacing.lg }} onPress={handleSave} disabled={saving}>
              {saving ? <ActivityIndicator size="small" color={colors.onPrimary} /> : <Text style={{ color: colors.onPrimary, fontSize: 16, fontWeight: '600' }}>{editItem ? 'تحديث' : 'إنشاء'}</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
