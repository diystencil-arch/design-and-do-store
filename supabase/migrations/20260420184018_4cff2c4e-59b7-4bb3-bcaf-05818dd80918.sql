
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Anyone view product images') THEN
    CREATE POLICY "Anyone view product images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Admins update product images') THEN
    CREATE POLICY "Admins update product images" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Admins delete product images') THEN
    CREATE POLICY "Admins delete product images" ON storage.objects FOR DELETE USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Admins read digital files objects') THEN
    CREATE POLICY "Admins read digital files objects" ON storage.objects FOR SELECT USING (bucket_id = 'digital-files' AND public.has_role(auth.uid(), 'admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Admins upload digital files') THEN
    CREATE POLICY "Admins upload digital files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'digital-files' AND public.has_role(auth.uid(), 'admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Admins update digital files') THEN
    CREATE POLICY "Admins update digital files" ON storage.objects FOR UPDATE USING (bucket_id = 'digital-files' AND public.has_role(auth.uid(), 'admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Admins delete digital files') THEN
    CREATE POLICY "Admins delete digital files" ON storage.objects FOR DELETE USING (bucket_id = 'digital-files' AND public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;
