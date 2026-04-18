import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Package, LogOut, Shield } from 'lucide-react';

interface Order {
  id: string;
  status: string;
  total: number;
  tracking_number: string | null;
  created_at: string;
}

export default function AccountPage() {
  const { user, isAdmin, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const { format } = useCurrency();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!loading && !user) navigate('/auth', { replace: true });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('orders')
      .select('id, status, total, tracking_number, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => setOrders(data || []));
  }, [user]);

  if (!user) return null;

  return (
    <div className="container-page py-12 max-w-3xl">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="section-heading">My account</h1>
          <p className="text-muted-foreground text-sm mt-1">{user.email}</p>
        </div>
        <button onClick={signOut} className="btn-outline text-sm py-2 px-4">
          <LogOut size={14} /> Sign out
        </button>
      </div>

      {isAdmin && (
        <Link to="/admin" className="product-card flex items-center gap-3 mb-6 hover:border-primary">
          <Shield className="text-primary" size={20} />
          <div>
            <p className="font-medium text-foreground">Admin dashboard</p>
            <p className="text-xs text-muted-foreground">Manage products, orders, blog & messages</p>
          </div>
        </Link>
      )}

      <h2 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
        <Package size={18} /> My orders
      </h2>

      {orders.length === 0 ? (
        <div className="product-card text-center py-10 text-muted-foreground">
          <p className="text-sm">No orders yet.</p>
          <Link to="/stencils" className="text-primary text-sm mt-2 inline-block hover:underline">Start shopping →</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="product-card flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Order #{o.id.slice(0, 8)}</p>
                <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</p>
                {o.tracking_number && <p className="text-xs text-primary mt-1">Tracking: {o.tracking_number}</p>}
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">{format(Number(o.total))}</p>
                <span className="text-xs px-2 py-1 rounded bg-secondary text-secondary-foreground capitalize">{o.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
