import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FreebiePage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="container-page py-20 text-center max-w-lg mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <span className="badge-tag inline-flex items-center gap-1 mb-4">
          <Sparkles size={12} /> 100% free
        </span>
        <h1 className="section-heading mb-4">Get a free stencil SVG</h1>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          Enter your email and we'll send you a beautiful stencil design in SVG, PNG, and DXF formats — completely free. No strings attached.
        </p>

        {submitted ? (
          <div className="bg-success/10 text-success rounded-xl p-6">
            <p className="font-medium text-lg">✨ Check your inbox!</p>
            <p className="text-sm mt-2 opacity-80">Your free SVG is on its way.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-border rounded-md text-sm bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <button
              onClick={() => email && setSubmitted(true)}
              className="btn-primary w-full"
            >
              Send me the freebie →
            </button>
            <p className="text-xs text-muted-foreground">We respect your privacy. Unsubscribe anytime.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
