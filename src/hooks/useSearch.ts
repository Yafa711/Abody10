import { useState, useCallback, useRef } from 'react';
import { searchService } from '../services/searchService';
import { analyticsService } from '../services/analyticsService';
import { Product } from '../types/product';

interface TopSearchItem {
  query: string;
  count: number;
}

interface UseSearchReturn {
  results: Product[];
  topSearches: TopSearchItem[];
  loading: boolean;
  error: string | null;
  search: (query: string) => Promise<void>;
  clear: () => void;
  clearResults: () => void;
  hasSearched: boolean;
  loadTopSearches: () => Promise<void>;
}

export function useSearch(userId: string | null = null): UseSearchReturn {
  const [results, setResults] = useState<Product[]>([]);
  const [topSearches, setTopSearches] = useState<TopSearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const searchIdRef = useRef(0);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    const id = ++searchIdRef.current;
    setLoading(true);
    setError(null);
    try {
      const data = await searchService.search(query.trim(), userId);
      if (id !== searchIdRef.current) return;
      setResults(data.data || []);
      setHasSearched(true);
      analyticsService.trackSearch(query.trim(), (data.data || []).length);
    } catch (err: any) {
      if (id !== searchIdRef.current) return;
      setError(err.message || 'Search failed');
    } finally {
      if (id === searchIdRef.current) setLoading(false);
    }
  }, [userId]);

  const clear = useCallback(() => {
    setResults([]);
    setHasSearched(false);
    setError(null);
  }, []);

  const loadTopSearches = useCallback(async () => {
    try {
      const data = await searchService.getTopSearches(10);
      setTopSearches((data as any) || []);
    } catch {
      // Failed to load top searches — non-critical
    }
  }, []);

  return {
    results,
    topSearches,
    loading,
    error,
    search,
    clear,
    clearResults: clear,
    hasSearched,
    loadTopSearches,
  };
}
