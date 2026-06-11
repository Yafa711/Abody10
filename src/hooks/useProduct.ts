import { useState, useEffect, useCallback, useRef } from 'react';
import { productService } from '../services/productService';
import { cacheService } from '../services/cacheService';
import { analyticsService } from '../services/analyticsService';
import { isOnline } from '../services/networkService';
import { Product, ProductImage } from '../types/product';

interface UseProductReturn {
  product: Product | null;
  images: ProductImage[];
  relatedProducts: Product[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  fromCache: boolean;
}

export function useProduct(id: string | undefined): UseProductReturn {
  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);
  const fetchIdRef = useRef(0);

  const fetch = useCallback(async () => {
    if (!id) {
      setLoading(false);
      setError('Product ID is required');
      return;
    }
    const fetchId = ++fetchIdRef.current;
    setLoading(true);
    setError(null);
    setFromCache(false);

    const cacheKey = cacheService.keys.PRODUCT(id);

    try {
      if (!isOnline()) {
        const cached = await cacheService.get<Product>(cacheKey);
        if (cached) {
          setProduct(cached);
          setFromCache(true);
        }
      }

      const [productData, productImages, related] = await Promise.all([
        productService.getProduct(id),
        productService.getImages(id),
        productService.getRelated(id, product?.category_id || '', 4),
      ]);
      if (fetchId !== fetchIdRef.current) return;
      setProduct(productData);
      setImages(productImages);
      setRelatedProducts(related);
      cacheService.set(cacheKey, productData).catch(() => {});
      analyticsService.trackProductView(id, productData.title);
    } catch (err: any) {
      if (fetchId !== fetchIdRef.current) return;
      const cached = await cacheService.get<Product>(cacheKey);
      if (cached) {
        setProduct(cached);
        setFromCache(true);
      } else {
        setError(err.message || 'Failed to load product');
      }
    } finally {
      if (fetchId === fetchIdRef.current) setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { product, images, relatedProducts, loading, error, refetch: fetch, fromCache };
}
