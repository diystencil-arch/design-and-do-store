import ProductCard from '@/components/ProductCard';
import { getProductsByType } from '@/data/products';

export default function StencilsPage() {
  const products = getProductsByType('physical');

  return (
    <div className="container-page py-10">
      <h1 className="section-heading mb-2">Handmade stencils</h1>
      <p className="text-muted-foreground mb-8 max-w-lg">
        Laser-cut from durable Mylar. Reusable, easy to clean, and perfect for walls, furniture, and fabric.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
