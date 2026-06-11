# Security & Deployment Guide — NewElectroStore v1.0.0

## 1. Supabase Security Configuration

### 1.1 Row Level Security (RLS)

Enable RLS on ALL tables. Apply these policies:

| Table | Policy Name | Action | Condition |
|-------|-------------|--------|-----------|
| `products` | products_select | SELECT | `true` (public) |
| `products` | products_insert | INSERT | `auth.jwt() ->> 'role' IN ('admin', 'super_admin')` |
| `products` | products_update | UPDATE | `auth.jwt() ->> 'role' IN ('admin', 'super_admin')` |
| `products` | products_delete | DELETE | `auth.jwt() ->> 'role' IN ('admin', 'super_admin')` |
| `categories` | categories_select | SELECT | `true` (public) |
| `categories` | categories_insert | INSERT | Role check `IN ('admin', 'super_admin')` |
| `categories` | categories_update | UPDATE | Role check `IN ('admin', 'super_admin')` |
| `categories` | categories_delete | DELETE | Role check `IN ('admin', 'super_admin')` |
| `profiles` | profiles_select_own | SELECT | `auth.uid() = id` |
| `profiles` | profiles_select_admin | SELECT | `auth.jwt() ->> 'role' IN ('admin', 'super_admin')` |
| `profiles` | profiles_update_own | UPDATE | `auth.uid() = id` |
| `profiles` | profiles_update_admin | UPDATE | `auth.jwt() ->> 'role' = 'super_admin'` |
| `orders` | orders_select_own | SELECT | `auth.uid() = user_id` |
| `orders` | orders_select_admin | SELECT | `auth.jwt() ->> 'role' IN ('admin', 'super_admin')` |
| `orders` | orders_insert | INSERT | `auth.uid() = user_id` |
| `orders` | orders_update_admin | UPDATE | `auth.jwt() ->> 'role' IN ('admin', 'super_admin')` |
| `order_items` | order_items_select_own | SELECT | `EXISTS (SELECT 1 FROM orders WHERE id = order_id AND user_id = auth.uid())` |
| `order_items` | order_items_select_admin | SELECT | `auth.jwt() ->> 'role' IN ('admin', 'super_admin')` |
| `order_items` | order_items_insert | INSERT | `auth.uid()` IS NOT NULL |
| `favorites` | favorites_select_own | SELECT | `auth.uid() = user_id` |
| `favorites` | favorites_insert_own | INSERT | `auth.uid() = user_id` |
| `favorites` | favorites_delete_own | DELETE | `auth.uid() = user_id` |
| `coupons` | coupons_select_admin | SELECT | `auth.jwt() ->> 'role' IN ('admin', 'super_admin')` |
| `coupons` | coupons_insert_admin | INSERT | `auth.jwt() ->> 'role' IN ('admin', 'super_admin')` |
| `coupons` | coupons_update_admin | UPDATE | `auth.jwt() ->> 'role' IN ('admin', 'super_admin')` |
| `coupons` | coupons_delete_admin | DELETE | `auth.jwt() ->> 'role' IN ('admin', 'super_admin')` |
| `cities` | cities_select | SELECT | `true` (public) |
| `cities` | cities_insert_admin | INSERT | `auth.jwt() ->> 'role' IN ('admin', 'super_admin')` |
| `cities` | cities_update_admin | UPDATE | `auth.jwt() ->> 'role' IN ('admin', 'super_admin')` |
| `cities` | cities_delete_admin | DELETE | `auth.jwt() ->> 'role' IN ('admin', 'super_admin')` |
| `push_tokens` | push_tokens_upsert | INSERT | `auth.uid() = user_id` |
| `analytics_events` | analytics_insert | INSERT | `auth.uid()` IS NOT NULL |

### 1.2 Storage Bucket Policies

| Bucket | Policy | Action | Condition |
|--------|--------|--------|-----------|
| `payment-proofs` | Bucket is **PRIVATE** | — | — |
| `payment-proofs` | upload | INSERT | `auth.role() = 'authenticated'` AND `(storage.foldername(name))[1] = 'payment-proofs'` |
| `payment-proofs` | select | SELECT | `auth.role() = 'authenticated'` (use signed URLs) |

