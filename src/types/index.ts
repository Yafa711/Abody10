export * from './product';
export * from './category';
export * from './order';
export * from './coupon';
export * from './city';
export * from './profile';

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
