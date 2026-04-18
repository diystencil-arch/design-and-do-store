import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image: string | null;
  published_at: string | null;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('blog_posts')
      .select('id, slug, title, excerpt, cover_image, published_at')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .then(({ data }) => {
        setPosts(data || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="container-page py-10">
      <h1 className="section-heading mb-8">Blog</h1>
      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : posts.length === 0 ? (
        <p className="text-muted-foreground">No posts yet — check back soon!</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {posts.map((post) => (
            <article key={post.id} className="product-card">
              {post.cover_image ? (
                <img src={post.cover_image} alt={post.title} className="aspect-video w-full object-cover rounded-lg mb-4" />
              ) : (
                <div className="aspect-video bg-muted rounded-lg mb-4" />
              )}
              {post.published_at && (
                <p className="text-xs text-muted-foreground mb-2">{new Date(post.published_at).toLocaleDateString()}</p>
              )}
              <h2 className="text-foreground font-medium mb-2">{post.title}</h2>
              {post.excerpt && <p className="text-sm text-muted-foreground">{post.excerpt}</p>}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
