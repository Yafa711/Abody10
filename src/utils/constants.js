export const ROLES = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
};

export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

export const PAYMENT_METHODS = {
  CREDIT_CARD: 'credit_card',
  DEBIT_CARD: 'debit_card',
  PAYPAL: 'paypal',
};

export const PRODUCT_CATEGORIES = [
  'Electronics',
  'Clothing',
  'Home & Garden',
  'Books',
  'Sports & Outdoors',
];

export const DEFAULT_PAGE_SIZE = 20;
export const DEFAULT_LANGUAGE = 'en';
export const SUPPORTED_LANGUAGES = ['en', 'ar'];

export const API_ENDPOINTS = {
  PRODUCTS: '/products',
  CATEGORIES: '/categories',
  ORDERS: '/orders',
  USERS: '/users',
  AUTH: '/auth',
};

export const STORAGE_KEYS = {
  USER_TOKEN: 'user_token',
  USER_PROFILE: 'user_profile',
  CART_ITEMS: 'cart_items',
  USER_PREFERENCES: 'user_preferences',
};

export const APP_NAME = 'NewElectroStore';
export const VERSION = '1.0.0';

export const ROUTES = {
  ROOT: 'Root',
  AUTH_LOADING: 'AuthLoading',
  LOGIN: 'Login',
  REGISTER: 'Register',
  FORGOT_PASSWORD: 'ForgotPassword',
  HOME: 'Home',
  PRODUCT_LIST: 'ProductList',
  PRODUCT_DETAILS: 'ProductDetails',
  CART: 'Cart',
  CHECKOUT: 'Checkout',
  PROFILE: 'Profile',
  ORDER_HISTORY: 'OrderHistory',
  SETTINGS: 'Settings',
  FAVORITES: 'Favorites',
  ADDRESS: 'Address',
  ADMIN_DASHBOARD: 'AdminDashboard',
  PRODUCT_MANAGEMENT: 'ProductManagement',
  ORDER_MANAGEMENT: 'OrderManagement',
  PRODUCT_EDITOR: 'ProductEditor',
  CATEGORIES_ADMIN: 'CategoriesAdmin',
  COUPONS_ADMIN: 'CouponsAdmin',
  CUSTOMERS_ADMIN: 'CustomersAdmin',
  SHIPPING_ADMIN: 'ShippingAdmin',
  ADMIN_TAB: 'AdminTab',
};
