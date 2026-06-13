-- ============================================
-- NewElectroStore — Full Backend Deployment
-- Safe to re-run (DROP IF EXISTS on all policies)
-- ============================================

-- ============================================
-- 1. Extensions
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 2. Auto-Confirm Email Trigger
-- ============================================
CREATE OR REPLACE FUNCTION public.auto_confirm_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE auth.users
  SET email_confirmed_at = NOW()
  WHERE id = NEW.id AND email_confirmed_at IS NULL;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_auto_confirm ON auth.users;
CREATE TRIGGER on_auth_user_auto_confirm
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_confirm_email();

-- ============================================
-- 3. Tables (CREATE IF NOT EXISTS)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  full_name     TEXT NOT NULL DEFAULT '',
  phone         TEXT,
  avatar_url    TEXT,
  role          TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer','admin','super_admin')),
  default_address_id UUID,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  name_ar    TEXT NOT NULL,
  slug       TEXT NOT NULL UNIQUE,
  image_url  TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.products (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT NOT NULL,
  description      TEXT NOT NULL DEFAULT '',
  price            NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  original_price   NUMERIC(10,2) CHECK (original_price IS NULL OR original_price >= 0),
  image_url        TEXT NOT NULL DEFAULT '',
  category_id      UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  featured         BOOLEAN NOT NULL DEFAULT false,
  flash_sale       BOOLEAN NOT NULL DEFAULT false,
  flash_sale_price NUMERIC(10,2) CHECK (flash_sale_price IS NULL OR flash_sale_price >= 0),
  views            INTEGER NOT NULL DEFAULT 0,
  stock            INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  rating           NUMERIC(2,1) NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  reviews_count    INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.product_images (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0
);
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.banners (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url  TEXT NOT NULL,
  link_url   TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active     BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.favorites (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.coupons (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code              TEXT NOT NULL UNIQUE,
  discount_percent  NUMERIC(5,2) NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
  max_uses          INTEGER NOT NULL DEFAULT 0 CHECK (max_uses >= 0),
  current_uses      INTEGER NOT NULL DEFAULT 0,
  min_purchase      NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (min_purchase >= 0),
  expires_at        TIMESTAMPTZ NOT NULL,
  active            BOOLEAN NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.cities (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  name_ar        TEXT NOT NULL,
  shipping_fee   NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (shipping_fee >= 0),
  delivery_days  INTEGER NOT NULL DEFAULT 1 CHECK (delivery_days > 0),
  active         BOOLEAN NOT NULL DEFAULT true
);
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.orders (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_amount      NUMERIC(10,2) NOT NULL DEFAULT 0,
  shipping_address  TEXT NOT NULL,
  city_id           UUID NOT NULL REFERENCES public.cities(id),
  city_name         TEXT,
  full_name         TEXT NOT NULL,
  phone             TEXT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','shipped','delivered','cancelled')),
  coupon_id         UUID REFERENCES public.coupons(id),
  coupon_code       TEXT,
  discount_amount   NUMERIC(10,2) NOT NULL DEFAULT 0,
  payment_method    TEXT NOT NULL DEFAULT 'cod' CHECK (payment_method IN ('cod','transfer')),
  payment_proof_url TEXT,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.order_items (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id       UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id     UUID NOT NULL REFERENCES public.products(id),
  product_title  TEXT NOT NULL,
  product_image  TEXT NOT NULL DEFAULT '',
  quantity       INTEGER NOT NULL CHECK (quantity > 0),
  unit_price     NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
  subtotal       NUMERIC(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED
);
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.search_queries (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  query      TEXT NOT NULL,
  count      INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.search_queries ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type  TEXT NOT NULL,
  event_data  JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.push_tokens (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token      TEXT NOT NULL,
  platform   TEXT NOT NULL DEFAULT 'android',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);
ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_products_flash_sale ON public.products(flash_sale) WHERE flash_sale = true;
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price);
CREATE INDEX IF NOT EXISTS idx_products_views ON public.products(views DESC);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_product_id ON public.favorites(product_id);
CREATE INDEX IF NOT EXISTS idx_search_queries_count ON public.search_queries(count DESC);
CREATE INDEX IF NOT EXISTS idx_search_queries_query ON public.search_queries(query);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON public.analytics_events(created_at DESC);

-- ============================================
-- 5. RLS Policies (DROP IF EXISTS to be re-runnable)
-- ============================================

DROP POLICY IF EXISTS products_select ON public.products;
DROP POLICY IF EXISTS products_insert ON public.products;
DROP POLICY IF EXISTS products_update ON public.products;
DROP POLICY IF EXISTS products_delete ON public.products;
CREATE POLICY products_select ON public.products FOR SELECT USING (true);
CREATE POLICY products_insert ON public.products FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'super_admin'));
CREATE POLICY products_update ON public.products FOR UPDATE
  USING (auth.jwt() ->> 'role' IN ('admin', 'super_admin'));
CREATE POLICY products_delete ON public.products FOR DELETE
  USING (auth.jwt() ->> 'role' IN ('admin', 'super_admin'));

DROP POLICY IF EXISTS categories_select ON public.categories;
DROP POLICY IF EXISTS categories_insert ON public.categories;
DROP POLICY IF EXISTS categories_update ON public.categories;
DROP POLICY IF EXISTS categories_delete ON public.categories;
CREATE POLICY categories_select ON public.categories FOR SELECT USING (true);
CREATE POLICY categories_insert ON public.categories FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'super_admin'));
CREATE POLICY categories_update ON public.categories FOR UPDATE
  USING (auth.jwt() ->> 'role' IN ('admin', 'super_admin'));
CREATE POLICY categories_delete ON public.categories FOR DELETE
  USING (auth.jwt() ->> 'role' IN ('admin', 'super_admin'));

DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
DROP POLICY IF EXISTS profiles_select_admin ON public.profiles;
DROP POLICY IF EXISTS profiles_insert_own ON public.profiles;
DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
DROP POLICY IF EXISTS profiles_update_admin ON public.profiles;
CREATE POLICY profiles_select_own ON public.profiles FOR SELECT
  USING (auth.uid() = id);
CREATE POLICY profiles_select_admin ON public.profiles FOR SELECT
  USING (auth.jwt() ->> 'role' IN ('admin', 'super_admin'));
CREATE POLICY profiles_insert_own ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
CREATE POLICY profiles_update_admin ON public.profiles FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'super_admin');

DROP POLICY IF EXISTS orders_select_own ON public.orders;
DROP POLICY IF EXISTS orders_select_admin ON public.orders;
DROP POLICY IF EXISTS orders_insert ON public.orders;
DROP POLICY IF EXISTS orders_update_admin ON public.orders;
CREATE POLICY orders_select_own ON public.orders FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY orders_select_admin ON public.orders FOR SELECT
  USING (auth.jwt() ->> 'role' IN ('admin', 'super_admin'));
CREATE POLICY orders_insert ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY orders_update_admin ON public.orders FOR UPDATE
  USING (auth.jwt() ->> 'role' IN ('admin', 'super_admin'));

DROP POLICY IF EXISTS order_items_select_own ON public.order_items;
DROP POLICY IF EXISTS order_items_select_admin ON public.order_items;
DROP POLICY IF EXISTS order_items_insert ON public.order_items;
CREATE POLICY order_items_select_own ON public.order_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid()));
CREATE POLICY order_items_select_admin ON public.order_items FOR SELECT
  USING (auth.jwt() ->> 'role' IN ('admin', 'super_admin'));
