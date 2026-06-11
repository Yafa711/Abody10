# إدارة الحالة — Zustand

## التثبيت
npm install zustand

## هيكل المتجر
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { MMKV } from 'react-native-mmkv'

## متجر السلة
export const useCartStore = create(persist(
  (set, get) => ({
    items: [],
    addItem: (product) => set(state => ({
      items: [...state.items, product]
    })),
    removeItem: (id) => set(state => ({
      items: state.items.filter(i => i.id !== id)
    })),
    clearCart: () => set({ items: [] }),
    total: () => get().items.reduce((sum, i) => sum + i.price * i.qty, 0)
  }),
  { name: 'cart-storage' }
))

## متجر المستخدم
export const useAuthStore = create(persist(
  (set) => ({
    user: null,
    profile: null,
    setUser: (user) => set({ user }),
    setProfile: (profile) => set({ profile }),
    logout: () => set({ user: null, profile: null })
  }),
  { name: 'auth-storage' }
))

## القواعد
- متجر واحد لكل domain (cart, auth, wishlist, ui)
- لا تضع كل شيء في متجر واحد
- استخدم persist للبيانات التي تبقى بعد الإغلاق
- استخدم MMKV كـ storage بدل AsyncStorage (أسرع 10x)
