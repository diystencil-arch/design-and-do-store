import { useEffect, useState, useRef } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Edit, Upload, FileDown, Sparkles, GripVertical, Star, Flame, Eye, EyeOff, Languages, FileText, X, Copy } from 'lucide-react';
import { slugify } from '@/lib/slug';

type ProductType = 'affiliate' | 'physical' | 'digital';
type Status = 'published' | 'draft' | 'deactivated' | 'sold_out';

interface Product {
  id: string;
  title: string;
  slug: string;
  type: ProductType;
  price: number;
  compare_at_price: number | null;
  is_active: boolean;
  status: Status;
  is_bestseller: boolean;
  is_featured: boolean;
  is_recommended: boolean;
  tags: string[];
  images: string[];
  description: string | null;
  sku: string | null;
  barcode: string | null;
  stock_quantity: number;
  low_stock_threshold: number;
  personalization_enabled: boolean;
  personalization_label: string | null;
  personalization_max_chars: number | null;
  video_url: string | null;
  video_thumbnail: string | null;
  meta_title: string | null;
  meta_description: string | null;
}

interface Category { id: string; name: string; slug: string; }

interface VariationDraft {
  id?: string;
  size: string;
  material: string;
  sku: string;
  stock_quantity: number;
  price_override: string | number;
  images: string[];
}

const empty = {
  title: '', slug: '', type: 'physical' as ProductType, price: 0, compare_at_price: '' as number | string,
  description: '', tags: '', images: [] as string[],
  status: 'published' as Status, is_active: true,
  is_bestseller: false, is_featured: false, is_recommended: false,
  amazon_url: '',
  digital_storage_path: '', digital_formats: '',
  sku: '', barcode: '', stock_quantity: 0, low_stock_threshold: 5,
  personalization_enabled: false, personalization_label: 'Add your personalization', personalization_max_chars: 100,
  video_url: '', video_thumbnail: '',
  meta_title: '', meta_description: '',
  category_ids: [] as string[],
  variations: [] as VariationDraft[],
};

const LANGUAGES = [
  { code: 'en', label: '🇬🇧 English' }, { code: 'nl', label: '🇳🇱 Dutch' }, { code: 'fr', label: '🇫🇷 French' },
  { code: 'de', label: '🇩🇪 German' }, { code: 'it', label: '🇮🇹 Italian' }, { code: 'ja', label: '🇯🇵 Japanese' },
  { code: 'pl', label: '🇵🇱 Polish' }, { code: 'pt', label: '🇵🇹 Portuguese' }, { code: 'ru', label: '🇷🇺 Russian' },
  { code: 'es', label: '🇪🇸 Spanish' },
];

