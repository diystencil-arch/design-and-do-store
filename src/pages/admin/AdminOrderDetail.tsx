import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import AdminLayout from '@/components/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Mail, Package, Download, MapPin, User } from 'lucide-react';

interface OrderItem {
  id: string;
  product_title: string;
  product_type: 'physical' | 'digital' | 'affiliate';
  quantity: number;
  unit_price: number;
  product_id: string | null;
}

interface DigitalDownload {
  id: string;
  order_item_id: string;
  download_token: string;
  download_count: number;
  download_limit: number;
  expires_at: string;
}

interface Order {
  id: string;
  status: string;
  total: number;
  subtotal: number;
  shipping_cost: number;
  guest_email: string | null;
  user_id: string | null;
  tracking_number: string | null;
  shipping_address: any;
  payment_provider: string | null;
  paypal_order_id: string | null;
  paypal_capture_id: string | null;
  created_at: string;
}

const STATUSES = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'refunded', 'payment_failed'];

export default function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [downloads, setDownloads] = useState<DigitalDownload[]>([]);
  const [loading, setLoading] = useState(true);
  const [tracking, setTracking] = useState('');
  const [carrier, setCarrier] = useState('');
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    const [oRes, iRes] = await Promise.all([
      supabase.from('orders').select('*').eq('id', id).maybeSingle(),
      supabase.from('order_items').select('*').eq('order_id', id),
    ]);
    if (oRes.data) {
      setOrder(oRes.data as Order);
      setTracking(oRes.data.tracking_number || '');
    }
    const itemsData = (iRes.data || []) as OrderItem[];
    setItems(itemsData);

    const itemIds = itemsData.filter(i => i.product_type === 'digital').map(i => i.id);
    if (itemIds.length > 0) {
      const { data: dls } = await supabase.from('digital_downloads').select('*').in('order_item_id', itemIds);
      setDownloads((dls || []) as DigitalDownload[]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const updateStatus = async (status: string) => {
    if (!order) return;
    const { error } = await supabase.from('orders').update({ status: status as Order['status'] as any }).eq('id', order.id);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    toast({ title: `Order marked as ${status}` });
    load();
  };

  const sendTrackingEmail = async () => {
    if (!order) return;
    if (!tracking && !note) {
      toast({ title: 'Add tracking number or note', variant: 'destructive' });
      return;
    }
    setSending(true);
    const { data, error } = await supabase.functions.invoke('send-order-email', {
      body: { orderId: order.id, trackingNumber: tracking || null, carrier: carrier || null, note: note || null },
    });
    setSending(false);
    if (error || !data?.ok) {
      toast({ title: 'Failed to send', description: error?.message || data?.error || 'Try again', variant: 'destructive' });
      return;
    }
    toast({ title: 'Email sent', description: `Notified ${data.sentTo}` });
    setNote('');
    load();
  };

  if (loading) return <AdminLayout><p className="text-muted-foreground text-sm">Loading order…</p></AdminLayout>;
  if (!order) return <AdminLayout><p className="text-muted-foreground text-sm">Order not found.</p></AdminLayout>;

  const addr = order.shipping_address;
  const hasPhysical = items.some(i => i.product_type === 'physical');
  const downloadByItem: Record<string, DigitalDownload> = {};
  downloads.forEach(d => { downloadByItem[d.order_item_id] = d; });

  return (
    <AdminLayout>
      <Link to="/admin/orders" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft size={14} /> All orders
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="section-heading">Order #{order.id.slice(0, 8)}</h1>
          <p className="text-xs text-muted-foreground mt-1">{new Date(order.created_at).toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-medium">${Number(order.total).toFixed(2)}</p>
          <span className="inline-block text-xs px-2 py-1 rounded bg-secondary text-secondary-foreground capitalize mt-1">{order.status}</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Items + Downloads */}
        <div className="lg:col-span-2 space-y-6">
          <section className="product-card">
            <h2 className="font-medium mb-4 flex items-center gap-2"><Package size={16} /> Line items ({items.length})</h2>
            <div className="space-y-3">
              {items.map((it) => {
                const dl = downloadByItem[it.id];
                return (
                  <div key={it.id} className="border-b border-border pb-3 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-foreground">{it.product_title}</p>
                        <p className="text-xs text-muted-foreground capitalize">{it.product_type} · Qty {it.quantity}</p>
                      </div>
                      <span className="text-sm">${(Number(it.unit_price) * it.quantity).toFixed(2)}</span>
                    </div>
                    {it.product_type === 'digital' && (
                      <div className="mt-2 text-xs">
                        {dl ? (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Download size={12} />
                            <span>{dl.download_count}/{dl.download_limit} downloads</span>
                            <span>·</span>
                            <span>Expires {new Date(dl.expires_at).toLocaleDateString()}</span>
                            {new Date(dl.expires_at) < new Date() && <span className="text-destructive">(expired)</span>}
                          </div>
                        ) : (
                          <span className="text-destructive">No download token generated</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="border-t border-border mt-4 pt-3 space-y-1 text-sm">
              <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>${Number(order.subtotal).toFixed(2)}</span></div>
              <div className="flex justify-between text-muted-foreground"><span>Shipping</span><span>${Number(order.shipping_cost).toFixed(2)}</span></div>
              <div className="flex justify-between font-medium text-foreground pt-1"><span>Total</span><span>${Number(order.total).toFixed(2)}</span></div>
            </div>
          </section>

          {hasPhysical && (
            <section className="product-card">
              <h2 className="font-medium mb-3 flex items-center gap-2"><Mail size={16} /> Send tracking to customer</h2>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="Tracking number" className="px-3 py-2 border border-border rounded-md text-sm bg-background" />
                  <input value={carrier} onChange={(e) => setCarrier(e.target.value)} placeholder="Carrier (UPS, USPS...)" className="px-3 py-2 border border-border rounded-md text-sm bg-background" />
                </div>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional note to customer" rows={2} className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background" />
                <button onClick={sendTrackingEmail} disabled={sending} className="btn-primary w-full justify-center disabled:opacity-50">
                  <Mail size={14} /> {sending ? 'Sending…' : 'Email tracking info'}
                </button>
                <p className="text-xs text-muted-foreground">Sets order status to <strong>shipped</strong> and saves the tracking number.</p>
              </div>
            </section>
          )}
        </div>

        {/* Right: Customer + Shipping + Status */}
        <div className="space-y-6">
          <section className="product-card">
            <h2 className="font-medium mb-3 flex items-center gap-2"><User size={16} /> Customer</h2>
            <p className="text-sm text-foreground break-all">{order.guest_email || '—'}</p>
            <p className="text-xs text-muted-foreground mt-1">{order.user_id ? 'Registered account' : 'Guest checkout'}</p>
          </section>

          {addr && (
            <section className="product-card">
              <h2 className="font-medium mb-3 flex items-center gap-2"><MapPin size={16} /> Shipping address</h2>
              <div className="text-sm text-foreground space-y-0.5">
                {addr.name && <p>{addr.name}</p>}
                {addr.line1 && <p>{addr.line1}</p>}
                {addr.line2 && <p>{addr.line2}</p>}
                {(addr.city || addr.postcode) && <p>{[addr.city, addr.postcode].filter(Boolean).join(', ')}</p>}
              </div>
            </section>
          )}

          <section className="product-card">
            <h2 className="font-medium mb-3">Status</h2>
            <select value={order.status} onChange={(e) => updateStatus(e.target.value)} className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background mb-2">
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            {order.tracking_number && (
              <p className="text-xs text-muted-foreground">Current tracking: <strong className="text-foreground">{order.tracking_number}</strong></p>
            )}
          </section>

          <section className="product-card text-xs text-muted-foreground space-y-1">
            <h2 className="font-medium text-foreground mb-2 text-sm">Payment</h2>
            <p>Provider: <span className="text-foreground capitalize">{order.payment_provider || '—'}</span></p>
            {order.paypal_order_id && <p className="break-all">PayPal order: {order.paypal_order_id}</p>}
            {order.paypal_capture_id && <p className="break-all">Capture ID: {order.paypal_capture_id}</p>}
          </section>
        </div>
      </div>
    </AdminLayout>
  );
}
