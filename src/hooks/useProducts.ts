import { useState, useEffect, useCallback, useRef } from 'react';
import { productService } from '../services/productService';
import { cacheService } from '../services/cacheService';
import { isOnline } from '../services/networkService';
import { Product, ProductFilters } from '../types/product';

interface UseProductsReturn {
  products: Product[];
  total: number;
  loading: boolean;
  error: string | null;
  refetch: (filters?: ProductFilters) => Promise<void>;
  fromCache: boolean;
}

export function useProducts(initialFilters?: ProductFilters): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);
  const fetchIdRef = useRef(0);
  const filtersRef = useRef(initialFilters);
  filtersRef.current = initialFilters;

  const fetch = useCallback(async (filters?: ProductFilters) => {
    const id = ++fetchIdRef.current;
    setLoading(true);
    setError(null);
    setFromCache(false);

    const activeFilters = filters ?? filtersRef.current;
    const cacheKey = `products_${JSON.stringify(activeFilters)}`;

    try {
      if (!isOnline()) {
        const cached = await cacheService.get<Product[]>(cacheKey);
        if (cached) {
          setProducts(cached);
          setTotal(cached.length);
          setFromCache(true);
          setLoading(false);
          return;
        }
      }

      const result = await productService.getProducts(activeFilters);
      if (id !== fetchIdRef.current) return;
      setProducts(result.data);
      setTotal(result.total);
      cacheService.set(cacheKey, result.data).catch(() => {});
    } catch (err: any) {
      if (id !== fetchIdRef.current) return;
      const cached = await cacheService.get<Product[]>(cacheKey);
      if (cached) {
        setProducts(cached);
        setTotal(cached.length);
        setFromCache(true);
      } else {
        setError(err.message || 'Failed to load products');
      }
    } finally {
      if (id === fetchIdRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch(initialFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { products, total, loading, error, refetch: fetch, fromCache };
}
