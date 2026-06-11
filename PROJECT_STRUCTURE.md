# البنية المقترحة للمشروع وتطبيق المهارات

هذا المستند يوضح how each skill will be applied to the project structure and files.

## البنية المقترحة للمجلدات

```
NewElectroStore/
├── src/
│   ├── components/           # مكونات UI قابلة لإعادة الاستخدام
│   │   ├── ui/               # componentes básicos (Button, Input, Card, etc.)
│   │   ├── layout/           # مكونات Layout (Header, Footer, Sidebar)
│   │   └── feature/          # مكونات محددة للميزات (ProductCard, OrderItem, etc.)
│   │
│   ├── screens/              # شاشات التطبيق
│   │   ├── auth/             # شاشات المصادقة (Login, Register, etc.)
│   │   ├── home/             # شاشة الرئيسية
│   │   ├── product/          # شاشات المنتجات (List, Details, etc.)
│   │   ├── cart/             # شاشات السلة
│   │   ├── profile/          # شاشات الملف الشخصي
│   │   └── admin/            # شاشات لوحة الإدارة (إذا وجدت)
│   │
│   ├── services/             # خدمات التعامل مع المصادر الخارجية
│   │   ├── supabase/         # خدمة Supabase encapsulée
│   │   ├── analytics/        # خدمة التحليلات (إذا وجدت)
│   │   └── api/              # طبقة تجريد للاتصالات العامة
│   │
│   ├── hooks/                # هوكس مخصصة لإعادة استخدام المنطق
│   │   ├── useAuth.js        # هوك المصادقة
│   │   ├── useProducts.js    # هوك جلب المنتجات
│   │   ├── useCart.js        # هوك إدارة السلة
│   │   └── useApi.js         # هوك عام لاستدعاءات API
│   │
│   ├── utils/                # وظائف مساعدة عامة
│   │   ├── helpers.js        # وظائف مساعدة متنوعة
│   │   ├── constants.js      # ثوابت التطبيق
│   │   ├── validation.js     # وظائف التحقق من الصحة
│   │   └── formatters.js     # وظائف تنسيق البيانات
│   │
│   ├── contexts/             # سياقات React لإدارة الحالة العامة
│   │   ├── AuthContext.js    # سياق المصادقة
│   │   ├── CartContext.js    # سياق السلة
│   │   └── ThemeContext.js   # سياق الثيم (light/dark)
│   │
│   ├── types/                # تعريفات أنواع TypeScript مشتركة
│   │   ├── index.ts          # تصدير جميع الأنواع
│   │   ├── supabase.ts       # أنواع خاصة بـ Supabase
│   │   ├── products.ts       # أنواع المنتجات
│   │   ├── orders.ts         # أنواع الطلبات
│   │   └── users.ts          # أنواع المستخدمين
│   │
│   ├── assets/               # موارد ثابتة
│   │   ├── images/           # صور التطبيق
│   │   ├── icons/            # أيقونات التطبيق
│   │   └── animations/       # ملفات الحركة (إذا وجدت)
│   │
│   ├── themes/               # إعدادات الثيمات
│   │   ├── colors.js         # تعريف الألوان
│   │   ├── fonts.js          # تعريف الخطوط
│   │   └── index.js          # تصدير الثيم
│   │
│   ├── navigation/           # إعدادات التوجيه
│   │   ├── RootNavigator.js  # ملاح الجذر
│   │   ├── AuthNavigator.js  # ملاح المصادقة
│   │   └── AppNavigator.js   # ملاح التطبيق الرئيسي
│   │
│   └── __tests__/            # هيكل الاختبارات
│       ├── components/       # اختبارات المكونات
│       ├── services/         # اختبارات الخدمات
│       ├── hooks/            # اختبارات الهوكسات
│       └── utils/            # اختبارات الوظائف المساعدة
│
├── .env.example              # نموذج متغيرات البيئة
├── .env                      # متغيرات البيئة الفعلية (غير مضمومة في git)
├── app.json                  # إعدادات Expo
├── eas.json                  # إعدادات EAS 빌드
├── tsconfig.json             # إعدادات TypeScript
├── package.json              #dependencies و scripts
└── README.md                 # وثائق المشروع
```

## كيف يتم تطبيق كل مهارة على هذه البنية:

