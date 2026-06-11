import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from '../../themes/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';
import { adminService, DashboardStats } from '../../services/adminService';
import { exportService } from '../../services/exportService';
import { errorService } from '../../services/errorService';
import { hapticService } from '../../services/hapticService';
import { Ionicons } from '@expo/vector-icons';

const statusColors: Record<string, string> = {
  pending: '#FF9500',
  processing: '#00D4AA',
  shipped: '#34C759',
  delivered: '#D4A853',
  cancelled: '#FF3B30',
};

export default function AdminDashboard({ navigation }: { navigation: any }) {
  const { colors, spacing, radius } = useTheme();
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const [chartPeriod, setChartPeriod] = useState<'day' | 'week' | 'month'>('week');
  const subscriptionRef = useRef<any>(null);

  const loadStats = useCallback(async () => {
    try {
      const data = await adminService.getDashboardStats();
      setStats(data);
    } catch (e) {
      errorService.capture(e, 'error', 'admin-dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
    const channel = supabase
      .channel('admin-dashboard-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        setRealtimeConnected(true);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        setRealtimeConnected(true);
      })
      .subscribe((status: string) => {
        if (status === 'SUBSCRIBED') setRealtimeConnected(true);
      });
    subscriptionRef.current = channel;
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleExportOrders = useCallback(async () => {
    if (!stats?.recentOrders?.length) return;
    hapticService.medium();
    try {
      const fileUri = await exportService.exportOrdersToCSV(stats.recentOrders);
      await exportService.shareFile(fileUri);
    } catch (e: any) {
      Alert.alert('خطأ', e.message || 'فشل تصدير الطلبات');
    }
  }, [stats]);

  if (!isAdmin) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: spacing.lg }}>
        <Ionicons name="shield-checkmark-outline" size={64} color={colors.error} />
        <Text style={{ color: colors.error, fontSize: 18, fontWeight: '600', marginTop: spacing.md, textAlign: 'center' }}>صلاحية الوصول مقيدة</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: spacing.sm, textAlign: 'center' }}>هذه الصفحة متاحة فقط للمشرفين</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const statCards = [
    { label: 'إجمالي المبيعات', value: `${(stats?.totalSales || 0).toLocaleString()} ريال`, icon: 'cash-outline', color: colors.primary },
    { label: 'إجمالي الطلبات', value: `${stats?.totalOrders || 0}`, icon: 'receipt-outline', color: colors.secondary },
    { label: 'عدد المنتجات', value: `${stats?.totalProducts || 0}`, icon: 'cube-outline', color: colors.info },
    { label: 'عدد المستخدمين', value: `${stats?.totalUsers || 0}`, icon: 'people-outline', color: colors.warning },
  ];

  const chartData = stats?.ordersOverTime || [];
  const periodData = chartPeriod === 'day' ? chartData.slice(-7) : chartPeriod === 'week' ? chartData : chartData;
  const maxTotal = Math.max(...periodData.map(d => d.total), 1);

  const menuItems = [
    { icon: 'cube-outline', title: 'إدارة المنتجات', description: 'أضف، عدّل، واحذف المنتجات', route: 'ProductManagement' },
    { icon: 'receipt-outline', title: 'إدارة الطلبات', description: 'راقب وعالج الطلبات', route: 'OrderManagement' },
    { icon: 'layers-outline', title: 'إدارة التصنيفات', description: 'إضافة وتعديل التصنيفات', route: 'CategoriesAdmin' },
    { icon: 'pricetag-outline', title: 'إدارة الكوبونات', description: 'إنشاء وإدارة أكواد الخصم', route: 'CouponsAdmin' },
    { icon: 'people-outline', title: 'إدارة العملاء', description: 'إدارة حسابات وأدوار المستخدمين', route: 'CustomersAdmin' },
    { icon: 'car-outline', title: 'إدارة الشحن', description: 'إدارة المدن ورسوم الشحن', route: 'ShippingAdmin' },
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadStats(); }} tintColor={colors.primary} />}
    >
      <View style={{ padding: spacing.md, borderBottomWidth: 1, borderColor: colors.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 24, fontWeight: '700', color: colors.onBackground }}>لوحة التحكم</Text>
          {realtimeConnected && (
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success, marginLeft: spacing.sm }} />
          )}
        </View>
        <TouchableOpacity onPress={handleExportOrders} style={{ padding: spacing.xs }}>
          <Ionicons name="download-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={{ padding: spacing.md, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        {statCards.map((card, i) => (
          <TouchableOpacity key={i} style={{ width: '48%', backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm }}
            onPress={() => { hapticService.light(); }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm }}>
              <Text style={{ fontSize: 12, color: colors.textSecondary }}>{card.label}</Text>
              <Ionicons name={card.icon as any} size={20} color={card.color} />
            </View>
            <Text style={{ fontSize: 22, fontWeight: '700', color: colors.onBackground }}>{card.value}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {stats && (
        <View style={{ paddingHorizontal: spacing.md, marginBottom: spacing.md }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.onBackground, marginBottom: spacing.sm }}>حالة الطلبات</Text>
          <View style={{ backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md }}>
            {[
              { label: 'قيد الانتظار', count: stats.pendingOrders, color: statusColors.pending },
              { label: 'قيد التجهيز', count: stats.processingOrders, color: statusColors.processing },
              { label: 'تم الشحن', count: stats.shippedOrders, color: statusColors.shipped },
              { label: 'تم التوصيل', count: stats.deliveredOrders, color: statusColors.delivered },
              { label: 'ملغي', count: stats.cancelledOrders, color: statusColors.cancelled },
            ].map((item, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: i < 4 ? spacing.sm : 0 }}>
                <Text style={{ width: 80, fontSize: 13, color: colors.textSecondary }}>{item.label}</Text>
                <View style={{ flex: 1, height: 20, backgroundColor: colors.surfaceVariant, borderRadius: radius.xs, marginHorizontal: spacing.sm, overflow: 'hidden' }}>
                  <View style={{ width: `${(item.count / Math.max(stats.pendingOrders, stats.processingOrders, stats.shippedOrders, stats.deliveredOrders, stats.cancelledOrders, 1)) * 100}%`, height: '100%', backgroundColor: item.color, borderRadius: radius.xs }} />
                </View>
                <Text style={{ width: 30, fontSize: 13, color: colors.onBackground, textAlign: 'right' }}>{item.count}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {stats && stats.ordersOverTime.length > 0 && (
        <View style={{ paddingHorizontal: spacing.md, marginBottom: spacing.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.onBackground }}>الإيرادات</Text>
            <View style={{ flexDirection: 'row' }}>
              {(['day', 'week', 'month'] as const).map(p => (
                <TouchableOpacity key={p} onPress={() => setChartPeriod(p)} style={{ paddingVertical: spacing.xs, paddingHorizontal: spacing.sm, borderRadius: radius.xs, backgroundColor: chartPeriod === p ? colors.primary : 'transparent', marginLeft: spacing.xs }}>
                  <Text style={{ fontSize: 11, color: chartPeriod === p ? colors.onPrimary : colors.textSecondary }}>{p === 'day' ? 'يوم' : p === 'week' ? 'أسبوع' : 'شهر'}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={{ backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {periodData.map((day, i) => {
                const barHeight = Math.max((day.total / maxTotal) * 120, 4);
                return (
                  <View key={i} style={{ alignItems: 'center', marginRight: spacing.md, width: 40 }}>
                    <Text style={{ fontSize: 10, color: colors.textTertiary, marginBottom: 4 }}>{day.total.toFixed(0)}</Text>
                    <View style={{ height: 120, justifyContent: 'flex-end', alignItems: 'center' }}>
                      <View style={{ width: 24, height: barHeight, backgroundColor: colors.primary, borderRadius: radius.xs, borderTopLeftRadius: radius.xs, borderTopRightRadius: radius.xs }} />
                    </View>
                    <Text style={{ fontSize: 9, color: colors.textTertiary, marginTop: 4 }}>{day.date.slice(5)}</Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      )}

      <View style={{ padding: spacing.md }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: colors.onBackground, marginBottom: spacing.sm }}>القائمة السريعة</Text>
        {menuItems.map((item, i) => (
          <TouchableOpacity
            key={i}
            style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm }}
            onPress={() => { hapticService.light(); navigation.navigate(item.route); }}
          >
            <View style={{ width: 44, height: 44, borderRadius: radius.sm, backgroundColor: `${colors.primary}20`, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md }}>
              <Ionicons name={item.icon as any} size={22} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: colors.onBackground }}>{item.title}</Text>
              <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>{item.description}</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={18} color={colors.textTertiary} />
          </TouchableOpacity>
        ))}
      </View>

      {stats && stats.recentOrders.length > 0 && (
        <View style={{ padding: spacing.md, marginBottom: spacing.xxxl }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.onBackground }}>آخر الطلبات</Text>
            <TouchableOpacity onPress={() => navigation.navigate('OrderManagement')}>
              <Text style={{ fontSize: 13, color: colors.primary }}>عرض الكل</Text>
            </TouchableOpacity>
          </View>
          {stats.recentOrders.map((order) => (
            <TouchableOpacity
              key={order.id}
              style={{ backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm }}
              onPress={() => navigation.navigate('OrderManagement', { orderId: order.id })}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 13, color: colors.textSecondary }}>#{order.id.slice(0, 8)}</Text>
                <Text style={{ fontSize: 13, fontWeight: '600', color: statusColors[order.status] || colors.textSecondary }}>{order.status}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.xs }}>
                <Text style={{ fontSize: 15, color: colors.onBackground }}>{order.full_name || 'عميل'}</Text>
                <Text style={{ fontSize: 15, fontWeight: '600', color: colors.primary }}>{order.total_amount.toFixed(2)} ريال</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
