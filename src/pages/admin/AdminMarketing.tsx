import AdminLayout from '@/components/AdminLayout';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Users, Gift, Share2 } from 'lucide-react';

export default function AdminMarketing() {
  const [subs, setSubs] = useState(0);
  const [freebiesSent, setFreebiesSent] = useState(0);

  useEffect(() => {
    Promise.all([
      supabase.from('email_subscribers').select('id', { count: 'exact', head: true }),
      supabase.from('email_subscribers').select('id', { count: 'exact', head: true }).eq('freebie_sent', true),
    ]).then(([all, sent]) => {
      setSubs(all.count || 0);
      setFreebiesSent(sent.count || 0);
    });
  }, []);

  return (
    <AdminLayout>
      <h1 className="section-heading mb-2">Marketing</h1>
      <p className="text-sm text-muted-foreground mb-6">Grow your audience and reach.</p>

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div className="product-card">
          <Users className="text-blue-600" size={20} />
          <p className="mt-3 text-2xl font-semibold text-foreground">{subs}</p>
          <p className="text-xs text-muted-foreground">Email subscribers</p>
        </div>
        <div className="product-card">
          <Gift className="text-purple-600" size={20} />
          <p className="mt-3 text-2xl font-semibold text-foreground">{freebiesSent}</p>
          <p className="text-xs text-muted-foreground">Freebies delivered</p>
        </div>
      </div>

      <div className="product-card mb-4">
        <h2 className="font-medium text-foreground mb-2 flex items-center gap-2"><Mail size={16} /> Email campaigns</h2>
        <p className="text-sm text-muted-foreground mb-3">
          Export your subscribers to send a campaign through Mailchimp, Beehiiv, or any email service.
        </p>
        <a href="/admin/subscribers" className="btn-outline text-sm py-2 px-4 inline-block">Manage subscribers →</a>
      </div>

      <div className="product-card">
        <h2 className="font-medium text-foreground mb-2 flex items-center gap-2"><Share2 size={16} /> Social channels</h2>
        <ul className="text-sm space-y-2 text-muted-foreground">
          <li>📷 Instagram — <a href="https://www.instagram.com/diystencil" target="_blank" rel="noreferrer" className="text-primary hover:underline">@diystencil</a></li>
          <li>📘 Facebook — <a href="https://www.facebook.com/diystencil" target="_blank" rel="noreferrer" className="text-primary hover:underline">/diystencil</a></li>
          <li>▶️ YouTube — <a href="https://www.youtube.com/@ResinMold" target="_blank" rel="noreferrer" className="text-primary hover:underline">@ResinMold</a></li>
          <li>🛒 Etsy shop — <a href="https://www.etsy.com/shop/diystencilca" target="_blank" rel="noreferrer" className="text-primary hover:underline">diystencilca</a></li>
        </ul>
      </div>
    </AdminLayout>
  );
}
