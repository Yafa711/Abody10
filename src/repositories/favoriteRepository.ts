import { supabase } from '../services/supabase';

export const favoriteRepository = {
  async list(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('favorites')
      .select('product_id')
      .eq('user_id', userId);
    if (error) throw error;
    return ((data as { product_id: string }[]) || []).map(f => f.product_id);
  },

  async add(userId: string, productId: string): Promise<void> {
    const { error } = await supabase
      .from('favorites')
      .insert({ user_id: userId, product_id: productId });
    if (error) throw error;
  },

  async remove(userId: string, productId: string): Promise<void> {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);
    if (error) throw error;
  },

  async isFavorited(userId: string, productId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .maybeSingle();
    if (error) throw error;
    return !!data;
  },

  async toggle(userId: string, productId: string): Promise<boolean> {
    const isFav = await this.isFavorited(userId, productId);
    if (isFav) {
      await this.remove(userId, productId);
      return false;
    } else {
      await this.add(userId, productId);
      return true;
    }
  },
};