CREATE POLICY order_items_insert ON public.order_items FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS favorites_select_own ON public.favorites;
DROP POLICY IF EXISTS favorites_insert_own ON public.favorites;
DROP POLICY IF EXISTS favorites_delete_own ON public.favorites;
CREATE POLICY favorites_select_own ON public.favorites FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY favorites_insert_own ON public.favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY favorites_delete_own ON public.favorites FOR DELETE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS coupons_select_admin ON public.coupons;
DROP POLICY IF EXISTS coupons_insert_admin ON public.coupons;
DROP POLICY IF EXISTS coupons_update_admin ON public.coupons;
DROP POLICY IF EXISTS coupons_delete_admin ON public.coupons;
CREATE POLICY coupons_select_admin ON public.coupons FOR SELECT
  USING (auth.jwt() ->> 'role' IN ('admin', 'super_admin'));
CREATE POLICY coupons_insert_admin ON public.coupons FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'super_admin'));
CREATE POLICY coupons_update_admin ON public.coupons FOR UPDATE
  USING (auth.jwt() ->> 'role' IN ('admin', 'super_admin'));
CREATE POLICY coupons_delete_admin ON public.coupons FOR DELETE
  USING (auth.jwt() ->> 'role' IN ('admin', 'super_admin'));

