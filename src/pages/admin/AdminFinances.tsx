import AdminLayout from '@/components/AdminLayout';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DollarSign, TrendingUp, Truck, AlertCircle } from 'lucide-react';

export default function AdminFinances() {
  const [data, setData] = useState({
    totalRevenue: 0,
    totalShipping: 0,
    totalSubtotal: 0,
    pendingPayout: 0,
    failedPayments: 0,
    refunded: 0,
  });

  useEffect(() => {
    supabase.from('orders').select('total, subtotal, shipping_cost, status').then(({ data: orders }) => {
      const o = orders || [];
      const paid = o.filter((x: any) => ['paid', 'processing', 'shipped', 'delivered'].includes(x.status));
      setData({
        totalRevenue: paid.reduce((s: number, x: any) => s + Number(x.total || 0), 0),
        totalShipping: paid.reduce((s: number, x: any) => s + Number(x.shipping_cost || 0), 0),
        totalSubtotal: paid.reduce((s: number, x: any) => s + Number(x.subtotal || 0), 0),
        pendingPayout: o.filter((x: any) => x.status === 'paid').reduce((s: number, x: any) => s + Number(x.total || 0), 0),
        failedPayments: o.filter((x: any) => x.status === 'payment_failed').length,
        refunded: o.filter((x: any) => x.status === 'refunded').reduce((s: number, x: any) => s + Number(x.total || 0), 0),
      });
    });
  }, []);

  const cards = [
    { label: 'Gross revenue', value: `$${data.totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'text-green-600' },
    { label: 'Product subtotal', value: `$${data.totalSubtotal.toFixed(2)}`, icon: TrendingUp, color: 'text-blue-600' },
    { label: 'Shipping collected', value: `$${data.totalShipping.toFixed(2)}`, icon: Truck, color: 'text-purple-600' },
    { label: 'Pending payout (paid, not yet shipped)', value: `$${data.pendingPayout.toFixed(2)}`, icon: AlertCircle, color: 'text-orange-600' },
    { label: 'Refunded', value: `$${data.refunded.toFixed(2)}`, icon: AlertCircle, color: 'text-red-600' },
    { label: 'Failed payments (count)', value: data.failedPayments, icon: AlertCircle, color: 'text-red-600' },
  ];

  return (
    <AdminLayout>
      <h1 className="section-heading mb-2">Finances</h1>
      <p className="text-sm text-muted-foreground mb-6">Revenue, shipping, payouts and refunds (CAD).</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="product-card">
            <c.icon className={c.color} size={20} />
            <p className="mt-3 text-2xl font-semibold text-foreground">{c.value}</p>
            <p className="text-xs text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-6">
        For full payment history, payouts and tax invoices, sign in to your Stripe and PayPal merchant dashboards.
      </p>
    </AdminLayout>
  );
}
