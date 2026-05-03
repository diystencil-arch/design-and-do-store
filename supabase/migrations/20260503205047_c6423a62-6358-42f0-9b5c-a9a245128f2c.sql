
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.categories(id) ON DELETE SET NULL;

ALTER TABLE public.physical_variants
  ADD COLUMN IF NOT EXISTS images text[] NOT NULL DEFAULT '{}'::text[];

INSERT INTO public.categories (name, slug, description, sort_order, show_on_home)
SELECT v.name, v.slug, v.description, v.sort_order, false
FROM (VALUES
  ('Christmas', 'christmas', 'Festive holiday designs and stencils', 100),
  ('Halloween', 'halloween', 'Spooky season designs', 101),
  ('Easter', 'easter', 'Spring & Easter designs', 102),
  ('Mother''s Day', 'mothers-day', 'Gifts and designs for Mom', 103),
  ('Father''s Day', 'fathers-day', 'Gifts and designs for Dad', 104),
  ('Valentine''s Day', 'valentines-day', 'Love & romance designs', 105),
  ('Thanksgiving', 'thanksgiving', 'Autumn & gratitude designs', 106),
  ('New Year', 'new-year', 'New Year celebration designs', 107),
  ('St Patrick''s Day', 'st-patricks-day', 'St Patrick''s Day designs', 108),
  ('Independence Day', 'independence-day', '4th of July designs', 109)
) AS v(name, slug, description, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.categories c WHERE c.slug = v.slug);
