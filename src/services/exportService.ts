import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Order } from '../types/order';
import { Product } from '../types/product';

export const exportService = {
  async exportOrdersToCSV(orders: Order[]): Promise<string> {
    const headers = [
      'Order ID', 'Customer', 'Phone', 'Email', 'Status',
      'Total', 'Discount', 'Payment Method', 'City',
      'Items', 'Created At', 'Notes',
    ];

    const rows = orders.map(order => [
      order.id,
      `"${(order.full_name || '').replace(/"/g, '""')}"`,
      order.phone,
      '',
      order.status,
      order.total_amount.toFixed(2),
      order.discount_amount.toFixed(2),
      order.payment_method,
      order.city_name || '',
      order.items?.length || 0,
      order.created_at ? new Date(order.created_at).toISOString().split('T')[0] : '',
      `"${(order.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    const fileUri = `${FileSystem.cacheDirectory}orders_export_${Date.now()}.csv`;
    await FileSystem.writeAsStringAsync(fileUri, csv, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    return fileUri;
  },

  async exportProductsToCSV(products: Product[]): Promise<string> {
    const headers = [
      'ID', 'Title', 'Price', 'Stock', 'Category ID',
      'Featured', 'Flash Sale', 'Views', 'Rating',
    ];

    const rows = products.map(p => [
      p.id,
      `"${p.title.replace(/"/g, '""')}"`,
      p.price.toFixed(2),
      p.stock,
      p.category_id,
      p.featured ? 'Yes' : 'No',
      p.flash_sale ? 'Yes' : 'No',
      p.views || 0,
      p.rating || 0,
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    const fileUri = `${FileSystem.cacheDirectory}products_export_${Date.now()}.csv`;
    await FileSystem.writeAsStringAsync(fileUri, csv, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    return fileUri;
  },

  async shareFile(fileUri: string) {
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      throw new Error('المشاركة غير متاحة على هذا الجهاز');
    }
    await Sharing.shareAsync(fileUri, {
      mimeType: 'text/csv',
      dialogTitle: 'تصدير البيانات',
    });
  },
};
