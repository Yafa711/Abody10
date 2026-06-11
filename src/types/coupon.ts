export interface Coupon {
  id: string;
  code: string;
  discount_percent: number;
  max_uses: number;
  current_uses: number;
  min_purchase: number;
  expires_at: string;
  active: boolean;
  created_at: string;
}