DROP POLICY IF EXISTS cities_select ON public.cities;
DROP POLICY IF EXISTS cities_insert_admin ON public.cities;
DROP POLICY IF EXISTS cities_update_admin ON public.cities;
DROP POLICY IF EXISTS cities_delete_admin ON public.cities;
CREATE POLICY cities_select ON public.cities FOR SELECT USING (true);
CREATE POLICY cities_insert_admin ON public.cities FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'super_admin'));
CREATE POLICY cities_update_admin ON public.cities FOR UPDATE
  USING (auth.jwt() ->> 'role' IN ('admin', 'super_admin'));
CREATE POLICY cities_delete_admin ON public.cities FOR DELETE
  USING (auth.jwt() ->> 'role' IN ('admin', 'super_admin'));

DROP POLICY IF EXISTS push_tokens_insert ON public.push_tokens;
DROP POLICY IF EXISTS push_tokens_update ON public.push_tokens;
DROP POLICY IF EXISTS push_tokens_select ON public.push_tokens;
CREATE POLICY push_tokens_insert ON public.push_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY push_tokens_update ON public.push_tokens FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY push_tokens_select ON public.push_tokens FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS analytics_insert ON public.analytics_events;
CREATE POLICY analytics_insert ON public.analytics_events FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS search_queries_insert ON public.search_queries;
DROP POLICY IF EXISTS search_queries_select ON public.search_queries;
CREATE POLICY search_queries_insert ON public.search_queries FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL OR auth.uid() IS NULL);
CREATE POLICY search_queries_select ON public.search_queries FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS banners_select ON public.banners;
DROP POLICY IF EXISTS banners_insert ON public.banners;
DROP POLICY IF EXISTS banners_update ON public.banners;
DROP POLICY IF EXISTS banners_delete ON public.banners;
CREATE POLICY banners_select ON public.banners FOR SELECT USING (true);
CREATE POLICY banners_insert ON public.banners FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'super_admin'));
CREATE POLICY banners_update ON public.banners FOR UPDATE
  USING (auth.jwt() ->> 'role' IN ('admin', 'super_admin'));
CREATE POLICY banners_delete ON public.banners FOR DELETE
  USING (auth.jwt() ->> 'role' IN ('admin', 'super_admin'));

DROP POLICY IF EXISTS product_images_select ON public.product_images;
DROP POLICY IF EXISTS product_images_insert ON public.product_images;
DROP POLICY IF EXISTS product_images_delete ON public.product_images;
CREATE POLICY product_images_select ON public.product_images FOR SELECT USING (true);
CREATE POLICY product_images_insert ON public.product_images FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'super_admin'));
CREATE POLICY product_images_delete ON public.product_images FOR DELETE
  USING (auth.jwt() ->> 'role' IN ('admin', 'super_admin'));

