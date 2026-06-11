import { supabase } from './supabase';
import { Product } from '../types/product';
import { Category } from '../types/category';
import { Order, OrderStatus } from '../types/order';
import { Coupon } from '../types/coupon';
import { City } from '../types/city';
import { Profile } from '../types/profile';

export interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  ordersOverTime: { date: string; count: number; total: number }[];
  recentOrders: Order[];
}

export const adminService = {

  async getDashboardStats(): Promise<DashboardStats> {
    const [ordersRes, productsRes, profilesRes] = await Promise.all([
      supabase.from('orders').select('total_amount, status, created_at'),
      supabase.from('products').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
    ]);

    const orders = (ordersRes.data || []) as any[];
    const totalSales = orders.reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0);
    const totalOrders = orders.length;
    const totalProducts = productsRes.count || 0;
    const totalUsers = profilesRes.count || 0;

    const counts: Record<string, number> = { pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 };
    orders.forEach((o: any) => { if (counts[o.status] !== undefined) counts[o.status]++; });

    const days: Record<string, { count: number; total: number }> = {};
    orders.forEach((o: any) => {
      const date = o.created_at?.split('T')[0] || '';
      if (date) {
        if (!days[date]) days[date] = { count: 0, total: 0 };
        days[date].count++;
        days[date].total += o.total_amount || 0;
      }
    });
    const ordersOverTime = Object.entries(days)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-30)
      .map(([date, val]) => ({ date, count: val.count, total: val.total }));

    const { data: recentOrders } = await supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .order('created_at', { ascending: false })
      .limit(5);

    return {
      totalSales,
      totalOrders,
      totalProducts,
      totalUsers,
      pendingOrders: counts.pending,
      processingOrders: counts.processing,
      shippedOrders: counts.shipped,
      deliveredOrders: counts.delivered,
      cancelledOrders: counts.cancelled,
      ordersOverTime,
      recentOrders: ((recentOrders as any[]) || []).map(mapOrder),
    };
  },

  async listProducts(search?: string, page = 1, limit = 20): Promise<{ data: Product[]; total: number }> {
    let query = supabase.from('products').select('*', { count: 'exact' });
    if (search) query = query.ilike('title', `%${search}%`);
    query = query.order('created_at', { ascending: false });
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);
    const { data, error, count } = await query;
    if (error) throw error;
    return { data: (data as Product[]) || [], total: count || 0 };
  },

  async createProduct(input: Partial<Product>): Promise<Product> {
    const { data, error } = await supabase.from('products').insert(input).select().single();
    if (error) throw error;
    return data as Product;
  },

  async updateProduct(id: string, input: Partial<Product>): Promise<Product> {
    const { data, error } = await supabase.from('products').update(input).eq('id', id).select().single();
    if (error) throw error;
    return data as Product;
  },

  async deleteProduct(id: string): Promise<void> {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
  },

  async listCategories(): Promise<Category[]> {
    const { data, error } = await supabase.from('categories').select('*').order('name');
    if (error) throw error;
    return (data as Category[]) || [];
  },

  async createCategory(input: Partial<Category>): Promise<Category> {
    const { data, error } = await supabase.from('categories').insert(input).select().single();
    if (error) throw error;
    return data as Category;
  },

  async updateCategory(id: string, input: Partial<Category>): Promise<Category> {
    const { data, error } = await supabase.from('categories').update(input).eq('id', id).select().single();
    if (error) throw error;
    return data as Category;
  },

  async deleteCategory(id: string): Promise<void> {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
  },

  async listAllOrders(filters?: { status?: string; search?: string; page?: number; limit?: number }): Promise<{ data: Order[]; total: number }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    let query = supabase.from('orders').select('*, items:order_items(*)', { count: 'exact' });
    if (filters?.status && filters.status !== 'all') query = query.eq('status', filters.status);
    if (filters?.search) query = query.or(`full_name.ilike.%${filters.search}%,id.ilike.%${filters.search}%`);
    query = query.order('created_at', { ascending: false });
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);
    const { data, error, count } = await query;
    if (error) throw error;
    return { data: ((data as any[]) || []).map(mapOrder), total: count || 0 };
  },

  async updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
    const { error } = await supabase.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) throw error;
  },

  async listCoupons(): Promise<Coupon[]> {
    const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data as Coupon[]) || [];
  },

  async createCoupon(input: Partial<Coupon>): Promise<Coupon> {
    const { data, error } = await supabase.from('coupons').insert(input).select().single();
    if (error) throw error;
    return data as Coupon;
  },

  async updateCoupon(id: string, input: Partial<Coupon>): Promise<Coupon> {
    const { data, error } = await supabase.from('coupons').update(input).eq('id', id).select().single();
    if (error) throw error;
    return data as Coupon;
  },

  async deleteCoupon(id: string): Promise<void> {
    const { error } = await supabase.from('coupons').delete().eq('id', id);
    if (error) throw error;
  },

  async listCities(): Promise<City[]> {
    const { data, error } = await supabase.from('cities').select('*').order('name');
    if (error) throw error;
    return (data as City[]) || [];
  },

  async createCity(input: Partial<City>): Promise<City> {
    const { data, error } = await supabase.from('cities').insert(input).select().single();
    if (error) throw error;
    return data as City;
  },

  async updateCity(id: string, input: Partial<City>): Promise<City> {
    const { data, error } = await supabase.from('cities').update(input).eq('id', id).select().single();
    if (error) throw error;
    return data as City;
  },

  async deleteCity(id: string): Promise<void> {
    const { error } = await supabase.from('cities').delete().eq('id', id);
    if (error) throw error;
  },

  async listCustomers(search?: string, page = 1, limit = 20): Promise<{ data: Profile[]; total: number }> {
    let query = supabase.from('profiles').select('*', { count: 'exact' });
    if (search) query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    query = query.order('created_at', { ascending: false });
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);
    const { data, error, count } = await query;
    if (error) throw error;
    return { data: (data as Profile[]) || [], total: count || 0 };
  },

  async updateUserRole(userId: string, role: string): Promise<void> {
    const { error } = await supabase.from('profiles').update({ role }).eq('id', userId);
    if (error) throw error;
  },

};

function mapOrder(raw: any): Order {
  return {
    id: raw.id,
    user_id: raw.user_id,
    items: (raw.items || []).map((i: any) => ({
      id: i.id,
      order_id: i.order_id,
      product_id: i.product_id,
      product_title: i.product_title,
      product_image: i.product_image,
      quantity: i.quantity,
      unit_price: i.unit_price,
      subtotal: i.subtotal || i.unit_price * i.quantity,
    })),
    total_amount: raw.total_amount,
    shipping_address: raw.shipping_address,
    city_id: raw.city_id,
    city_name: raw.city_name || '',
    full_name: raw.full_name || '',
    phone: raw.phone,
    status: raw.status,
    coupon_id: raw.coupon_id,
    coupon_code: raw.coupon_code,
    discount_amount: raw.discount_amount || 0,
    payment_method: raw.payment_method || 'cod',
    payment_proof_url: raw.payment_proof_url,
    notes: raw.notes,
    created_at: raw.created_at,
    updated_at: raw.updated_at,
  };
}
