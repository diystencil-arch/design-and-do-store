import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Edit, X, ChevronRight } from 'lucide-react';
import { slugify } from '@/lib/slug';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
  sort_order: number;
  show_on_home: boolean;
}

const empty = { name: '', slug: '', description: '', parent_id: '' as string | '', sort_order: 0, show_on_home: false };

export default function AdminCategories() {
  const { toast } = useToast();
  const [cats, setCats] = useState<Category[]>([]);
  const [editing, setEditing] = useState<typeof empty & { id?: string } | null>(null);

  const load = async () => {
    const { data } = await supabase.from('categories').select('*').order('sort_order').order('name');
    setCats((data || []) as Category[]);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing) return;
    if (!editing.name.trim()) { toast({ title: 'Name required', variant: 'destructive' }); return; }
    const slug = slugify(editing.slug || editing.name);
    const payload = {
      name: editing.name.trim(),
      slug,
      description: editing.description || null,
      parent_id: editing.parent_id || null,
      sort_order: Number(editing.sort_order) || 0,
      show_on_home: editing.show_on_home,
    };
    if (editing.id) {
      const { error } = await supabase.from('categories').update(payload).eq('id', editing.id);
      if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    } else {
      const { error } = await supabase.from('categories').insert(payload);
      if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    }
    toast({ title: 'Saved' });
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this category? Products are not deleted.')) return;
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    load();
  };

  const parents = cats.filter((c) => !c.parent_id);
  const childrenOf = (pid: string) => cats.filter((c) => c.parent_id === pid);

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-heading">Categories</h1>
          <p className="text-sm text-muted-foreground mt-1">Organize products by category and sub-category. Holiday categories are pre-seeded.</p>
        </div>
        <button onClick={() => setEditing({ ...empty })} className="btn-primary text-sm py-2 px-4">
          <Plus size={14} /> New category
        </button>
      </div>

      {editing && (
        <div className="product-card mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">{editing.id ? 'Edit category' : 'New category'}</h2>
            <button onClick={() => setEditing(null)}><X size={18} /></button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Name *</label>
              <input className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Slug (URL)</label>
              <input className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background" placeholder="auto-from-name" value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: slugify(e.target.value) })} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Parent category (for sub-category)</label>
              <select className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background" value={editing.parent_id} onChange={(e) => setEditing({ ...editing, parent_id: e.target.value })}>
                <option value="">— None (top-level) —</option>
                {parents.filter((p) => p.id !== editing.id).map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Sort order</label>
              <input type="number" className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background" value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value) || 0 })} />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Description</label>
            <textarea rows={2} className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background" value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={editing.show_on_home} onChange={(e) => setEditing({ ...editing, show_on_home: e.target.checked })} />
            Show on homepage
          </label>
          <div className="flex gap-2 pt-2 border-t border-border">
            <button onClick={save} className="btn-primary text-sm py-2 px-4">Save</button>
            <button onClick={() => setEditing(null)} className="btn-outline text-sm py-2 px-4">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {parents.map((p) => (
          <div key={p.id} className="product-card">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">{p.name}</p>
                <p className="text-xs text-muted-foreground">/{p.slug} · order {p.sort_order}{p.show_on_home && ' · on home'}</p>
              </div>
              <button onClick={() => setEditing({ id: p.id, name: p.name, slug: p.slug, description: p.description || '', parent_id: '', sort_order: p.sort_order, show_on_home: p.show_on_home })} className="text-muted-foreground hover:text-primary p-1.5"><Edit size={16} /></button>
              <button onClick={() => remove(p.id)} className="text-muted-foreground hover:text-destructive p-1.5"><Trash2 size={16} /></button>
            </div>
            {childrenOf(p.id).length > 0 && (
              <div className="mt-3 pl-4 border-l-2 border-border space-y-1">
                {childrenOf(p.id).map((c) => (
                  <div key={c.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <ChevronRight size={12} /> <span className="text-foreground">{c.name}</span>
                      <span className="text-xs">· /{c.slug}</span>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => setEditing({ id: c.id, name: c.name, slug: c.slug, description: c.description || '', parent_id: c.parent_id || '', sort_order: c.sort_order, show_on_home: c.show_on_home })} className="text-muted-foreground hover:text-primary p-1"><Edit size={14} /></button>
                      <button onClick={() => remove(c.id)} className="text-muted-foreground hover:text-destructive p-1"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {cats.length === 0 && <p className="text-sm text-muted-foreground py-8 text-center">No categories yet.</p>}
      </div>
    </AdminLayout>
  );
}
