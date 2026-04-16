import { useCartStore } from '@/stores/cartStore';
import { Minus, Plus, X, ShoppingBag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal } = useCartStore();
  const hasPhysical = items.some((i) => i.type === 'physical');

  if (items.length === 0) {
    return (
      <div className="container-page py-20 text-center">
        <ShoppingBag size={48} strokeWidth={1} className="mx-auto text-muted-foreground mb-4" />
        <h1 className="section-heading mb-3">Your cart is empty</h1>
        <p className="text-muted-foreground mb-6">Looks like you haven't added anything yet.</p>
        <Link to="/stencils" className="btn-primary">Browse Stencils</Link>
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <h1 className="section-heading mb-8">Your Cart</h1>
      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={`${item.productId}-${item.variantId}`} className="product-card flex gap-4">
              <img src={item.image} alt={item.title} className="w-20 h-20 object-cover rounded-lg" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{item.title}</p>
                {item.variantLabel && <p className="text-xs text-muted-foreground">{item.variantLabel}</p>}
                <p className="text-sm text-accent font-medium mt-1">£{item.price.toFixed(2)}</p>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId)}
                    className="w-7 h-7 border border-border rounded flex items-center justify-center text-muted-foreground hover:text-foreground"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-sm w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)}
                    className="w-7 h-7 border border-border rounded flex items-center justify-center text-muted-foreground hover:text-foreground"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
              <button onClick={() => removeItem(item.productId, item.variantId)} className="text-muted-foreground hover:text-destructive self-start">
                <X size={16} />
              </button>
            </div>
          ))}
        </div>

        <div className="product-card h-fit space-y-4">
          <h2 className="text-lg font-medium text-foreground">Order summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground">£{subtotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span className="text-foreground">{hasPhysical ? 'Calculated at checkout' : 'Free'}</span>
            </div>
          </div>
          <div className="border-t border-border pt-3 flex justify-between text-foreground font-medium">
            <span>Total</span>
            <span>£{subtotal().toFixed(2)}</span>
          </div>
          <Link to="/checkout" className="btn-primary w-full text-center">
            Checkout <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
