import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../themes/ThemeContext';

interface SettingsRowProps {
  label: string;
  onPress?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  color?: string;
}

function SettingsRow({ label, onPress, icon, color }: SettingsRowProps) {
  const { colors, spacing, typography } = useTheme();
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={color || colors.textSecondary}
          />
        )}
        <Text style={{ fontSize: typography.fontSize.bodyMedium, color: color || colors.textPrimary }}>
          {label}
        </Text>
      </View>
      <Ionicons name="chevron-back" size={18} color={colors.textTertiary} />
    </TouchableOpacity>
  );
}

export default function SettingsScreen({ navigation }: any) {
  const { colors, spacing } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: spacing.lg, paddingTop: spacing.xxxl, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-forward" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={{ fontSize: 24, fontWeight: '600', color: colors.textPrimary, marginTop: spacing.md }}>
          الإعدادات
        </Text>
      </View>

      <View style={{ paddingTop: spacing.lg }}>
        <SettingsRow label="الملف الشخصي" icon="person-outline" />
        <View style={{ height: 1, backgroundColor: colors.divider, marginHorizontal: spacing.lg }} />
        <SettingsRow label="الإشعارات" icon="notifications-outline" />
        <View style={{ height: 1, backgroundColor: colors.divider, marginHorizontal: spacing.lg }} />
        <SettingsRow label="اللغة" icon="language-outline" />
        <View style={{ height: 1, backgroundColor: colors.divider, marginHorizontal: spacing.lg }} />
        <SettingsRow label="المظهر" icon="moon-outline" />
        <View style={{ height: 1, backgroundColor: colors.divider, marginHorizontal: spacing.lg }} />
        <SettingsRow label="حول التطبيق" icon="information-circle-outline" />
        <View style={{ height: 1, backgroundColor: colors.divider, marginHorizontal: spacing.lg }} />
        <SettingsRow label="تسجيل الخروج" icon="log-out-outline" color={colors.error} />
      </View>
    </View>
  );
}
