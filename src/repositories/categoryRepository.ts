import { supabase } from '../services/supabase';
import { Category } from '../types/category';

export const categoryRepository = {
  async list(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });
    if (error) throw error;
    return (data as Category[]) || [];
  },

  async getById(id: string): Promise<Category | null> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as Category;
  },

  async getBySlug(slug: string): Promise<Category | null> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single();
    if (error) throw error;
    return data as Category;
  },

  async getWithProductCount(): Promise<(Category & { product_count: number })[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*, products:products(count)')
      .order('name', { ascending: true });
    if (error) throw error;
    return ((data as any[]) || []).map(cat => ({
      ...cat,
      product_count: cat.products?.[0]?.count || 0,
    }));
  },
};
