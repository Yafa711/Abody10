import { productRepository } from '../repositories/productRepository';
import { ProductFilters } from '../types/product';

export const productService = {
  async getProducts(filters: ProductFilters = {}) {
    return productRepository.list(filters);
  },

  async getProduct(id: string) {
    const product = await productRepository.getById(id);
    if (!product) throw new Error('Product not found');
    return product;
  },

  async getFeatured() {
    return productRepository.list({ featured: true, limit: 10 });
  },

  async getFlashSales() {
    return productRepository.list({ flash_sale: true, limit: 10 });
  },

  async getRelated(productId: string, categoryId: string, limit = 4) {
    return productRepository.getRelated(productId, categoryId, limit);
  },

  async viewProduct(id: string) {
    const product = await productRepository.getById(id);
    if (!product) throw new Error('Product not found');
    await productRepository.incrementView(id);
    return product;
  },

  async getImages(productId: string) {
    return productRepository.getImages(productId);
  },

  async getProductsByIds(ids: string[]) {
    if (ids.length === 0) return [];
    const results = await Promise.allSettled(
      ids.map((id) => productRepository.getById(id))
    );
    return results
      .filter((r) => r.status === 'fulfilled')
      .map((r) => (r as PromiseFulfilledResult<any>).value)
      .filter(Boolean);
  },

  async validateStock(productId: string, quantity: number) {
    return productRepository.validateStock(productId, quantity);
  },
};
