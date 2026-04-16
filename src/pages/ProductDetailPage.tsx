import { useParams, Link } from 'react-router-dom';
import { getProductBySlug } from '@/data/products';
import { useCartStore } from '@/stores/cartStore';
import { ShoppingBag, Download, ExternalLink, Star, ArrowLeft, Check } from 'lucide-react';
import { useState } from 'react';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const product = getProductBySlug(slug || '');
  const addItem = useCartStore((s) => s.addItem);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [added, setAdded] = useState(false);

  if (!product) {
    return (
      <div className="container-page py-20 text-center">
        <p className="text-muted-foreground">Product not found.</p>
        <Link to="/" className="btn-primary mt-4 inline-flex">Go Home</Link>
      </div>
    );
  }

  const variant = product.variants?.[selectedVariant];
  const displayPrice = variant?.priceOverride ?? product.price;

  const handleAdd = () => {
    if (product.type === 'affiliate') return;
    addItem({
      productId: product.id,
      variantId: variant?.id,
      quantity: 1,
      price: displayPrice,
      title: product.title,
      image: product.images[0],
      type: product.type,
      variantLabel: variant ? `${variant.size} · ${variant.material}` : undefined,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="container-page py-10">
      <Link to={product.type === 'affiliate' ? '/tools' : product.type === 'physical' ? '/stencils' : '/svg'} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-6">
        <ArrowLeft size={14} /> Back
      </Link>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Image */}
        <div className="aspect-square rounded-xl overflow-hidden bg-muted">
          <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
        </div>

        {/* Info */}
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
              {product.externalRating && (
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={i < Math.floor(product.externalRating!) ? 'fill-accent text-accent' : 'text-border'}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {product.externalRating} ({product.externalReviewCount} reviews)
                  </span>
                </div>
              )}
              <p className="text-2xl font-medium text-foreground">{product.externalPrice}</p>
              <a href={product.amazonUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">
                View on Amazon <ExternalLink size={16} />
              </a>
              <p className="text-xs text-muted-foreground">
                As an Amazon Associate, we earn from qualifying purchases.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-medium text-foreground">£{displayPrice.toFixed(2)}</span>
                {product.compareAtPrice && (
                  <span className="text-lg text-muted-foreground line-through">£{product.compareAtPrice.toFixed(2)}</span>
                )}
              </div>

              {/* Variants */}
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
                            ? 'border-accent bg-accent/10 text-foreground'
                            : 'border-border text-muted-foreground hover:border-accent/40'
                        }`}
                      >
                        {v.size}
                      </button>
                    ))}
                  </div>
                  {variant && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {variant.material} · {variant.stock > 0 ? `${variant.stock} in stock` : 'Out of stock'}
                    </p>
                  )}
                </div>
              )}

              {/* File formats */}
              {product.fileFormats && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Included formats</p>
                  <div className="flex gap-2">
                    {product.fileFormats.map((f) => (
                      <span key={f} className="px-3 py-1.5 bg-muted rounded-md text-sm text-foreground">{f}</span>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleAdd}
                disabled={variant?.stock === 0}
                className="btn-primary w-full md:w-auto disabled:opacity-50"
              >
                {added ? (
                  <><Check size={16} /> Added!</>
                ) : product.type === 'digital' ? (
                  <><Download size={16} /> Buy Now — £{displayPrice.toFixed(2)}</>
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
