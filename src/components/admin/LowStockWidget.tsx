import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, Package } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Row {
  id: string;
  title: string;
  slug: string;
  type: string;
  stock: number;
  threshold: number;
  variant?: string | null;
}

export default function LowStockWidget() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      // Digital products = unlimited stock; only check physical/affiliate at product level.
      const { data: products } = await supabase
        .from('products')
        .select('id, title, slug, type, stock_quantity, low_stock_threshold')
        .neq('type', 'digital');

      const productLow: Row[] = (products || [])
        .filter((p: any) => (p.stock_quantity ?? 0) <= (p.low_stock_threshold ?? 5))
        .map((p: any) => ({
          id: p.id, title: p.title, slug: p.slug, type: p.type,
          stock: p.stock_quantity ?? 0, threshold: p.low_stock_threshold ?? 5,
        }));

      const { data: variants } = await supabase
        .from('physical_variants')
        .select('id, size, material, stock_quantity, product:products(id, title, slug, low_stock_threshold)');

      const variantLow: Row[] = (variants || [])
        .filter((v: any) => v.product && v.stock_quantity <= (v.product.low_stock_threshold ?? 5))
        .map((v: any) => ({
          id: v.id,
          title: v.product.title,
          slug: v.product.slug,
          type: 'variant',
          stock: v.stock_quantity,
          threshold: v.product.low_stock_threshold ?? 5,
          variant: [v.size, v.material].filter(Boolean).join(' / ') || 'Variant',
        }));

      setRows([...productLow, ...variantLow].sort((a, b) => a.stock - b.stock));
      setLoading(false);
    })();
  }, []);

  return (
    <div className="product-card">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="text-orange-500" size={18} />
        <h2 className="font-medium text-foreground">Low stock alerts</h2>
        <span className="text-xs text-muted-foreground">({rows.length})</span>
      </div>
      {loading ? (
        <p className="text-sm text-muted-foreground">Checking inventory…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground flex items-center gap-2"><Package size={14} /> All stock levels look healthy.</p>
      ) : (
        <div className="space-y-1.5 max-h-80 overflow-y-auto">
          {rows.map((r) => (
            <Link
              key={r.id}
              to={`/admin/products`}
              className="flex items-center justify-between gap-3 p-2 rounded hover:bg-muted text-sm"
            >
              <div className="min-w-0 flex-1">
                <p className="text-foreground truncate">{r.title}</p>
                {r.variant && <p className="text-xs text-muted-foreground">{r.variant}</p>}
              </div>
              <span className={`text-xs font-mono px-2 py-0.5 rounded ${r.stock === 0 ? 'bg-destructive/10 text-destructive' : 'bg-orange-500/10 text-orange-600'}`}>
                {r.stock === 0 ? 'Out of stock' : `${r.stock} left`}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
