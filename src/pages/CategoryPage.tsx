import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import ProductCard from '@/components/ProductCard';
import { DbProduct } from '@/hooks/useProducts';
import { Filter, ArrowUpDown } from 'lucide-react';

const SELECT = `
  id, type, title, slug, description, price, compare_at_price, images, tags, is_active,
  status, is_bestseller, is_featured, is_recommended, stock_quantity, created_at,
  affiliate:affiliate_products(amazon_url, external_price, external_rating, external_review_count),
  variants:physical_variants(id, size, material, stock_quantity, price_override, sku),
  digital:digital_files(file_formats, preview_image_url)
`;

type Sort = 'newest' | 'price_asc' | 'price_desc' | 'bestselling';

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<{ name: string; description: string | null } | null>(null);
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [maxPrice, setMaxPrice] = useState<number>(500);
  const [priceFilter, setPriceFilter] = useState<[number, number]>([0, 500]);
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [stockOnly, setStockOnly] = useState(false);
  const [bestsellerOnly, setBestsellerOnly] = useState(false);
  const [sort, setSort] = useState<Sort>('newest');

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      const { data: cat } = await supabase.from('categories').select('id, name, description').eq('slug', slug).maybeSingle();
      if (!cat) { if (!cancelled) { setCategory(null); setProducts([]); setLoading(false); } return; }
      setCategory({ name: cat.name, description: cat.description });
      const { data } = await supabase
        .from('product_categories')
        .select(`product:products(${SELECT})`)
        .eq('category_id', cat.id);
      if (cancelled) return;
      const list = (data || [])
        .map((row: any) => row.product)
        .filter((p: any) => p && p.is_active && (p.status === 'published' || p.status === 'sold_out'))
        .map((row: any) => ({
          ...row,
          images: row.images || [],
          tags: row.tags || [],
          affiliate: Array.isArray(row.affiliate) ? row.affiliate[0] || null : row.affiliate || null,
          digital: Array.isArray(row.digital) ? row.digital[0] || null : row.digital || null,
          variants: row.variants || [],
        }));
      const max = Math.ceil(Math.max(...list.map((p: any) => Number(p.price) || 0), 100));
      setMaxPrice(max);
      setPriceFilter([0, max]);
      setProducts(list);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [slug]);

  const allTags = useMemo(() => {
    const t = new Set<string>();
    products.forEach((p) => p.tags.forEach((tag) => t.add(tag)));
    return Array.from(t).slice(0, 12);
  }, [products]);

  const filtered = useMemo(() => {
    let list = [...products];
    list = list.filter((p) => Number(p.price) >= priceFilter[0] && Number(p.price) <= priceFilter[1]);
    if (tagFilter) list = list.filter((p) => p.tags.includes(tagFilter));
    if (stockOnly) list = list.filter((p) => p.status !== 'sold_out');
    if (bestsellerOnly) list = list.filter((p) => p.is_bestseller);

    if (sort === 'price_asc') list.sort((a, b) => Number(a.price) - Number(b.price));
    else if (sort === 'price_desc') list.sort((a, b) => Number(b.price) - Number(a.price));
    else if (sort === 'bestselling') list.sort((a, b) => Number(b.is_bestseller) - Number(a.is_bestseller));
    return list;
  }, [products, priceFilter, tagFilter, stockOnly, bestsellerOnly, sort]);

  if (loading) {
    return <div className="container-page py-20 text-center text-muted-foreground">Loading…</div>;
  }
  if (!category) {
    return (
      <div className="container-page py-20 text-center">
        <p className="text-muted-foreground">Category not found.</p>
        <Link to="/" className="btn-primary mt-4 inline-flex">Go Home</Link>
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <h1 className="section-heading mb-2">{category.name}</h1>
      {category.description && <p className="text-muted-foreground mb-8 max-w-2xl">{category.description}</p>}

      <div className="grid md:grid-cols-[240px_1fr] gap-8">
        {/* Filters */}
        <aside className="space-y-6">
          <div>
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-3 flex items-center gap-2"><Filter size={12} /> Filters</h3>

            <div className="space-y-1 mb-4">
              <label className="text-xs text-muted-foreground">Price: ${priceFilter[0]} - ${priceFilter[1]}</label>
              <input type="range" min={0} max={maxPrice} value={priceFilter[1]} onChange={(e) => setPriceFilter([0, parseInt(e.target.value)])} className="w-full accent-primary" />
            </div>

            <label className="flex items-center gap-2 text-sm mb-2 cursor-pointer">
              <input type="checkbox" checked={stockOnly} onChange={(e) => setStockOnly(e.target.checked)} /> In stock only
            </label>
            <label className="flex items-center gap-2 text-sm mb-4 cursor-pointer">
              <input type="checkbox" checked={bestsellerOnly} onChange={(e) => setBestsellerOnly(e.target.checked)} /> Bestsellers
            </label>

            {allTags.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  <button onClick={() => setTagFilter(null)} className={`text-xs px-2 py-1 rounded ${!tagFilter ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>All</button>
                  {allTags.map((t) => (
                    <button key={t} onClick={() => setTagFilter(tagFilter === t ? null : t)} className={`text-xs px-2 py-1 rounded ${tagFilter === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-secondary'}`}>{t}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">{filtered.length} products</p>
            <label className="flex items-center gap-2 text-sm">
              <ArrowUpDown size={14} className="text-muted-foreground" />
              <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="bg-background border border-border rounded px-2 py-1 text-sm">
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low → High</option>
                <option value="price_desc">Price: High → Low</option>
                <option value="bestselling">Best Selling</option>
              </select>
            </label>
          </div>

          {filtered.length === 0 ? (
            <p className="text-muted-foreground py-10 text-center">No products match these filters.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
