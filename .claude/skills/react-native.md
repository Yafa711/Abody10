# React Native & Expo Skill

## المبدأ الأساسي
- دائماً استخدم Expo SDK — لا Bare React Native
- كل مكون يجب أن يعمل على Android أولاً
- لا تستخدم أي مكتبة تحتاج native linking بدون expo plugin

## الأنيميشن في React Native
- استخدم react-native-reanimated وليس framer-motion (framer للويب فقط)
- react-native-gesture-handler لكل اللمسات
- مثال صح:
  import Animated, { useSharedValue, withSpring, useAnimatedStyle } from 'react-native-reanimated'

## التنقل
- expo-router للتنقل (أحدث وأفضل من React Navigation)
- أو @react-navigation/native مع @react-navigation/stack

## الأداء
- استخدم FlashList بدل FlatList للقوائم الطويلة
- memo() على كل كارد منتج
- لا تضع logic داخل render

## الحجم والشاشات
- استخدم Dimensions أو useWindowDimensions
- كل قياس نسبي لا ثابت (لا px ثابتة)

## الصور
- expo-image أسرع من Image العادية
- دائماً حدد width وheight للصور

## المكتبات المعتمدة
- expo-router — تنقل
- react-native-reanimated — أنيميشن
- react-native-gesture-handler — لمسات
- @shopify/flash-list — قوائم سريعة
- expo-image — صور محسّنة
- react-native-mmkv — تخزين محلي سريع
- zustand — إدارة الحالة
