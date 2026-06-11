import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator, Switch } from 'react-native';
import { useTheme } from '../../themes/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { adminService } from '../../services/adminService';
import { Product } from '../../types/product';
import { Category } from '../../types/category';
import { Ionicons } from '@expo/vector-icons';

export default function ProductEditorScreen({ route, navigation }: { route: any; navigation: any }) {
  const { colors, spacing, radius } = useTheme();
  const { isAdmin } = useAuth();
  const existing: Product | null = route.params?.product || null;
  const isEdit = !!existing;

  const [title, setTitle] = useState(existing?.title || '');
  const [description, setDescription] = useState(existing?.description || '');
  const [price, setPrice] = useState(existing?.price?.toString() || '');
  const [originalPrice, setOriginalPrice] = useState(existing?.original_price?.toString() || '');
  const [stock, setStock] = useState(existing?.stock?.toString() || '0');
  const [imageUrl, setImageUrl] = useState(existing?.image_url || '');
  const [categoryId, setCategoryId] = useState(existing?.category_id || '');
  const [featured, setFeatured] = useState(existing?.featured || false);
  const [flashSale, setFlashSale] = useState(existing?.flash_sale || false);
  const [flashSalePrice, setFlashSalePrice] = useState(existing?.flash_sale_price?.toString() || '');
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  useEffect(() => {
    adminService.listCategories().then(setCategories).catch(() => {});
  }, []);

  const handleSave = async () => {
    if (!title.trim()) { Alert.alert('خطأ', 'يرجى إدخال اسم المنتج'); return; }
    if (!price) { Alert.alert('خطأ', 'يرجى إدخال السعر'); return; }
    setSaving(true);
    try {
      const data: Partial<Product> = {
        title: title.trim(),
        description: description.trim(),
        price: parseFloat(price),
        original_price: originalPrice ? parseFloat(originalPrice) : undefined,
        stock: parseInt(stock, 10) || 0,
        image_url: imageUrl.trim() || null as any,
        category_id: categoryId || null as any,
        featured,
        flash_sale: flashSale,
        flash_sale_price: flashSale && flashSalePrice ? parseFloat(flashSalePrice) : undefined,
      };
      if (isEdit) {
        await adminService.updateProduct(existing!.id, data);
        Alert.alert('تم', 'تم تحديث المنتج بنجاح');
      } else {
        await adminService.createProduct(data);
        Alert.alert('تم', 'تم إنشاء المنتج بنجاح');
      }
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('خطأ', e.message || 'فشل حفظ المنتج');
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: colors.error, fontSize: 16 }}>غير مصرح بالوصول</Text>
      </View>
    );
  }

  const selectedCategory = categories.find(c => c.id === categoryId);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: spacing.md, borderBottomWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: spacing.md }}>
          <Ionicons name="arrow-forward" size={24} color={colors.onBackground} />
        </TouchableOpacity>
        <Text style={{ fontSize: 22, fontWeight: '700', color: colors.onBackground }}>{isEdit ? 'تعديل منتج' : 'إضافة منتج'}</Text>
      </View>

      <View style={{ padding: spacing.md }}>
        <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: spacing.xs, fontWeight: '500' }}>اسم المنتج</Text>
        <TextInput
          style={{ backgroundColor: colors.surface, color: colors.onBackground, borderRadius: radius.sm, padding: spacing.md, fontSize: 14, borderWidth: 1, borderColor: colors.border }}
          value={title}
          onChangeText={setTitle}
          placeholder="اسم المنتج"
          placeholderTextColor={colors.textTertiary}
        />
      </View>

      <View style={{ padding: spacing.md }}>
        <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: spacing.xs, fontWeight: '500' }}>الوصف</Text>
        <TextInput
          style={{ backgroundColor: colors.surface, color: colors.onBackground, borderRadius: radius.sm, padding: spacing.md, fontSize: 14, minHeight: 80, borderWidth: 1, borderColor: colors.border, textAlignVertical: 'top' }}
          value={description}
          onChangeText={setDescription}
          placeholder="وصف المنتج"
          placeholderTextColor={colors.textTertiary}
          multiline
        />
      </View>

      <View style={{ padding: spacing.md, flexDirection: 'row' }}>
        <View style={{ flex: 1, marginRight: spacing.sm }}>
          <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: spacing.xs, fontWeight: '500' }}>السعر (ريال)</Text>
          <TextInput
            style={{ backgroundColor: colors.surface, color: colors.onBackground, borderRadius: radius.sm, padding: spacing.md, fontSize: 14, borderWidth: 1, borderColor: colors.border }}
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor={colors.textTertiary}
          />
        </View>
        <View style={{ flex: 1, marginLeft: spacing.sm }}>
          <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: spacing.xs, fontWeight: '500' }}>السعر الأصلي</Text>
          <TextInput
            style={{ backgroundColor: colors.surface, color: colors.onBackground, borderRadius: radius.sm, padding: spacing.md, fontSize: 14, borderWidth: 1, borderColor: colors.border }}
            value={originalPrice}
            onChangeText={setOriginalPrice}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor={colors.textTertiary}
          />
        </View>
      </View>

      <View style={{ padding: spacing.md, flexDirection: 'row' }}>
        <View style={{ flex: 1, marginRight: spacing.sm }}>
          <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: spacing.xs, fontWeight: '500' }}>المخزون</Text>
          <TextInput
            style={{ backgroundColor: colors.surface, color: colors.onBackground, borderRadius: radius.sm, padding: spacing.md, fontSize: 14, borderWidth: 1, borderColor: colors.border }}
            value={stock}
            onChangeText={setStock}
            keyboardType="number-pad"
            placeholder="0"
            placeholderTextColor={colors.textTertiary}
          />
        </View>
        <View style={{ flex: 1, marginLeft: spacing.sm }}>
          <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: spacing.xs, fontWeight: '500' }}>التصنيف</Text>
          <TouchableOpacity
            style={{ backgroundColor: colors.surface, borderRadius: radius.sm, padding: spacing.md, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
            onPress={() => setShowCategoryPicker(!showCategoryPicker)}
          >
            <Text style={{ color: selectedCategory ? colors.onBackground : colors.textTertiary, fontSize: 14 }}>
              {selectedCategory ? (selectedCategory as any).name_ar || selectedCategory.name : 'اختر تصنيف'}
            </Text>
            <Ionicons name={showCategoryPicker ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textTertiary} />
          </TouchableOpacity>
          {showCategoryPicker && (
            <View style={{ backgroundColor: colors.surfaceVariant, borderRadius: radius.sm, marginTop: spacing.xs, maxHeight: 160 }}>
              <ScrollView>
                <TouchableOpacity
                  style={{ padding: spacing.sm, borderBottomWidth: 1, borderColor: colors.border }}
                  onPress={() => { setCategoryId(''); setShowCategoryPicker(false); }}
                >
                  <Text style={{ color: colors.textTertiary, fontSize: 14 }}>بدون تصنيف</Text>
                </TouchableOpacity>
                {categories.map(cat => (
                  <TouchableOpacity
                    key={cat.id}
                    style={{ padding: spacing.sm, borderBottomWidth: 1, borderColor: colors.border, backgroundColor: cat.id === categoryId ? `${colors.primary}20` : 'transparent' }}
                    onPress={() => { setCategoryId(cat.id); setShowCategoryPicker(false); }}
                  >
                    <Text style={{ color: cat.id === categoryId ? colors.primary : colors.onBackground, fontSize: 14 }}>
                      {(cat as any).name_ar || cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </View>

      <View style={{ padding: spacing.md }}>
        <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: spacing.xs, fontWeight: '500' }}>رابط الصورة</Text>
        <TextInput
          style={{ backgroundColor: colors.surface, color: colors.onBackground, borderRadius: radius.sm, padding: spacing.md, fontSize: 14, borderWidth: 1, borderColor: colors.border }}
          value={imageUrl}
          onChangeText={setImageUrl}
          placeholder="https://example.com/image.jpg"
          placeholderTextColor={colors.textTertiary}
        />
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={{ width: '100%', height: 160, borderRadius: radius.sm, marginTop: spacing.sm }} resizeMode="cover" />
        ) : null}
      </View>

      <View style={{ padding: spacing.md }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
          <Text style={{ fontSize: 14, color: colors.onBackground }}>منتج مميز</Text>
          <Switch value={featured} onValueChange={setFeatured} trackColor={{ false: colors.surfaceVariant, true: `${colors.primary}60` }} thumbColor={featured ? colors.primary : colors.textTertiary} />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 14, color: colors.onBackground }}>عرض خاص</Text>
          <Switch value={flashSale} onValueChange={setFlashSale} trackColor={{ false: colors.surfaceVariant, true: `${colors.error}60` }} thumbColor={flashSale ? colors.error : colors.textTertiary} />
        </View>
        {flashSale && (
          <View style={{ marginTop: spacing.sm }}>
            <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: spacing.xs }}>سعر العرض</Text>
            <TextInput
              style={{ backgroundColor: colors.surface, color: colors.onBackground, borderRadius: radius.sm, padding: spacing.md, fontSize: 14, borderWidth: 1, borderColor: colors.border }}
              value={flashSalePrice}
              onChangeText={setFlashSalePrice}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={colors.textTertiary}
            />
          </View>
        )}
      </View>

      <View style={{ padding: spacing.md, marginBottom: spacing.xxxl }}>
        <TouchableOpacity
          style={{ backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', opacity: saving ? 0.6 : 1 }}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color={colors.onPrimary} />
          ) : (
            <Text style={{ color: colors.onPrimary, fontSize: 16, fontWeight: '600' }}>{isEdit ? 'تحديث المنتج' : 'إنشاء المنتج'}</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
