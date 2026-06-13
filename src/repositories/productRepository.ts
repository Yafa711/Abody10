import { supabase } from '../services/supabase';
import { Product, ProductFilters, ProductImage } from '../types/product';

export const productRepository = {
  async list(filters: ProductFilters = {}): Promise<{ data: Product[]; total: number }> {
    let query = supabase
      .from('products')
      .select('*', { count: 'exact' });

    if (filters.category_id) {
      query = query.eq('category_id', filters.category_id);
    }
    if (filters.featured !== undefined) {
      query = query.eq('featured', filters.featured);
    }
    if (filters.flash_sale !== undefined) {
      query = query.eq('flash_sale', filters.flash_sale);
    }
    if (filters.min_price !== undefined) {
      query = query.gte('price', filters.min_price);
    }
    if (filters.max_price !== undefined) {
      query = query.lte('price', filters.max_price);
    }
    if (filters.search) {
      query = query.ilike('title', `%${filters.search}%`);
    }

    const sortMap: Record<string, { column: string; ascending: boolean }> = {
      price_asc: { column: 'price', ascending: true },
      price_desc: { column: 'price', ascending: false },
      newest: { column: 'created_at', ascending: false },
      popular: { column: 'views', ascending: false },
    };
    const sort = sortMap[filters.sort_by || 'newest'];
    query = query.order(sort.column, { ascending: sort.ascending });

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;
    return { data: (data as Product[]) || [], total: count || 0 };
  },

  async getById(id: string): Promise<Product | null> {
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!id || !UUID_RE.test(id)) return null;
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as Product;
  },

  async getImages(productId: string): Promise<ProductImage[]> {
    const { data, error } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', productId)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return (data as ProductImage[]) || [];
  },

  async incrementView(productId: string): Promise<void> {
    await supabase.rpc('increment_product_view', { product_id: productId });
  },

  async getRelated(productId: string, categoryId: string, limit = 4): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category_id', categoryId)
      .neq('id', productId)
      .limit(limit);
    if (error) throw error;
    return (data as Product[]) || [];
  },

  async validateStock(productId: string, quantity: number): Promise<boolean> {
    const { data, error } = await supabase
      .from('products')
      .select('stock')
      .eq('id', productId)
      .single();
    if (error) throw error;
    return data ? (data as Product).stock >= quantity : false;
  },
};
