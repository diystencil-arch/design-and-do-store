
-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('admin', 'customer');
CREATE TYPE public.product_type AS ENUM ('affiliate', 'physical', 'digital');
CREATE TYPE public.order_status AS ENUM ('pending', 'paid', 'processing', 'shipped', 'delivered', 'refunded', 'payment_failed');
CREATE TYPE public.payment_provider AS ENUM ('stripe', 'paypal');

-- ============ UTILITY FUNCTIONS ============
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ USER ROLES ============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ AUTO PROFILE + ROLE ON SIGNUP ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'));

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ PRODUCTS ============
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type product_type NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  compare_at_price NUMERIC(10,2),
  images TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone view active products" ON public.products FOR SELECT USING (is_active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage products" ON public.products FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_products_updated BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_products_type ON public.products(type);
CREATE INDEX idx_products_slug ON public.products(slug);

-- ============ PHYSICAL VARIANTS ============
CREATE TABLE public.physical_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  size TEXT,
  material TEXT,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  sku TEXT UNIQUE,
  price_override NUMERIC(10,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.physical_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone view variants" ON public.physical_variants FOR SELECT USING (true);
CREATE POLICY "Admins manage variants" ON public.physical_variants FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ DIGITAL FILES ============
CREATE TABLE public.digital_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  file_formats TEXT[] DEFAULT '{}',
  download_limit INTEGER NOT NULL DEFAULT 5,
  preview_image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.digital_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read digital files" ON public.digital_files FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage digital files" ON public.digital_files FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ AFFILIATE PRODUCTS ============
CREATE TABLE public.affiliate_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  amazon_url TEXT NOT NULL,
  amazon_asin TEXT,
  affiliate_tag TEXT,
  external_price TEXT,
  external_rating NUMERIC(2,1),
  external_review_count INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.affiliate_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone view affiliate" ON public.affiliate_products FOR SELECT USING (true);
CREATE POLICY "Admins manage affiliate" ON public.affiliate_products FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ ORDERS ============
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  guest_email TEXT,
  status order_status NOT NULL DEFAULT 'pending',
  payment_provider payment_provider,
  stripe_payment_intent_id TEXT,
  paypal_order_id TEXT,
  stripe_charge_id TEXT,
  paypal_capture_id TEXT,
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  shipping_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  shipping_address JSONB,
  tracking_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins view all orders" ON public.orders FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update orders" ON public.orders FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_orders_updated BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_orders_user ON public.orders(user_id);

-- ============ ORDER ITEMS ============
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES public.physical_variants(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL,
  product_title TEXT NOT NULL,
  product_type product_type NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own order items" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid())
);
CREATE POLICY "Admins view all order items" ON public.order_items FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- ============ DIGITAL DOWNLOADS ============
CREATE TABLE public.digital_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id UUID NOT NULL REFERENCES public.order_items(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  guest_email TEXT,
  download_token UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  download_count INTEGER NOT NULL DEFAULT 0,
  download_limit INTEGER NOT NULL DEFAULT 5,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '72 hours'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.digital_downloads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own downloads" ON public.digital_downloads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins view all downloads" ON public.digital_downloads FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_downloads_token ON public.digital_downloads(download_token);

-- ============ AFFILIATE CLICKS ============
CREATE TABLE public.affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  session_id TEXT,
  ip_hash TEXT,
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone insert clicks" ON public.affiliate_clicks FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins view clicks" ON public.affiliate_clicks FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- ============ EMAIL SUBSCRIBERS ============
CREATE TABLE public.email_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  source TEXT,
  freebie_sent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.email_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone subscribe" ON public.email_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins view subscribers" ON public.email_subscribers FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update subscribers" ON public.email_subscribers FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- ============ STORAGE BUCKETS ============
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('digital-files', 'digital-files', false) ON CONFLICT DO NOTHING;

CREATE POLICY "Public read product images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Admins upload product images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update product images" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete product images" ON storage.objects FOR DELETE USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins read digital files" ON storage.objects FOR SELECT USING (bucket_id = 'digital-files' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins upload digital files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'digital-files' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update digital files" ON storage.objects FOR UPDATE USING (bucket_id = 'digital-files' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete digital files" ON storage.objects FOR DELETE USING (bucket_id = 'digital-files' AND public.has_role(auth.uid(), 'admin'));
