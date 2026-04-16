import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-border mt-20">
      <div className="container-page py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="text-lg font-semibold text-foreground">
              DIY<span className="text-accent">Stencil</span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Handmade stencils, digital SVG designs, and curated craft tools for creative makers.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">Shop</h4>
            <div className="flex flex-col gap-2">
              <Link to="/stencils" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Stencils</Link>
              <Link to="/svg" className="text-sm text-muted-foreground hover:text-foreground transition-colors">SVG Files</Link>
              <Link to="/tools" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Craft Tools</Link>
              <Link to="/freebie" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Free SVG</Link>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">Support</h4>
            <div className="flex flex-col gap-2">
              <span className="text-sm text-muted-foreground">Contact Us</span>
              <span className="text-sm text-muted-foreground">FAQs</span>
              <span className="text-sm text-muted-foreground">Shipping Info</span>
              <span className="text-sm text-muted-foreground">Returns</span>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">Stay in the loop</h4>
            <p className="text-sm text-muted-foreground mb-3">Get a free SVG when you subscribe.</p>
            <Link to="/freebie" className="btn-primary text-sm py-2 px-4">
              Get Free SVG →
            </Link>
          </div>
        </div>
        <div className="border-t border-border mt-10 pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} DIY Stencil. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
