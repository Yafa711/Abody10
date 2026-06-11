import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { supabase } from './supabase';
import { errorService } from './errorService';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const notificationService = {
  async registerForPushNotifications(): Promise<string | null> {
    if (!Device.isDevice) {
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return null;
    }

    try {
      const tokenData = await Notifications.getExpoPushTokenAsync();
      const token = tokenData.data;

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'الإشعارات العامة',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#D4A853',
        });
        await Notifications.setNotificationChannelAsync('orders', {
          name: 'الطلبات',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#D4A853',
        });
        await Notifications.setNotificationChannelAsync('promotions', {
          name: 'العروض والتخفيضات',
          importance: Notifications.AndroidImportance.DEFAULT,
          sound: 'default',
        });
      }

      return token;
    } catch (err) {
      errorService.log(err, 'push-notification-registration');
      return null;
    }
  },

  async savePushToken(userId: string, token: string): Promise<void> {
    try {
      await supabase.from('push_tokens').upsert(
        { user_id: userId, token, platform: Platform.OS, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      );
    } catch (err) {
      errorService.log(err, 'save-push-token');
    }
  },

  async sendLocalNotification(title: string, body: string, data?: Record<string, unknown>) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: null,
    });
  },

  async sendOrderStatusNotification(orderId: string, status: string, _customerName: string) {
    const statusMessages: Record<string, string> = {
      pending: 'قيد الانتظار',
      processing: 'قيد التجهيز',
      shipped: 'تم الشحن',
      delivered: 'تم التوصيل',
      cancelled: 'ملغي',
    };
    const statusMsg = statusMessages[status] || status;
    await this.sendLocalNotification(
      `تحديث الطلب #${orderId.slice(0, 8)}`,
      `تم تحديث حالة طلبك إلى: ${statusMsg}`,
      { orderId, type: 'order_status', screen: 'OrderDetail' }
    );
  },

  async sendPromotionNotification(title: string, description: string, productId?: string) {
    await this.sendLocalNotification(
      `🎉 ${title}`,
      description,
      { productId, type: 'promotion', screen: 'Home' }
    );
  },

  async sendFlashSaleNotification(productTitle: string, flashPrice: number, productId: string) {
    await this.sendLocalNotification(
      '⚡ عرض خاطف!',
      `${productTitle} — الآن بسعر ${flashPrice} ريال!`,
      { productId, type: 'flash_sale', screen: 'ProductDetails' }
    );
  },

  addNotificationResponseListener(handler: (response: Notifications.NotificationResponse) => void) {
    const subscription = Notifications.addNotificationResponseReceivedListener(handler);
    return () => subscription.remove();
  },
};
