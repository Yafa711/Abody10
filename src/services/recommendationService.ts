import { supabase } from './supabase';
import { productService } from './productService';
import { cacheService } from './cacheService';
import { Product } from '../types/product';

const RECENTLY_VIEWED_KEY = 'recently_viewed';
const MAX_RECENT = 20;

export const recommendationService = {
  async getRecentlyViewed(): Promise<string[]> {
    const cached = await cacheService.get<string[]>(RECENTLY_VIEWED_KEY);
    return cached || [];
  },

  async addRecentlyViewed(productId: string) {
    const recent = await this.getRecentlyViewed();
    const updated = [productId, ...recent.filter(id => id !== productId)].slice(0, MAX_RECENT);
    await cacheService.set(RECENTLY_VIEWED_KEY, updated, 1000 * 60 * 60 * 24 * 7);
  },

  async getRecentlyViewedProducts(): Promise<Product[]> {
    const ids = await this.getRecentlyViewed();
    if (ids.length === 0) return [];
    return productService.getProductsByIds(ids);
  },

  async getSmartRecommendations(userId: string | null, currentProductId?: string, limit = 6): Promise<Product[]> {
    if (userId) {
      const { data: categoryIds } = await supabase
        .from('orders')
        .select('items:order_items(product_id)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (categoryIds && categoryIds.length > 0) {
        const productIds = categoryIds.flatMap((o: any) =>
          (o.items || []).map((i: any) => i.product_id)
        ).filter(Boolean);

        if (productIds.length > 0) {
          const { data: products } = await supabase
            .from('products')
            .select('*')
            .in('id', productIds)
            .limit(limit);
          if (products && products.length > 0) {
            const filtered = (products as Product[]).filter(p => p.id !== currentProductId);
            if (filtered.length > 0) return filtered.slice(0, limit);
          }
        }
      }
    }

    const recent = await this.getRecentlyViewedProducts();
    const recentFiltered = recent.filter(p => p.id !== currentProductId);
    if (recentFiltered.length > 0) return recentFiltered.slice(0, limit);

    const featured = await productService.getFeatured();
    return featured.data.filter(p => p.id !== currentProductId).slice(0, limit);
  },

  async getTopSearchedProducts(limit = 6): Promise<Product[]> {
    const { data: topQueries } = await supabase
      .from('search_queries')
      .select('query, count')
      .order('count', { ascending: false })
      .limit(10);

    if (!topQueries || topQueries.length === 0) return [];

    const topProducts: Product[] = [];
    for (const sq of topQueries) {
      if (topProducts.length >= limit) break;
      const results = await productService.getProducts({ search: sq.query as string, limit: 2 });
      for (const p of results.data) {
        if (!topProducts.find(ep => ep.id === p.id)) {
          topProducts.push(p);
          if (topProducts.length >= limit) break;
        }
      }
    }
    return topProducts;
  },
};
