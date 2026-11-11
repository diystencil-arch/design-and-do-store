DROP POLICY IF EXISTS "Anyone can record a product view" ON public.product_views;
CREATE POLICY "Anyone can record a product view" ON public.product_views FOR INSERT
WITH CHECK (
  (user_id IS NULL OR user_id = auth.uid())
  AND (session_id IS NULL OR length(session_id) <= 100)
  AND (referrer IS NULL OR length(referrer) <= 2000)
  AND (view_duration_ms IS NULL OR (view_duration_ms >= 0 AND view_duration_ms <= 86400000))
  AND EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.is_active = true)
);

DROP POLICY IF EXISTS "Anyone log funnel event" ON public.funnel_events;
CREATE POLICY "Anyone log funnel event" ON public.funnel_events FOR INSERT
WITH CHECK (
  (user_id IS NULL OR user_id = auth.uid())
  AND length(event_name) BETWEEN 1 AND 64
  AND (session_id IS NULL OR length(session_id) <= 100)
  AND (metadata IS NULL OR length(metadata::text) <= 4000)
  AND (product_id IS NULL OR EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id))
);

DROP POLICY IF EXISTS "Anyone can read site settings" ON public.site_settings;
CREATE POLICY "Anyone can read public site settings" ON public.site_settings FOR SELECT
USING (key IN ('ga_measurement_id','gtm_id','fb_pixel_id','contact_email','blog_ad_html') OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Public access product images by name" ON storage.objects;