import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Package, ShoppingBag, Mail, Users } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, messages: 0, subscribers: 0 });

  useEffect(() => {
    Promise.all([
      supabase.from('products').select('id', { count: 'exact', head: true }),
      supabase.from('orders').select('id', { count: 'exact', head: true }),
      supabase.from('contact_messages').select('id', { count: 'exact', head: true }).eq('status', 'new'),
      supabase.from('email_subscribers').select('id', { count: 'exact', head: true }),
    ]).then(([p, o, m, s]) => {
      setStats({
        products: p.count || 0,
        orders: o.count || 0,
        messages: m.count || 0,
        subscribers: s.count || 0,
      });
    });
  }, []);

  const cards = [
    { label: 'Products', value: stats.products, icon: Package, color: 'text-blue-600' },
    { label: 'Total orders', value: stats.orders, icon: ShoppingBag, color: 'text-green-600' },
    { label: 'New messages', value: stats.messages, icon: Mail, color: 'text-orange-600' },
    { label: 'Email subscribers', value: stats.subscribers, icon: Users, color: 'text-purple-600' },
  ];

  return (
    <AdminLayout>
      <h1 className="section-heading mb-6">Dashboard</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="product-card">
            <c.icon className={c.color} size={20} />
            <p className="mt-3 text-2xl font-semibold text-foreground">{c.value}</p>
            <p className="text-xs text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </div>
      <div className="product-card mt-6">
        <h2 className="font-medium text-foreground mb-2">Welcome to your admin dashboard 🎉</h2>
        <p className="text-sm text-muted-foreground">
          Use the side nav to manage products (stencils, wood, acrylic, SVG, affiliate tools), view orders and mark them as shipped, write blog posts, read contact messages, and view email subscribers.
        </p>
      </div>
    </AdminLayout>
  );
}
