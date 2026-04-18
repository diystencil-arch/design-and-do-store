import { Link } from 'react-router-dom';
import { ExternalLink, ShoppingBag, Download, Star } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { useCurrency } from '@/contexts/CurrencyContext';
import { DbProduct } from '@/hooks/useProducts';

interface Props {
  product: DbProduct;
}

export default function ProductCard({ product }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const { format } = useCurrency();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.type === 'affiliate') return;
    const variant = product.variants?.[0];
    addItem({
      productId: product.id,
      variantId: variant?.id,
      quantity: 1,
      price: variant?.price_override ?? Number(product.price),
      title: product.title,
      image: product.images[0] || '/placeholder.svg',
      type: product.type,
      variantLabel: variant ? `${variant.size ?? ''} · ${variant.material ?? ''}`.trim() : undefined,
    });
  };

  const handleAffiliateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Best-effort log
    import('@/integrations/supabase/client').then(({ supabase }) => {
      supabase.from('affiliate_clicks').insert({ product_id: product.id });
    });
  };

  if (product.type === 'affiliate') {
    return (
      <a
        href={product.affiliate?.amazon_url || '#'}
        target="_blank"
        rel="noopener noreferrer sponsored"
        onClick={handleAffiliateClick}
        className="product-card group block"
      >
        <div className="aspect-square rounded-lg overflow-hidden bg-muted mb-4">
          <img
            src={product.images[0] || '/placeholder.svg'}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
        <div className="flex flex-wrap gap-1 mb-2">
          {product.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="badge-tag">{tag}</span>
          ))}
        </div>
        <h3 className="text-sm font-medium text-foreground mb-1 line-clamp-2">{product.title}</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-1">
            {product.affiliate?.external_rating && (
              <>
                <Star size={13} className="fill-accent text-accent" />
                <span className="text-xs text-muted-foreground">
                  {product.affiliate.external_rating} ({product.affiliate.external_review_count})
                </span>
              </>
            )}
          </div>
          {product.affiliate?.external_price && (
            <p className="text-sm font-medium text-foreground">{product.affiliate.external_price}</p>
          )}
          <span className="btn-outline text-xs py-1.5 px-3 w-full text-center">
            View on Amazon <ExternalLink size={12} />
          </span>
        </div>
      </a>
    );
  }

  return (
    <Link to={`/product/${product.slug}`} className="product-card group block">
      <div className="aspect-square rounded-lg overflow-hidden bg-muted mb-4">
        <img
          src={product.images[0] || '/placeholder.svg'}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>

      <div className="flex flex-wrap gap-1 mb-2">
        {product.tags.slice(0, 2).map((tag) => (
          <span key={tag} className="badge-tag">{tag}</span>
        ))}
      </div>

      <h3 className="text-sm font-medium text-foreground mb-1 line-clamp-2">{product.title}</h3>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{format(Number(product.price))}</span>
          {product.compare_at_price && (
            <span className="text-xs text-muted-foreground line-through">{format(Number(product.compare_at_price))}</span>
          )}
        </div>
        {product.digital?.file_formats && product.digital.file_formats.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {product.digital.file_formats.map((f) => (
              <span key={f} className="text-[10px] px-1.5 py-0.5 bg-muted rounded text-muted-foreground">{f}</span>
            ))}
          </div>
        )}
        <button onClick={handleAddToCart} className="btn-primary text-xs py-2 px-4 w-full">
          {product.type === 'digital' ? (
            <><Download size={14} /> Buy Now</>
          ) : (
            <><ShoppingBag size={14} /> Add to Cart</>
          )}
        </button>
      </div>
    </Link>
  );
}
