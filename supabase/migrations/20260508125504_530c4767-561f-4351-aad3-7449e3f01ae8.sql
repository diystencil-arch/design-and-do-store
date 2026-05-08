ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS promo_code text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS promo_discount numeric(10,2) DEFAULT 0;