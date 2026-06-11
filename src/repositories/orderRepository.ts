import { supabase } from '../services/supabase';
import { Order, CreateOrderInput, OrderStatus } from '../types/order';
import { Coupon } from '../types/coupon';

export const orderRepository = {
  async list(userId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as any[])?.map(mapOrder) || [];
  },

  async getById(id: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data ? mapOrder(data) : null;
  },

  async create(userId: string, input: CreateOrderInput): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        full_name: input.full_name,
        shipping_address: input.shipping_address,
        city_id: input.city_id,
        phone: input.phone,
        payment_method: input.payment_method,
        payment_proof_url: input.payment_proof_url || null,
        coupon_id: input.coupon_id || null,
        coupon_code: input.coupon_code || null,
        discount_amount: input.discount_amount || 0,
        notes: input.notes || null,
        status: 'pending',
      })
      .select()
      .single();
    if (error) throw error;

    const orderItems = input.items.map(item => ({
      order_id: data.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      product_title: item.product_title,
      product_image: item.product_image,
    }));
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);
    if (itemsError) throw itemsError;

    for (const item of input.items) {
      const { error: stockError } = await supabase.rpc('decrement_stock', {
        pid: item.product_id,
        qty: item.quantity,
      });
      if (stockError) console.error('Failed to decrement stock:', stockError);
    }

    if (input.coupon_id) {
      const { error: couponError } = await supabase.rpc('increment_coupon_usage', {
        cid: input.coupon_id,
      });
      if (couponError) console.error('Failed to increment coupon usage:', couponError);
    }

    return this.getById(data.id) as Promise<Order>;
  },

  async updateStatus(id: string, status: OrderStatus): Promise<void> {
    const { error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  },

  async validateCoupon(code: string): Promise<Coupon | null> {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('active', true)
      .gte('expires_at', new Date().toISOString())
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data as Coupon | null;
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
