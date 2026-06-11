# Release Checklist — NewElectroStore v1.0.0

## Pre-Flight

- [ ] `tsc --noEmit` passes with 0 errors
- [ ] App builds with `npx expo run:android` or `eas build --platform android --profile production`
- [ ] All screens render without crashes

---

## Database Checklist (Supabase)

### Tables
- [ ] `products` — has RLS: `SELECT` public, `INSERT/UPDATE/DELETE` for `admin`/`super_admin`
- [ ] `categories` — has RLS: `SELECT` public, `INSERT/UPDATE/DELETE` for admin
- [ ] `profiles` — has RLS: user reads own, admin reads all, `UPDATE` for admin roles
- [ ] `orders` — has RLS: `SELECT` own, admin reads all, `INSERT` authenticated
- [ ] `order_items` — has RLS: cascades from orders
- [ ] `coupons` — has RLS: admin-only CRUD
- [ ] `cities` — has RLS: `SELECT` public, admin write
- [ ] `favorites` — has RLS: user reads/writes own
- [ ] `product_images` — has RLS: `SELECT` public, admin write
- [ ] `banners` — has RLS: `SELECT` public, admin write
- [ ] `push_tokens` — has RLS: user writes own, admin reads
- [ ] `analytics_events` — has RLS: insert-only from client, admin read
- [ ] `search_queries` — has RLS: insert-only

### Functions / Triggers
- [ ] `decrement_stock` RPC — exists and is callable
- [ ] `increment_coupon_usage` RPC — exists and is callable
- [ ] `increment_product_view` RPC — exists and is callable
- [ ] `orders.total_amount` — should be computed from `order_items` trigger or client-side

### Indexes
- [ ] `orders(user_id)` — for user order lookup
- [ ] `orders(created_at)` — for sorting
- [ ] `products(category_id)` — for filtered queries
- [ ] `favorites(user_id, product_id)` — unique constraint

---

## Storage Checklist (Supabase)

### Buckets
- [ ] `payment-proofs` — **PRIVATE** (not public)
- [ ] Signed URLs configured for reading payment proofs (expire after 1 hour)
- [ ] RLS on `payment-proofs`: `INSERT` by authenticated users only, `SELECT` by order owner or admin

### File Validation
- [ ] MIME types restricted to `image/jpeg`, `image/png`, `image/webp`
- [ ] Max file size: 5MB

---

## Security Checklist

- [ ] Supabase anon key is the only key in client — service keys NEVER in app
- [ ] `.env.production` in `.gitignore`
- [ ] No hardcoded secrets in source code
- [ ] RLS policies applied to ALL tables
- [ ] Storage bucket policies applied
- [ ] Rate limiting enabled on Supabase auth endpoints
- [ ] Payment proof URLs use signed URLs (not public)
- [ ] `total_amount` computed server-side or validated on receipt

---

## Play Store / App Store Checklist

### Android (Google Play)
- [ ] App bundle (.aab) generated via `eas build --platform android --profile production`
- [ ] App signed with upload key
- [ ] Privacy Policy URL set
- [ ] App category: Shopping
- [ ] Content rating completed
- [ ] App screenshots (2-8 screenshots, at least 2 tablets)
- [ ] Feature graphic (1024x500px)
- [ ] App description in Arabic + English
- [ ] Version name matches `app.json` → `version`
- [ ] Target SDK 33+ (SDK 50 targets 34 by default)
- [ ] `android.permissions` only includes: `INTERNET`, `CAMERA` (for payment proof), `READ_EXTERNAL_STORAGE` (for image picker), `POST_NOTIFICATIONS` (for push)
- [ ] Test on physical device

### iOS (App Store) — *Future*
- [ ] Apple Developer account
- [ ] App icon 1024x1024
- [ ] Screenshots for 6.5" and 5.5" displays
- [ ] Privacy policy URL
- [ ] TestFlight build

---

## Pre-Release Testing

### Auth Flow
- [ ] Sign up with email/password
- [ ] Sign in
- [ ] Password reset (via Supabase email)
- [ ] Sign out
- [ ] Session persistence across app restarts

### Products
- [ ] Home screen loads products, categories, banners
- [ ] Product detail shows images, description, price, stock
- [ ] Product images in gallery
- [ ] Related products display
- [ ] Product view count increments

### Search
- [ ] Search returns results
- [ ] Top searches display on empty state
- [ ] Recent searches persist locally
- [ ] Empty state handles no results

### Favorites
- [ ] Add to favorites
- [ ] Remove from favorites
- [ ] Favorites persist across restarts
- [ ] Empty state when no favorites

### Cart
- [ ] Add item to cart
- [ ] Update quantity (with stock limit)
- [ ] Remove item from cart
- [ ] Coupon code application
- [ ] City selection affects shipping fee
- [ ] Cart persists via AsyncStorage
- [ ] Remove all items

### Checkout
- [ ] Order form validation (name, phone, address, city)
- [ ] Payment method selection (COD / transfer)
- [ ] Transfer receipt image upload
- [ ] Coupon discount reflected in total
- [ ] Order confirmation screen
- [ ] Stock validation on submit

### Orders
- [ ] Order history loads with user's orders
- [ ] Order detail shows items, status timeline, payment info
- [ ] Status search/filter works
- [ ] Re-order button (future)

### Admin Dashboard
- [ ] Dashboard stats load (sales, orders, products, users)
- [ ] Product CRUD (create, read, update, delete)
- [ ] Category CRUD
- [ ] Order management (view all, update status, WhatsApp)
- [ ] Coupon CRUD
- [ ] Customer management (role changes)
- [ ] City/shipping CRUD
- [ ] Role guards work (admin only screens)

### Offline
- [ ] Cached products display when offline
- [ ] Cached categories display when offline
- [ ] Network status indicator shows offline state
- [ ] Graceful error messages when offline

### Notifications
- [ ] Push notification permission requested
- [ ] Expo push token saved to `push_tokens` table
- [ ] Local notification on order status change

---

## Post-Release

- [ ] Monitor crash reporting
- [ ] Monitor Supabase query performance
- [ ] Set up Supabase daily backups
- [ ] Plan first patch (1.0.1) for any discovered issues
- [ ] Gather user feedback

---

## Notes

- Supabase Free Plan limits: 500MB database, 5GB bandwidth, 50,000 monthly active users
- Expo SDK 50: supports Android 6+ (API 23+), iOS 13.4+
- Push notifications require: `expo-notifications`, `expo-device`, and a push token server
