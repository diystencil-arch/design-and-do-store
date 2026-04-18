import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Edit } from 'lucide-react';

interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  is_published: boolean;
  published_at: string | null;
}

const empty = { title: '', slug: '', excerpt: '', content: '', cover_image: '', is_published: false };

export default function AdminBlog() {
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [editing, setEditing] = useState<typeof empty & { id?: string } | null>(null);

  const load = () => {
    supabase.from('blog_posts').select('*').order('created_at', { ascending: false })
      .then(({ data }) => setPosts((data || []) as Post[]));
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing) return;
    const slug = editing.slug || editing.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const payload: any = {
      title: editing.title, slug, excerpt: editing.excerpt, content: editing.content,
      cover_image: editing.cover_image || null, is_published: editing.is_published,
      published_at: editing.is_published ? new Date().toISOString() : null,
    };
    if (editing.id) {
      const { error } = await supabase.from('blog_posts').update(payload).eq('id', editing.id);
      if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    } else {
      const { error } = await supabase.from('blog_posts').insert(payload);
      if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    }
    toast({ title: 'Saved' });
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this post?')) return;
    await supabase.from('blog_posts').delete().eq('id', id);
    load();
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="section-heading">Blog posts</h1>
        <button onClick={() => setEditing({ ...empty })} className="btn-primary text-sm py-2 px-4">
          <Plus size={14} /> New post
        </button>
      </div>

      {editing && (
        <div className="product-card mb-6 space-y-3">
          <input className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background" placeholder="Title" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
          <input className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background" placeholder="Slug (auto if blank)" value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} />
          <input className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background" placeholder="Cover image URL" value={editing.cover_image} onChange={(e) => setEditing({ ...editing, cover_image: e.target.value })} />
          <textarea className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background" rows={2} placeholder="Excerpt (short summary)" value={editing.excerpt} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} />
          <textarea className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background" rows={10} placeholder="Content (markdown supported)" value={editing.content} onChange={(e) => setEditing({ ...editing, content: e.target.value })} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={editing.is_published} onChange={(e) => setEditing({ ...editing, is_published: e.target.checked })} />
            Published
          </label>
          <div className="flex gap-2">
            <button onClick={save} className="btn-primary text-sm py-2 px-4">Save</button>
            <button onClick={() => setEditing(null)} className="btn-outline text-sm py-2 px-4">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {posts.map((p) => (
          <div key={p.id} className="product-card flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{p.title}</p>
              <p className="text-xs text-muted-foreground">{p.is_published ? 'Published' : 'Draft'}</p>
            </div>
            <button onClick={() => setEditing({
              id: p.id, title: p.title, slug: p.slug, excerpt: p.excerpt || '',
              content: p.content, cover_image: p.cover_image || '', is_published: p.is_published,
            })} className="text-muted-foreground hover:text-primary"><Edit size={16} /></button>
            <button onClick={() => remove(p.id)} className="text-muted-foreground hover:text-destructive"><Trash2 size={16} /></button>
          </div>
        ))}
        {posts.length === 0 && <p className="text-muted-foreground text-sm">No posts yet.</p>}
      </div>
    </AdminLayout>
  );
}
