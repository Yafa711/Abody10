# التنقل — Expo Router

## الهيكل
app/
  _layout.tsx        — root layout
  (auth)/
    login.tsx
    register.tsx
  (tabs)/
    _layout.tsx      — tab bar
    index.tsx        — الرئيسية
    search.tsx
    cart.tsx
    profile.tsx
  product/[id].tsx   — تفاصيل المنتج
  admin/
    _layout.tsx
    dashboard.tsx

## التنقل البرمجي
import { router } from 'expo-router'
router.push('/product/123')
router.replace('/(auth)/login')
router.back()

## حماية المسارات
// في _layout.tsx
import { Redirect } from 'expo-router'
if (!user) return <Redirect href="/(auth)/login" />

## Tab Bar مخصص
tabBar={(props) => <CustomTabBar {...props} />}

## قواعد
- كل شاشة ملفوفة في motion animation للانتقال السلس
- استخدم Redirect لا navigation.navigate للحماية
- اسم الملف = المسار تلقائياً
