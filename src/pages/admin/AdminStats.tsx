import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, Eye, MousePointerClick, ShoppingBag } from 'lucide-react';

export default function AdminStats() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    paidOrders: 0,
    pendingOrders: 0,
    affiliateClicks: 0,
    last30Orders: 0,
    last30Revenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    Promise.all([
      supabase.from('orders').select('total, status, created_at'),
      supabase.from('affiliate_clicks').select('id', { count: 'exact', head: true }),
    ]).then(([ordersRes, clicksRes]) => {
      const orders = ordersRes.data || [];
      const paid = orders.filter((o: any) => ['paid', 'processing', 'shipped', 'delivered'].includes(o.status));
      const recent = orders.filter((o: any) => o.created_at >= thirtyDaysAgo);
      const recentPaid = recent.filter((o: any) => ['paid', 'processing', 'shipped', 'delivered'].includes(o.status));
      setStats({
        totalRevenue: paid.reduce((s: number, o: any) => s + Number(o.total || 0), 0),
        paidOrders: paid.length,
        pendingOrders: orders.filter((o: any) => o.status === 'pending').length,
        affiliateClicks: clicksRes.count || 0,
        last30Orders: recent.length,
        last30Revenue: recentPaid.reduce((s: number, o: any) => s + Number(o.total || 0), 0),
      });
      setLoading(false);
    });
  }, []);

  const cards = [
    { label: 'Total revenue (all time)', value: `$${stats.totalRevenue.toFixed(2)} CAD`, icon: TrendingUp, color: 'text-green-600' },
    { label: 'Revenue (last 30 days)', value: `$${stats.last30Revenue.toFixed(2)} CAD`, icon: TrendingUp, color: 'text-green-600' },
    { label: 'Paid orders', value: stats.paidOrders, icon: ShoppingBag, color: 'text-blue-600' },
    { label: 'Pending orders', value: stats.pendingOrders, icon: ShoppingBag, color: 'text-orange-600' },
    { label: 'Orders (last 30 days)', value: stats.last30Orders, icon: Eye, color: 'text-purple-600' },
    { label: 'Amazon affiliate clicks', value: stats.affiliateClicks, icon: MousePointerClick, color: 'text-amber-600' },
  ];

  return (
    <AdminLayout>
      <h1 className="section-heading mb-2">Stats</h1>
      <p className="text-sm text-muted-foreground mb-6">Quick performance overview of your shop.</p>
      {loading ? (
        <p className="text-muted-foreground text-sm">Loading…</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((c) => (
            <div key={c.label} className="product-card">
              <c.icon className={c.color} size={20} />
              <p className="mt-3 text-2xl font-semibold text-foreground">{c.value}</p>
              <p className="text-xs text-muted-foreground">{c.label}</p>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