### مهارة البساطة (Simplicity)
- كل مجلد له مسؤولية واحدة وواضحة
- المكونات في `components/ui` هي atoms بسيطة قابلة لإعادة الاستخدام
- الشاشات في `screens/` تركّز على العرض فقط، والمنطق في hooks أو services
- مثال: `src/components/ui/Button.jsx` يحتوي فقط على مكون زر بسيط עם props واضحة

### مهارة عدم التكرار (DRY)
- مكونات UI مشتركة في `components/ui/` تستخدم في جميع الشاشات
- هوكس مخصصة في `hooks/` تحوي منطق متكرر (مثل مصادقة، جلب بيانات)
- وظائف مساعدة في `utils/` تستخدم في جميع أنحاء التطبيق
- مثال: вместо كتابة منطق fetch في كل component، نستخدم `useApi` هوك

### مهارة التغليف (Encapsulation)
- خدمة Supabase في `services/supabase/` скрыée تفاصيل التنفيذ
- المكونات تتفاعل مع الخدمات عبر واجهات واضحة (metods)
- السياقات في `contexts/` إخفاء تفاصيل إدارة الحالة
- مثال: במקום לנהל את מצב האימות במרכיב, משתמשים ב`AuthContext`

### مهارة التكوين على الوراثة
- بناء واجهات معقدة من تجميع مكونات بسيطة
- `ProductCard` في `components/feature/` مكون من `Image` + `Text` + `Button` من `components/ui/`
- تجنب وجود hiérarchies עמוקים של רכיבים מורשים
- مثال: במקום ליצור מחלקת בסיס מורכבת לכרטיסי מוצרים, מרכיבים כרטיס ממודולים פשוטים

### مهارة الإعداد المспецифиكي للمزود
- إعدادات Supabase مركزة في `services/supabase/SupabaseService.js`
- لا يتسرب عنوان URL أو مفتاح Supabase إلى منطق الأعمال
- المكونات تستخدم واجهة بسيطة مثل `supabaseService.getProducts()`
- مثال: بدلاً من استدعاء `supabase.from('products')` في كل مكان، لدينا طريقة موحدة

### مهارة إزالة الكود الميت
- هيكل项目初期不包含未使用的文件
- أي كود تجريبي أو معلق يُزال فورًا после الاختبار
- المراجعة الدورية لإزالة التعليقات الزائدة والكود غير المستخدم
- مثال: بعد اختبار ميزة جديدة، إذا لم نعد نستخدم متغيرًا أو دالة، نزيلها

### مهارة التسمية محايدة للمنصة
- جميع أسماء الأحداث والثوابت في `utils/constants.js` محايدة
- مثال: использовать `EVENTS.PRODUCT_ADDED_TO_CART` вместо `ANDROID_PRODUCT_ADDED`
- تجنب الأسماء المتعلقة بـ iOS أو Android في المنطق المشترك
- مثال:命名函数为`formatCurrency`而不是`formatCurrencyForAndroid`

### مهارة запрет на تجاهل الأنواع
- `tsconfig.json` مُضبط علىstrict Mode دون استثناءات
- جميع الملفات TypeScript تعرّف الأنواع بدقة
- لا توجد تعليقات `// @ts-ignore` أو `// @ts-expect-error`
- بدلاً من `any`، نستخدم أنواع محددة أو `unknown` مع فحص النوع
- مثال: defining precise types for Supabase responses instead of using `any`

### مهارة التكامل الكامل
- عند نقل ملف، يتم تحديث所有 الاستيرادات في نفس العملية
- لا يترك أيcling أو شيمات توافق إلا إذا كان مطلوبًا
- مثال: عند نقل مكون من `components/old/Button.jsx` إلى `src/components/ui/Button.jsx`, نحدث所有 الملفات التي تستورده في نفس الالتزام

### مهارة أقصى تغطية بالاختبارات
- بنية `__tests__/` جاهزة لكتابة اختبارات الوحدة والتكامل
- كل مجلد مصدر له مجلد اختبار موازي (مثلاً: `src/components/__tests__/`)
- حتى لو لم نكتب الاختبارات الآن، الهيكل جاهز للاستخدام المستقبلي
- مثال: وجود `__tests__/services/supabase.test.js` جاهز لاختبار خدمة Supabase

