import { searchRepository } from '../repositories/searchRepository';
import { productService } from './productService';

export const searchService = {
  async search(query: string, userId: string | null = null) {
    if (!query.trim()) return { data: [], total: 0 };

    const results = await productService.getProducts({ search: query });

    await searchRepository.saveQuery(userId, query);
    await searchRepository.incrementCount(query);

    return results;
  },

  async getTopSearches(limit = 10) {
    return searchRepository.getTopSearches(limit);
  },
};
