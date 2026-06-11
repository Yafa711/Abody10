import { useState, useCallback, useEffect } from 'react';
import { favoriteService } from '../services/favoriteService';
import { cacheService } from '../services/cacheService';
import { analyticsService } from '../services/analyticsService';

interface UseFavoritesReturn {
  favorites: string[];
  toggle: (productId: string, productTitle?: string) => Promise<boolean>;
  isFavorited: (productId: string) => boolean;
  loading: boolean;
  error: string | null;
}

export function useFavorites(userId: string | null | undefined): UseFavoritesReturn {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      cacheService.get<string[]>(cacheService.keys.FAVORITES).then(cached => {
        if (cached) setFavorites(cached);
      }).catch(() => {});
    }
  }, [userId]);

  const toggle = useCallback(async (productId: string, productTitle?: string): Promise<boolean> => {
    if (!userId) {
      setError('Please sign in to save favorites');
      return false;
    }
    setLoading(true);
    setError(null);
    try {
      const isNowFavorited = await favoriteService.toggleFavorite(userId, productId);
      setFavorites(prev => {
        const next = isNowFavorited
          ? [...prev, productId]
          : prev.filter(id => id !== productId);
        cacheService.set(cacheService.keys.FAVORITES, next).catch(() => {});
        return next;
      });
      if (isNowFavorited && productTitle) {
        analyticsService.trackAddToFavorites(productId, productTitle);
      } else {
        analyticsService.trackRemoveFromFavorites(productId);
      }
      return isNowFavorited;
    } catch (err: any) {
      setError(err.message || 'Failed to toggle favorite');
      return false;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const isFavorited = useCallback(
    (productId: string) => favorites.includes(productId),
    [favorites]
  );

  return { favorites, toggle, isFavorited, loading, error };
}
