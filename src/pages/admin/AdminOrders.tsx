import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Order {
  id: string;
  status: string;
  total: number;
  guest_email: string | null;
  user_id: string | null;
  tracking_number: string | null;
  shipping_address: any;
  created_at: string;
}

const STATUSES = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'refunded', 'payment_failed'];

export default function AdminOrders() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [tracking, setTracking] = useState<Record<string, string>>({});

  const load = () => {
    supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(100)
      .then(({ data }) => {
        setOrders((data || []) as Order[]);
        const t: Record<string, string> = {};
        (data || []).forEach((o: any) => { if (o.tracking_number) t[o.id] = o.tracking_number; });
        setTracking(t);
      });
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const update: any = { status };
    if (status === 'shipped' && tracking[id]) update.tracking_number = tracking[id];
    const { error } = await supabase.from('orders').update(update).eq('id', id);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    toast({ title: `Order marked as ${status}` });
    load();
  };

  return (
    <AdminLayout>
      <h1 className="section-heading mb-6">Orders</h1>
      {orders.length === 0 ? (
        <p className="text-muted-foreground text-sm">No orders yet. Once a customer checks out, orders appear here.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="product-card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground">#{o.id.slice(0, 8)}</p>
                  <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground mt-1">{o.guest_email || 'Registered customer'}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">${Number(o.total).toFixed(2)}</p>
                  <span className="text-xs px-2 py-1 rounded bg-secondary text-secondary-foreground capitalize">{o.status}</span>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <input
                  className="px-3 py-1.5 border border-border rounded-md text-sm bg-background flex-1 min-w-[180px]"
                  placeholder="Tracking number"
                  value={tracking[o.id] || ''}
                  onChange={(e) => setTracking({ ...tracking, [o.id]: e.target.value })}
                />
                <select
                  className="px-3 py-1.5 border border-border rounded-md text-sm bg-background"
                  value={o.status}
                  onChange={(e) => updateStatus(o.id, e.target.value)}
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <button onClick={() => updateStatus(o.id, 'shipped')} className="btn-primary text-xs py-1.5 px-3">
                  Mark shipped
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
