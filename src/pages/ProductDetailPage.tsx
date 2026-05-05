import { useParams, Link } from 'react-router-dom';
import { useProductBySlug, useRecommendedProducts } from '@/hooks/useProducts';
import { useCartStore } from '@/stores/cartStore';
import { useCurrency } from '@/contexts/CurrencyContext';
import { ShoppingBag, Download, ExternalLink, Star, ArrowLeft, Check, Minus, Plus, Flame, Sparkles, Package } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import ProductCard from '@/components/ProductCard';
import { getSessionId, logFunnel } from '@/lib/funnel';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { product, loading } = useProductBySlug(slug);
  const { products: recommended } = useRecommendedProducts(product?.id);
  const addItem = useCartStore((s) => s.addItem);
  const { format } = useCurrency();
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [personalization, setPersonalization] = useState('');
  const [added, setAdded] = useState(false);

  // SEO meta tags
  useEffect(() => {
    if (!product) return;
    document.title = (product.meta_title || product.title) + ' | DIY Stencil';
    const descTag = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    const desc = product.meta_description || product.description?.slice(0, 160) || '';
    if (descTag) descTag.content = desc;
    else {
      const m = document.createElement('meta');
      m.name = 'description';
      m.content = desc;
      document.head.appendChild(m);
    }
    return () => { document.title = 'DIY Stencil'; };
  }, [product]);

  // Track view + view duration (deduped per session by DB unique index)
  const viewStartRef = useRef<number>(0);
  const viewIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!product?.id) return;
    const sid = getSessionId();
    viewStartRef.current = Date.now();
    (async () => {
      const { data } = await supabase
        .from('product_views')
        .insert({ product_id: product.id, session_id: sid, referrer: document.referrer || null })
        .select('id')
        .maybeSingle();
      if (data?.id) viewIdRef.current = data.id;
    })();
    logFunnel('view', product.id);

    const sendDuration = () => {
      const ms = Date.now() - viewStartRef.current;
      if (ms < 1000 || !viewIdRef.current) return;
      // fire-and-forget
      supabase.from('product_views').update({ view_duration_ms: ms }).eq('id', viewIdRef.current).then(() => {});
    };
    const onHide = () => sendDuration();
    window.addEventListener('beforeunload', onHide);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') sendDuration(); });
    return () => {
      sendDuration();
      window.removeEventListener('beforeunload', onHide);
    };
  }, [product?.id]);

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
  const isDraft = product.status === 'draft' || product.status === 'deactivated' || !product.is_active;
  const isSoldOut = product.status === 'sold_out' ||
    (product.type === 'physical' && variant && variant.stock_quantity <= 0) ||
    (product.type === 'physical' && (!product.variants || product.variants.length === 0) && (product.stock_quantity ?? 0) <= 0);

  const handleAdd = () => {
    if (product.type === 'affiliate' || isSoldOut) return;
    if (product.personalization_enabled && !personalization.trim()) {
      alert(`Please add your ${(product.personalization_label || 'personalization').toLowerCase()}`);
      return;
    }
    addItem({
      productId: product.id,
      variantId: variant?.id,
      quantity,
      price: displayPrice,
      title: product.title + (personalization ? ` — "${personalization}"` : ''),
      image: product.images[0] || '/placeholder.svg',
      type: product.type,
      variantLabel: variant ? `${variant.size ?? ''} · ${variant.material ?? ''}`.trim() : undefined,
    });
    logFunnel('add_to_cart', product.id, { quantity, price: displayPrice });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleAffiliateClick = () => {
    supabase.from('affiliate_clicks').insert({ product_id: product.id });
  };

  const backTo =
    product.categories?.[0] ? `/category/${product.categories[0].slug}`
    : product.type === 'affiliate' ? '/tools'
    : product.type === 'digital' ? '/svg'
    : product.tags.includes('wood') ? '/wood'
    : product.tags.includes('acrylic') ? '/acrylic'
    : '/stencils';

  return (
    <div className="container-page py-10">
      {isDraft && (
        <div className="mb-4 px-4 py-2 bg-secondary/50 border border-border rounded-md text-xs text-muted-foreground">
          ⚠️ This product is currently <strong>{product.status}</strong> — only admins can see this preview.
        </div>
      )}

      <Link to={backTo} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-6">
        <ArrowLeft size={14} /> Back
      </Link>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Media gallery */}
        <div className="space-y-3">
          <div className="aspect-square rounded-xl overflow-hidden bg-muted relative">
            {selectedImage === -1 && product.video_url ? (
              <video src={product.video_url} controls className="w-full h-full object-cover" poster={product.video_thumbnail || product.images[0]} />
            ) : (
              <img src={product.images[selectedImage] || product.images[0] || '/placeholder.svg'} alt={product.title} className="w-full h-full object-cover" />
            )}
            <div className="absolute top-3 left-3 flex flex-col gap-1">
              {product.is_bestseller && (
                <span className="bg-primary text-primary-foreground text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 shadow">
                  <Flame size={12} /> Bestseller
                </span>
              )}
              {product.is_featured && !product.is_bestseller && (
                <span className="bg-foreground text-background text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 shadow">
                  <Sparkles size={12} /> Featured
                </span>
              )}
              {isSoldOut && (
                <span className="bg-muted text-muted-foreground text-xs px-2.5 py-1 rounded-full font-medium shadow">Sold out</span>
              )}
            </div>
          </div>
          {(product.images.length > 1 || product.video_url) && (
            <div className="flex gap-2 overflow-x-auto">
              {product.video_url && (
                <button
                  onClick={() => setSelectedImage(-1)}
                  className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 bg-muted flex items-center justify-center ${selectedImage === -1 ? 'border-primary' : 'border-border'}`}
                  aria-label="View video"
                >
                  <Package size={20} />
                </button>
              )}
              {product.images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 ${i === selectedImage ? 'border-primary' : 'border-border'}`}
                >
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex flex-wrap gap-2 mb-3">
            {product.categories?.map((c) => (
              <Link key={c.id} to={`/category/${c.slug}`} className="badge-tag hover:opacity-80">{c.name}</Link>
            ))}
            {product.tags.map((tag) => (
              <span key={tag} className="badge-tag">{tag}</span>
            ))}
          </div>

          <h1 className="text-2xl md:text-3xl font-medium text-foreground mb-3">{product.title}</h1>
          <p className="text-muted-foreground leading-relaxed mb-6 whitespace-pre-line">{product.description}</p>

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

              {/* Stock indicator */}
              {product.type === 'physical' && !isSoldOut && (() => {
                const stock = variant?.stock_quantity ?? product.stock_quantity ?? 0;
                const threshold = product.low_stock_threshold ?? 5;
                if (stock > 0 && stock <= threshold) {
                  return <p className="text-xs text-destructive font-medium">Only {stock} left in stock — order soon!</p>;
                }
                if (stock > 0) return <p className="text-xs text-success font-medium">In stock</p>;
                return null;
              })()}

              {product.variants && product.variants.length > 0 && (
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Size</label>
                  <select
                    value={selectedVariant}
                    onChange={(e) => setSelectedVariant(parseInt(e.target.value))}
                    className="w-full md:w-64 px-3 py-2.5 border border-border rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    {product.variants.map((v, i) => (
                      <option key={v.id} value={i}>
                        {[v.size, v.material].filter(Boolean).join(' · ')}
                        {v.stock_quantity <= 0 ? ' — Out of stock' : ''}
                      </option>
                    ))}
                  </select>
                  {variant && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {variant.stock_quantity > 0 ? `${variant.stock_quantity} in stock` : 'Out of stock'}
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

              {/* Personalization */}
              {product.personalization_enabled && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {product.personalization_label || 'Add your personalization'}
                    <span className="text-destructive ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    value={personalization}
                    maxLength={product.personalization_max_chars || 100}
                    onChange={(e) => setPersonalization(e.target.value)}
                    placeholder="e.g. Sarah & Tom · 06.21.2025"
                    className="w-full px-3 py-2.5 border border-border rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {personalization.length}/{product.personalization_max_chars || 100} characters
                  </p>
                </div>
              )}

              {/* Quantity */}
              {product.type !== 'digital' && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Quantity</p>
                  <div className="inline-flex items-center border border-border rounded-md">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 hover:bg-muted transition-colors"
                      aria-label="Decrease"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="px-4 py-2 text-sm font-medium min-w-[3rem] text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-2 hover:bg-muted transition-colors"
                      aria-label="Increase"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={handleAdd}
                disabled={isSoldOut}
                className="btn-primary w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSoldOut ? 'Sold out' : added ? (
                  <><Check size={16} /> Added to cart!</>
                ) : product.type === 'digital' ? (
                  <><Download size={16} /> Buy Now — {format(displayPrice * quantity)}</>
                ) : (
                  <><ShoppingBag size={16} /> Add to Cart — {format(displayPrice * quantity)}</>
                )}
              </button>

              {product.sku && (
                <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Recommended */}
      {recommended.length > 0 && (
        <section className="mt-20">
          <h2 className="section-heading mb-6">You may also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recommended.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
