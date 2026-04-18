import { Mail, MessageCircle, MapPin, Clock, Send } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const EMAIL = 'diystencil@gmail.com';
const WHATSAPP = '15197818540';
const WHATSAPP_DISPLAY = '+1 (519) 781-8540';

export default function ContactPage() {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`
    );
    const subject = encodeURIComponent(form.subject || 'Inquiry from DIY Stencil website');
    window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
    setTimeout(() => {
      setSending(false);
      toast({ title: 'Opening your email app', description: 'If nothing happens, please email us directly at ' + EMAIL });
    }, 600);
  };

  return (
    <div className="container-page py-12 md:py-16">
      <header className="max-w-2xl">
        <p className="text-sm font-medium text-primary uppercase tracking-wider">Get in touch</p>
        <h1 className="mt-2 text-4xl md:text-5xl font-bold text-foreground">Contact DIY Stencil</h1>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          Have a question about a product, custom order, or your shipment? We typically reply within 24 hours
          (Mon–Fri). Fastest response is via WhatsApp.
        </p>
      </header>

      <div className="mt-12 grid gap-8 lg:grid-cols-5">
        {/* Contact info */}
        <aside className="lg:col-span-2 space-y-4">
          <a
            href={`https://wa.me/${WHATSAPP}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366]/10 text-[#25D366]">
                <MessageCircle size={20} />
              </span>
              <div>
                <h3 className="font-semibold text-foreground">WhatsApp</h3>
                <p className="mt-1 text-sm text-muted-foreground">{WHATSAPP_DISPLAY}</p>
                <p className="mt-1 text-xs text-primary font-medium">Tap to chat →</p>
              </div>
            </div>
          </a>

          <a
            href={`mailto:${EMAIL}`}
            className="block rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Mail size={20} />
              </span>
              <div>
                <h3 className="font-semibold text-foreground">Email</h3>
                <p className="mt-1 text-sm text-muted-foreground break-all">{EMAIL}</p>
                <p className="mt-1 text-xs text-primary font-medium">Send an email →</p>
              </div>
            </div>
          </a>

          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <MapPin size={20} />
              </span>
              <div>
                <h3 className="font-semibold text-foreground">Location</h3>
                <p className="mt-1 text-sm text-muted-foreground">Kitchener, Ontario, Canada</p>
                <p className="mt-1 text-xs text-muted-foreground">Ships worldwide</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Clock size={20} />
              </span>
              <div>
                <h3 className="font-semibold text-foreground">Hours</h3>
                <p className="mt-1 text-sm text-muted-foreground">Mon–Fri: 9 AM – 6 PM EST</p>
                <p className="mt-1 text-sm text-muted-foreground">Sat: 10 AM – 2 PM EST</p>
              </div>
            </div>
          </div>

          <a
            href="https://www.etsy.com/shop/diystencilca"
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F1641E]/10 text-[#F1641E] font-bold text-lg">
                E
              </span>
              <div>
                <h3 className="font-semibold text-foreground">Visit our Etsy shop</h3>
                <p className="mt-1 text-sm text-muted-foreground">125,800+ sales · 4.9★ rating</p>
                <p className="mt-1 text-xs text-primary font-medium">Shop on Etsy →</p>
              </div>
            </div>
          </a>
        </aside>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-3 rounded-lg border border-border bg-card p-6 md:p-8 space-y-5"
        >
          <h2 className="text-xl font-semibold text-foreground">Send a message</h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Name</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Subject</label>
            <input
              required
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="e.g. Custom stencil request"
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Message</label>
            <textarea
              required
              rows={6}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Tell us what you need — sizes, materials, design references…"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <button
            type="submit"
            disabled={sending}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            <Send size={16} /> {sending ? 'Opening…' : 'Send message'}
          </button>
          <p className="text-xs text-muted-foreground">
            This will open your email app. You can also email us directly at{' '}
            <a href={`mailto:${EMAIL}`} className="text-primary underline">{EMAIL}</a>.
          </p>
        </form>
      </div>
    </div>
  );
}
