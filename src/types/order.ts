export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  user_id: string;
  items: OrderItem[];
  total_amount: number;
  shipping_address: string;
  city_id: string;
  city_name?: string;
  full_name: string;
  phone: string;
  status: OrderStatus;
  coupon_id?: string;
  coupon_code?: string;
  discount_amount: number;
  payment_method: string;
  payment_proof_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_title: string;
  product_image: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface CreateOrderInput {
  items: { product_id: string; quantity: number; unit_price: number; product_title: string; product_image: string }[];
  shipping_address: string;
  city_id: string;
  full_name: string;
  phone: string;
  payment_method: string;
  payment_proof_url?: string;
  coupon_code?: string;
  coupon_id?: string;
  discount_amount?: number;
  notes?: string;
}
