import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../themes/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

export default function ProfileScreen({ navigation }: { navigation: any }) {
  const { colors, spacing, radius } = useTheme();
  const { user, signOut, isAdmin, profile, isSuperAdmin } = useAuth();

  return (
    <View style={[styles.container, { backgroundColor: colors.background, padding: spacing.md }]}>
      {/* User header */}
      <View style={[styles.userHeader, { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg }]}>
        {/* User avatar placeholder */}
        <View style={[styles.avatar, {
          width: 72,
          height: 72,
          backgroundColor: colors.surface,
          borderRadius: radius.xxxl,
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: spacing.md,
        }]}>
          <Text style={{ color: colors.onBackground, fontSize: 24, fontWeight: '600' }}>
            {user?.email?.charAt(0).toUpperCase() || 'ع'}
          </Text>
        </View>

        {/* User info */}
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: colors.onBackground, fontSize: 20, fontWeight: '600' }]}>
            {profile?.full_name || user?.email?.split('@')[0] || 'مستخدم'}
          </Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary, fontSize: spacing.bodyMedium }]}>
            {user?.email || ''}
          </Text>
          {isAdmin && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
              <View style={{ backgroundColor: colors.primary, paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.xs }}>
                <Text style={{ color: colors.onPrimary, fontSize: 11, fontWeight: '600' }}>
                  {isSuperAdmin ? 'مشرف عام' : 'مشرف'}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Edit profile button */}
        <TouchableOpacity
          onPress={() => {
            // Navigate to edit profile screen (would be implemented)
            alert('سيتم تعديل الملف الشخصي قريباً');
          }}
          style={[
            styles.editButton,
            {
              backgroundColor: colors.surface,
              paddingVertical: spacing.xs,
              paddingHorizontal: spacing.sm,
              borderRadius: radius.sm,
            },
          ]}
        >
          <Text style={[styles.editButtonText, { color: colors.onBackground, fontSize: spacing.bodyMedium }]}>
            تعديل الملف الشخصي
          </Text>
        </TouchableOpacity>
      </View>

      {/* Menu options */}
      <View style={styles.menuContainer}>
        <TouchableOpacity
          style={[styles.menuItem, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderColor: colors.border }]}
          onPress={() => navigation.navigate('OrderHistory')}
        >
          <Text style={[styles.menuItemText, { color: colors.onBackground, fontSize: spacing.bodyMedium }]}>
            طلباتي
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: spacing.bodyMedium }}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderColor: colors.border }]}
          onPress={() => navigation.navigate('Favorites')}
        >
          <Text style={[styles.menuItemText, { color: colors.onBackground, fontSize: spacing.bodyMedium }]}>
            المفضلات
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: spacing.bodyMedium }}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderColor: colors.border }]}
          onPress={() => navigation.navigate('Address')}
        >
          <Text style={[styles.menuItemText, { color: colors.onBackground, fontSize: spacing.bodyMedium }]}>
            العناوين
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: spacing.bodyMedium }}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderColor: colors.border }]}
          onPress={() => alert('سيتم عرض طرق الدفع قريباً')}
        >
          <Text style={[styles.menuItemText, { color: colors.onBackground, fontSize: spacing.bodyMedium }]}>
            طرق الدفع
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: spacing.bodyMedium }}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderColor: colors.border }]}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={[styles.menuItemText, { color: colors.onBackground, fontSize: spacing.bodyMedium }]}>
            الإعدادات
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: spacing.bodyMedium }}>›</Text>
        </TouchableOpacity>

        <View style={[styles.menuItem, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderColor: colors.border }]}>
          <Text style={[styles.menuItemText, { color: colors.onBackground, fontSize: spacing.bodyMedium }]}>
            المساعدة والدعم
          </Text>
          <TouchableOpacity
            onPress={() => alert('سيتم عرض المساعدة والدعم قريباً')}
            style={{ paddingVertical: spacing.xs }}
          >
            <Text style={{ color: colors.textSecondary, fontSize: spacing.bodyMedium }}>›</Text>
          </TouchableOpacity>
        </View>

        {isAdmin && (
          <TouchableOpacity
            style={[styles.menuItem, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderColor: colors.border }]}
            onPress={() => navigation.navigate('AdminDashboard')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 16, color: colors.primary, fontWeight: '600' }}>🛡️</Text>
              <Text style={{ color: colors.primary, fontSize: spacing.bodyMedium, fontWeight: '600', marginLeft: spacing.sm }}>
                لوحة التحكم
              </Text>
            </View>
            <Text style={{ color: colors.primary, fontSize: spacing.bodyMedium }}>›</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Logout button */}
      <TouchableOpacity
        onPress={signOut}
        style={[
          styles.logoutButton,
          {
            backgroundColor: colors.error,
            paddingVertical: spacing.sm,
            borderRadius: radius.md,
            alignItems: 'center',
            marginTop: spacing.lg,
          },
        ]}
      >
        <Text style={[styles.logoutButtonText, {
          color: colors.onBackground,
          fontSize: spacing.bodyLarge,
          fontWeight: '600',
        }]}>
          تسجيل الخروج
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  userHeader: {},
  avatar: {},
  userInfo: {
    flex: 1,
  },
  userName: {},
  userEmail: {},
  editButton: {},
  editButtonText: {},
  menuContainer: {},
  menuItem: {},
  menuItemText: {},
  menuItemArrow: {},
  logoutButton: {},
  logoutButtonText: {},
});
