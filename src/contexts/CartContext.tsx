import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../services/supabase';
import { City } from '../types/city';
import { Coupon } from '../types/coupon';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { analyticsService } from '../services/analyticsService';

const CART_KEY = 'app_cart';

export interface CartItem {
  product_id: string;
  title: string;
  price: number;
  image_url: string;
  quantity: number;
  stock: number;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  total: number;
  coupon: Coupon | null;
  couponCode: string;
  cities: City[];
  selectedCity: City | null;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setCouponCode: (code: string) => void;
  applyCoupon: () => Promise<void>;
  removeCoupon: () => void;
  setSelectedCity: (city: City | null) => void;
  loadCities: () => Promise<void>;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [couponCode, setCouponCode] = useState('');

  useEffect(() => {
    AsyncStorage.getItem(CART_KEY).then((stored) => {
      if (stored) setItems(JSON.parse(stored));
    });
    loadCities();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const loadCities = useCallback(async () => {
    try {
      const { data } = await supabase.from('cities').select('*').eq('active', true);
      if (data) setCities(data as City[]);
    } catch {
      // Failed to load cities — user can retry
    }
  }, []);

  const addItem = useCallback((item: CartItem) => {
    analyticsService.trackAddToCart(item.product_id, item.title, item.quantity, item.price);
    setItems((prev) => {
      const existing = prev.find((i) => i.product_id === item.product_id);
      if (existing) {
        return prev.map((i) =>
          i.product_id === item.product_id
            ? { ...i, quantity: Math.min(i.quantity + item.quantity, i.stock) }
            : i
        );
      }
      return [...prev, item];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    analyticsService.trackRemoveFromCart(productId);
    setItems((prev) => prev.filter((i) => i.product_id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.product_id !== productId));
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.product_id === productId ? { ...i, quantity: Math.min(quantity, i.stock) } : i
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setCoupon(null);
    setCouponCode('');
    AsyncStorage.removeItem(CART_KEY);
  }, []);

  const applyCoupon = useCallback(async () => {
    if (!couponCode.trim()) return;
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .eq('active', true)
        .gte('expires_at', new Date().toISOString())
        .single();
      if (error || !data) throw new Error('Invalid coupon');
      const c = data as Coupon;
      if (c.current_uses >= c.max_uses) throw new Error('Coupon exhausted');
      setCoupon(c);
    } catch {
      setCoupon(null);
      throw new Error('Invalid coupon');
    }
  }, [couponCode]);

  const removeCoupon = useCallback(() => {
    setCoupon(null);
    setCouponCode('');
  }, []);

  const subtotal = useMemo(() =>
    items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items]
  );

  const shippingFee = selectedCity?.shipping_fee || 0;

  const discountAmount = useMemo(() => {
    if (!coupon) return 0;
    return (subtotal * coupon.discount_percent) / 100;
  }, [coupon, subtotal]);

  const total = useMemo(() =>
    Math.max(0, subtotal + shippingFee - discountAmount),
    [subtotal, shippingFee, discountAmount]
  );

  const itemCount = useMemo(() =>
    items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      itemCount,
      subtotal,
      shippingFee,
      discountAmount,
      total,
      coupon,
      couponCode,
      cities,
      selectedCity,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      setCouponCode,
      applyCoupon,
      removeCoupon,
      setSelectedCity,
      loadCities,
    }),
    [
      items, itemCount, subtotal, shippingFee, discountAmount, total,
      coupon, couponCode, cities, selectedCity,
      addItem, removeItem, updateQuantity, clearCart,
      applyCoupon, removeCoupon, loadCities,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
