import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '@/components/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ChevronRight } from 'lucide-react';

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
            <Link to={`/admin/orders/${o.id}`} key={o.id} className="product-card block hover:border-accent transition-colors">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-foreground">#{o.id.slice(0, 8)}</p>
                  <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground mt-1 truncate">{o.guest_email || 'Registered customer'}</p>
                  {o.tracking_number && <p className="text-xs text-muted-foreground mt-1">Tracking: {o.tracking_number}</p>}
                </div>
                <div className="text-right flex items-center gap-3">
                  <div>
                    <p className="font-medium">${Number(o.total).toFixed(2)}</p>
                    <span className="text-xs px-2 py-1 rounded bg-secondary text-secondary-foreground capitalize">{o.status}</span>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
