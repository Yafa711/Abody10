import { useState, useEffect, useRef } from 'react';
import { Image } from 'react-native';

type ImageLoadState = 'loading' | 'loaded' | 'error';

export function useProgressiveImage(uri: string | undefined) {
  const [state, setState] = useState<ImageLoadState>('loading');
  const isMounted = useRef(true);

  useEffect(() => {
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    if (!uri) {
      setState('error');
      return;
    }
    setState('loading');
    Image.prefetch(uri).then((cached) => {
      if (isMounted.current) {
        setState(cached ? 'loaded' : 'loading');
        Image.getSize(
          uri,
          () => { if (isMounted.current) setState('loaded'); },
          () => { if (isMounted.current) setState('error'); }
        );
      }
    });
  }, [uri]);

  return state;
}

export const imageCacheService = {
  prefetched: new Set<string>(),

  async prefetch(uri: string) {
    if (this.prefetched.has(uri)) return;
    try {
      await Image.prefetch(uri);
      this.prefetched.add(uri);
    } catch {
      // prefetch failed — non-critical
    }
  },

  async prefetchBatch(uris: string[]) {
    const tasks = uris
      .filter(u => !this.prefetched.has(u))
      .map(u => this.prefetch(u));
    await Promise.allSettled(tasks);
  },

  getImageUri(uri: string, width = 400): string {
    if (uri.startsWith('https://rjcqkwgjqeqwzfbedwav.supabase.co')) {
      return `${uri}?width=${width}&format=webp`;
    }
    return uri;
  },
};
