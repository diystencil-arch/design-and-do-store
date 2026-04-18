import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Search } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { getProductsByType, products } from '@/data/products';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function Index() {
  const affiliates = getProductsByType('affiliate').slice(0, 4);
  const physicals = getProductsByType('physical').slice(0, 4);
  const digitals = getProductsByType('digital').slice(0, 4);
  const [freebieEmail, setFreebieEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const navigate = useNavigate();

  const searchResults = searchQuery.trim().length > 1
    ? products.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 5)
    : [];

  return (
    <div>
      {/* Hero */}
      <section className="container-page py-20 md:py-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <img
            src="/images/logo-banner.png"
            alt="DIY Stencil - Do It Yourself"
            className="h-16 md:h-20 mx-auto mb-6 object-contain"
          />
          <span className="badge-tag mb-4 inline-flex items-center gap-1">
            <Sparkles size={12} /> New designs weekly
          </span>
          <h1 className="text-4xl md:text-6xl font-medium text-foreground leading-tight mt-4">
            Create. Craft. Inspire.
          </h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Handmade stencils, instant SVG downloads, and curated craft tools — everything you need to bring your creative vision to life.
          </p>

          {/* Big Search Bar */}
          <div className="mt-8 max-w-2xl mx-auto relative">
            <div className={`flex items-center bg-card border-2 rounded-xl overflow-hidden transition-colors ${searchFocused ? 'border-primary shadow-lg shadow-primary/10' : 'border-border'}`}>
              <Search size={20} className="ml-4 text-muted-foreground flex-shrink-0" />
              <input
                type="text"
                placeholder="Search stencils, SVG files, craft tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                className="flex-1 px-4 py-4 text-base bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <button
                onClick={() => searchQuery.trim() && navigate(`/stencils?q=${encodeURIComponent(searchQuery)}`)}
                className="btn-primary rounded-none rounded-r-[10px] px-6 py-4 text-sm"
              >
                Search
              </button>
            </div>

            {/* Search Dropdown */}
            {searchFocused && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
                {searchResults.map((p) => (
                  <Link
                    key={p.id}
                    to={`/product/${p.slug}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors"
                  >
                    <img src={p.images[0]} alt={p.title} className="w-10 h-10 rounded-md object-cover bg-muted" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-foreground">{p.title}</p>
                      <p className="text-xs text-muted-foreground capitalize">{p.type} · ${p.price.toFixed(2)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <Link to="/stencils" className="btn-primary">
              Shop Stencils <ArrowRight size={16} />
            </Link>
            <Link to="/svg" className="btn-outline">
              Browse SVG Files
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Trending tools */}
      <section className="container-page mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-heading">Trending craft tools</h2>
          <Link to="/tools" className="text-sm text-primary hover:underline flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {affiliates.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Best selling stencils */}
      <section className="container-page mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-heading">Best selling stencils</h2>
          <Link to="/stencils" className="text-sm text-primary hover:underline flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {physicals.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* New SVG designs */}
      <section className="container-page mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-heading">New SVG designs</h2>
          <Link to="/svg" className="text-sm text-primary hover:underline flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {digitals.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Email capture banner */}
      <section className="container-page mb-16">
        <div className="bg-primary rounded-xl p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-medium text-primary-foreground mb-3">
            Get a free SVG design
          </h2>
          <p className="text-primary-foreground/70 mb-6 max-w-md mx-auto">
            Drop your email below and we'll send you a beautiful stencil SVG — completely free.
          </p>
          {submitted ? (
            <p className="text-primary-foreground font-medium">✨ Check your inbox!</p>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="your@email.com"
                value={freebieEmail}
                onChange={(e) => setFreebieEmail(e.target.value)}
                className="flex-1 px-4 py-3 rounded-md bg-primary-foreground text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={() => freebieEmail && setSubmitted(true)}
                className="bg-card text-primary px-6 py-3 rounded-md font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
              >
                Send me the freebie
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
