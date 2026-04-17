import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export default function AcrylicPage() {
  return (
    <div className="container-page py-12 md:py-16">
      <header className="max-w-2xl">
        <p className="text-sm font-medium text-primary uppercase tracking-wider">Laser Cut</p>
        <h1 className="mt-2 text-4xl md:text-5xl font-bold text-foreground">Acrylic cutouts</h1>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          Mirror, clear, frosted and coloured acrylic — flame-polished edges, peel-off film and ready
          to display. Perfect for cake toppers, wedding signs, keychains and home decor.
        </p>
      </header>

      <div className="mt-10 grid sm:grid-cols-3 gap-4">
        {[
          { title: '3 mm clear / frosted', body: 'Crystal-clear or elegant frosted finish.' },
          { title: 'Mirror gold / silver / rose', body: 'Premium cast mirror acrylic for luxe events.' },
          { title: 'Coloured & glitter', body: '20+ colours including pastels and glitter.' },
        ].map((c) => (
          <div key={c.title} className="rounded-lg border border-border bg-card p-5">
            <Sparkles size={20} className="text-primary" />
            <h3 className="mt-3 font-semibold text-foreground">{c.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{c.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-lg border border-border bg-secondary/40 p-8 text-center">
        <h2 className="text-2xl font-bold text-foreground">Catalogue coming soon</h2>
        <p className="mt-2 text-muted-foreground">Custom orders welcome — send your design and we'll quote within 24 hours.</p>
        <Link to="/contact" className="mt-5 inline-flex items-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
          Request a quote →
        </Link>
      </div>
    </div>
  );
}
