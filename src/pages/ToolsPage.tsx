import ProductCard from '@/components/ProductCard';
import { useProductsForSection } from '@/hooks/useProducts';

export default function ToolsPage() {
  const { products, loading } = useProductsForSection({ categorySlug: 'tools', type: 'affiliate' });

  return (
    <div className="container-page py-10">
      <h1 className="section-heading mb-2">Craft tools we recommend</h1>
      <p className="text-muted-foreground mb-8 max-w-lg">
        Our hand-picked selection of the best craft tools available on Amazon. We earn a small commission at no extra cost to you.
      </p>
      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : products.length === 0 ? (
        <p className="text-muted-foreground">No tools recommended yet — check back soon!</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
