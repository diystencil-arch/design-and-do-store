import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Edit } from 'lucide-react';

interface Product {
  id: string;
  title: string;
  slug: string;
  type: 'affiliate' | 'physical' | 'digital';
  price: number;
  is_active: boolean;
  tags: string[];
  images: string[];
  description: string | null;
}

const empty = {
  title: '', slug: '', type: 'physical' as Product['type'], price: 0,
  description: '', tags: '', image_url: '', is_active: true, amazon_url: '',
};

export default function AdminProducts() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<typeof empty & { id?: string } | null>(null);

  const load = () => {
    supabase.from('products').select('*').order('created_at', { ascending: false })
      .then(({ data }) => setProducts((data || []) as Product[]));
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing) return;
    const slug = editing.slug || editing.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const payload = {
      title: editing.title,
      slug,
      type: editing.type,
      price: editing.price,
      description: editing.description,
      tags: editing.tags.split(',').map((t) => t.trim()).filter(Boolean),
      images: editing.image_url ? [editing.image_url] : [],
      is_active: editing.is_active,
    };
    let productId = editing.id;
    if (editing.id) {
      const { error } = await supabase.from('products').update(payload).eq('id', editing.id);
      if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    } else {
      const { data, error } = await supabase.from('products').insert(payload).select('id').single();
      if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
      productId = data.id;
    }
    if (editing.type === 'affiliate' && editing.amazon_url && productId) {
      await supabase.from('affiliate_products').upsert({ product_id: productId, amazon_url: editing.amazon_url }, { onConflict: 'product_id' });
    }
    toast({ title: 'Saved' });
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    load();
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="section-heading">Products</h1>
        <button onClick={() => setEditing({ ...empty })} className="btn-primary text-sm py-2 px-4">
          <Plus size={14} /> New product
        </button>
      </div>

      {editing && (
        <div className="product-card mb-6 space-y-3">
          <h2 className="font-medium">{editing.id ? 'Edit product' : 'New product'}</h2>
          <input className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background" placeholder="Title" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
          <input className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background" placeholder="Slug (auto if blank)" value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} />
          <select className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background" value={editing.type} onChange={(e) => setEditing({ ...editing, type: e.target.value as Product['type'] })}>
            <option value="physical">Physical (stencil/wood/acrylic)</option>
            <option value="digital">Digital (SVG)</option>
            <option value="affiliate">Affiliate (Amazon)</option>
          </select>
          <input type="number" step="0.01" className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background" placeholder="Price (CAD)" value={editing.price} onChange={(e) => setEditing({ ...editing, price: parseFloat(e.target.value) || 0 })} />
          <textarea className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background" placeholder="Description" rows={3} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
          <input className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background" placeholder="Tags (comma-separated, use 'wood' for wood, 'acrylic' for acrylic, 'stencil' for stencils)" value={editing.tags} onChange={(e) => setEditing({ ...editing, tags: e.target.value })} />
          <input className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background" placeholder="Image URL" value={editing.image_url} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} />
          {editing.type === 'affiliate' && (
            <input className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background" placeholder="Amazon URL" value={editing.amazon_url} onChange={(e) => setEditing({ ...editing, amazon_url: e.target.value })} />
          )}
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={editing.is_active} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} />
            Active (visible on storefront)
          </label>
          <div className="flex gap-2">
            <button onClick={save} className="btn-primary text-sm py-2 px-4">Save</button>
            <button onClick={() => setEditing(null)} className="btn-outline text-sm py-2 px-4">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {products.map((p) => (
          <div key={p.id} className="product-card flex items-center gap-4">
            <img src={p.images[0] || '/placeholder.svg'} alt="" className="w-14 h-14 rounded object-cover bg-muted" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{p.title}</p>
              <p className="text-xs text-muted-foreground">{p.type} · ${Number(p.price).toFixed(2)} · {p.is_active ? 'Active' : 'Hidden'}</p>
            </div>
            <button onClick={() => setEditing({
              id: p.id, title: p.title, slug: p.slug, type: p.type, price: Number(p.price),
              description: p.description || '', tags: (p.tags || []).join(', '),
              image_url: p.images[0] || '', is_active: p.is_active, amazon_url: '',
            })} className="text-muted-foreground hover:text-primary"><Edit size={16} /></button>
            <button onClick={() => remove(p.id)} className="text-muted-foreground hover:text-destructive"><Trash2 size={16} /></button>
          </div>
        ))}
        {products.length === 0 && <p className="text-muted-foreground text-sm">No products yet. Click "New product" to add one.</p>}
      </div>
    </AdminLayout>
  );
}
