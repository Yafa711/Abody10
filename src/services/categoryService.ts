import { categoryRepository } from '../repositories/categoryRepository';

export const categoryService = {
  async getCategories() {
    return categoryRepository.list();
  },

  async getCategory(id: string) {
    return categoryRepository.getById(id);
  },

  async getCategoryBySlug(slug: string) {
    return categoryRepository.getBySlug(slug);
  },

  async getCategoriesWithCounts() {
    return categoryRepository.getWithProductCount();
  },
};
