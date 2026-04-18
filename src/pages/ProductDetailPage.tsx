import { useParams, Link } from 'react-router-dom';
import { useProductBySlug } from '@/hooks/useProducts';
import { useCartStore } from '@/stores/cartStore';
import { useCurrency } from '@/contexts/CurrencyContext';
import { ShoppingBag, Download, ExternalLink, Star, ArrowLeft, Check } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { product, loading } = useProductBySlug(slug);
  const addItem = useCartStore((s) => s.addItem);
  const { format } = useCurrency();
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [added, setAdded] = useState(false);

  if (loading) {
    return <div className="container-page py-20 text-center text-muted-foreground">Loading…</div>;
  }

  if (!product) {
    return (
      <div className="container-page py-20 text-center">
        <p className="text-muted-foreground">Product not found.</p>
        <Link to="/" className="btn-primary mt-4 inline-flex">Go Home</Link>
      </div>
    );
  }

  const variant = product.variants?.[selectedVariant];
  const displayPrice = variant?.price_override ?? Number(product.price);

  const handleAdd = () => {
    if (product.type === 'affiliate') return;
    addItem({
      productId: product.id,
      variantId: variant?.id,
      quantity: 1,
      price: displayPrice,
      title: product.title,
      image: product.images[0] || '/placeholder.svg',
      type: product.type,
      variantLabel: variant ? `${variant.size ?? ''} · ${variant.material ?? ''}`.trim() : undefined,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleAffiliateClick = () => {
    supabase.from('affiliate_clicks').insert({ product_id: product.id });
  };

  const backTo =
    product.type === 'affiliate' ? '/tools'
    : product.type === 'digital' ? '/svg'
    : product.tags.includes('wood') ? '/wood'
    : product.tags.includes('acrylic') ? '/acrylic'
    : '/stencils';

  return (
    <div className="container-page py-10">
      <Link to={backTo} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-6">
        <ArrowLeft size={14} /> Back
      </Link>

      <div className="grid md:grid-cols-2 gap-10">
        <div className="aspect-square rounded-xl overflow-hidden bg-muted">
          <img src={product.images[0] || '/placeholder.svg'} alt={product.title} className="w-full h-full object-cover" />
        </div>

        <div>
          <div className="flex flex-wrap gap-2 mb-3">
            {product.tags.map((tag) => (
              <span key={tag} className="badge-tag">{tag}</span>
            ))}
          </div>

          <h1 className="text-2xl md:text-3xl font-medium text-foreground mb-3">{product.title}</h1>
          <p className="text-muted-foreground leading-relaxed mb-6">{product.description}</p>

          {product.type === 'affiliate' ? (
            <div className="space-y-4">
              {product.affiliate?.external_rating && (
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={i < Math.floor(product.affiliate!.external_rating!) ? 'fill-accent text-accent' : 'text-border'}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {product.affiliate.external_rating} ({product.affiliate.external_review_count} reviews)
                  </span>
                </div>
              )}
              {product.affiliate?.external_price && (
                <p className="text-2xl font-medium text-foreground">{product.affiliate.external_price}</p>
              )}
              <a
                href={product.affiliate?.amazon_url || '#'}
                onClick={handleAffiliateClick}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="btn-primary"
              >
                View on Amazon <ExternalLink size={16} />
              </a>
              <p className="text-xs text-muted-foreground">
                As an Amazon Associate, we earn from qualifying purchases.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-medium text-foreground">{format(displayPrice)}</span>
                {product.compare_at_price && (
                  <span className="text-lg text-muted-foreground line-through">{format(Number(product.compare_at_price))}</span>
                )}
              </div>

              {product.variants && product.variants.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Size</p>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v, i) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(i)}
                        className={`px-4 py-2 border rounded-md text-sm transition-colors ${
                          i === selectedVariant
                            ? 'border-primary bg-primary/10 text-foreground'
                            : 'border-border text-muted-foreground hover:border-primary/40'
                        }`}
                      >
                        {v.size}
                      </button>
                    ))}
                  </div>
                  {variant && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {variant.material} · {variant.stock_quantity > 0 ? `${variant.stock_quantity} in stock` : 'Out of stock'}
                    </p>
                  )}
                </div>
              )}

              {product.digital?.file_formats && product.digital.file_formats.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Included formats</p>
                  <div className="flex gap-2 flex-wrap">
                    {product.digital.file_formats.map((f) => (
                      <span key={f} className="px-3 py-1.5 bg-muted rounded-md text-sm text-foreground">{f}</span>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleAdd}
                disabled={variant?.stock_quantity === 0}
                className="btn-primary w-full md:w-auto disabled:opacity-50"
              >
                {added ? (
                  <><Check size={16} /> Added!</>
                ) : product.type === 'digital' ? (
                  <><Download size={16} /> Buy Now — {format(displayPrice)}</>
                ) : (
                  <><ShoppingBag size={16} /> Add to Cart</>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
