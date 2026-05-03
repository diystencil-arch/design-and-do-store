import { Link } from 'react-router-dom';
import { ShoppingBag, Search, User, Menu, X, Heart, MessageCircle } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { useState } from 'react';

const navLinks = [
  { to: '/tools', label: 'Tools' },
  { to: '/stencils', label: 'Stencils' },
  { to: '/wood', label: 'Wood' },
  { to: '/acrylic', label: 'Acrylic' },
  { to: '/svg', label: 'SVG Files' },
  { to: '/blog', label: 'Blog' },
];

const CUSTOM_ORDER_WA = 'https://wa.me/16475724095?text=' + encodeURIComponent('Hi! I would like to place a custom order. Here are the details:');

export default function Header() {
  const totalItems = useCartStore((s) => s.totalItems());
  const toggleCart = useCartStore((s) => s.toggleCart);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border">
      <div className="container-page flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src="/images/logo-banner.png" alt="DIY Stencil" className="h-9 object-contain" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right icons */}
        <div className="flex items-center gap-3 md:gap-4">
          <a
            href={CUSTOM_ORDER_WA}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#25D366] text-white text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            <MessageCircle size={14} /> Custom Order
          </a>
          <Link to="/freebie" className="hidden md:block">
            <Heart size={20} className="text-muted-foreground hover:text-primary transition-colors" />
          </Link>
          <Link to="/login" className="hidden md:block">
            <User size={20} className="text-muted-foreground hover:text-primary transition-colors" />
          </Link>
          <button onClick={toggleCart} className="relative text-muted-foreground hover:text-primary transition-colors">
            <ShoppingBag size={20} />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-primary-foreground text-[10px] font-semibold rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
          <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card animate-fade-in">
          <nav className="container-page py-4 flex flex-col gap-4">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="text-sm text-foreground py-2"
                onClick={() => setMobileOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            <a
              href={CUSTOM_ORDER_WA}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#25D366] py-2"
              onClick={() => setMobileOpen(false)}
            >
              <MessageCircle size={16} /> Custom Order on WhatsApp
            </a>
            <Link to="/freebie" className="text-sm text-primary font-medium py-2" onClick={() => setMobileOpen(false)}>
              Free SVG ✨
            </Link>
            <Link to="/login" className="text-sm text-foreground py-2" onClick={() => setMobileOpen(false)}>
              Account
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
