import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type ProductStatus = 'published' | 'draft' | 'deactivated' | 'sold_out';

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
  status?: ProductStatus;
  is_bestseller?: boolean;
  is_featured?: boolean;
  is_recommended?: boolean;
  featured_sort?: number | null;
  sku?: string | null;
  barcode?: string | null;
  stock_quantity?: number;
  low_stock_threshold?: number;
  personalization_enabled?: boolean;
  personalization_label?: string | null;
  personalization_max_chars?: number | null;
  video_url?: string | null;
  video_thumbnail?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
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
  categories?: Array<{ id: string; name: string; slug: string }>;
}

const SELECT = `
  id, type, title, slug, description, price, compare_at_price, images, tags, is_active,
  status, is_bestseller, is_featured, is_recommended, featured_sort,
  sku, barcode, stock_quantity, low_stock_threshold,
  personalization_enabled, personalization_label, personalization_max_chars,
  video_url, video_thumbnail, meta_title, meta_description,
  affiliate:affiliate_products(amazon_url, external_price, external_rating, external_review_count),
  variants:physical_variants(id, size, material, stock_quantity, price_override, sku),
  digital:digital_files(file_formats, preview_image_url),
  product_categories(category:categories(id, name, slug))
`;

function normalize(row: any): DbProduct {
  const cats = (row.product_categories || []).map((pc: any) => pc.category).filter(Boolean);
  return {
    ...row,
    images: row.images || [],
    tags: row.tags || [],
    affiliate: Array.isArray(row.affiliate) ? row.affiliate[0] || null : row.affiliate || null,
    digital: Array.isArray(row.digital) ? row.digital[0] || null : row.digital || null,
    variants: row.variants || [],
    categories: cats,
  };
}

const PUBLIC_STATUSES: ProductStatus[] = ['published', 'sold_out'];

export function useProductsByType(type: 'affiliate' | 'physical' | 'digital', tagFilter?: string) {
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    let q = supabase
      .from('products')
      .select(SELECT)
      .eq('type', type)
      .eq('is_active', true)
      .in('status', PUBLIC_STATUSES);
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
    setLoading(true);
    // No is_active/status filter — admins should be able to preview drafts.
    // Public users can still see sold_out (we show a badge instead).
    supabase.from('products').select(SELECT).eq('slug', slug).maybeSingle().then(({ data }) => {
      if (cancelled) return;
      setProduct(data ? normalize(data) : null);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [slug]);

  return { product, loading };
}

export function useFeaturedProducts(limit = 8) {
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from('products')
      .select(SELECT)
      .eq('is_active', true)
      .eq('is_featured', true)
      .in('status', PUBLIC_STATUSES)
      .order('featured_sort', { ascending: true, nullsFirst: false })
      .limit(limit)
      .then(({ data }) => {
        if (cancelled) return;
        setProducts((data || []).map(normalize));
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [limit]);

  return { products, loading };
}

export function useRecommendedProducts(excludeId?: string, limit = 4) {
  const [products, setProducts] = useState<DbProduct[]>([]);
  useEffect(() => {
    let cancelled = false;
    let q = supabase
      .from('products')
      .select(SELECT)
      .eq('is_active', true)
      .eq('is_recommended', true)
      .in('status', PUBLIC_STATUSES)
      .limit(limit + 1);
    q.then(({ data }) => {
      if (cancelled) return;
      const list = (data || []).map(normalize).filter((p) => p.id !== excludeId).slice(0, limit);
      setProducts(list);
    });
    return () => { cancelled = true; };
  }, [excludeId, limit]);
  return { products };
}

export function useCategories() {
  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string; description: string | null; image_url: string | null; show_on_home: boolean }>>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    supabase.from('categories').select('id, name, slug, description, image_url, show_on_home, sort_order')
      .order('sort_order', { ascending: true })
      .then(({ data }) => {
        if (cancelled) return;
        setCategories(data || []);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);
  return { categories, loading };
}

export function useProductsByCategory(categorySlug: string | undefined) {
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!categorySlug) { setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    (async () => {
      const { data: cat } = await supabase.from('categories').select('id').eq('slug', categorySlug).maybeSingle();
      if (!cat) { if (!cancelled) { setProducts([]); setLoading(false); } return; }
      const { data } = await supabase
        .from('product_categories')
        .select(`product:products(${SELECT})`)
        .eq('category_id', cat.id);
      if (cancelled) return;
      const list = (data || [])
        .map((row: any) => row.product)
        .filter((p: any) => p && p.is_active && PUBLIC_STATUSES.includes(p.status))
        .map(normalize);
      setProducts(list);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [categorySlug]);
  return { products, loading };
}
