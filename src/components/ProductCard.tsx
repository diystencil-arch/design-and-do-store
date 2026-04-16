import { Link } from 'react-router-dom';
import { ExternalLink, ShoppingBag, Download, Star } from 'lucide-react';
import { Product } from '@/data/products';
import { useCartStore } from '@/stores/cartStore';

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const addItem = useCartStore((s) => s.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.type === 'affiliate') return;
    addItem({
      productId: product.id,
      variantId: product.variants?.[0]?.id,
      quantity: 1,
      price: product.variants?.[0]?.priceOverride ?? product.price,
      title: product.title,
      image: product.images[0],
      type: product.type,
      variantLabel: product.variants?.[0] ? `${product.variants[0].size} · ${product.variants[0].material}` : undefined,
    });
  };

  return (
    <Link to={`/product/${product.slug}`} className="product-card group block">
      <div className="aspect-square rounded-lg overflow-hidden bg-muted mb-4">
        <img
          src={product.images[0]}
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

      {product.type === 'affiliate' ? (
        <div className="space-y-2">
          <div className="flex items-center gap-1">
            {product.externalRating && (
              <>
                <Star size={13} className="fill-accent text-accent" />
                <span className="text-xs text-muted-foreground">
                  {product.externalRating} ({product.externalReviewCount})
                </span>
              </>
            )}
          </div>
          <p className="text-sm font-medium text-foreground">{product.externalPrice}</p>
          <span className="btn-outline text-xs py-1.5 px-3 w-full text-center">
            View on Amazon <ExternalLink size={12} />
          </span>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">£{product.price.toFixed(2)}</span>
            {product.compareAtPrice && (
              <span className="text-xs text-muted-foreground line-through">£{product.compareAtPrice.toFixed(2)}</span>
            )}
          </div>
          {product.fileFormats && (
            <div className="flex gap-1">
              {product.fileFormats.map((f) => (
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
      )}
    </Link>
  );
}
