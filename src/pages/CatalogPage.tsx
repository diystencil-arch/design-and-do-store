import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import ProductCard from '@/components/ProductCard';

export default function CatalogPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('products')
      .select('id, type, title, slug, description, price, compare_at_price, images, tags, is_active, status')
      .eq('is_active', true)
      .in('status', ['published', 'sold_out'])
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setProducts(data || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="container-page py-10">
      <header className="mb-8">
        <h1 className="section-heading">Catalog</h1>
        <p className="text-sm text-muted-foreground mt-2">Browse every product across Tools, Stencils, Wood, Acrylic and SVG.</p>
      </header>
      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : products.length === 0 ? (
        <p className="text-muted-foreground">No products yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((p) => (
            <Link key={p.id} to={`/products/${p.slug}`}>
              <ProductCard product={p as any} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
