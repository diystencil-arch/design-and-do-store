import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, Eye, MousePointerClick, ShoppingBag, Trophy } from 'lucide-react';

export default function AdminStats() {
  const [stats, setStats] = useState({
    totalRevenue: 0, paidOrders: 0, pendingOrders: 0,
    affiliateClicks: 0, last30Orders: 0, last30Revenue: 0, totalViews: 0,
  });
  const [topViewed, setTopViewed] = useState<Array<{ id: string; title: string; views: number }>>([]);
  const [topSold, setTopSold] = useState<Array<{ id: string; title: string; units: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    Promise.all([
      supabase.from('orders').select('total, status, created_at'),
      supabase.from('affiliate_clicks').select('id', { count: 'exact', head: true }),
      supabase.from('product_views').select('product_id'),
      supabase.from('order_items').select('product_id, product_title, quantity'),
      supabase.from('products').select('id, title'),
    ]).then(([ordersRes, clicksRes, viewsRes, itemsRes, prodRes]) => {
      const orders = ordersRes.data || [];
      const paid = orders.filter((o: any) => ['paid', 'processing', 'shipped', 'delivered'].includes(o.status));
      const recent = orders.filter((o: any) => o.created_at >= thirtyDaysAgo);
      const recentPaid = recent.filter((o: any) => ['paid', 'processing', 'shipped', 'delivered'].includes(o.status));

      const views = viewsRes.data || [];
      const products = prodRes.data || [];
      const titleById: Record<string, string> = {};
      products.forEach((p: any) => { titleById[p.id] = p.title; });

      const viewCounts: Record<string, number> = {};
      views.forEach((v: any) => { viewCounts[v.product_id] = (viewCounts[v.product_id] || 0) + 1; });
      const tv = Object.entries(viewCounts)
        .map(([id, views]) => ({ id, title: titleById[id] || 'Unknown', views }))
        .sort((a, b) => b.views - a.views).slice(0, 5);

      const items = itemsRes.data || [];
      const sold: Record<string, { title: string; units: number }> = {};
      items.forEach((it: any) => {
        if (!it.product_id) return;
        const k = it.product_id;
        sold[k] = sold[k] || { title: it.product_title || titleById[k] || 'Unknown', units: 0 };
        sold[k].units += Number(it.quantity || 0);
      });
      const ts = Object.entries(sold)
        .map(([id, v]) => ({ id, title: v.title, units: v.units }))
        .sort((a, b) => b.units - a.units).slice(0, 5);

      setStats({
        totalRevenue: paid.reduce((s: number, o: any) => s + Number(o.total || 0), 0),
        paidOrders: paid.length,
        pendingOrders: orders.filter((o: any) => o.status === 'pending').length,
        affiliateClicks: clicksRes.count || 0,
        last30Orders: recent.length,
        last30Revenue: recentPaid.reduce((s: number, o: any) => s + Number(o.total || 0), 0),
        totalViews: views.length,
      });
      setTopViewed(tv);
      setTopSold(ts);
      setLoading(false);
    });
  }, []);

  const cards = [
    { label: 'Total revenue (all time)', value: `$${stats.totalRevenue.toFixed(2)} CAD`, icon: TrendingUp, color: 'text-green-600' },
    { label: 'Revenue (last 30 days)', value: `$${stats.last30Revenue.toFixed(2)} CAD`, icon: TrendingUp, color: 'text-green-600' },
    { label: 'Paid orders', value: stats.paidOrders, icon: ShoppingBag, color: 'text-blue-600' },
    { label: 'Pending orders', value: stats.pendingOrders, icon: ShoppingBag, color: 'text-orange-600' },
    { label: 'Orders (last 30 days)', value: stats.last30Orders, icon: Eye, color: 'text-purple-600' },
    { label: 'Total product views', value: stats.totalViews, icon: Eye, color: 'text-indigo-600' },
    { label: 'Amazon affiliate clicks', value: stats.affiliateClicks, icon: MousePointerClick, color: 'text-amber-600' },
  ];

  return (
    <AdminLayout>
      <h1 className="section-heading mb-2">Stats</h1>
      <p className="text-sm text-muted-foreground mb-6">Quick performance overview of your shop.</p>
      {loading ? (
        <p className="text-muted-foreground text-sm">Loading…</p>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {cards.map((c) => (
              <div key={c.label} className="product-card">
                <c.icon className={c.color} size={20} />
                <p className="mt-3 text-2xl font-semibold text-foreground">{c.value}</p>
                <p className="text-xs text-muted-foreground">{c.label}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="product-card">
              <h2 className="font-medium text-foreground mb-3 flex items-center gap-2"><Eye size={16} /> Most viewed products</h2>
              {topViewed.length === 0 ? (
                <p className="text-xs text-muted-foreground">No views yet.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {topViewed.map((p) => (
                    <li key={p.id} className="flex justify-between border-b border-border pb-1">
                      <span className="text-foreground truncate">{p.title}</span>
                      <span className="text-muted-foreground">{p.views} views</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="product-card">
              <h2 className="font-medium text-foreground mb-3 flex items-center gap-2"><Trophy size={16} /> Best sellers</h2>
              {topSold.length === 0 ? (
                <p className="text-xs text-muted-foreground">No sales yet.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {topSold.map((p) => (
                    <li key={p.id} className="flex justify-between border-b border-border pb-1">
                      <span className="text-foreground truncate">{p.title}</span>
                      <span className="text-muted-foreground">{p.units} sold</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