export default function AdminProducts() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<typeof empty & { id?: string } | null>(null);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [blogLoading, setBlogLoading] = useState<string | null>(null);
  const [blogPanel, setBlogPanel] = useState<Product | null>(null);
  const [filter, setFilter] = useState<'all' | Status>('all');
  const dragSrc = useRef<number | null>(null);

  const load = async () => {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    setProducts((data || []) as Product[]);
  };
  const loadCategories = async () => {
    const { data } = await supabase.from('categories').select('id, name, slug').order('sort_order');
    setCategories(data || []);
  };

  useEffect(() => { load(); loadCategories(); }, []);

  const startEdit = async (p: Product) => {
    let digital_storage_path = '';
    let digital_formats = '';
    if (p.type === 'digital') {
      const { data: df } = await supabase.from('digital_files').select('storage_path, file_formats').eq('product_id', p.id).maybeSingle();
      digital_storage_path = df?.storage_path || '';
      digital_formats = (df?.file_formats || []).join(', ');
    }
    const { data: pcs } = await supabase.from('product_categories').select('category_id').eq('product_id', p.id);
    const { data: vars } = await supabase.from('physical_variants').select('id, size, material, sku, stock_quantity, price_override, images').eq('product_id', p.id);
    setEditing({
      id: p.id, title: p.title, slug: p.slug, type: p.type,
      price: Number(p.price), compare_at_price: p.compare_at_price ?? '',
      description: p.description || '', tags: (p.tags || []).join(', '),
      images: p.images || [],
      status: p.status || 'published', is_active: p.is_active,
      is_bestseller: !!p.is_bestseller, is_featured: !!p.is_featured, is_recommended: !!p.is_recommended,
      amazon_url: '', digital_storage_path, digital_formats,
      sku: p.sku || '', barcode: p.barcode || '',
      stock_quantity: p.stock_quantity ?? 0, low_stock_threshold: p.low_stock_threshold ?? 5,
      personalization_enabled: !!p.personalization_enabled,
      personalization_label: p.personalization_label || 'Add your personalization',
      personalization_max_chars: p.personalization_max_chars ?? 100,
      video_url: p.video_url || '', video_thumbnail: p.video_thumbnail || '',
      meta_title: p.meta_title || '', meta_description: p.meta_description || '',
      category_ids: (pcs || []).map((r) => r.category_id),
      variations: (vars || []).map((v: any) => ({
        id: v.id, size: v.size || '', material: v.material || '', sku: v.sku || '',
        stock_quantity: v.stock_quantity ?? 0,
        price_override: v.price_override ?? '',
        images: v.images || [],
      })),
    });
    if (p.type === 'affiliate') {
      const { data: af } = await supabase.from('affiliate_products').select('amazon_url').eq('product_id', p.id).maybeSingle();
      setEditing((prev) => prev ? { ...prev, amazon_url: af?.amazon_url || '' } : prev);
    }
  };

  const copyListing = async (p: Product) => {
    if (!confirm(`Duplicate "${p.title}" as a draft?`)) return;
    let digital_storage_path = '';
    let digital_formats: string[] = [];
    if (p.type === 'digital') {
      const { data: df } = await supabase.from('digital_files').select('storage_path, file_formats').eq('product_id', p.id).maybeSingle();
      digital_storage_path = df?.storage_path || '';
      digital_formats = df?.file_formats || [];
    }
    const baseSlug = `${p.slug}-copy`;
    let finalSlug = baseSlug; let n = 1;
    while (true) {
      const { data: ex } = await supabase.from('products').select('id').eq('slug', finalSlug).maybeSingle();
      if (!ex) break;
      n += 1; finalSlug = `${baseSlug}-${n}`;
    }
    const { data: newP, error } = await supabase.from('products').insert({
      title: `${p.title} (copy)`, slug: finalSlug, type: p.type, price: p.price,
      compare_at_price: p.compare_at_price, description: p.description, tags: p.tags,
      images: p.images, status: 'draft', is_active: false,
      is_bestseller: false, is_featured: false, is_recommended: false,
      sku: null, barcode: null,
      stock_quantity: p.stock_quantity, low_stock_threshold: p.low_stock_threshold,
      personalization_enabled: p.personalization_enabled,
      personalization_label: p.personalization_label,
      personalization_max_chars: p.personalization_max_chars,
      video_url: p.video_url, video_thumbnail: p.video_thumbnail,
      meta_title: p.meta_title, meta_description: p.meta_description,
    }).select('id').single();
    if (error || !newP) { toast({ title: 'Copy failed', description: error?.message, variant: 'destructive' }); return; }
    // copy categories
    const { data: pcs } = await supabase.from('product_categories').select('category_id').eq('product_id', p.id);
    if (pcs?.length) await supabase.from('product_categories').insert(pcs.map((r: any) => ({ product_id: newP.id, category_id: r.category_id })));
    // copy variations
    const { data: vars } = await supabase.from('physical_variants').select('size, material, sku, stock_quantity, price_override, images').eq('product_id', p.id);
    if (vars?.length) await supabase.from('physical_variants').insert(vars.map((v: any) => ({ ...v, product_id: newP.id, sku: null })));
    if (p.type === 'digital' && digital_storage_path) {
      await supabase.from('digital_files').insert({ product_id: newP.id, storage_path: digital_storage_path, file_formats: digital_formats });
    }
    toast({ title: 'Listing duplicated', description: 'Saved as draft.' });
    load();
  };

  const uploadImages = async (files: FileList) => {
    if (!editing) return;
    setUploadingImg(true);
    const newUrls: string[] = [];
    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from('product-images').upload(path, file, { upsert: false, contentType: file.type });
      if (error) { toast({ title: 'Upload failed', description: error.message, variant: 'destructive' }); continue; }
      const { data } = supabase.storage.from('product-images').getPublicUrl(path);
      newUrls.push(data.publicUrl);
    }
    setEditing({ ...editing, images: [...editing.images, ...newUrls] });
    setUploadingImg(false);
    if (newUrls.length) toast({ title: `${newUrls.length} image(s) uploaded` });
  };

  const uploadVideo = async (file: File) => {
    if (!editing) return;
    if (file.size > 50 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Max 50MB for videos', variant: 'destructive' });
      return;
    }
    setUploadingVideo(true);
    const ext = file.name.split('.').pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from('product-videos').upload(path, file, { upsert: false, contentType: file.type });
    if (error) { toast({ title: 'Upload failed', description: error.message, variant: 'destructive' }); setUploadingVideo(false); return; }
    const { data } = supabase.storage.from('product-videos').getPublicUrl(path);
    setEditing({ ...editing, video_url: data.publicUrl, video_thumbnail: editing.images[0] || '' });
    setUploadingVideo(false);
    toast({ title: 'Video uploaded' });
  };

  const removeImage = (idx: number) => {
    if (!editing) return;
    setEditing({ ...editing, images: editing.images.filter((_, i) => i !== idx) });
  };

  const reorderImages = (from: number, to: number) => {
    if (!editing || from === to) return;
    const arr = [...editing.images];
    const [moved] = arr.splice(from, 1);
    arr.splice(to, 0, moved);
    setEditing({ ...editing, images: arr });
  };

  const uploadDigitalFile = async (file: File) => {
    if (!editing) return;
    const allowed = ['svg', 'zip', 'pdf', 'png', 'dxf'];
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    if (!allowed.includes(ext)) { toast({ title: 'Invalid file', description: 'Use SVG, ZIP, PDF, PNG, or DXF', variant: 'destructive' }); return; }
    setUploadingFile(true);
    const slug = slugify(editing.slug || editing.title) || 'file';
    const path = `${slug}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('digital-files').upload(path, file, { upsert: false, contentType: file.type });
    if (error) { toast({ title: 'Upload failed', description: error.message, variant: 'destructive' }); setUploadingFile(false); return; }
    setEditing({ ...editing, digital_storage_path: path, digital_formats: editing.digital_formats || ext.toUpperCase() });
    setUploadingFile(false);
    toast({ title: 'File uploaded', description: file.name });
  };

  const callAI = async (mode: 'title' | 'description' | 'tags' | 'all') => {
    if (!editing) return;
    setAiLoading(mode);
    try {
      const { data, error } = await supabase.functions.invoke('ai-content', {
        body: {
          mode,
          title: editing.title,
          description: editing.description,
          productType: editing.type,
          imageUrl: editing.images[0],
        },
      });
      if (error) throw error;
      if (mode === 'title') setEditing({ ...editing, title: data.result });
      else if (mode === 'description') setEditing({ ...editing, description: data.result });
      else if (mode === 'tags') {
        const newTags = Array.from(new Set([
          ...editing.tags.split(',').map((t) => t.trim()).filter(Boolean),
          ...data.result,
        ]));
        setEditing({ ...editing, tags: newTags.join(', ') });
      } else if (mode === 'all') {
        const r = data.result || {};
        setEditing({
          ...editing,
          title: r.title || editing.title,
          description: r.description || editing.description,
          tags: Array.isArray(r.tags) ? r.tags.join(', ') : editing.tags,
          meta_title: r.meta_title || editing.meta_title,
          meta_description: r.meta_description || editing.meta_description,
        });
      }
      toast({ title: `AI generated ${mode}` });
    } catch (e: any) {
      toast({ title: 'AI error', description: e.message || 'Could not reach Lovable AI', variant: 'destructive' });
    } finally {
      setAiLoading(null);
    }
  };

  const generateBlog = async (product: Product, language: string) => {
    setBlogLoading(language);
    try {
      const { data, error } = await supabase.functions.invoke('ai-content', {
        body: {
          mode: 'blog',
          title: product.title,
          description: product.description,
          productType: product.type,
          tags: product.tags,
          imageUrl: product.images?.[0],
          language,
        },
      });
      if (error) throw error;
      const blog = data.result;
      // Ensure unique slug per language
      let baseSlug = slugify(blog.slug || blog.title);
      let finalSlug = baseSlug;
      let n = 1;
      while (true) {
        const { data: existing } = await supabase.from('blog_posts').select('id').eq('slug', finalSlug).eq('language', language).maybeSingle();
        if (!existing) break;
        n += 1;
        finalSlug = `${baseSlug}-${n}`;
      }
      const { error: insertErr } = await supabase.from('blog_posts').insert({
        title: blog.title,
        slug: finalSlug,
        excerpt: blog.excerpt,
        content: blog.content,
        meta_title: blog.meta_title,
        meta_description: blog.meta_description,
        tags: blog.tags,
        language,
        product_id: product.id,
        cover_image: product.images?.[0] || null,
        is_published: true,
        published_at: new Date().toISOString(),
      });
      if (insertErr) throw insertErr;
      toast({ title: `Blog post generated`, description: `Published in ${LANGUAGES.find(l => l.code === language)?.label}` });
    } catch (e: any) {
      toast({ title: 'Blog generation failed', description: e.message, variant: 'destructive' });
    } finally {
      setBlogLoading(null);
    }
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.title.trim()) { toast({ title: 'Title required', variant: 'destructive' }); return; }
    const slug = slugify(editing.slug || editing.title);
    if (!slug) { toast({ title: 'Could not generate slug', variant: 'destructive' }); return; }
    const payload: any = {
      title: editing.title.trim(),
      slug,
      type: editing.type,
      price: Number(editing.price) || 0,
      compare_at_price: editing.compare_at_price === '' ? null : Number(editing.compare_at_price),
      description: editing.description,
      tags: editing.tags.split(',').map((t) => t.trim()).filter(Boolean),
      images: editing.images,
      status: editing.status,
      is_active: editing.status !== 'deactivated' && editing.status !== 'draft',
      is_bestseller: editing.is_bestseller,
      is_featured: editing.is_featured,
      is_recommended: editing.is_recommended,
      sku: editing.sku || null,
      barcode: editing.barcode || null,
      stock_quantity: Number(editing.stock_quantity) || 0,
      low_stock_threshold: Number(editing.low_stock_threshold) || 5,
      personalization_enabled: editing.personalization_enabled,
      personalization_label: editing.personalization_label || null,
      personalization_max_chars: Number(editing.personalization_max_chars) || 100,
      video_url: editing.video_url || null,
      video_thumbnail: editing.video_thumbnail || null,
      meta_title: editing.meta_title || null,
      meta_description: editing.meta_description || null,
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

    // Categories
    if (productId) {
      await supabase.from('product_categories').delete().eq('product_id', productId);
      if (editing.category_ids.length) {
        await supabase.from('product_categories').insert(editing.category_ids.map((cid) => ({ product_id: productId, category_id: cid })));
      }
    }

    if (editing.type === 'affiliate' && editing.amazon_url && productId) {
      await supabase.from('affiliate_products').upsert({ product_id: productId, amazon_url: editing.amazon_url }, { onConflict: 'product_id' });
    }
    if (editing.type === 'digital' && editing.digital_storage_path && productId) {
      const formats = editing.digital_formats.split(',').map((f) => f.trim().toUpperCase()).filter(Boolean);
      const { data: existing } = await supabase.from('digital_files').select('id').eq('product_id', productId).maybeSingle();
      if (existing) {
        await supabase.from('digital_files').update({ storage_path: editing.digital_storage_path, file_formats: formats }).eq('id', existing.id);
      } else {
        await supabase.from('digital_files').insert({ product_id: productId, storage_path: editing.digital_storage_path, file_formats: formats });
      }
    }

    // Variations (physical products only)
    if (productId && editing.type === 'physical') {
      const incomingIds = editing.variations.filter((v) => v.id).map((v) => v.id as string);
      const { data: existingVars } = await supabase.from('physical_variants').select('id').eq('product_id', productId);
      const toDelete = (existingVars || []).map((v: any) => v.id).filter((id: string) => !incomingIds.includes(id));
      if (toDelete.length) await supabase.from('physical_variants').delete().in('id', toDelete);
      for (const v of editing.variations) {
        const row = {
          product_id: productId,
          size: v.size || null,
          material: v.material || null,
          sku: v.sku || null,
          stock_quantity: Number(v.stock_quantity) || 0,
          price_override: v.price_override === '' || v.price_override === null ? null : Number(v.price_override),
          images: v.images || [],
        };
        if (v.id) await supabase.from('physical_variants').update(row).eq('id', v.id);
        else await supabase.from('physical_variants').insert(row);
      }
    }

    toast({ title: 'Saved' });
    setEditing(null);
    load();
  };

  const uploadVariationImage = async (vIdx: number, files: FileList) => {
    if (!editing) return;
    const newUrls: string[] = [];
    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop();
      const path = `${Date.now()}-v${vIdx}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from('product-images').upload(path, file, { upsert: false, contentType: file.type });
      if (error) { toast({ title: 'Upload failed', description: error.message, variant: 'destructive' }); continue; }
      const { data } = supabase.storage.from('product-images').getPublicUrl(path);
      newUrls.push(data.publicUrl);
    }
    const variations = [...editing.variations];
    variations[vIdx] = { ...variations[vIdx], images: [...variations[vIdx].images, ...newUrls] };
    setEditing({ ...editing, variations });
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    load();
  };

  const quickToggle = async (p: Product, field: 'is_bestseller' | 'is_featured' | 'is_recommended') => {
    const update: any = { [field]: !p[field] };
    await supabase.from('products').update(update).eq('id', p.id);
    load();
  };

  const setStatus = async (p: Product, status: Status) => {
    const is_active = status !== 'deactivated' && status !== 'draft';
    await supabase.from('products').update({ status, is_active }).eq('id', p.id);
    toast({ title: `Moved to ${status.replace('_', ' ')}` });
    load();
  };

  const aiSlug = async () => {
    if (!editing) return;
    if (!editing.title.trim()) { toast({ title: 'Add a title first', variant: 'destructive' }); return; }
    setAiLoading('slug');
    try {
      const { data, error } = await supabase.functions.invoke('ai-content', {
        body: { mode: 'all', title: editing.title, description: editing.description, productType: editing.type },
      });
      if (error) throw error;
      const seedTitle = data?.result?.title || editing.title;
      setEditing({ ...editing, slug: slugify(seedTitle) });
      toast({ title: 'AI slug generated' });
    } catch (e: any) {
      // Fallback: just slugify the title
      setEditing({ ...editing, slug: slugify(editing.title) });
      toast({ title: 'Slug from title' });
    } finally { setAiLoading(null); }
  };

  const saveAsDraft = async () => {
    if (!editing) return;
    setEditing({ ...editing, status: 'draft' });
    setTimeout(() => save(), 0);
  };

  const filtered = filter === 'all' ? products : products.filter((p) => p.status === filter);

  const exportCSV = () => {
    const headers = ['id','title','slug','type','status','price','compare_at_price','stock_quantity','sku','barcode','tags','images','description'];
    const esc = (v: any) => {
      const s = v == null ? '' : Array.isArray(v) ? v.join('|') : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const rows = [headers.join(',')].concat(
      products.map((p) => headers.map((h) => esc((p as any)[h])).join(','))
    );
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `products-${new Date().toISOString().slice(0,10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const importCSV = async (file: File) => {
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) { toast({ title: 'Empty CSV', variant: 'destructive' }); return; }
    const parseLine = (line: string) => {
      const out: string[] = []; let cur = ''; let inQ = false;
      for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (inQ) {
          if (c === '"' && line[i+1] === '"') { cur += '"'; i++; }
          else if (c === '"') inQ = false;
          else cur += c;
        } else {
          if (c === ',') { out.push(cur); cur = ''; }
          else if (c === '"') inQ = true;
          else cur += c;
        }
      }
      out.push(cur);
      return out;
    };
    const headers = parseLine(lines[0]).map((h) => h.trim());
    let inserted = 0, updated = 0, errors = 0;
    for (let i = 1; i < lines.length; i++) {
      const cols = parseLine(lines[i]);
      const row: any = {};
      headers.forEach((h, idx) => { row[h] = cols[idx] ?? ''; });
      const payload: any = {
        title: row.title?.trim(),
        slug: slugify(row.slug || row.title || ''),
        type: row.type || 'physical',
        status: row.status || 'published',
        price: parseFloat(row.price) || 0,
        compare_at_price: row.compare_at_price ? parseFloat(row.compare_at_price) : null,
        stock_quantity: parseInt(row.stock_quantity) || 0,
        sku: row.sku || null,
        barcode: row.barcode || null,
        tags: row.tags ? row.tags.split('|').filter(Boolean) : [],
        images: row.images ? row.images.split('|').filter(Boolean) : [],
        description: row.description || null,
        is_active: (row.status || 'published') !== 'draft' && row.status !== 'deactivated',
      };
      if (!payload.title || !payload.slug) { errors++; continue; }
      if (row.id) {
        const { error } = await supabase.from('products').update(payload).eq('id', row.id);
        if (error) errors++; else updated++;
      } else {
        const { error } = await supabase.from('products').insert(payload);
        if (error) errors++; else inserted++;
      }
    }
    toast({ title: 'Import complete', description: `${inserted} added · ${updated} updated · ${errors} errors` });
    load();
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6 gap-2 flex-wrap">
        <h1 className="section-heading">Products</h1>
        <div className="flex items-center gap-2">
          <button onClick={exportCSV} className="btn-outline text-sm py-2 px-3" title="Export all products to CSV">
            <FileDown size={14} /> Export
          </button>
          <label className="btn-outline text-sm py-2 px-3 cursor-pointer" title="Import products from CSV">
            <Upload size={14} /> Import
            <input type="file" accept=".csv" className="hidden" onChange={(e) => e.target.files?.[0] && importCSV(e.target.files[0])} />
          </label>
          <button onClick={() => setEditing({ ...empty })} className="btn-primary text-sm py-2 px-4">
            <Plus size={14} /> New product
          </button>
        </div>
      </div>

      <div className="flex gap-1 mb-4 overflow-x-auto">
        {(['all', 'published', 'draft', 'sold_out', 'deactivated'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 text-xs rounded-md whitespace-nowrap ${filter === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-secondary'}`}
          >
            {s.replace('_', ' ')} ({s === 'all' ? products.length : products.filter((p) => p.status === s).length})
          </button>
        ))}
      </div>

      {editing && (
        <div className="product-card mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">{editing.id ? 'Edit product' : 'New product'}</h2>
            <div className="flex items-center gap-3">
              <button onClick={() => callAI('all')} disabled={aiLoading === 'all'} className="btn-outline text-xs py-1.5 px-3 flex items-center gap-1">
                <Sparkles size={12} /> {aiLoading === 'all' ? 'Generating all…' : 'Generate all with AI'}
              </button>
              <button onClick={() => setEditing(null)} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground -mt-2">Tip: enter a quick title or upload an image, then click <strong>Generate all with AI</strong> to fill title, description, tags, and SEO meta in one click.</p>

          {/* Title with AI */}
          <div>
            <label className="text-xs text-muted-foreground font-medium flex items-center justify-between mb-1">
              <span>Title *</span>
              <button onClick={() => callAI('title')} disabled={aiLoading === 'title'} className="text-primary hover:underline flex items-center gap-1">
                <Sparkles size={12} /> {aiLoading === 'title' ? 'Generating…' : 'AI generate'}
              </button>
            </label>
            <input className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
          </div>

          {/* Slug */}
          <div>
            <label className="text-xs text-muted-foreground font-medium block mb-1">URL slug — <code>/products/{editing.slug || slugify(editing.title) || 'auto-from-title'}</code></label>
            <input className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background" placeholder="auto-from-title" value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: slugify(e.target.value) })} />
          </div>

          {/* Fulfillment + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground font-medium block mb-1">Fulfillment</label>
              <select className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background" value={editing.type} onChange={(e) => setEditing({ ...editing, type: e.target.value as ProductType })}>
                <option value="physical">Physical (we ship it)</option>
                <option value="digital">Digital (instant download — unlimited stock)</option>
                <option value="affiliate">Affiliate (Amazon link)</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-medium block mb-1">Status</label>
              <select className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background" value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value as Status })}>
                <option value="published">Published (live)</option>
                <option value="draft">Draft (hidden)</option>
                <option value="sold_out">Sold out (visible, no buy)</option>
                <option value="deactivated">Deactivated (hidden)</option>
              </select>
            </div>
          </div>

          {/* Categories — primary classification */}
          <div className="p-3 bg-primary/5 rounded-md border border-primary/20">
            <label className="text-xs text-foreground font-medium block mb-2">Category * <span className="text-muted-foreground font-normal">(controls which storefront page this shows on)</span></label>
            {categories.length === 0 ? (
              <p className="text-xs text-muted-foreground">No categories yet — create some in <a href="/admin/categories" className="text-primary underline">Categories</a>.</p>
            ) : (
              <>
                <select
                  className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background"
                  value={editing.category_ids[0] || ''}
                  onChange={(e) => setEditing({ ...editing, category_ids: e.target.value ? [e.target.value] : [] })}
                >
                  <option value="">— Select a category —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground mt-1">Need multiple categories? Hold Cmd/Ctrl and click the chips below.</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {categories.map((c) => {
                    const active = editing.category_ids.includes(c.id);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setEditing({
                          ...editing,
                          category_ids: active ? editing.category_ids.filter((id) => id !== c.id) : [...editing.category_ids, c.id]
                        })}
                        className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${active ? 'bg-primary text-primary-foreground border-primary' : 'border-border bg-background text-muted-foreground hover:border-primary/40'}`}
                      >
                        {c.name}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground font-medium block mb-1">Price (CAD) *</label>
              <input type="number" step="0.01" className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background" value={editing.price} onChange={(e) => setEditing({ ...editing, price: parseFloat(e.target.value) || 0 })} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-medium block mb-1">Compare-at price (sale strikethrough)</label>
              <input type="number" step="0.01" className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background" value={editing.compare_at_price as any} onChange={(e) => setEditing({ ...editing, compare_at_price: e.target.value })} />
            </div>
          </div>

          {/* Inventory */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-muted-foreground font-medium block mb-1">SKU</label>
              <input className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background" value={editing.sku} onChange={(e) => setEditing({ ...editing, sku: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-medium block mb-1">Barcode</label>
              <input className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background" value={editing.barcode} onChange={(e) => setEditing({ ...editing, barcode: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-medium block mb-1">Stock</label>
              <input type="number" className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background" value={editing.stock_quantity} onChange={(e) => setEditing({ ...editing, stock_quantity: parseInt(e.target.value) || 0 })} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-medium block mb-1">Low stock alert</label>
              <input type="number" className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background" value={editing.low_stock_threshold} onChange={(e) => setEditing({ ...editing, low_stock_threshold: parseInt(e.target.value) || 5 })} />
            </div>
          </div>

          {/* Description with AI */}
          <div>
            <label className="text-xs text-muted-foreground font-medium flex items-center justify-between mb-1">
              <span>Description</span>
              <button onClick={() => callAI('description')} disabled={aiLoading === 'description'} className="text-primary hover:underline flex items-center gap-1">
                <Sparkles size={12} /> {aiLoading === 'description' ? 'Generating…' : 'AI generate'}
              </button>
            </label>
            <textarea className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background" rows={4} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
          </div>

          {/* Tags with AI */}
          <div>
            <label className="text-xs text-muted-foreground font-medium flex items-center justify-between mb-1">
              <span>Tags (comma-separated)</span>
              <button onClick={() => callAI('tags')} disabled={aiLoading === 'tags'} className="text-primary hover:underline flex items-center gap-1">
                <Sparkles size={12} /> {aiLoading === 'tags' ? 'Suggesting…' : 'AI suggest'}
              </button>
            </label>
            <input className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background" placeholder="wood, rustic, wedding" value={editing.tags} onChange={(e) => setEditing({ ...editing, tags: e.target.value })} />
          </div>

          {/* Variations (physical only) */}
          {editing.type === 'physical' && (
            <div className="p-3 bg-muted/30 rounded-md space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Variations (size, material, etc.)</label>
                <button type="button" onClick={() => setEditing({ ...editing, variations: [...editing.variations, { size: '', material: '', sku: '', stock_quantity: 0, price_override: '', images: [] }] })} className="text-xs text-primary hover:underline flex items-center gap-1"><Plus size={12} /> Add variation</button>
              </div>
              {editing.variations.length === 0 && <p className="text-xs text-muted-foreground">No variations — single SKU using the price/stock above.</p>}
              {editing.variations.map((v, i) => (
                <div key={i} className="border border-border rounded-md p-3 space-y-2 bg-background">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    <input className="px-2 py-1.5 border border-border rounded text-sm bg-background" placeholder="Size (e.g. 8x10)" value={v.size} onChange={(e) => { const a = [...editing.variations]; a[i] = { ...a[i], size: e.target.value }; setEditing({ ...editing, variations: a }); }} />
                    <input className="px-2 py-1.5 border border-border rounded text-sm bg-background" placeholder="Material/option" value={v.material} onChange={(e) => { const a = [...editing.variations]; a[i] = { ...a[i], material: e.target.value }; setEditing({ ...editing, variations: a }); }} />
                    <input className="px-2 py-1.5 border border-border rounded text-sm bg-background" placeholder="SKU" value={v.sku} onChange={(e) => { const a = [...editing.variations]; a[i] = { ...a[i], sku: e.target.value }; setEditing({ ...editing, variations: a }); }} />
                    <input type="number" className="px-2 py-1.5 border border-border rounded text-sm bg-background" placeholder="Stock" value={v.stock_quantity} onChange={(e) => { const a = [...editing.variations]; a[i] = { ...a[i], stock_quantity: parseInt(e.target.value) || 0 }; setEditing({ ...editing, variations: a }); }} />
                    <input type="number" step="0.01" className="px-2 py-1.5 border border-border rounded text-sm bg-background" placeholder="Price (optional)" value={v.price_override as any} onChange={(e) => { const a = [...editing.variations]; a[i] = { ...a[i], price_override: e.target.value }; setEditing({ ...editing, variations: a }); }} />
                  </div>
                  <div className="flex flex-wrap gap-2 items-center">
                    {v.images.map((src, ii) => (
                      <div key={src + ii} className="relative w-14 h-14 rounded overflow-hidden border border-border group">
                        <img src={src} alt="" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => { const a = [...editing.variations]; a[i] = { ...a[i], images: a[i].images.filter((_, j) => j !== ii) }; setEditing({ ...editing, variations: a }); }} className="absolute top-0.5 right-0.5 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100"><X size={10} /></button>
                      </div>
                    ))}
                    <label className="w-14 h-14 border-2 border-dashed border-border rounded flex items-center justify-center text-muted-foreground hover:border-primary cursor-pointer">
                      <Upload size={14} />
                      <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files && uploadVariationImage(i, e.target.files)} />
                    </label>
                    <button type="button" onClick={() => setEditing({ ...editing, variations: editing.variations.filter((_, j) => j !== i) })} className="ml-auto text-xs text-destructive hover:underline">Remove variation</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Badges */}
          <div className="flex flex-wrap gap-4 p-3 bg-muted/50 rounded-md">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={editing.is_bestseller} onChange={(e) => setEditing({ ...editing, is_bestseller: e.target.checked })} />
              <Flame size={14} /> Bestseller
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={editing.is_featured} onChange={(e) => setEditing({ ...editing, is_featured: e.target.checked })} />
              <Star size={14} /> Featured (Home)
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={editing.is_recommended} onChange={(e) => setEditing({ ...editing, is_recommended: e.target.checked })} />
              <Sparkles size={14} /> Recommended
            </label>
          </div>

          {/* Images drag-drop */}
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground font-medium">Product images (drag to reorder, first = main)</label>
            <div className="flex flex-wrap gap-2">
              {editing.images.map((src, i) => (
                <div
                  key={src + i}
                  draggable
                  onDragStart={() => { dragSrc.current = i; }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => { if (dragSrc.current !== null) reorderImages(dragSrc.current, i); dragSrc.current = null; }}
                  className="relative w-24 h-24 rounded-md overflow-hidden border border-border bg-muted group cursor-move"
                >
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <div className="absolute top-1 left-1 text-background bg-foreground/60 rounded p-0.5"><GripVertical size={10} /></div>
                  {i === 0 && <span className="absolute bottom-1 left-1 text-[9px] bg-primary text-primary-foreground px-1 rounded">Main</span>}
                  <button onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100">
                    <X size={10} />
                  </button>
                </div>
              ))}
              <label className="w-24 h-24 border-2 border-dashed border-border rounded-md flex flex-col items-center justify-center text-xs text-muted-foreground hover:border-primary cursor-pointer">
                <Upload size={18} />
                <span className="mt-1">{uploadingImg ? 'Uploading…' : 'Add'}</span>
                <input type="file" accept="image/*" multiple className="hidden" disabled={uploadingImg} onChange={(e) => e.target.files && uploadImages(e.target.files)} />
              </label>
            </div>
          </div>

          {/* Video */}
          <div className="space-y-2 p-3 bg-muted/30 rounded-md">
            <label className="text-xs text-muted-foreground font-medium">Product video (optional, MP4/MOV, max 50MB)</label>
            <div className="flex items-center gap-3">
              {editing.video_url && (
                <video src={editing.video_url} className="w-24 h-16 object-cover rounded bg-muted" muted />
              )}
              <label className="btn-outline text-xs py-2 px-3 cursor-pointer">
                <Upload size={14} /> {uploadingVideo ? 'Uploading…' : (editing.video_url ? 'Replace video' : 'Upload video')}
                <input type="file" accept="video/mp4,video/quicktime,video/*" className="hidden" disabled={uploadingVideo} onChange={(e) => e.target.files?.[0] && uploadVideo(e.target.files[0])} />
              </label>
              {editing.video_url && (
                <button onClick={() => setEditing({ ...editing, video_url: '', video_thumbnail: '' })} className="text-xs text-destructive">Remove</button>
              )}
            </div>
          </div>

          {editing.type === 'affiliate' && (
            <div>
              <label className="text-xs text-muted-foreground font-medium block mb-1">Amazon URL</label>
              <input className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background" value={editing.amazon_url} onChange={(e) => setEditing({ ...editing, amazon_url: e.target.value })} />
            </div>
          )}

          {editing.type === 'digital' && (
            <div className="space-y-2 p-3 bg-muted/50 rounded-md">
              <label className="text-xs text-muted-foreground font-medium">Digital file (SVG / ZIP / PDF) — delivered instantly after purchase</label>
              <div className="flex items-center gap-3">
                {editing.digital_storage_path && (
                  <span className="text-xs text-primary flex items-center gap-1">
                    <FileDown size={14} /> {editing.digital_storage_path.split('/').pop()}
                  </span>
                )}
                <label className="btn-outline text-xs py-2 px-3 cursor-pointer">
                  <Upload size={14} /> {uploadingFile ? 'Uploading…' : (editing.digital_storage_path ? 'Replace file' : 'Upload SVG/ZIP')}
                  <input type="file" accept=".svg,.zip,.pdf,.png,.dxf" className="hidden" disabled={uploadingFile} onChange={(e) => e.target.files?.[0] && uploadDigitalFile(e.target.files[0])} />
                </label>
              </div>
              <input className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background" placeholder="Formats included (e.g. SVG, PNG, DXF, PDF)" value={editing.digital_formats} onChange={(e) => setEditing({ ...editing, digital_formats: e.target.value })} />
            </div>
          )}

          {/* Personalization */}
          <div className="p-3 bg-muted/30 rounded-md space-y-2">
            <label className="flex items-center gap-2 text-sm cursor-pointer font-medium">
              <input type="checkbox" checked={editing.personalization_enabled} onChange={(e) => setEditing({ ...editing, personalization_enabled: e.target.checked })} />
              Enable customer personalization (text input on product page)
            </label>
            {editing.personalization_enabled && (
              <div className="grid grid-cols-2 gap-3 pl-6">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Field label</label>
                  <input className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background" value={editing.personalization_label || ''} onChange={(e) => setEditing({ ...editing, personalization_label: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Max characters</label>
                  <input type="number" className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background" value={editing.personalization_max_chars || 100} onChange={(e) => setEditing({ ...editing, personalization_max_chars: parseInt(e.target.value) || 100 })} />
                </div>
              </div>
            )}
          </div>

          {/* SEO */}
          <details className="p-3 bg-muted/30 rounded-md">
            <summary className="text-sm font-medium cursor-pointer">SEO meta tags</summary>
            <div className="mt-3 space-y-2">
              <input className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background" placeholder="Meta title (max 60 chars)" maxLength={60} value={editing.meta_title} onChange={(e) => setEditing({ ...editing, meta_title: e.target.value })} />
              <textarea className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background" rows={2} placeholder="Meta description (max 160 chars)" maxLength={160} value={editing.meta_description} onChange={(e) => setEditing({ ...editing, meta_description: e.target.value })} />
            </div>
          </details>

          <div className="flex gap-2 pt-2 border-t border-border">
            <button onClick={save} className="btn-primary text-sm py-2 px-4">Save product</button>
            <button onClick={() => setEditing(null)} className="btn-outline text-sm py-2 px-4">Cancel</button>
          </div>
        </div>
      )}

      {/* Blog generation panel */}
      {blogPanel && (
        <div className="fixed inset-0 bg-foreground/40 z-50 flex items-center justify-center p-4" onClick={() => setBlogPanel(null)}>
          <div className="bg-card rounded-xl p-6 max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Generate AI blog for "{blogPanel.title}"</h3>
              <button onClick={() => setBlogPanel(null)}><X size={18} /></button>
            </div>
            <p className="text-xs text-muted-foreground mb-4">Pick a language. The post is auto-published with SEO meta and linked to this product.</p>
            <div className="grid grid-cols-2 gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => generateBlog(blogPanel, lang.code)}
                  disabled={!!blogLoading}
                  className="flex items-center justify-between px-3 py-2 border border-border rounded-md hover:border-primary/40 text-sm disabled:opacity-50"
                >
                  <span>{lang.label}</span>
                  {blogLoading === lang.code && <span className="text-xs text-primary">…</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {filtered.map((p) => (
          <div key={p.id} className="product-card flex items-center gap-4">
            <img src={p.images?.[0] || '/placeholder.svg'} alt="" className="w-14 h-14 rounded object-cover bg-muted" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium text-foreground truncate">{p.title}</p>
                {p.is_bestseller && <span className="text-[10px] px-1.5 py-0.5 bg-primary text-primary-foreground rounded-full">Bestseller</span>}
                {p.is_featured && <span className="text-[10px] px-1.5 py-0.5 bg-foreground text-background rounded-full">Featured</span>}
                {p.is_recommended && <span className="text-[10px] px-1.5 py-0.5 bg-secondary text-secondary-foreground rounded-full">Recommended</span>}
              </div>
              <p className="text-xs text-muted-foreground">
                {p.type} · ${Number(p.price).toFixed(2)} · {p.status?.replace('_', ' ')} · stock {p.stock_quantity ?? 0}
                {(p.stock_quantity ?? 0) > 0 && (p.stock_quantity ?? 0) <= (p.low_stock_threshold ?? 5) && (
                  <span className="ml-2 text-destructive">⚠ Low stock</span>
                )}
              </p>
            </div>
            <button onClick={() => quickToggle(p, 'is_featured')} className={`p-1.5 rounded ${p.is_featured ? 'text-foreground bg-secondary' : 'text-muted-foreground hover:bg-muted'}`} title="Toggle featured">
              <Star size={14} />
            </button>
            <button onClick={() => quickToggle(p, 'is_bestseller')} className={`p-1.5 rounded ${p.is_bestseller ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:bg-muted'}`} title="Toggle bestseller">
              <Flame size={14} />
            </button>
            <button onClick={() => setBlogPanel(p)} className="text-muted-foreground hover:text-primary p-1.5 rounded hover:bg-muted" title="Generate AI blog">
              <Languages size={16} />
            </button>
            <a href={`/products/${p.slug}`} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground p-1.5"><FileText size={16} /></a>
            <button onClick={() => copyListing(p)} className="text-muted-foreground hover:text-primary p-1.5" title="Duplicate listing"><Copy size={16} /></button>
            <button onClick={() => startEdit(p)} className="text-muted-foreground hover:text-primary p-1.5"><Edit size={16} /></button>
            <button onClick={() => remove(p.id)} className="text-muted-foreground hover:text-destructive p-1.5"><Trash2 size={16} /></button>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-muted-foreground text-sm">No products in this view.</p>}
      </div>
    </AdminLayout>
  );
}