-- ============================================
-- 6. Functions (RPCs)
-- ============================================
CREATE OR REPLACE FUNCTION public.decrement_stock(pid UUID, qty INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.products
  SET stock = stock - qty
  WHERE id = pid AND stock >= qty;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient stock for product %', pid;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_coupon_usage(cid UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.coupons
  SET current_uses = current_uses + 1
  WHERE id = cid AND current_uses < max_uses;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Coupon % has reached max uses', cid;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_product_view(product_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.products
  SET views = views + 1
  WHERE id = product_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_search_count(search_query TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.search_queries (query, count)
  VALUES (search_query, 1)
  ON CONFLICT ON CONSTRAINT search_queries_query_unique DO UPDATE
  SET count = public.search_queries.count + 1;
END;
$$;

ALTER TABLE IF EXISTS public.search_queries DROP CONSTRAINT IF EXISTS search_queries_query_unique;
ALTER TABLE public.search_queries ADD CONSTRAINT search_queries_query_unique UNIQUE (query);

-- ============================================
-- 7. Triggers
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_orders_updated_at ON public.orders;
CREATE TRIGGER set_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.calculate_order_total()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.orders
  SET total_amount = (
    SELECT COALESCE(SUM(quantity * unit_price), 0)
    FROM public.order_items
    WHERE order_id = NEW.order_id
  ) - COALESCE((SELECT discount_amount FROM public.orders WHERE id = NEW.order_id), 0)
  WHERE id = NEW.order_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_order_item_inserted ON public.order_items;
CREATE TRIGGER on_order_item_inserted
  AFTER INSERT ON public.order_items
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_order_total();

-- ============================================
-- 8. Create profiles for all existing auth.users
-- (trigger on_auth_user_created only fires on NEW users)
-- ============================================

INSERT INTO public.profiles (id, email, full_name)
SELECT id, email, COALESCE(raw_user_meta_data ->> 'full_name', '')
FROM auth.users
ON CONFLICT (id) DO NOTHING;

UPDATE public.profiles
SET role = 'super_admin'
WHERE email = 'abnbwh@gmail.com';

-- ============================================
-- 9. Sample Data
-- ============================================

-- Categories (proper hex UUIDs)
INSERT INTO public.categories (id, name, name_ar, slug, image_url) VALUES
  ('00000001-0000-0000-0000-000000000001', 'Smartphones', 'الهواتف الذكية', 'smartphones', 'https://picsum.photos/seed/cat1/400/400'),
  ('00000002-0000-0000-0000-000000000002', 'Laptops', 'أجهزة الكمبيوتر المحمولة', 'laptops', 'https://picsum.photos/seed/cat2/400/400'),
  ('00000003-0000-0000-0000-000000000003', 'Headphones', 'سماعات الرأس', 'headphones', 'https://picsum.photos/seed/cat3/400/400'),
  ('00000004-0000-0000-0000-000000000004', 'Accessories', 'الإكسسوارات', 'accessories', 'https://picsum.photos/seed/cat4/400/400'),
  ('00000005-0000-0000-0000-000000000005', 'Smart Watches', 'الساعات الذكية', 'smart-watches', 'https://picsum.photos/seed/cat5/400/400'),
  ('00000006-0000-0000-0000-000000000006', 'Tablets', 'الأجهزة اللوحية', 'tablets', 'https://picsum.photos/seed/cat6/400/400')
ON CONFLICT (slug) DO NOTHING;

-- Products (proper hex UUIDs, category IDs must match above)
INSERT INTO public.products (id, title, description, price, original_price, image_url, category_id, featured, flash_sale, flash_sale_price, stock, rating, reviews_count) VALUES
  ('00000001-0000-0001-0000-000000000001', 'Samsung Galaxy S24 Ultra', 'أحدث هاتف ذكي من سامسونج مع كاميرا 200 ميجابكسل', 4299, 4999, 'https://picsum.photos/seed/prod1/600/600', '00000001-0000-0000-0000-000000000001', true, true, 3899, 15, 4.8, 124),
  ('00000002-0000-0001-0000-000000000002', 'iPhone 15 Pro Max', 'هاتف أبل الأحدث مع شريحة A17 Pro', 4899, 5499, 'https://picsum.photos/seed/prod2/600/600', '00000001-0000-0000-0000-000000000001', true, false, NULL, 10, 4.9, 256),
  ('00000003-0000-0001-0000-000000000003', 'MacBook Pro M3', 'لاب توب أبل برو مع شريحة M3 مقاس 16 إنش', 8499, 9499, 'https://picsum.photos/seed/prod3/600/600', '00000002-0000-0000-0000-000000000002', true, false, NULL, 5, 4.7, 89),
  ('00000004-0000-0001-0000-000000000004', 'Sony WH-1000XM5', 'سماعات رأس لاسلكية مانعة للضوضاء', 1299, 1599, 'https://picsum.photos/seed/prod4/600/600', '00000003-0000-0000-0000-000000000003', true, true, 1099, 25, 4.6, 312),
  ('00000005-0000-0001-0000-000000000005', 'Apple Watch Ultra 2', 'ساعة أبل الرياضية المتطورة', 3299, 3799, 'https://picsum.photos/seed/prod5/600/600', '00000005-0000-0000-0000-000000000005', true, false, NULL, 8, 4.5, 67),
  ('00000006-0000-0001-0000-000000000006', 'iPad Air M2', 'جهاز أبل اللوحي مع شريحة M2', 2799, 3299, 'https://picsum.photos/seed/prod6/600/600', '00000006-0000-0000-0000-000000000006', false, true, 2499, 12, 4.4, 45),
  ('00000007-0000-0001-0000-000000000007', 'Xiaomi Power Bank 20000mAh', 'بطارية متنقلة بسعة 20000 ميللي أمبير', 159, 199, 'https://picsum.photos/seed/prod7/600/600', '00000004-0000-0000-0000-000000000004', false, false, NULL, 100, 4.3, 523),
  ('00000008-0000-0001-0000-000000000008', 'Galaxy Buds2 Pro', 'سماعات أذن لاسلكية من سامسونج', 699, 849, 'https://picsum.photos/seed/prod8/600/600', '00000004-0000-0000-0000-000000000004', true, true, 599, 30, 4.4, 198)
ON CONFLICT (id) DO NOTHING;

-- Product Images
INSERT INTO public.product_images (product_id, url, sort_order) VALUES
  ('00000001-0000-0001-0000-000000000001', 'https://picsum.photos/seed/prod1a/600/600', 1),
  ('00000001-0000-0001-0000-000000000001', 'https://picsum.photos/seed/prod1b/600/600', 2),
  ('00000001-0000-0001-0000-000000000001', 'https://picsum.photos/seed/prod1c/600/600', 3);

-- Banners
INSERT INTO public.banners (image_url, link_url, sort_order, active) VALUES
  ('https://picsum.photos/seed/banner1/1200/400', NULL, 1, true),
  ('https://picsum.photos/seed/banner2/1200/400', NULL, 2, true),
  ('https://picsum.photos/seed/banner3/1200/400', NULL, 3, true);

-- Cities (proper hex UUIDs)
INSERT INTO public.cities (id, name, name_ar, shipping_fee, delivery_days, active) VALUES
  ('00000001-0000-0002-0000-000000000001', 'Riyadh', 'الرياض', 30, 2, true),
  ('00000002-0000-0002-0000-000000000002', 'Jeddah', 'جدة', 40, 3, true),
  ('00000003-0000-0002-0000-000000000003', 'Dammam', 'الدمام', 35, 3, true),
  ('00000004-0000-0002-0000-000000000004', 'Mecca', 'مكة المكرمة', 45, 3, true),
  ('00000005-0000-0002-0000-000000000005', 'Medina', 'المدينة المنورة', 40, 3, true)
ON CONFLICT (id) DO NOTHING;

-- Coupons
INSERT INTO public.coupons (code, discount_percent, max_uses, current_uses, min_purchase, expires_at, active) VALUES
  ('WELCOME10', 10, 100, 0, 200, '2027-12-31 23:59:59+00', true),
  ('SALE20', 20, 50, 0, 500, '2026-12-31 23:59:59+00', true),
  ('VIP50', 50, 10, 0, 1000, '2026-06-30 23:59:59+00', true);
