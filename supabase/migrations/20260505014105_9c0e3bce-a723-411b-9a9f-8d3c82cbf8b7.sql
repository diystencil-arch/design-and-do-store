
-- site_settings: simple key/value for app-wide config (GA, GTM, AdSense, email, etc.)
CREATE TABLE public.site_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read site settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admins manage site settings" ON public.site_settings FOR ALL
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

INSERT INTO public.site_settings (key, value) VALUES
  ('ga_measurement_id',''),
  ('gtm_id',''),
  ('blog_ad_html',''),
  ('contact_email','diystencil@gmail.com')
ON CONFLICT (key) DO NOTHING;

-- promo_banners
CREATE TABLE public.promo_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  message TEXT NOT NULL,
  link_url TEXT,
  link_label TEXT,
  bg_color TEXT DEFAULT '#C4A882',
  text_color TEXT DEFAULT '#ffffff',
  position TEXT NOT NULL DEFAULT 'top',
  is_active BOOLEAN NOT NULL DEFAULT true,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.promo_banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone view active banners" ON public.promo_banners FOR SELECT
  USING (is_active = true OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage banners" ON public.promo_banners FOR ALL
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_promo_banners_updated BEFORE UPDATE ON public.promo_banners
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- funnel_events
CREATE TABLE public.funnel_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  product_id UUID,
  session_id TEXT,
  user_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.funnel_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone log funnel event" ON public.funnel_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins read funnel events" ON public.funnel_events FOR SELECT
  USING (has_role(auth.uid(), 'admin'));
CREATE INDEX idx_funnel_events_event ON public.funnel_events(event_name, created_at DESC);
CREATE INDEX idx_funnel_events_product ON public.funnel_events(product_id);

-- view duration + dedupe
ALTER TABLE public.product_views ADD COLUMN IF NOT EXISTS view_duration_ms INTEGER;
-- de-dup existing rows before unique index
DELETE FROM public.product_views a USING public.product_views b
  WHERE a.ctid < b.ctid AND a.product_id = b.product_id AND a.session_id = b.session_id;
CREATE UNIQUE INDEX IF NOT EXISTS uniq_product_views_session ON public.product_views(product_id, session_id) WHERE session_id IS NOT NULL;
