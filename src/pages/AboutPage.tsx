import { Star, Package, Award, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="container-page py-16 md:py-24 text-center max-w-3xl">
        <p className="text-sm font-medium text-primary uppercase tracking-wider">Our story</p>
        <h1 className="mt-2 text-4xl md:text-6xl font-bold text-foreground">
          Handmade in Kitchener, loved worldwide.
        </h1>
        <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
          DIY Stencil started in 2017 as a small home workshop in Kitchener, Ontario. Eight years and over
          125,000 happy customers later, we're still passionate about helping makers bring their creative
          ideas to life — one stencil at a time.
        </p>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-card">
        <div className="container-page py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { icon: Package, value: '125,800+', label: 'Orders shipped' },
            { icon: Star, value: '4.9 / 5', label: 'From 21,600+ reviews' },
            { icon: Award, value: '8 years', label: 'Trusted craft brand' },
            { icon: Heart, value: '1,200+', label: 'Unique designs' },
          ].map((s) => (
            <div key={s.label}>
              <s.icon className="mx-auto text-primary" size={28} />
              <div className="mt-3 text-2xl md:text-3xl font-bold text-foreground">{s.value}</div>
              <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="container-page py-16 max-w-3xl space-y-10">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">What we make</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            We design and laser-cut reusable Mylar stencils, wood stencils, sprinkle stencils for baking,
            silicone molds, and craft tools. We also offer instant-download SVG and digital files for Cricut,
            Silhouette, Glowforge, and other cutting machines. From sprinkle patterns and herb labels to
            custom business logos and wall stencils — if you can dream it, we can cut it.
          </p>
        </div>

        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">Custom orders welcome</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Custom stencils are our specialty. Send us your logo, text, or design idea and we'll quote you
            within 24 hours. Whether it's a single wedding cake stencil or a wholesale order for your bakery
            or business, we love bringing personalized projects to life.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link to="/contact" className="inline-flex items-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
              Request a custom order →
            </Link>
            <a
              href="https://www.etsy.com/shop/diystencilca"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-[#F1641E] bg-[#F1641E]/5 px-5 py-2.5 text-sm font-semibold text-[#F1641E] hover:bg-[#F1641E]/10"
            >
              Visit our Etsy shop →
            </a>
          </div>
        </div>

        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">Our promise</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Every stencil is cut, inspected, and packed by hand. We use food-safe Mylar, premium birch
            plywood, and sustainable packaging. If you're ever unhappy with your order, we'll make it right —
            that's been our promise since day one.
          </p>
        </div>
      </section>
    </div>
  );
}
