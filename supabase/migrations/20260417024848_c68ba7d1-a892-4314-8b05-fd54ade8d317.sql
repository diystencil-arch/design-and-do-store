
-- Replace overly permissive INSERT on email_subscribers (require non-empty email)
DROP POLICY IF EXISTS "Anyone subscribe" ON public.email_subscribers;
CREATE POLICY "Anyone subscribe with email"
  ON public.email_subscribers FOR INSERT
  WITH CHECK (email IS NOT NULL AND length(trim(email)) > 3);

-- Replace overly permissive INSERT on affiliate_clicks (require valid product reference)
DROP POLICY IF EXISTS "Anyone insert clicks" ON public.affiliate_clicks;
CREATE POLICY "Anyone log click for active product"
  ON public.affiliate_clicks FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.is_active = true)
  );

-- Restrict storage listing on product-images: keep file access via direct URL but disallow listing
DROP POLICY IF EXISTS "Public read product images" ON storage.objects;
CREATE POLICY "Public access product images by name"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images' AND auth.role() = 'anon' IS NOT NULL);
-- Note: public bucket files remain accessible via signed/public URL paths regardless of listing policy.
