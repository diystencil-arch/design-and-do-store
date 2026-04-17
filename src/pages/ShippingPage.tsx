import { Truck, Package, Globe, Clock } from 'lucide-react';

export default function ShippingPage() {
  return (
    <div className="container-page py-12 md:py-16 max-w-4xl">
      <header>
        <p className="text-sm font-medium text-primary uppercase tracking-wider">Shipping</p>
        <h1 className="mt-2 text-4xl md:text-5xl font-bold text-foreground">Shipping information</h1>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          We ship from Kitchener, Ontario, Canada to customers worldwide. All physical orders are carefully
          packaged to arrive flat and undamaged.
        </p>
      </header>

      {/* Quick stats */}
      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Clock, title: 'Processing', body: '1–3 business days' },
          { icon: Truck, title: 'Canada', body: '3–7 business days' },
          { icon: Package, title: 'USA', body: '5–10 business days' },
          { icon: Globe, title: 'International', body: '10–21 business days' },
        ].map((c) => (
          <div key={c.title} className="rounded-lg border border-border bg-card p-5">
            <c.icon size={22} className="text-primary" />
            <h3 className="mt-3 font-semibold text-foreground">{c.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{c.body}</p>
          </div>
        ))}
      </div>

      {/* Rates */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-foreground">Shipping rates</h2>
        <div className="mt-4 overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Destination</th>
                <th className="px-4 py-3 text-left font-semibold">Standard</th>
                <th className="px-4 py-3 text-left font-semibold">Tracked</th>
                <th className="px-4 py-3 text-left font-semibold">Free shipping over</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card text-muted-foreground">
              <tr>
                <td className="px-4 py-3 text-foreground font-medium">Canada</td>
                <td className="px-4 py-3">CA$4.99</td>
                <td className="px-4 py-3">CA$8.99</td>
                <td className="px-4 py-3">CA$50</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-foreground font-medium">United States</td>
                <td className="px-4 py-3">CA$6.99</td>
                <td className="px-4 py-3">CA$12.99</td>
                <td className="px-4 py-3">CA$75</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-foreground font-medium">International</td>
                <td className="px-4 py-3">CA$14.99</td>
                <td className="px-4 py-3">CA$24.99</td>
                <td className="px-4 py-3">CA$120</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Rates calculated at checkout based on destination and weight. Customers are responsible for any
          customs duties or import taxes.
        </p>
      </section>

      {/* Policies */}
      <section className="mt-12 space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Order processing</h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Standard stencils ship within 1–3 business days. Custom and personalized orders typically take 3–5
            business days to produce before shipping. You'll receive a tracking email as soon as your package
            is on its way.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-foreground">Digital downloads</h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Digital products are delivered instantly via email and your account dashboard — no shipping
            required. Download links are valid for 30 days with a 5-download limit per file.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-foreground">Lost or delayed packages</h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            If your package hasn't arrived within the estimated window, please contact us at{' '}
            <a href="mailto:diystencil@gmail.com" className="text-primary underline">diystencil@gmail.com</a>.
            For tracked shipments, we'll open a claim with the carrier. For untracked standard shipments,
            we'll work with you on a fair resolution.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-foreground">Address accuracy</h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Please double-check your shipping address at checkout. We are not responsible for packages sent
            to incorrect addresses provided by the buyer. If a package is returned to us as undeliverable,
            re-shipping fees will apply.
          </p>
        </div>
      </section>
    </div>
  );
}
