import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useSiteSettings } from '@/hooks/useSiteSettings';

interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  published_at: string | null;
  meta_title: string | null;
  meta_description: string | null;
}

export default function BlogPostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const { settings } = useSiteSettings();
  const adHtml = settings.blog_ad_html;

  useEffect(() => {
    if (!slug) return;
    supabase
      .from('blog_posts')
      .select('id, slug, title, excerpt, content, cover_image, published_at, meta_title, meta_description')
      .eq('slug', slug)
      .eq('is_published', true)
      .maybeSingle()
      .then(({ data }) => {
        setPost(data as Post | null);
        setLoading(false);
        if (data?.meta_title) document.title = data.meta_title;
        else if (data?.title) document.title = data.title;
      });
  }, [slug]);

  if (loading) return <div className="container-page py-10"><p className="text-muted-foreground">Loading…</p></div>;
  if (!post) return (
    <div className="container-page py-10">
      <p className="text-muted-foreground">Post not found.</p>
      <Link to="/blog" className="text-primary text-sm hover:underline">← Back to blog</Link>
    </div>
  );

  return (
    <article className="container-page py-10 max-w-3xl">
      <Link to="/blog" className="text-sm text-muted-foreground hover:text-primary">← Back to blog</Link>
      {post.cover_image && (
        <img src={post.cover_image} alt={post.title} className="aspect-video w-full object-cover rounded-lg my-6" />
      )}
      {post.published_at && (
        <p className="text-xs text-muted-foreground">{new Date(post.published_at).toLocaleDateString()}</p>
      )}
      <h1 className="section-heading mt-2 mb-6">{post.title}</h1>
      {post.excerpt && <p className="text-lg text-muted-foreground mb-6">{post.excerpt}</p>}
      <div
        className="prose prose-sm md:prose-base max-w-none text-foreground whitespace-pre-wrap"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
      {adHtml && (
        <aside className="mt-12 border-t border-border pt-8">
          <p className="text-xs text-muted-foreground text-center mb-2 uppercase tracking-wider">Advertisement</p>
          <div className="flex justify-center" dangerouslySetInnerHTML={{ __html: adHtml }} />
        </aside>
      )}
    </article>
  );
}
