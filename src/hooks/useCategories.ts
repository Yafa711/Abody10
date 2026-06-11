import { useState, useEffect, useCallback, useRef } from 'react';
import { categoryService } from '../services/categoryService';
import { cacheService } from '../services/cacheService';
import { isOnline } from '../services/networkService';
import { Category } from '../types/category';

interface UseCategoriesReturn {
  categories: Category[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  fromCache: boolean;
}

export function useCategories(withCounts = false): UseCategoriesReturn {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);
  const fetchIdRef = useRef(0);

  const fetch = useCallback(async () => {
    const id = ++fetchIdRef.current;
    setLoading(true);
    setError(null);
    setFromCache(false);

    try {
      if (!isOnline()) {
        const cached = await cacheService.get<Category[]>(cacheService.keys.CATEGORIES);
        if (cached) {
          setCategories(cached);
          setFromCache(true);
          setLoading(false);
          return;
        }
      }

      const data = withCounts
        ? await categoryService.getCategoriesWithCounts()
        : await categoryService.getCategories();
      if (id !== fetchIdRef.current) return;
      setCategories(data);
      cacheService.set(cacheService.keys.CATEGORIES, data).catch(() => {});
    } catch (err: any) {
      if (id !== fetchIdRef.current) return;
      const cached = await cacheService.get<Category[]>(cacheService.keys.CATEGORIES);
      if (cached) {
        setCategories(cached);
        setFromCache(true);
      } else {
        setError(err.message || 'Failed to load categories');
      }
    } finally {
      if (id === fetchIdRef.current) setLoading(false);
    }
  }, [withCounts]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { categories, loading, error, refetch: fetch, fromCache };
}
