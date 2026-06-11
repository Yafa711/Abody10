import { favoriteRepository } from '../repositories/favoriteRepository';

export const favoriteService = {
  async getFavorites(userId: string) {
    return favoriteRepository.list(userId);
  },

  async toggleFavorite(userId: string, productId: string) {
    return favoriteRepository.toggle(userId, productId);
  },

  async isFavorited(userId: string, productId: string) {
    return favoriteRepository.isFavorited(userId, productId);
  },

  async addFavorite(userId: string, productId: string) {
    await favoriteRepository.add(userId, productId);
  },

  async removeFavorite(userId: string, productId: string) {
    await favoriteRepository.remove(userId, productId);
  },
};
