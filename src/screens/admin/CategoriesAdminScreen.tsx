import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Alert, ActivityIndicator, Modal } from 'react-native';
import { useTheme } from '../../themes/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { adminService } from '../../services/adminService';
import { Category } from '../../types/category';
import { Ionicons } from '@expo/vector-icons';

export default function CategoriesAdminScreen({ navigation }: { navigation: any }) {
  const { colors, spacing, radius } = useTheme();
  const { isAdmin } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editItem, setEditItem] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const loadCategories = async () => {
    try {
      const data = await adminService.listCategories();
      setCategories(data);
    } catch (e) {
      console.error('Failed to load categories:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCategories(); }, []);

  const openCreate = () => {
    setEditItem(null);
    setName('');
    setNameAr('');
    setImageUrl('');
    setModalVisible(true);
  };

  const openEdit = (cat: Category) => {
    setEditItem(cat);
    setName(cat.name);
    setNameAr((cat as any).name_ar || '');
    setImageUrl(cat.image_url || '');
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('خطأ', 'يرجى إدخال الاسم'); return; }
    setSaving(true);
    try {
      const data: Partial<Category> = { name: name.trim(), name_ar: nameAr.trim() || name.trim(), image_url: imageUrl.trim() || undefined };
      if (editItem) {
        await adminService.updateCategory(editItem.id, data);
      } else {
        await adminService.createCategory(data);
      }
      setModalVisible(false);
      loadCategories();
    } catch (e: any) {
      Alert.alert('خطأ', e.message || 'فشل الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (cat: Category) => {
    Alert.alert('تأكيد الحذف', `حذف التصنيف "${cat.name}"؟`, [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'حذف', style: 'destructive', onPress: async () => {
        try {
          await adminService.deleteCategory(cat.id);
          setCategories(prev => prev.filter(c => c.id !== cat.id));
        } catch (e) {
          Alert.alert('خطأ', 'فشل حذف التصنيف');
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

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: spacing.md, borderBottomWidth: 1, borderColor: colors.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: spacing.md }}>
          <Ionicons name="arrow-forward" size={24} color={colors.onBackground} />
        </TouchableOpacity>
        <Text style={{ flex: 1, fontSize: 22, fontWeight: '700', color: colors.onBackground }}>إدارة التصنيفات</Text>
        <TouchableOpacity style={{ backgroundColor: colors.primary, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radius.sm }} onPress={openCreate}>
          <Text style={{ color: colors.onPrimary, fontSize: 13, fontWeight: '600' }}>+ إضافة</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: spacing.md }}
          renderItem={({ item }) => (
            <View style={{ backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: colors.onBackground }}>{(item as any).name_ar || item.name}</Text>
                <Text style={{ fontSize: 12, color: colors.textTertiary, marginTop: 2 }}>{item.name}</Text>
                <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>المنتجات: {item.product_count || 0}</Text>
              </View>
              <TouchableOpacity onPress={() => openEdit(item)} style={{ padding: spacing.sm }}>
                <Ionicons name="create-outline" size={20} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item)} style={{ padding: spacing.sm }}>
                <Ionicons name="trash-outline" size={20} color={colors.error} />
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', padding: spacing.xl }}>
              <Ionicons name="layers-outline" size={48} color={colors.textTertiary} />
              <Text style={{ color: colors.textSecondary, fontSize: 16, marginTop: spacing.md }}>لا توجد تصنيفات</Text>
            </View>
          }
        />
      )}

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: colors.background, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.lg, maxHeight: '70%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: colors.onBackground }}>{editItem ? 'تعديل تصنيف' : 'إضافة تصنيف'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close-outline" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: spacing.xs }}>الاسم (إنجليزي)</Text>
            <TextInput style={{ backgroundColor: colors.surface, color: colors.onBackground, borderRadius: radius.sm, padding: spacing.md, fontSize: 14, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md }} value={name} onChangeText={setName} placeholder="Category name" placeholderTextColor={colors.textTertiary} />

            <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: spacing.xs }}>الاسم (عربي)</Text>
            <TextInput style={{ backgroundColor: colors.surface, color: colors.onBackground, borderRadius: radius.sm, padding: spacing.md, fontSize: 14, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md }} value={nameAr} onChangeText={setNameAr} placeholder="اسم التصنيف" placeholderTextColor={colors.textTertiary} />

            <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: spacing.xs }}>رابط الصورة</Text>
            <TextInput style={{ backgroundColor: colors.surface, color: colors.onBackground, borderRadius: radius.sm, padding: spacing.md, fontSize: 14, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.lg }} value={imageUrl} onChangeText={setImageUrl} placeholder="https://..." placeholderTextColor={colors.textTertiary} />

            <TouchableOpacity style={{ backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', opacity: saving ? 0.6 : 1 }} onPress={handleSave} disabled={saving}>
              {saving ? <ActivityIndicator size="small" color={colors.onPrimary} /> : <Text style={{ color: colors.onPrimary, fontSize: 16, fontWeight: '600' }}>{editItem ? 'تحديث' : 'إنشاء'}</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
