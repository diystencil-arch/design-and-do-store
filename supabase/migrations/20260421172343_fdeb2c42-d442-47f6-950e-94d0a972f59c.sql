-- Product status enum
DO $$ BEGIN
  CREATE TYPE public.product_status AS ENUM ('published', 'draft', 'deactivated', 'sold_out');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Categories
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  image_url text,
  sort_order integer NOT NULL DEFAULT 0,
  show_on_home boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone view categories" ON public.categories;
CREATE POLICY "Anyone view categories" ON public.categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins manage categories" ON public.categories;
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS trg_categories_updated ON public.categories;
CREATE TRIGGER trg_categories_updated BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Product ↔ Categories
CREATE TABLE IF NOT EXISTS public.product_categories (
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, category_id)
);
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone view product_categories" ON public.product_categories;
CREATE POLICY "Anyone view product_categories" ON public.product_categories FOR SELECT
  USING (EXISTS (SELECT 1 FROM products p WHERE p.id = product_id AND (p.is_active = true OR has_role(auth.uid(), 'admin'))));
DROP POLICY IF EXISTS "Admins manage product_categories" ON public.product_categories;
CREATE POLICY "Admins manage product_categories" ON public.product_categories FOR ALL
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Product columns
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS status public.product_status NOT NULL DEFAULT 'published',
  ADD COLUMN IF NOT EXISTS is_bestseller boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_recommended boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS featured_sort integer,
  ADD COLUMN IF NOT EXISTS sku text,
  ADD COLUMN IF NOT EXISTS barcode text,
  ADD COLUMN IF NOT EXISTS stock_quantity integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS low_stock_threshold integer NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS personalization_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS personalization_label text DEFAULT 'Add your personalization',
  ADD COLUMN IF NOT EXISTS personalization_max_chars integer DEFAULT 100,
  ADD COLUMN IF NOT EXISTS video_url text,
  ADD COLUMN IF NOT EXISTS video_thumbnail text,
  ADD COLUMN IF NOT EXISTS meta_title text,
  ADD COLUMN IF NOT EXISTS meta_description text;

CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_products_bestseller ON public.products(is_bestseller) WHERE is_bestseller = true;

-- Order item personalization
ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS personalization text;

-- Blog posts: i18n and SEO
ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS language text NOT NULL DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS meta_title text,
  ADD COLUMN IF NOT EXISTS meta_description text,
  ADD COLUMN IF NOT EXISTS product_id uuid REFERENCES public.products(id) ON DELETE SET NULL;

-- Allow same slug per different language
DO $$ BEGIN
  ALTER TABLE public.blog_posts DROP CONSTRAINT IF EXISTS blog_posts_slug_key;
EXCEPTION WHEN others THEN null; END $$;
CREATE UNIQUE INDEX IF NOT EXISTS uniq_blog_slug_lang ON public.blog_posts(slug, language);

-- Product videos bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-videos', 'product-videos', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Anyone read product videos" ON storage.objects;
CREATE POLICY "Anyone read product videos" ON storage.objects FOR SELECT
  USING (bucket_id = 'product-videos');
DROP POLICY IF EXISTS "Admins write product videos" ON storage.objects;
CREATE POLICY "Admins write product videos" ON storage.objects FOR ALL
  USING (bucket_id = 'product-videos' AND has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'product-videos' AND has_role(auth.uid(), 'admin'));

-- Seed a Stencils category
INSERT INTO public.categories (name, slug, description, sort_order, show_on_home)
VALUES ('Stencils', 'stencils', 'Reusable Mylar stencils for crafts, walls, and more.', 1, true)
ON CONFLICT (slug) DO NOTHING;

-- Backfill: existing inactive products become drafts
UPDATE public.products SET status = 'draft' WHERE is_active = false AND status = 'published';