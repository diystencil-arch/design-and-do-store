// PayPal: create order — server computes total from products in DB (never trust client price)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PAYPAL_MODE = (Deno.env.get('PAYPAL_MODE') || 'sandbox').toLowerCase();
const PAYPAL_BASE = PAYPAL_MODE === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';

async function getAccessToken() {
  const id = Deno.env.get('PAYPAL_CLIENT_ID');
  const secret = Deno.env.get('PAYPAL_SECRET');
  if (!id || !secret) throw new Error('PayPal credentials missing');
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + btoa(`${id}:${secret}`),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  const j = await res.json();
  if (!res.ok) throw new Error('PayPal auth failed: ' + JSON.stringify(j));
  return j.access_token as string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const { items, currency = 'USD', promoCode } = await req.json();
    if (!Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: 'No items' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Fetch real prices from DB
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const ids = items.map((i: any) => i.productId).filter(Boolean);
    const dbRes = await fetch(`${SUPABASE_URL}/rest/v1/products?id=in.(${ids.join(',')})&select=id,price,title,type`, {
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
    });
    const products = await dbRes.json();
    const byId: Record<string, any> = {};
    for (const p of products) byId[p.id] = p;

    let subtotal = 0;
    const lineItems: any[] = [];
    for (const it of items) {
      const p = byId[it.productId];
      if (!p) continue;
      const qty = Math.max(1, Math.min(99, Number(it.quantity) || 1));
      subtotal += Number(p.price) * qty;
      lineItems.push({
        name: String(p.title).slice(0, 127),
        quantity: String(qty),
        unit_amount: { currency_code: currency, value: Number(p.price).toFixed(2) },
        category: p.type === 'digital' ? 'DIGITAL_GOODS' : 'PHYSICAL_GOODS',
      });
    }

    // Validate promo
    let discountAmount = 0;
    if (promoCode) {
      const prRes = await fetch(`${SUPABASE_URL}/rest/v1/promo_codes?code=eq.${encodeURIComponent(promoCode)}&is_active=eq.true&select=*`, {
        headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
      });
      const [pc] = await prRes.json();
      const now = new Date();
      const valid = pc
        && (!pc.starts_at || new Date(pc.starts_at) <= now)
        && (!pc.ends_at || new Date(pc.ends_at) >= now)
        && (!pc.max_uses || pc.used_count < pc.max_uses)
        && subtotal >= Number(pc.min_subtotal || 0);
      if (valid) {
        const d = pc.discount_type === 'percent' ? subtotal * Number(pc.discount_value) / 100 : Number(pc.discount_value);
        discountAmount = Math.min(d, subtotal);
      }
    }
    const total = (subtotal - discountAmount).toFixed(2);

    const token = await getAccessToken();
    const breakdown: any = { item_total: { currency_code: currency, value: subtotal.toFixed(2) } };
    if (discountAmount > 0) breakdown.discount = { currency_code: currency, value: discountAmount.toFixed(2) };
    const orderRes = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: currency,
            value: total,
            breakdown,
          },
          items: lineItems,
        }],
      }),
    });
    const order = await orderRes.json();
    if (!orderRes.ok) {
      console.error('PayPal order error', order);
      return new Response(JSON.stringify({ error: 'PayPal order failed', details: order }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify({ id: order.id }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
