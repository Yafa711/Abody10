# Security Audit Report — NewElectroStore

## Overview
Date: 2026-06-11  
Scope: Full project audit — Supabase integrations, auth, data access, API keys, storage, navigation  
Auditor: Automated security review  

---

## 1. Secrets & Credentials

| Finding | Severity | Status |
|---------|----------|--------|
| Supabase anon key in `src/services/supabase.ts` | Low | **Acceptable** — anon key is publishable by design; RLS enforces real security |
| Supabase URL hardcoded | Low | Acceptable; URL is public |
| No production `.env` file | Medium | **Fix** — add `.env.production` with production Supabase keys to `.gitignore` |
| `.env.example` exists | OK | Good practice |
| JWT tokens handled by Supabase SDK | OK | SDK auto-refreshes, no manual token storage |

**Action**: Ensure `.env.production` is in `.gitignore`. The anon key is safe for client-side use when RLS is properly configured.

---

## 2. Authentication

| Finding | Severity | Status |
|---------|----------|--------|
| `AuthContext` uses Supabase `onAuthStateChange` | OK | Standard safe pattern |
| Session stored in SDK-managed storage | OK | Not accessible to app code |
| Password reset uses Supabase built-in | OK | Safe |
| No brute-force protection on client | Low | Apply at Supabase level (Rate Limiting) |
| No MFA enforcement | Low | Optional; add if sensitive data is stored |

**Action**: Enable Supabase Rate Limiting for auth endpoints.

---

## 3. Database Access (RLS)

| Table | RLS Required | Current Risk |
|-------|-------------|--------------|
| `products` | Public read, admin write | **RISK** — Ensure RLS policy: `SELECT` for all, `INSERT/UPDATE/DELETE` only for `admin`/`super_admin` roles |
| `categories` | Public read, admin write | Same as above |
| `profiles` | User read own, admin read all, admin write roles | **RISK** — Policy must check `auth.uid() = id` for user, `role IN ('admin','super_admin')` for admin ops |
| `orders` | User read own, admin read all | **RISK** — Policy: `auth.uid() = user_id` for users, role check for admins |
| `order_items` | Same as orders | Cascade from orders |
| `coupons` | Admin only | **RISK** — Policy: only admins can read/write |
| `cities` | Public read, admin write | Same as products |
| `favorites` | User read/write own | **RISK** — Policy: `auth.uid() = user_id` |
| `product_images` | Public read, admin write | Same as products |

**Action**: Verify all RLS policies in Supabase dashboard match the above matrix.

---

## 4. API-Level Vulnerabilities

| Finding | Severity | Status |
|---------|----------|--------|
| Repository layer uses parameterized Supabase queries | OK | No SQL injection risk |
| No raw SQL queries anywhere | OK | All queries go through Supabase JS SDK |
| `handleSupabaseError` logs to console | Low | Remove production logging; use analytics instead |
| No request rate limiting on client | Low | Add at Supabase level |
| File upload to `payment-proofs` bucket | Medium | **Fix** — Ensure RLS policy restricts upload to authenticated users only, delete to admins only |

**Action**: Add Supabase Storage RLS for `payment-proofs` bucket.

---

## 5. Authorization — Missing Checks

| Route | Current Protection | Risk |
|-------|-------------------|------|
| Admin screens | Inline `isAdmin`/`isSuperAdmin` guards | Low — adequate for now |
| `orderRepository.list(userId)` | Accepts any `userId` param | **MEDIUM** — `list()` takes a userId but doesn't verify the caller owns it. Must only be called with current auth user's ID. |
| `orderRepository.getById(id)` | No owner check | **MEDIUM** — Returns order data for any ID. Must be only called from authenticated context. |
| `adminService.updateUserRole` | Only called from `CustomersAdminScreen` which checks `isSuperAdmin` | Low — adequate but **add server-side check** |
| `createOrder` validates stock client-side | Low — stock validation also happens server-side in RPC |

**Action**:
- Ensure `orderRepository.list()` and `getById()` are only called with the authenticated user's ID (currently satisfied by `orderService`)
- Add Supabase RLS policy that enforces `user_id = auth.uid()` for orders/order_items

---

## 6. Data Exposure

| Finding | Severity | Status |
|---------|----------|--------|
| `Profile` type includes `email`, `phone`, `avatar_url` | Low | Needed for order processing |
| `profile.role` exposed to client | Acceptable | Role must be on client for UI decisions |
| Coupon codes not hashed | Low | Anon key cannot enumerate; RLS restricts access |
| Order `payment_proof_url` publicly accessible | Medium | **Fix** — Use signed URLs with expiration for payment proofs, or check bucket RLS |

**Action**: Use Supabase signed URLs (expiring) for sensitive stored files instead of public URLs.

---

## 7. Input Validation

| Finding | Severity | Status |
|---------|----------|--------|
| No input sanitization on repository level | Low | Supabase SDK handles parameterization |
| No image URL validation | Low | Validate URL format server-side |
| Coupon codes stored uppercased | OK | Normalization is good practice |
| Order `total_amount` computed server-side | **MISSING** | **HIGH** — Order total is not recalculated on server; client sends `items` but `total_amount` is not stored consistently. Fix should use `order_items` subtotals. |

**Action**: Add a Supabase database function or trigger to compute `total_amount` from `order_items` on order creation.

---

## 8. Storage Security

| Finding | Severity | Status |
|---------|----------|--------|
| `payment-proofs` bucket — public read? | Medium | **Fix** — Bucket should not be public. Use RLS + signed URLs. |
| Image compression before upload | OK | Reduces abuse surface |
| File type not validated | Low | Supabase Storage can validate MIME type via RLS |

**Action**: Set `payment-proofs` bucket to private, use signed URLs for reading.

---

## 9. Dependency Security

| Package | Version | Notes |
|---------|---------|-------|
| `expo` | 50.0.15 | Latest SDK 50 — no known critical CVEs |
| `@supabase/supabase-js` | 2.39.0 | Updated — safe |
| `react-native-reanimated` | 3.6.2 | No known issues |
| `typescript` | 5.1.3 | Up-to-date |
| `jwt-decode` | 4.0.0 | Used for token inspection |

**Action**: Run `npm audit` before release.

---

## 10. Summary of Required Fixes

### Critical
- [ ] Add Supabase RLS policies matching the matrix above
- [ ] Add trigger/computed column for `orders.total_amount`

### High
- [ ] Fix `orderRepository.getById` — ensure it's only called from authenticated context (currently satisfied by `orderService`)
- [ ] Add server-side role validation for admin operations

### Medium
- [ ] Make `payment-proofs` bucket private + signed URLs
- [ ] Add `.env.production` to `.gitignore`
- [ ] Validate image file types on upload

### Low
- [ ] Remove console.error from `handleSupabaseError` in production
- [ ] Add Supabase Rate Limiting
- [ ] Run `npm audit`

---

## Risk Score

| Category | Score (0-10) | Notes |
|----------|-------------|-------|
| Secrets exposure | 2/10 | Anon key is acceptable |
| Auth | 3/10 | Needs RLS verification |
| Data access | 5/10 | Missing RLS enforcement in audit |
| Input validation | 3/10 | Parameterized queries safe |
| Storage | 4/10 | Payment proofs need signed URLs |
| **Overall** | **3.4/10** | Low risk, but RLS must be verified before production |
