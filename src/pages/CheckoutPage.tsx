import { useCartStore } from '@/stores/cartStore';
import { Lock } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

declare global { interface Window { paypal?: any } }

const PAYPAL_CLIENT_ID = 'AUNxuurZ1NbsnZKRdzPF4KJrztGvlEYvQFaO1JelHsQXbvJsyY6sXSoejlANuBovlPI__6D4luSYFUya';

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCartStore();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState(user?.email || '');
  const [address, setAddress] = useState({ name: '', line1: '', line2: '', city: '', postcode: '' });
  const [paypalReady, setPaypalReady] = useState(false);
  const [processing, setProcessing] = useState(false);
  const ppRef = useRef<HTMLDivElement>(null);
  const hasPhysical = items.some((i) => i.type === 'physical');

  useEffect(() => {
    if (window.paypal) { setPaypalReady(true); return; }
    const s = document.createElement('script');
    s.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD&intent=capture`;
    s.async = true;
    s.onload = () => setPaypalReady(true);
    document.body.appendChild(s);
  }, []);

  useEffect(() => {
    if (!paypalReady || !ppRef.current || items.length === 0) return;
    ppRef.current.innerHTML = '';
    window.paypal.Buttons({
      style: { layout: 'vertical', color: 'gold', shape: 'rect', label: 'paypal' },
      createOrder: async () => {
        if (!email) { toast({ title: 'Email required', description: 'Please enter your email first.', variant: 'destructive' }); throw new Error('email'); }
        const { data, error } = await supabase.functions.invoke('paypal-create-order', {
          body: { items: items.map(i => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity })), currency: 'USD' },
        });
        if (error || !data?.id) throw new Error('Failed to create order');
        return data.id;
      },
      onApprove: async (data: any) => {
        setProcessing(true);
        const { data: capData, error } = await supabase.functions.invoke('paypal-capture-order', {
          body: {
            paypalOrderId: data.orderID,
            items: items.map(i => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity, title: i.title })),
            email,
            shippingAddress: hasPhysical ? address : null,
            userId: user?.id || null,
          },
        });
        setProcessing(false);
        if (error || !capData?.orderId) { toast({ title: 'Payment failed', description: error?.message || 'Try again', variant: 'destructive' }); return; }
        const dls: Array<{ title: string; url: string }> = capData.downloads || [];
        clearCart();
        if (dls.length > 0) {
          // Stash for the success page to show inline
          sessionStorage.setItem('lastDownloads', JSON.stringify(dls));
        }
        navigate(`/order-success?order=${capData.orderId}`);
        toast({ title: 'Order confirmed! 🎉', description: dls.length ? 'Your downloads are ready below.' : `Confirmation sent to ${email}` });
      },
      onError: (err: any) => { console.error(err); toast({ title: 'PayPal error', description: 'Please try again', variant: 'destructive' }); },
    }).render(ppRef.current);
  }, [paypalReady, items, email, address, user, hasPhysical]);

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
        <div className="lg:col-span-3 space-y-8">
          <section>
            <h2 className="text-lg font-medium text-foreground mb-4">Contact</h2>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full px-4 py-3 border border-border rounded-md text-sm bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </section>

          {hasPhysical && (
            <section>
              <h2 className="text-lg font-medium text-foreground mb-4">Shipping address</h2>
              <div className="grid grid-cols-2 gap-3">
                <input value={address.name} onChange={(e) => setAddress({ ...address, name: e.target.value })} placeholder="Full name" className="col-span-2 px-4 py-3 border border-border rounded-md text-sm bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent" />
                <input value={address.line1} onChange={(e) => setAddress({ ...address, line1: e.target.value })} placeholder="Address line 1" className="col-span-2 px-4 py-3 border border-border rounded-md text-sm bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent" />
                <input value={address.line2} onChange={(e) => setAddress({ ...address, line2: e.target.value })} placeholder="Address line 2 (optional)" className="col-span-2 px-4 py-3 border border-border rounded-md text-sm bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent" />
                <input value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} placeholder="City" className="px-4 py-3 border border-border rounded-md text-sm bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent" />
                <input value={address.postcode} onChange={(e) => setAddress({ ...address, postcode: e.target.value })} placeholder="Postcode" className="px-4 py-3 border border-border rounded-md text-sm bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent" />
              </div>
            </section>
          )}

          <section>
            <h2 className="text-lg font-medium text-foreground mb-4">Pay with PayPal</h2>
            <p className="text-sm text-muted-foreground mb-4">Pay with your PayPal balance, credit card, or debit card. No PayPal account required.</p>
            {processing && <p className="text-sm text-accent mb-3">Processing your order…</p>}
            <div ref={ppRef} className="min-h-[150px]" />
            {!paypalReady && <p className="text-xs text-muted-foreground">Loading PayPal…</p>}
            <p className="text-xs text-center text-muted-foreground mt-3">
              <Lock size={10} className="inline mr-1" />
              Secured by PayPal · 256-bit SSL encryption
            </p>
          </section>
        </div>

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
                  <span className="text-sm text-foreground">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-3 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="text-foreground">${subtotal().toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span className="text-foreground">{hasPhysical ? 'Calculated after order' : 'Free'}</span></div>
            </div>
            <div className="border-t border-border pt-3 flex justify-between font-medium text-foreground">
              <span>Total</span><span>${subtotal().toFixed(2)}</span>
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
