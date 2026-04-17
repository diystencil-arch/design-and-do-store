import { Link } from 'react-router-dom';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

export default function ReturnsPage() {
  return (
    <div className="container-page py-12 md:py-16 max-w-3xl">
      <header>
        <p className="text-sm font-medium text-primary uppercase tracking-wider">Policy</p>
        <h1 className="mt-2 text-4xl md:text-5xl font-bold text-foreground">Returns &amp; refunds</h1>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          We want you to love your DIY Stencil order. Please read our policy carefully before purchasing.
        </p>
      </header>

      <div className="mt-8 rounded-lg border border-primary/30 bg-primary/5 p-5 flex gap-3">
        <AlertTriangle className="text-primary shrink-0 mt-0.5" size={20} />
        <div>
          <h3 className="font-semibold text-foreground">No-returns policy</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Because every stencil, wood cutout, acrylic piece and SVG file is made-to-order or instantly
            delivered, we do <strong className="text-foreground">not accept returns or exchanges</strong>.
            Refunds are reviewed on a <strong className="text-foreground">case-by-case basis</strong> for
            damaged, defective or incorrectly shipped items only.
          </p>
        </div>
      </div>

      <div className="mt-8 grid sm:grid-cols-2 gap-4">
        <div className="rounded-lg border border-border bg-card p-5">
          <CheckCircle2 className="text-success" size={22} />
          <h3 className="mt-3 font-semibold text-foreground">Refunds may be considered for</h3>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground list-disc list-inside">
            <li>Items arrived damaged or defective</li>
            <li>Wrong item shipped</li>
            <li>Order lost in transit (tracked shipments)</li>
          </ul>
        </div>
        <div className="rounded-lg border border-border bg-card p-5">
          <XCircle className="text-destructive" size={22} />
          <h3 className="mt-3 font-semibold text-foreground">Not eligible</h3>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground list-disc list-inside">
            <li>Change-of-mind returns</li>
            <li>Custom or personalized orders</li>
            <li>Digital downloads (SVG/PNG/DXF/PDF)</li>
            <li>Used or buyer-damaged items</li>
            <li>Sale or clearance items</li>
          </ul>
        </div>
      </div>

      <section className="mt-12 space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Damage claim window</h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            You have <strong className="text-foreground">7 days from delivery</strong> to report damaged,
            defective or incorrect items. Email{' '}
            <a href="mailto:diystencil@gmail.com" className="text-primary underline">diystencil@gmail.com</a>{' '}
            with your order number and clear photos of the damage and outer packaging. Claims submitted
            after 7 days cannot be honoured.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-foreground">How resolution works</h2>
          <ol className="mt-3 space-y-2 text-muted-foreground list-decimal list-inside">
            <li>Email us within 7 days of delivery with order number and photos.</li>
            <li>We'll review your claim within 1 business day.</li>
            <li>If approved, we'll offer a free replacement, store credit, or full refund — your choice.</li>
            <li>You do <strong className="text-foreground">not</strong> need to ship the item back.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-foreground">Refund timing</h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Approved refunds appear in your account within <strong className="text-foreground">5–10 business days</strong>,
            depending on your bank or card issuer. Refunds are issued in CAD to the original payment method.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-foreground">Cancellations</h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Standard orders can be cancelled within 12 hours of purchase. Custom, personalized, wood and
            acrylic orders cannot be cancelled once production has started.
          </p>
        </div>
      </section>

      <div className="mt-12 rounded-lg border border-border bg-secondary/40 p-6 text-center">
        <h3 className="font-semibold text-foreground">Need to file a damage claim?</h3>
        <p className="mt-2 text-sm text-muted-foreground">Our team will help you within one business day.</p>
        <Link to="/contact" className="mt-4 inline-flex items-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
          Contact support →
        </Link>
      </div>
    </div>
  );
}
