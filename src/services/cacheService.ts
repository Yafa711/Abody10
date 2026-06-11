import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = 'cache_';
const CACHE_TTL = 1000 * 60 * 30;

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export const cacheService = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);
      if (!raw) return null;
      const entry: CacheEntry<T> = JSON.parse(raw);
      if (Date.now() - entry.timestamp > entry.ttl) {
        await AsyncStorage.removeItem(`${CACHE_PREFIX}${key}`);
        return null;
      }
      return entry.data;
    } catch {
      return null;
    }
  },

  async set<T>(key: string, data: T, ttl = CACHE_TTL): Promise<void> {
    try {
      const entry: CacheEntry<T> = { data, timestamp: Date.now(), ttl };
      await AsyncStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(entry));
    } catch {
      // Cache write failed — non-critical
    }
  },

  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`${CACHE_PREFIX}${key}`);
    } catch {
      // Cache remove failed — non-critical
    }
  },

  async clearAll(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(k => k.startsWith(CACHE_PREFIX));
      if (cacheKeys.length > 0) {
        await AsyncStorage.multiRemove(cacheKeys);
      }
    } catch {
      // Cache clear failed — non-critical
    }
  },

  async isStale(key: string): Promise<boolean> {
    try {
      const raw = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);
      if (!raw) return true;
      const entry: CacheEntry<unknown> = JSON.parse(raw);
      return Date.now() - entry.timestamp > entry.ttl;
    } catch {
      return true;
    }
  },

  keys: {
    PRODUCTS: 'products',
    CATEGORIES: 'categories',
    FAVORITES: 'favorites',
    PRODUCT: (id: string) => `product_${id}`,
  },
};
