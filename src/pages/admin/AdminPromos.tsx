import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Edit, X, Tag } from 'lucide-react';

interface PromoCode {
  id: string; code: string; discount_type: string; discount_value: number;
  min_subtotal: number; max_uses: number | null; used_count: number;
  starts_at: string | null; ends_at: string | null; is_active: boolean;
}
const emptyCode = {
  code: '', discount_type: 'percent', discount_value: 10, min_subtotal: 0,
  max_uses: '' as number | string, starts_at: '', ends_at: '', is_active: true,
};

interface Banner {
  id: string;
  title: string | null;
  message: string;
  link_url: string | null;
  link_label: string | null;
  bg_color: string;
  text_color: string;
  position: string;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  sort_order: number;
}

const empty = {
  title: '', message: '', link_url: '', link_label: '',
  bg_color: '#C4A882', text_color: '#ffffff',
  position: 'top', is_active: true,
  starts_at: '', ends_at: '', sort_order: 0,
};

export default function AdminPromos() {
  const { toast } = useToast();
  const [items, setItems] = useState<Banner[]>([]);
  const [editing, setEditing] = useState<typeof empty & { id?: string } | null>(null);
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [editingCode, setEditingCode] = useState<typeof emptyCode & { id?: string } | null>(null);

  const load = async () => {
    const { data } = await supabase.from('promo_banners').select('*').order('sort_order').order('created_at', { ascending: false });
    setItems((data || []) as Banner[]);
    const { data: cdata } = await supabase.from('promo_codes' as any).select('*').order('created_at', { ascending: false });
    setCodes((cdata || []) as unknown as PromoCode[]);
  };
  useEffect(() => { load(); }, []);

  const saveCode = async () => {
    if (!editingCode) return;
    const code = editingCode.code.trim().toUpperCase();
    if (!code) { toast({ title: 'Code required', variant: 'destructive' }); return; }
    const payload: any = {
      code,
      discount_type: editingCode.discount_type,
      discount_value: Number(editingCode.discount_value) || 0,
      min_subtotal: Number(editingCode.min_subtotal) || 0,
      max_uses: editingCode.max_uses === '' ? null : Number(editingCode.max_uses),
      starts_at: editingCode.starts_at || null,
      ends_at: editingCode.ends_at || null,
      is_active: editingCode.is_active,
    };
    const { error } = editingCode.id
      ? await supabase.from('promo_codes' as any).update(payload).eq('id', editingCode.id)
      : await supabase.from('promo_codes' as any).insert(payload);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Promo code saved' });
    setEditingCode(null); load();
  };
  const removeCode = async (id: string) => {
    if (!confirm('Delete this promo code?')) return;
    await supabase.from('promo_codes' as any).delete().eq('id', id);
    load();
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.message.trim()) { toast({ title: 'Message required', variant: 'destructive' }); return; }
    const payload = {
      title: editing.title || null,
      message: editing.message,
      link_url: editing.link_url || null,
      link_label: editing.link_label || null,
      bg_color: editing.bg_color,
      text_color: editing.text_color,
      position: editing.position,
      is_active: editing.is_active,
      starts_at: editing.starts_at || null,
      ends_at: editing.ends_at || null,
      sort_order: Number(editing.sort_order) || 0,
    };
    const { error } = editing.id
      ? await supabase.from('promo_banners').update(payload).eq('id', editing.id)
      : await supabase.from('promo_banners').insert(payload);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Saved' });
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this banner?')) return;
    await supabase.from('promo_banners').delete().eq('id', id);
    load();
  };

  const toggleActive = async (b: Banner) => {
    await supabase.from('promo_banners').update({ is_active: !b.is_active }).eq('id', b.id);
    load();
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-heading">Promotions</h1>
          <p className="text-sm text-muted-foreground mt-1">Run site-wide promo banners. The active banner with the lowest sort order shows for each position.</p>
        </div>
        <button onClick={() => setEditing({ ...empty })} className="btn-primary text-sm py-2 px-4"><Plus size={14} /> New banner</button>
      </div>

      {editing && (
        <div className="product-card mb-6 space-y-4 max-w-3xl">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">{editing.id ? 'Edit banner' : 'New banner'}</h2>
            <button onClick={() => setEditing(null)}><X size={18} /></button>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Internal title (admin only)</label>
            <input className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Message *</label>
            <input className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background" placeholder="🎉 Summer sale — 20% off all stencils" value={editing.message} onChange={(e) => setEditing({ ...editing, message: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Link URL</label>
              <input className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background" placeholder="/stencils" value={editing.link_url} onChange={(e) => setEditing({ ...editing, link_url: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Link label</label>
              <input className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background" placeholder="Shop sale" value={editing.link_label} onChange={(e) => setEditing({ ...editing, link_label: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Background</label>
              <input type="color" className="w-full h-10 border border-border rounded-md bg-background" value={editing.bg_color} onChange={(e) => setEditing({ ...editing, bg_color: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Text color</label>
              <input type="color" className="w-full h-10 border border-border rounded-md bg-background" value={editing.text_color} onChange={(e) => setEditing({ ...editing, text_color: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Position</label>
              <select className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background" value={editing.position} onChange={(e) => setEditing({ ...editing, position: e.target.value })}>
                <option value="top">Top of page</option>
                <option value="bottom">Bottom of page</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Sort order</label>
              <input type="number" className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background" value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value) || 0 })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Starts at (optional)</label>
              <input type="datetime-local" className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background" value={editing.starts_at?.slice(0, 16) || ''} onChange={(e) => setEditing({ ...editing, starts_at: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Ends at (optional)</label>
              <input type="datetime-local" className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background" value={editing.ends_at?.slice(0, 16) || ''} onChange={(e) => setEditing({ ...editing, ends_at: e.target.value })} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={editing.is_active} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} /> Active
          </label>
          {/* preview */}
          <div className="rounded-md p-3 text-center text-sm" style={{ background: editing.bg_color, color: editing.text_color }}>
            {editing.message || 'Preview'} {editing.link_label && <span className="ml-2 underline">{editing.link_label} →</span>}
          </div>
          <div className="flex gap-2 pt-2 border-t border-border">
            <button onClick={save} className="btn-primary text-sm py-2 px-4">Save</button>
            <button onClick={() => setEditing(null)} className="btn-outline text-sm py-2 px-4">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {items.map((b) => (
          <div key={b.id} className="product-card">
            <div className="flex items-center gap-3">
              <div className="rounded-md px-3 py-2 text-xs flex-1 min-w-0 truncate" style={{ background: b.bg_color, color: b.text_color }}>
                {b.message}
              </div>
              <span className="text-xs text-muted-foreground">{b.position}</span>
              <button onClick={() => toggleActive(b)} className={`text-xs px-2 py-1 rounded ${b.is_active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                {b.is_active ? 'Active' : 'Off'}
              </button>
              <button onClick={() => setEditing({
                id: b.id, title: b.title || '', message: b.message,
                link_url: b.link_url || '', link_label: b.link_label || '',
                bg_color: b.bg_color, text_color: b.text_color, position: b.position,
                is_active: b.is_active, starts_at: b.starts_at || '', ends_at: b.ends_at || '', sort_order: b.sort_order,
              })} className="text-muted-foreground hover:text-primary p-1.5"><Edit size={16} /></button>
              <button onClick={() => remove(b.id)} className="text-muted-foreground hover:text-destructive p-1.5"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-muted-foreground py-8 text-center">No promo banners yet — create your first to drive a campaign.</p>}
      </div>

      {/* Promo Codes */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="section-heading flex items-center gap-2"><Tag size={20} /> Promo codes</h2>
            <p className="text-sm text-muted-foreground mt-1">Discount codes customers can redeem at checkout.</p>
          </div>
          <button onClick={() => setEditingCode({ ...emptyCode })} className="btn-primary text-sm py-2 px-4"><Plus size={14} /> New code</button>
        </div>

        {editingCode && (
          <div className="product-card mb-6 space-y-4 max-w-3xl">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{editingCode.id ? 'Edit promo code' : 'New promo code'}</h3>
              <button onClick={() => setEditingCode(null)}><X size={18} /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Code *</label>
                <input className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background uppercase" placeholder="SAVE10" value={editingCode.code} onChange={(e) => setEditingCode({ ...editingCode, code: e.target.value.toUpperCase() })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Discount type</label>
                <select className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background" value={editingCode.discount_type} onChange={(e) => setEditingCode({ ...editingCode, discount_type: e.target.value })}>
                  <option value="percent">Percent (%)</option>
                  <option value="fixed">Fixed amount</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Value</label>
                <input type="number" step="0.01" className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background" value={editingCode.discount_value} onChange={(e) => setEditingCode({ ...editingCode, discount_value: parseFloat(e.target.value) || 0 })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Min subtotal</label>
                <input type="number" step="0.01" className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background" value={editingCode.min_subtotal} onChange={(e) => setEditingCode({ ...editingCode, min_subtotal: parseFloat(e.target.value) || 0 })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Max uses (blank = unlimited)</label>
                <input type="number" className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background" value={editingCode.max_uses as any} onChange={(e) => setEditingCode({ ...editingCode, max_uses: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Starts at</label>
                <input type="datetime-local" className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background" value={editingCode.starts_at?.slice(0, 16) || ''} onChange={(e) => setEditingCode({ ...editingCode, starts_at: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Ends at</label>
                <input type="datetime-local" className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background" value={editingCode.ends_at?.slice(0, 16) || ''} onChange={(e) => setEditingCode({ ...editingCode, ends_at: e.target.value })} />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={editingCode.is_active} onChange={(e) => setEditingCode({ ...editingCode, is_active: e.target.checked })} /> Active
            </label>
            <div className="flex gap-2 pt-2 border-t border-border">
              <button onClick={saveCode} className="btn-primary text-sm py-2 px-4">Save</button>
              <button onClick={() => setEditingCode(null)} className="btn-outline text-sm py-2 px-4">Cancel</button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {codes.map((c) => (
            <div key={c.id} className="product-card flex items-center gap-3">
              <code className="font-mono text-sm font-semibold bg-muted px-2 py-1 rounded">{c.code}</code>
              <span className="text-sm text-foreground">
                {c.discount_type === 'percent' ? `${c.discount_value}% off` : `$${c.discount_value} off`}
                {c.min_subtotal > 0 && ` · min $${c.min_subtotal}`}
              </span>
              <span className="text-xs text-muted-foreground ml-auto">Used {c.used_count}{c.max_uses ? `/${c.max_uses}` : ''}</span>
              <span className={`text-xs px-2 py-1 rounded ${c.is_active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>{c.is_active ? 'Active' : 'Off'}</span>
              <button onClick={() => setEditingCode({
                id: c.id, code: c.code, discount_type: c.discount_type, discount_value: c.discount_value,
                min_subtotal: c.min_subtotal, max_uses: c.max_uses ?? '', starts_at: c.starts_at || '', ends_at: c.ends_at || '', is_active: c.is_active,
              })} className="text-muted-foreground hover:text-primary p-1.5"><Edit size={16} /></button>
              <button onClick={() => removeCode(c.id)} className="text-muted-foreground hover:text-destructive p-1.5"><Trash2 size={16} /></button>
            </div>
          ))}
          {codes.length === 0 && <p className="text-sm text-muted-foreground py-8 text-center">No promo codes yet.</p>}
        </div>
      </div>
    </AdminLayout>
  );
}
