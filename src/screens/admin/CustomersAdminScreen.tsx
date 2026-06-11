import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useTheme } from '../../themes/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { adminService } from '../../services/adminService';
import { Profile } from '../../types/profile';
import { Ionicons } from '@expo/vector-icons';

export default function CustomersAdminScreen({ navigation }: { navigation: any }) {
  const { colors, spacing, radius } = useTheme();
  const { isSuperAdmin } = useAuth();
  const [customers, setCustomers] = useState<Profile[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;

  const loadCustomers = async (p = 1, s = '') => {
    try {
      const res = await adminService.listCustomers(s, p, limit);
      if (p === 1) setCustomers(res.data);
      else setCustomers(prev => [...prev, ...res.data]);
      setTotal(res.total);
    } catch (e) {
      console.error('Failed to load customers:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCustomers(page, search); }, [page]);

  const handleSearch = () => {
    setPage(1);
    setLoading(true);
    loadCustomers(1, search);
  };

  const handleRoleToggle = (user: Profile) => {
    if (!isSuperAdmin) {
      Alert.alert('صلاحية محدودة', 'فقط المشرف العام يمكنه تعديل الأدوار');
      return;
    }
    const newRole = user.role === 'admin' ? 'customer' : 'admin';
    Alert.alert('تأكيد', `تغيير صلاحية ${user.full_name || user.email} إلى ${newRole === 'admin' ? 'مشرف' : 'عميل'}؟`, [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'تأكيد', onPress: async () => {
        try {
          await adminService.updateUserRole(user.id, newRole);
          setCustomers(prev => prev.map(c => c.id === user.id ? { ...c, role: newRole as any } : c));
          Alert.alert('تم', 'تم تحديث الصلاحية بنجاح');
        } catch (e) {
          Alert.alert('خطأ', 'فشل تحديث الصلاحية');
        }
      }},
    ]);
  };

  const roleColors: Record<string, string> = {
    customer: colors.textSecondary,
    admin: colors.primary,
    super_admin: colors.error,
  };

  const roleLabels: Record<string, string> = {
    customer: 'عميل',
    admin: 'مشرف',
    super_admin: 'مشرف عام',
  };

  if (!isSuperAdmin) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: spacing.lg }}>
        <Ionicons name="shield-checkmark-outline" size={64} color={colors.error} />
        <Text style={{ color: colors.error, fontSize: 16, marginTop: spacing.md, textAlign: 'center' }}>هذه الصفحة متاحة فقط للمشرف العام</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: spacing.md, borderBottomWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: spacing.md }}>
          <Ionicons name="arrow-forward" size={24} color={colors.onBackground} />
        </TouchableOpacity>
        <Text style={{ fontSize: 22, fontWeight: '700', color: colors.onBackground }}>إدارة العملاء</Text>
      </View>

      <View style={{ padding: spacing.md, flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.sm }}>
          <Ionicons name="search-outline" size={18} color={colors.textTertiary} />
          <TextInput
            style={{ flex: 1, color: colors.onBackground, fontSize: 14, paddingVertical: spacing.sm, marginLeft: spacing.xs }}
            placeholder="بحث بالاسم أو البريد..."
            placeholderTextColor={colors.textTertiary}
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={handleSearch}
          />
        </View>
      </View>

      {loading && customers.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : (
        <FlatList
          data={customers}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxxl }}
          renderItem={({ item }) => (
            <View style={{ backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surfaceVariant, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md }}>
                <Text style={{ color: colors.onBackground, fontSize: 16, fontWeight: '600' }}>
                  {(item.full_name || item.email || '?').charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: colors.onBackground }}>{item.full_name || '—'}</Text>
                <Text style={{ fontSize: 12, color: colors.textTertiary }}>{item.email}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                  <View style={{ backgroundColor: `${roleColors[item.role] || colors.textSecondary}20`, paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.xs }}>
                    <Text style={{ fontSize: 11, color: roleColors[item.role] || colors.textSecondary, fontWeight: '600' }}>{roleLabels[item.role] || item.role}</Text>
                  </View>
                  {item.phone && <Text style={{ fontSize: 11, color: colors.textTertiary, marginLeft: spacing.sm }}>{item.phone}</Text>}
                </View>
              </View>
              {item.role !== 'super_admin' && (
                <TouchableOpacity
                  style={{ backgroundColor: item.role === 'admin' ? colors.warning : colors.primary, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radius.sm }}
                  onPress={() => handleRoleToggle(item)}
                >
                  <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '600' }}>{item.role === 'admin' ? 'خفض' : 'رفع'}</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', padding: spacing.xl }}>
              <Ionicons name="people-outline" size={48} color={colors.textTertiary} />
              <Text style={{ color: colors.textSecondary, fontSize: 16, marginTop: spacing.md }}>لا يوجد عملاء</Text>
            </View>
          }
          onEndReached={() => {
            if (customers.length < total) {
              const np = page + 1;
              setPage(np);
              loadCustomers(np, search);
            }
          }}
          onEndReachedThreshold={0.5}
        />
      )}
    </View>
  );
}
