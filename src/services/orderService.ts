import { orderRepository } from '../repositories/orderRepository';
import { productRepository } from '../repositories/productRepository';
import { CreateOrderInput } from '../types/order';

export const orderService = {
  async getOrders(userId: string) {
    return orderRepository.list(userId);
  },

  async getOrder(id: string) {
    return orderRepository.getById(id);
  },

  async createOrder(userId: string, input: CreateOrderInput) {
    for (const item of input.items) {
      const valid = await productRepository.validateStock(item.product_id, item.quantity);
      if (!valid) {
        const product = await productRepository.getById(item.product_id);
        throw new Error(`Insufficient stock for "${product?.title || 'product'}"`);
      }
    }

    return orderRepository.create(userId, input);
  },

  async validateCoupon(code: string) {
    const coupon = await orderRepository.validateCoupon(code);
    if (!coupon) throw new Error('Invalid or expired coupon');
    if (coupon.current_uses >= coupon.max_uses) {
      throw new Error('Coupon has reached maximum usage');
    }
    return coupon;
  },
};