### مهارة سير العمل المعرفي
- دليل واضح لتتبع الأخطاء وتنفيذ الميزات
- كل تغيير يخدم غرضًا محددًا ومُdocumented
- التنفيذ التدريجي مع تحقق من كل خطوة
- مثال: عند إضافة ميزة جديدة، أولاً نتحليل المتطلبات، ثم نخطط، ثم ننفذ جزءًجزءًا مع تحقق بعد كل جزء

### مهارة أدوات التطوير المفضلة
- استعمال أوامر مثل `grep -r src/ "search term"` للبحث في الكود
- استعمال `npm run lint` و`npm run type-check` вместо фпроверок يدوية
- أتمتة المهام المتكررة عبر scripست في package.json
- مثال: بدلاً من فتح كل ملف يدويًا للتحقق من خطأ معين، نستخدم `grep -r "Error:" src/`

## تطبيق المبادئ على الإعدادات الأساسية:

### app.json
```json
{
  "expo": {
    "name": "NewElectroStore",
    "slug": "newelectrostore",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "updates": {
      "fallbackToCacheTimeout": 0
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundImage": "./assets/adaptive-background.png"
      }
    },
    "web": {
      "favicon": "./assets/favicon.png"
    }
  }
}
```

### tsconfig.json (إعدادات نوع صارمة)
```json
{
  "compilerOptions": {
    "target": "esnext",
    "lib": ["dom", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "useUnknownInCatchVariables": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "exclude": [
    "node_modules",
    "babel.config.js",
    "metro.config.js",
    "jest.config.js"
  ]
}
```

### .env.example
```
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# اختياري: مفاتيح أخرى للخدمات الخارجية
# EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key_here
```

## تطبيق كارباتي سكيلز (Karpathy Skills) من CLAUDE.md:

1. **"لا تعدل كود لم أطلبه":**
   - نحن نقوم بإنشاء مشروع جديد، لذا لا نعدل كودًا موجودًا
   - أي تعديل مستقبلي سيكون بناءً على طلبات صريحة

2. **"أبسط حل دائماً أفضل":**
   - بنية المجلدات بسيطة وواضحة
   - المكونات والخدمات تبدأ بأبسط تنفيذ ممكن
   - تجنب التعقيد المسبق (premature optimization)

3. **"اسألني قبل أي افتراض":**
   - هذا المستند يوضح افتراضاتنا قبل التطبيق
   - أي تغيير في البنية سيشمل مناقشة أولًا

4. **"لا تضيف dependencies جديدة بدون إذن":**
   - سنبدأ بالتابعية الأساسية لـ Expo وReact Native
   - أي تبعية إضافية ستُضاف فقط بعد توضيح الحاجة وفوائدها

## الخطة للتنفيذ التدريجي مع تطبيق المهارات:

المرحلة 1: الإعداد الأساسي (الآن)
- إنشاء هيكل المجلدات
- تكوين TypeScript وإعدادات المشروع الأساسية
- إنشاء ملفات التوضيح (هذا الملف وSKILLS_EXPLANATION.md)

المرحلة 2: البنية التحتية
- إعداد خدمة Supabase مع التغليف الصحيح
- إنشاء هوكات أساسية (useAuth, useApi)
- إعداد سياقات_contexts_ الأساسية (AuthContext)

المرحلة 3: المكونات الأساسية
- بناء مكونات UI قابلة لإعادة الاستخدام
- إنشاء شاشات أساسية (التسجيل، المنزل، تفاصيل المنتج)
- تطبيق التجميع لإنشاء واجهات معقدة من مكونات بسيطة

المرحلة 4: الميزات المتخصصة
- عربة التسوق مع السياق أوzustand البسيط
- نظام التصفية والبحث
- مساحة المستخدم الشخصي
- لوحة الإدارة (إذا لزم الأمر)

المرحلة 5: الجودة والاختبار
- إضافة اختبارات للوحدات الحرجة
- تحسين الأداء حيث يلزم
- اختبار على أجهزة حقيقية
- إعداد لتسليم مستمر (إذا لزم الأمر)

في كل مرحلة، نطبق المبادئ المذكورة أعلاه لضمان كود ناضج، سهل الصيانة، وخالٍ من الأخطاء قدر الإمكان.