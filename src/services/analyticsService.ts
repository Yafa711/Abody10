import { supabase } from './supabase';
import { errorService } from './errorService';

type AnalyticsEvent =
  | { type: 'product_view'; product_id: string; product_title: string }
  | { type: 'search'; query: string; results_count: number }
  | { type: 'add_to_favorites'; product_id: string; product_title: string }
  | { type: 'remove_from_favorites'; product_id: string }
  | { type: 'add_to_cart'; product_id: string; product_title: string; quantity: number; price: number }
  | { type: 'remove_from_cart'; product_id: string }
  | { type: 'checkout_start'; item_count: number; total: number }
  | { type: 'purchase'; order_id: string; total: number; item_count: number }
  | { type: 'sign_up'; method: string }
  | { type: 'sign_in'; method: string }
  | { type: 'category_view'; category_id: string; category_name: string }
  | { type: 'error'; error_message: string; screen: string };

const eventQueue: AnalyticsEvent[] = [];
const FLUSH_INTERVAL = 10000;
let flushTimer: ReturnType<typeof setInterval> | null = null;

function startFlushTimer() {
  if (flushTimer) return;
  flushTimer = setInterval(() => {
    flush().catch(() => {});
  }, FLUSH_INTERVAL);
}

async function flush() {
  if (eventQueue.length === 0) return;
  const batch = eventQueue.splice(0, eventQueue.length);
  try {
    const records = batch.map(e => ({
      event_type: e.type,
      event_data: JSON.stringify(e),
      created_at: new Date().toISOString(),
    }));
    await supabase.from('analytics_events').insert(records);
  } catch (err) {
    eventQueue.unshift(...batch);
  }
}

export const analyticsService = {
  track(event: AnalyticsEvent) {
    eventQueue.push(event);
    if (eventQueue.length >= 20) {
      flush().catch(() => {});
    }
    startFlushTimer();
  },

  async trackProductView(productId: string, productTitle: string) {
    this.track({ type: 'product_view', product_id: productId, product_title: productTitle });
    try {
      const { error } = await supabase.rpc('increment_product_view', { product_id: productId });
      if (error) throw error;
    } catch (err) {
      errorService.log(err, 'analytics-product-view');
    }
  },

  async trackSearch(query: string, resultsCount: number) {
    this.track({ type: 'search', query, results_count: resultsCount });
  },

  trackAddToFavorites(productId: string, productTitle: string) {
    this.track({ type: 'add_to_favorites', product_id: productId, product_title: productTitle });
  },

  trackRemoveFromFavorites(productId: string) {
    this.track({ type: 'remove_from_favorites', product_id: productId });
  },

  trackAddToCart(productId: string, productTitle: string, quantity: number, price: number) {
    this.track({ type: 'add_to_cart', product_id: productId, product_title: productTitle, quantity, price });
  },

  trackRemoveFromCart(productId: string) {
    this.track({ type: 'remove_from_cart', product_id: productId });
  },

  trackCheckoutStart(itemCount: number, total: number) {
    this.track({ type: 'checkout_start', item_count: itemCount, total });
  },

  trackPurchase(orderId: string, total: number, itemCount: number) {
    this.track({ type: 'purchase', order_id: orderId, total, item_count: itemCount });
  },

  trackSignUp(method: string) {
    this.track({ type: 'sign_up', method });
  },

  trackSignIn(method: string) {
    this.track({ type: 'sign_in', method });
  },

  trackCategoryView(categoryId: string, categoryName: string) {
    this.track({ type: 'category_view', category_id: categoryId, category_name: categoryName });
  },

  trackError(errorMessage: string, screen: string) {
    this.track({ type: 'error', error_message: errorMessage, screen });
  },

  async flushNow() {
    await flush();
  },
};
