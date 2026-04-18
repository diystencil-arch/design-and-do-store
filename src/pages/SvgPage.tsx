import ProductCard from '@/components/ProductCard';
import { useProductsByType } from '@/hooks/useProducts';

export default function SvgPage() {
  const { products, loading } = useProductsByType('digital');

  return (
    <div className="container-page py-10">
      <h1 className="section-heading mb-2">Digital SVG files — instant download</h1>
      <p className="text-muted-foreground mb-8 max-w-lg">
        Ready-to-cut designs for Cricut, Silhouette, and laser cutters. Includes SVG, PNG, DXF, PDF.
      </p>
      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : products.length === 0 ? (
        <p className="text-muted-foreground">No SVG designs yet — check back soon!</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
