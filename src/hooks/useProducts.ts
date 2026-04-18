import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DbProduct {
  id: string;
  type: 'affiliate' | 'physical' | 'digital';
  title: string;
  slug: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  images: string[];
  tags: string[];
  is_active: boolean;
  // Joined
  affiliate?: {
    amazon_url: string;
    external_price: string | null;
    external_rating: number | null;
    external_review_count: number | null;
  } | null;
  variants?: Array<{
    id: string;
    size: string | null;
    material: string | null;
    stock_quantity: number;
    price_override: number | null;
    sku: string | null;
  }>;
  digital?: {
    file_formats: string[] | null;
    preview_image_url: string | null;
  } | null;
}

const SELECT = `
  id, type, title, slug, description, price, compare_at_price, images, tags, is_active,
  affiliate:affiliate_products(amazon_url, external_price, external_rating, external_review_count),
  variants:physical_variants(id, size, material, stock_quantity, price_override, sku),
  digital:digital_files(file_formats, preview_image_url)
`;

function normalize(row: any): DbProduct {
  return {
    ...row,
    images: row.images || [],
    tags: row.tags || [],
    affiliate: Array.isArray(row.affiliate) ? row.affiliate[0] || null : row.affiliate || null,
    digital: Array.isArray(row.digital) ? row.digital[0] || null : row.digital || null,
    variants: row.variants || [],
  };
}

export function useProductsByType(type: 'affiliate' | 'physical' | 'digital', tagFilter?: string) {
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    let q = supabase.from('products').select(SELECT).eq('type', type).eq('is_active', true);
    if (tagFilter) q = q.contains('tags', [tagFilter]);
    q.order('created_at', { ascending: false }).then(({ data }) => {
      if (cancelled) return;
      setProducts((data || []).map(normalize));
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [type, tagFilter]);

  return { products, loading };
}

export function useProductBySlug(slug: string | undefined) {
  const [product, setProduct] = useState<DbProduct | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) { setLoading(false); return; }
    let cancelled = false;
    supabase.from('products').select(SELECT).eq('slug', slug).eq('is_active', true).maybeSingle().then(({ data }) => {
      if (cancelled) return;
      setProduct(data ? normalize(data) : null);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [slug]);

  return { product, loading };
}
