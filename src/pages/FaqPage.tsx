import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Link } from 'react-router-dom';

const faqs = [
  {
    q: 'What materials are your stencils made from?',
    a: 'Our reusable stencils are laser-cut from 7-mil food-safe Mylar — durable, flexible, and easy to clean. Wood stencils are cut from premium birch plywood. Custom orders may use thicker Mylar or vinyl on request.',
  },
  {
    q: 'How do I clean and reuse my stencil?',
    a: 'Rinse with warm soapy water immediately after use, pat dry with a soft cloth, and store flat. Avoid harsh scrubbing or solvents — with proper care, our Mylar stencils last for hundreds of uses.',
  },
  {
    q: 'Do you accept custom or personalized orders?',
    a: 'Absolutely — custom stencils are one of our specialties! Send us your logo, text, or design through our Contact page or WhatsApp. We\'ll quote you within 24 hours. Most custom orders ship in 3–5 business days.',
  },
  {
    q: 'What file formats do digital downloads include?',
    a: 'Each digital purchase includes SVG, PNG (transparent), DXF, and PDF formats — compatible with Cricut, Silhouette, Glowforge, xTool, and most laser/cutting software.',
  },
  {
    q: 'Can I use your designs commercially?',
    a: 'Yes! All digital files include a small-business commercial license. You may sell finished physical products made with our designs (up to 200 units per design). Mass production, file resale, or sharing the digital file is not permitted.',
  },
  {
    q: 'When will I receive my digital download?',
    a: 'Instantly. After checkout, your download links appear on the order confirmation page and are emailed to you. Links remain valid for 30 days and allow up to 5 downloads.',
  },
  {
    q: 'How long does shipping take?',
    a: 'Canada: 3–7 business days. USA: 5–10 business days. International: 10–21 business days. Processing takes 1–3 business days before shipment. See our Shipping page for full details.',
  },
  {
    q: 'Do you offer wholesale pricing?',
    a: 'Yes — for orders of 25+ stencils or recurring business accounts, please contact us for wholesale rates.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit and debit cards via Stripe, plus PayPal at checkout. All transactions are encrypted and secure.',
  },
  {
    q: 'My stencil arrived damaged — what do I do?',
    a: 'We\'re sorry! Send a photo to diystencil@gmail.com within 7 days of delivery and we\'ll send a free replacement or full refund — no return needed.',
  },
];

export default function FaqPage() {
  return (
    <div className="container-page py-12 md:py-16 max-w-3xl">
      <header>
        <p className="text-sm font-medium text-primary uppercase tracking-wider">Help Center</p>
        <h1 className="mt-2 text-4xl md:text-5xl font-bold text-foreground">Frequently asked questions</h1>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          Everything you need to know about our stencils, digital files, shipping, and custom orders.
          Can't find what you're looking for? <Link to="/contact" className="text-primary underline">Contact us</Link>.
        </p>
      </header>

      <Accordion type="single" collapsible className="mt-10">
        {faqs.map((f, i) => (
          <AccordionItem key={i} value={`item-${i}`}>
            <AccordionTrigger className="text-left text-base font-medium text-foreground hover:no-underline">
              {f.q}
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
              {f.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="mt-12 rounded-lg border border-border bg-secondary/40 p-6 text-center">
        <h3 className="font-semibold text-foreground">Still have questions?</h3>
        <p className="mt-2 text-sm text-muted-foreground">We typically reply within 24 hours.</p>
        <Link to="/contact" className="mt-4 inline-flex items-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
          Get in touch →
        </Link>
      </div>
    </div>
  );
}
