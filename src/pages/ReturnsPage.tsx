import { Link } from 'react-router-dom';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function ReturnsPage() {
  return (
    <div className="container-page py-12 md:py-16 max-w-3xl">
      <header>
        <p className="text-sm font-medium text-primary uppercase tracking-wider">Policy</p>
        <h1 className="mt-2 text-4xl md:text-5xl font-bold text-foreground">Returns &amp; refunds</h1>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          We want you to love your DIY Stencil order. If something isn't right, here's how we'll make it right.
        </p>
      </header>

      <div className="mt-10 grid sm:grid-cols-2 gap-4">
        <div className="rounded-lg border border-border bg-card p-5">
          <CheckCircle2 className="text-success" size={22} />
          <h3 className="mt-3 font-semibold text-foreground">Eligible for return</h3>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground list-disc list-inside">
            <li>Unused stencils in original condition</li>
            <li>Damaged or defective items</li>
            <li>Wrong item shipped</li>
          </ul>
        </div>
        <div className="rounded-lg border border-border bg-card p-5">
          <XCircle className="text-destructive" size={22} />
          <h3 className="mt-3 font-semibold text-foreground">Not eligible</h3>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground list-disc list-inside">
            <li>Custom or personalized orders</li>
            <li>Digital downloads (SVG/PNG/DXF)</li>
            <li>Used or damaged-by-buyer items</li>
            <li>Sale or clearance items</li>
          </ul>
        </div>
      </div>

      <section className="mt-12 space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Return window</h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            You have <strong className="text-foreground">14 days from delivery</strong> to request a return.
            Returns must be received within 30 days. Buyers are responsible for return shipping unless the
            item arrived damaged or incorrect.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-foreground">Damaged or defective items</h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Email us within <strong className="text-foreground">7 days of delivery</strong> at{' '}
            <a href="mailto:diystencil@gmail.com" className="text-primary underline">diystencil@gmail.com</a>{' '}
            with photos of the damage and your order number. We'll send a free replacement or issue a full
            refund — no return required.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-foreground">How to start a return</h2>
          <ol className="mt-3 space-y-2 text-muted-foreground list-decimal list-inside">
            <li>Email <a href="mailto:diystencil@gmail.com" className="text-primary underline">diystencil@gmail.com</a> with your order number and reason for return.</li>
            <li>We'll confirm eligibility and provide a return address within 24 hours.</li>
            <li>Ship the item back in its original packaging using a tracked service.</li>
            <li>Once received and inspected (1–3 business days), your refund will be issued to the original payment method.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-foreground">Refund timing</h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Approved refunds appear in your account within <strong className="text-foreground">5–10 business days</strong>,
            depending on your bank or card issuer. Original shipping charges are non-refundable unless the
            return is due to our error.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-foreground">Cancellations</h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Standard orders can be cancelled within 12 hours of purchase. Custom and personalized orders
            cannot be cancelled once production has started.
          </p>
        </div>
      </section>

      <div className="mt-12 rounded-lg border border-border bg-secondary/40 p-6 text-center">
        <h3 className="font-semibold text-foreground">Need to start a return?</h3>
        <p className="mt-2 text-sm text-muted-foreground">Our team will help you within one business day.</p>
        <Link to="/contact" className="mt-4 inline-flex items-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
          Contact support →
        </Link>
      </div>
    </div>
  );
}