### 1.3 Signed URLs for Payment Proofs

Payment proofs use **signed URLs** expiring in 1 hour instead of public URLs.
This is enforced in `src/services/storageService.ts` via `createSignedUrl()`.

### 1.4 Rate Limiting

Enable Supabase Rate Limiting:
- **Auth endpoints**: 10 requests/minute per IP
- **Anonymous requests**: 30 requests/minute per IP
- **Authenticated requests**: 60 requests/minute per session

---

## 2. Environment Configuration

### 2.1 Environment Variables

Create `.env.production` (add to `.gitignore`):
```
EXPO_PUBLIC_SUPABASE_URL=https://rjcqkwgjqeqwzfbedwav.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_1Uz2U4l6oUH67i7sjTyr0g_rwqRFPIO
```

### 2.2 EAS Build Secrets

Set these in `eas secret:create` for CI/CD:
```
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY  # Only for backend/admin tasks
EXPO_PUBLIC_SUPABASE_ANON_KEY
```

---

## 3. Order Integrity

### 3.1 Duplicate Order Prevention

The app uses a client-side deduplication strategy:
- Disable submit button immediately on first tap
- Use a submission lock: `useRef(false)` pattern
- Server-side: add Supabase constraint `UNIQUE(idempotency_key)` on orders table

### 3.2 Stock Validation

Stock is validated twice:
1. **Client-side** before order creation (`validateStock` in `orderService.ts`)
2. **Server-side** via `decrement_stock` RPC with atomic decrement

---

## 4. Android Production Build

### 4.1 Permissions

Minimum required permissions in `app.json`:
- `INTERNET`
- `CAMERA` — for payment receipt upload
- `READ_EXTERNAL_STORAGE` — for image picker
- `POST_NOTIFICATIONS` — for push notifications

Blocked permissions (explicitly denied):
- `RECORD_AUDIO`, `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`
- `READ_CONTACTS`, `WRITE_CONTACTS`
- `READ_CALENDAR`, `WRITE_CALENDAR`

### 4.2 Build Commands

```bash
# Development build
eas build --platform android --profile development

# Preview APK for testing
eas build --platform android --profile preview

# Production AAB for Play Store
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android --profile production
```

### 4.3 App Signing

- Use **Google Play App Signing** for production
- Upload keystore to EAS with `eas credentials`
- Keep the upload keystore in a secure location (password manager)

---

## 5. Monitoring

### 5.1 Crash Reporting

- Add Sentry or similar crash reporting before launch
- LogLevel: `error` in production, `debug` in development

### 5.2 Supabase Monitoring

- Enable Supabase Logs for all API requests
- Set up email alerts for:
  - Auth failures > 10/minute
  - Database error rate > 1%
  - Storage bandwidth > 80%

### 5.3 Analytics

- `analytics_events` table tracks user behavior
- Review daily: sign-ups, purchases, product views
- Watch for anomaly: sudden drop in conversion rate

---

## 6. Backup Strategy

| Data | Frequency | Retention | Method |
|------|-----------|-----------|--------|
| Database | Daily | 30 days | Supabase automatic backups |
| Storage | Weekly | 90 days | Manual export via Supabase dashboard |
| Code | Per commit | Indefinite | GitHub + Git tags |

---

## 7. Pre-Launch Checklist

- [ ] All RLS policies enabled and tested
- [ ] Storage bucket set to PRIVATE
- [ ] Signed URLs working for payment proofs
- [ ] `.env.production` in `.gitignore`
- [ ] EAS secrets configured
- [ ] Production build signed with upload key
- [ ] Crash reporting configured
- [ ] Rate limiting enabled on Supabase
- [ ] Backup schedule configured
- [ ] Team members have required Supabase access

---

## 8. Emergency Response

| Incident | Response | SLA |
|----------|----------|-----|
| Data breach | Revoke anon key, rotate service keys, notify users | 1 hour |
| Auth outage | Check Supabase status page, downgrade to read-only | 15 minutes |
| Payment proof leak | Revoke signed URLs, rotate bucket policy | Immediate |
| High error rate | Rollback to last known good build | 30 minutes |
