import ProductCard from '@/components/ProductCard';
import { useProductsByType } from '@/hooks/useProducts';

export default function StencilsPage() {
  const { products, loading } = useProductsByType('physical', 'stencil');

  return (
    <div className="container-page py-10">
      <h1 className="section-heading mb-2">Handmade stencils</h1>
      <p className="text-muted-foreground mb-8 max-w-lg">
        Laser-cut from durable 10-mil food-safe Mylar. Reusable, easy to clean, and perfect for walls, furniture, and fabric.
      </p>
      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : products.length === 0 ? (
        <p className="text-muted-foreground">No stencils yet — check back soon!</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
