export default function BlogPage() {
  const posts = [
    { slug: 'stencil-beginners-guide', title: '5 Tips for Stencil Beginners', excerpt: 'Starting your stencil journey? Here are the essentials every crafter should know.', date: '2 Apr 2026' },
    { slug: 'wall-stencil-tutorial', title: 'How to Stencil an Accent Wall', excerpt: 'Transform any room with a stunning stencilled accent wall — step by step.', date: '28 Mar 2026' },
    { slug: 'svg-cricut-guide', title: 'Using SVG Files with Your Cricut', excerpt: 'A complete guide to importing and cutting our SVG designs on Cricut machines.', date: '20 Mar 2026' },
  ];

  return (
    <div className="container-page py-10">
      <h1 className="section-heading mb-8">Blog</h1>
      <div className="grid md:grid-cols-3 gap-6">
        {posts.map((post) => (
          <article key={post.slug} className="product-card">
            <div className="aspect-video bg-muted rounded-lg mb-4" />
            <p className="text-xs text-muted-foreground mb-2">{post.date}</p>
            <h2 className="text-foreground font-medium mb-2">{post.title}</h2>
            <p className="text-sm text-muted-foreground">{post.excerpt}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
