import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';
// lucide-react does not export brand icons; use inline SVGs below

const socials = [
  { href: 'https://www.instagram.com/diystencil', label: 'Instagram', icon: InstagramIcon },
  { href: 'https://www.tiktok.com/@diystencilca', label: 'TikTok', icon: TiktokIcon },
  { href: 'https://www.youtube.com/@ResinMold', label: 'YouTube', icon: YoutubeIcon },
  { href: 'https://www.facebook.com/diystencil', label: 'Facebook', icon: FacebookIcon },
  { href: 'https://www.pinterest.com/diystencil', label: 'Pinterest', icon: PinterestIcon },
  { href: 'https://www.etsy.com/shop/diystencilca', label: 'Etsy', icon: EtsyIcon },
];

function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function FacebookIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M13.5 22v-8h2.7l.4-3.2h-3.1V8.7c0-.9.3-1.6 1.6-1.6h1.7V4.2c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.4H7.4V14h2.7v8h3.4z" />
    </svg>
  );
}
function YoutubeIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23 7.2s-.2-1.6-.9-2.3c-.8-.9-1.8-.9-2.2-1C16.7 3.6 12 3.6 12 3.6s-4.7 0-7.9.3c-.4.1-1.4.1-2.2 1C1.2 5.6 1 7.2 1 7.2S.7 9 .7 10.9v1.7c0 1.9.3 3.7.3 3.7s.2 1.6.9 2.3c.8.9 1.9.9 2.4 1 1.7.2 7.7.3 7.7.3s4.7 0 7.9-.3c.4-.1 1.4-.1 2.2-1 .7-.7.9-2.3.9-2.3s.3-1.8.3-3.7v-1.7c0-1.9-.3-3.7-.3-3.7zM9.7 14.6V8.4l6.1 3.1-6.1 3.1z" />
    </svg>
  );
}

function TiktokIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.92a8.16 8.16 0 0 0 4.77 1.52V7a4.85 4.85 0 0 1-1.84-.31z" />
    </svg>
  );
}
function PinterestIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0a12 12 0 0 0-4.37 23.17c-.1-.94-.2-2.43.04-3.47.22-.94 1.4-6 1.4-6s-.36-.72-.36-1.78c0-1.67.97-2.92 2.18-2.92 1.03 0 1.52.77 1.52 1.7 0 1.03-.66 2.58-1 4.02-.28 1.2.6 2.18 1.79 2.18 2.15 0 3.8-2.27 3.8-5.54 0-2.9-2.08-4.92-5.05-4.92-3.44 0-5.46 2.58-5.46 5.25 0 1.04.4 2.16.9 2.76.1.12.11.22.08.34l-.33 1.36c-.05.22-.17.27-.4.16-1.5-.7-2.43-2.88-2.43-4.64 0-3.78 2.74-7.25 7.91-7.25 4.15 0 7.38 2.96 7.38 6.92 0 4.13-2.6 7.45-6.21 7.45-1.21 0-2.35-.63-2.74-1.37l-.75 2.85c-.27 1.04-1 2.35-1.49 3.15A12 12 0 1 0 12 0z" />
    </svg>
  );
}
function EtsyIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M9.16 4.24v6.16s2.18 0 3.36-.09c.93-.18 1.1-.27 1.28-1.2l.27-1.07h.8l-.13 2.7.13 2.76h-.8l-.27-1.04c-.18-.9-.35-1.04-1.28-1.16-1.18-.13-3.36-.13-3.36-.13v5.16c0 1 .53 1.45 1.7 1.45h3.5c1.1 0 2.18-.1 2.8-1.55l.83-1.84h.7c-.04.36-.5 3.62-.6 4.41 0 0-2.62-.06-3.74-.06H7.34l-3.07.06v-.74l1-.2c.74-.16.92-.36.92-.94V6.07c0-.58-.16-.78-.92-.94l-1-.2v-.74l3.01.05h6.99c1.1 0 3.04-.18 3.04-.18s-.18 1.16-.31 4.04h-.74l-.27-.97c-.27-1.2-.65-1.8-1.4-1.96-.55-.13-1.4-.13-2.5-.13H9.16z" />
    </svg>
  );
}

export default function Footer() {
  const { settings } = useSiteSettings();
  const email = settings.contact_email || 'diystencil@gmail.com';
  return (
    <footer className="border-t border-border mt-20">
      <div className="container-page py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="text-lg font-semibold text-foreground">
              DIY<span className="text-accent">Stencil</span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Handmade stencils, wood &amp; acrylic cutouts, digital SVG designs, and curated craft tools.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {socials.map(({ href, label, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">Shop</h4>
            <div className="flex flex-col gap-2">
              <Link to="/stencils" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Stencils</Link>
              <Link to="/wood" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Wood Cutouts</Link>
              <Link to="/acrylic" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Acrylic Cutouts</Link>
              <Link to="/svg" className="text-sm text-muted-foreground hover:text-foreground transition-colors">SVG Files</Link>
              <Link to="/tools" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Craft Tools</Link>
              
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">Support</h4>
            <div className="flex flex-col gap-2">
              <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact Us</Link>
              <Link to="/faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQs</Link>
              <Link to="/shipping" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Shipping Info</Link>
              <Link to="/returns" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Returns &amp; Refunds</Link>
              <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About Us</Link>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">Get in touch</h4>
            <a href={`mailto:${email}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
              <Mail size={14} /> {email}
            </a>
            <p className="mt-4 text-xs text-muted-foreground">
              Prices in CAD. Auto-converted at checkout based on your location.
            </p>
          </div>
        </div>
        <div className="border-t border-border mt-10 pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} DIY Stencil. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
