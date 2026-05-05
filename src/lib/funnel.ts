import { supabase } from '@/integrations/supabase/client';

export function getSessionId(): string {
  let sid = localStorage.getItem('sid');
  if (!sid) { sid = crypto.randomUUID(); localStorage.setItem('sid', sid); }
  return sid;
}

export type FunnelEvent = 'view' | 'add_to_cart' | 'checkout_started' | 'checkout_completed';

export async function logFunnel(event: FunnelEvent, productId?: string, metadata?: Record<string, any>) {
  try {
    await supabase.from('funnel_events').insert({
      event_name: event,
      product_id: productId || null,
      session_id: getSessionId(),
      metadata: metadata || null,
    });
    // Also push to GTM dataLayer if present
    (window as any).dataLayer?.push({ event: `funnel_${event}`, productId, ...metadata });
  } catch {}
}
