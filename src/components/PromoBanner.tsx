import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { X } from 'lucide-react';

interface Banner {
  id: string;
  message: string;
  link_url: string | null;
  link_label: string | null;
  bg_color: string | null;
  text_color: string | null;
  position: string;
}

export default function PromoBanner({ position = 'top' }: { position?: 'top' | 'bottom' }) {
  const [banner, setBanner] = useState<Banner | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const now = new Date().toISOString();
    supabase
      .from('promo_banners')
      .select('id, message, link_url, link_label, bg_color, text_color, position')
      .eq('is_active', true)
      .eq('position', position)
      .or(`starts_at.is.null,starts_at.lte.${now}`)
      .or(`ends_at.is.null,ends_at.gte.${now}`)
      .order('sort_order')
      .limit(1)
      .then(({ data }) => {
        if (data && data[0]) {
          setBanner(data[0] as Banner);
          setDismissed(sessionStorage.getItem(`pb_dismiss_${data[0].id}`) === '1');
        }
      });
  }, [position]);

  if (!banner || dismissed) return null;
  return (
    <div
      className="w-full text-center text-sm py-2 px-4 flex items-center justify-center gap-3"
      style={{ backgroundColor: banner.bg_color || '#C4A882', color: banner.text_color || '#fff' }}
    >
      <span>{banner.message}</span>
      {banner.link_url && (
        <a href={banner.link_url} className="underline font-medium">
          {banner.link_label || 'Shop now'} →
        </a>
      )}
      <button
        onClick={() => { sessionStorage.setItem(`pb_dismiss_${banner.id}`, '1'); setDismissed(true); }}
        className="ml-2 opacity-70 hover:opacity-100"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  );
}
