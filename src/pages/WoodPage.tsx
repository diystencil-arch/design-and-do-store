import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { useProductsForSection } from '@/hooks/useProducts';

export default function WoodPage() {
  const { products, loading } = useProductsForSection({ categorySlug: 'wood', type: 'physical', tag: 'wood' });

  return (
    <div className="container-page py-12 md:py-16">
      <header className="max-w-2xl">
        <p className="text-sm font-medium text-primary uppercase tracking-wider">Laser Cut</p>
        <h1 className="mt-2 text-4xl md:text-5xl font-bold text-foreground">Wood cutouts</h1>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          Precision laser-cut shapes, letters, signs and ornaments in premium birch plywood.
          Perfect for crafting, signage, weddings, holidays and home decor. Custom shapes available.
        </p>
      </header>

      {loading ? (
        <p className="mt-10 text-muted-foreground">Loading…</p>
      ) : products.length > 0 ? (
        <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      ) : (
        <>
          <div className="mt-10 grid sm:grid-cols-3 gap-4">
            {[
              { title: '1/8" Birch Plywood', body: 'Smooth-sanded both sides, ideal for paint or stain.' },
              { title: 'Custom shapes', body: 'Send your SVG/PNG — we cut and ship within 3–5 days.' },
            ].map((c) => (
              <div key={c.title} className="rounded-lg border border-border bg-card p-5">
                <Sparkles size={20} className="text-primary" />
                <h3 className="mt-3 font-semibold text-foreground">{c.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{c.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 rounded-lg border border-border bg-secondary/40 p-8 text-center">
            <h2 className="text-2xl font-bold text-foreground">Catalogue coming soon</h2>
            <p className="mt-2 text-muted-foreground">In the meantime, request a custom quote — we reply within 24 hours.</p>
            <Link to="/contact" className="mt-5 inline-flex items-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
              Request a quote →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
