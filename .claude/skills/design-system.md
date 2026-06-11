# نظام التصميم — DAVA Store

## الألوان (Dark Theme)
background: '#0D0D0D'
surface: '#141414'
card: '#1C1C1C'
accent: '#D4A853'        — ذهبي دافئ
accentLight: '#F0C060'
text: '#F5F5F5'
textSub: '#888888'
border: '#2A2A2A'
success: '#4CAF50'
error: '#FF5252'
warning: '#FF9800'

## المسافات (8px grid)
xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48

## الخطوط
heading: Cairo Bold — للعناوين العربية
body: Cairo Regular
numbers: Urbanist — للأرقام والأسعار
fontSize: xs=10, sm=12, md=14, lg=16, xl=20, xxl=24, h1=32

## الحواف
card: borderRadius 16
button: borderRadius 12
chip: borderRadius 8
input: borderRadius 12

## الظلال
cardShadow: { shadowColor: '#D4A853', shadowOpacity: 0.15, shadowRadius: 12, elevation: 8 }
glowAccent: { shadowColor: '#D4A853', shadowOpacity: 0.4, shadowRadius: 20 }

## قواعد التصميم
- لا أبيض على الإطلاق في الخلفيات
- كل border بلون #2A2A2A لا أكثر
- الأيقونات: Phosphor Icons حصراً
- لا gradients عشوائية — فقط من accent إلى accentLight
- كل كارد له padding 16px داخلي
