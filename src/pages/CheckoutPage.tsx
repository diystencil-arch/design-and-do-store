import { useCartStore } from '@/stores/cartStore';
import { Lock, CreditCard } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function CheckoutPage() {
  const { items, subtotal } = useCartStore();
  const [paymentTab, setPaymentTab] = useState<'card' | 'paypal'>('card');
  const hasPhysical = items.some((i) => i.type === 'physical');

  if (items.length === 0) {
    return (
      <div className="container-page py-20 text-center">
        <p className="text-muted-foreground mb-4">Your cart is empty.</p>
        <Link to="/" className="btn-primary">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <h1 className="section-heading mb-8">Checkout</h1>
      <div className="grid lg:grid-cols-5 gap-10">
        {/* Left — form */}
        <div className="lg:col-span-3 space-y-8">
          {/* Contact */}
          <section>
            <h2 className="text-lg font-medium text-foreground mb-4">Contact</h2>
            <input
              type="email"
              placeholder="Email address"
              className="w-full px-4 py-3 border border-border rounded-md text-sm bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <label className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
              <input type="checkbox" className="rounded" />
              Save my email for updates
            </label>
          </section>

          {/* Shipping */}
          {hasPhysical && (
            <section>
              <h2 className="text-lg font-medium text-foreground mb-4">Shipping address</h2>
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Full name" className="col-span-2 px-4 py-3 border border-border rounded-md text-sm bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent" />
                <input placeholder="Address line 1" className="col-span-2 px-4 py-3 border border-border rounded-md text-sm bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent" />
                <input placeholder="Address line 2 (optional)" className="col-span-2 px-4 py-3 border border-border rounded-md text-sm bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent" />
                <input placeholder="City" className="px-4 py-3 border border-border rounded-md text-sm bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent" />
                <input placeholder="Postcode" className="px-4 py-3 border border-border rounded-md text-sm bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent" />
              </div>
            </section>
          )}

          {/* Payment */}
          <section>
            <h2 className="text-lg font-medium text-foreground mb-4">How would you like to pay?</h2>
            <div className="flex gap-3 mb-6">
              <button
                onClick={() => setPaymentTab('card')}
                className={`flex-1 py-3 rounded-md border text-sm font-medium transition-colors ${
                  paymentTab === 'card'
                    ? 'border-accent bg-accent/5 text-foreground'
                    : 'border-border text-muted-foreground hover:border-accent/40'
                }`}
              >
                <CreditCard size={16} className="inline mr-2" />
                Pay by card
              </button>
              <button
                onClick={() => setPaymentTab('paypal')}
                className={`flex-1 py-3 rounded-md border text-sm font-medium transition-colors ${
                  paymentTab === 'paypal'
                    ? 'border-accent bg-accent/5 text-foreground'
                    : 'border-border text-muted-foreground hover:border-accent/40'
                }`}
              >
                PayPal
              </button>
            </div>

            {paymentTab === 'card' ? (
              <div className="space-y-4">
                <div className="border border-border rounded-md p-6 bg-muted/30 text-center text-sm text-muted-foreground">
                  <CreditCard size={32} className="mx-auto mb-3 text-muted-foreground/50" />
                  Stripe Payment Element will render here once connected.
                </div>
                <button className="btn-primary w-full">
                  Pay £{subtotal().toFixed(2)} securely →
                </button>
                <p className="text-xs text-center text-muted-foreground">
                  <Lock size={10} className="inline mr-1" />
                  256-bit SSL encryption · Powered by Stripe
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  You'll be redirected to PayPal to complete your payment.
                </p>
                <div className="border border-border rounded-md p-6 bg-muted/30 text-center text-sm text-muted-foreground">
                  PayPal Buttons will render here once connected.
                </div>
                <p className="text-xs text-center text-muted-foreground">
                  Pay with your PayPal balance, card, or Venmo
                </p>
              </div>
            )}
          </section>
        </div>

        {/* Right — order summary */}
        <div className="lg:col-span-2">
          <div className="product-card sticky top-24 space-y-4">
            <h2 className="text-lg font-medium text-foreground">Order summary</h2>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={`${item.productId}-${item.variantId}`} className="flex gap-3">
                  <img src={item.image} alt={item.title} className="w-12 h-12 object-cover rounded-lg" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{item.title}</p>
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-sm text-foreground">£{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">£{subtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-foreground">{hasPhysical ? 'Calculated' : 'Free'}</span>
              </div>
            </div>
            <div className="border-t border-border pt-3 flex justify-between font-medium text-foreground">
              <span>Total</span>
              <span>£{subtotal().toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <Lock size={10} /> Secure checkout
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
