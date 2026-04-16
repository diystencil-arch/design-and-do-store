import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { Link } from 'react-router-dom';

export default function CartDrawer() {
  const { items, isOpen, setCartOpen, removeItem, updateQuantity, subtotal } = useCartStore();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-foreground/20 z-50" onClick={() => setCartOpen(false)} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-card border-l border-border z-50 animate-slide-in-right flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-lg font-medium text-foreground">Your Cart</h2>
          <button onClick={() => setCartOpen(false)} className="text-muted-foreground hover:text-foreground">
            <X size={20} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-muted-foreground">
            <ShoppingBag size={40} strokeWidth={1} />
            <p className="text-sm">Your cart is empty</p>
            <button onClick={() => setCartOpen(false)} className="btn-primary text-sm py-2 px-5">
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {items.map((item) => (
                <div key={`${item.productId}-${item.variantId}`} className="flex gap-4">
                  <img src={item.image} alt={item.title} className="w-16 h-16 object-cover rounded-lg" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                    {item.variantLabel && (
                      <p className="text-xs text-muted-foreground">{item.variantLabel}</p>
                    )}
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
                  <button
                    onClick={() => removeItem(item.productId, item.variantId)}
                    className="text-muted-foreground hover:text-destructive self-start"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t border-border p-5 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium text-foreground">£{subtotal().toFixed(2)}</span>
              </div>
              <Link
                to="/checkout"
                onClick={() => setCartOpen(false)}
                className="btn-primary w-full text-center"
              >
                Checkout →
              </Link>
              <button
                onClick={() => setCartOpen(false)}
                className="btn-outline w-full text-sm"
              >
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
