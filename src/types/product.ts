export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  original_price?: number;
  image_url: string;
  category_id: string;
  featured: boolean;
  flash_sale: boolean;
  flash_sale_price?: number;
  views: number;
  stock: number;
  rating: number;
  reviews_count: number;
  created_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  sort_order: number;
}

export interface ProductFilters {
  category_id?: string;
  featured?: boolean;
  flash_sale?: boolean;
  min_price?: number;
  max_price?: number;
  search?: string;
  sort_by?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
  page?: number;
  limit?: number;
}
