// PayPal: capture order, persist order + items, email digital downloads
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PAYPAL_MODE = (Deno.env.get('PAYPAL_MODE') || 'sandbox').toLowerCase();
const PAYPAL_BASE = PAYPAL_MODE === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const RESEND_KEY = Deno.env.get('RESEND_API_KEY');
const LOVABLE_KEY = Deno.env.get('LOVABLE_API_KEY');

async function getAccessToken() {
  const id = Deno.env.get('PAYPAL_CLIENT_ID');
  const secret = Deno.env.get('PAYPAL_SECRET');
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: { Authorization: 'Basic ' + btoa(`${id}:${secret}`), 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
  });
  return (await res.json()).access_token as string;
}

async function sb(path: string, init: RequestInit = {}) {
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(init.headers || {}),
    },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const { paypalOrderId, items, email, shippingAddress, userId } = await req.json();
    if (!paypalOrderId) return new Response(JSON.stringify({ error: 'paypalOrderId required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const token = await getAccessToken();
    const capRes = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${paypalOrderId}/capture`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    const cap = await capRes.json();
    if (!capRes.ok || cap.status !== 'COMPLETED') {
      console.error('Capture failed', cap);
      return new Response(JSON.stringify({ error: 'Capture failed', details: cap }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const captureId = cap.purchase_units?.[0]?.payments?.captures?.[0]?.id;
    const amount = Number(cap.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value || 0);
    const payerEmail = cap.payer?.email_address || email;

    // Re-fetch product prices for line items
    const ids = items.map((i: any) => i.productId);
    const pRes = await sb(`products?id=in.(${ids.join(',')})&select=id,price,title,type`);
    const products = await pRes.json();
    const byId: Record<string, any> = {};
    for (const p of products) byId[p.id] = p;

    let subtotal = 0;
    for (const it of items) {
      const p = byId[it.productId];
      if (p) subtotal += Number(p.price) * Number(it.quantity || 1);
    }

    // Create order
    const orderRes = await sb('orders', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId || null,
        guest_email: payerEmail,
        status: 'paid',
        payment_provider: 'paypal',
        paypal_order_id: paypalOrderId,
        paypal_capture_id: captureId,
        subtotal,
        shipping_cost: 0,
        total: amount,
        shipping_address: shippingAddress || null,
      }),
    });
    const [order] = await orderRes.json();

    // Create order items
    const orderItems = items.map((it: any) => {
      const p = byId[it.productId];
      return {
        order_id: order.id,
        product_id: it.productId,
        variant_id: it.variantId || null,
        product_title: p?.title || it.title || 'Item',
        product_type: p?.type || 'physical',
        quantity: Number(it.quantity || 1),
        unit_price: Number(p?.price || 0),
      };
    });
    const itemsRes = await sb('order_items', { method: 'POST', body: JSON.stringify(orderItems) });
    const createdItems = await itemsRes.json();

    // Digital downloads — create token rows + email
    const digitalLinks: { title: string; url: string }[] = [];
    for (const ci of createdItems) {
      if (ci.product_type === 'digital') {
        const dlRes = await sb('digital_downloads', {
          method: 'POST',
          body: JSON.stringify({
            order_item_id: ci.id,
            user_id: userId || null,
            guest_email: payerEmail,
          }),
        });
        const [dl] = await dlRes.json();
        if (dl?.download_token) {
          const origin = req.headers.get('origin') || req.headers.get('referer')?.replace(/\/$/, '') || '';
          const url = `${origin}/download?token=${dl.download_token}`;
          digitalLinks.push({ title: ci.product_title, url });
        }
      }
    }

    // Send confirmation email via Resend gateway
    if (RESEND_KEY && LOVABLE_KEY && payerEmail) {
      const dlHtml = digitalLinks.length
        ? `<h3>Your digital downloads</h3><ul>${digitalLinks.map(d => `<li><a href="${d.url}">${d.title}</a> (link expires in 72h, 5 downloads)</li>`).join('')}</ul>`
        : '';
      await fetch('https://connector-gateway.lovable.dev/resend/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${LOVABLE_KEY}`,
          'X-Connection-Api-Key': RESEND_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'DIY Stencil <onboarding@resend.dev>',
          to: [payerEmail],
          subject: `Order confirmed — #${String(order.id).slice(0, 8)}`,
          html: `<h2>Thanks for your order!</h2><p>Order total: <strong>$${amount.toFixed(2)}</strong></p>${dlHtml}<p>We'll email tracking details once your physical items ship.</p>`,
        }),
      }).catch(e => console.error('Email failed', e));

      // Notify admin
      await fetch('https://connector-gateway.lovable.dev/resend/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${LOVABLE_KEY}`,
          'X-Connection-Api-Key': RESEND_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'DIY Stencil <onboarding@resend.dev>',
          to: ['diystencil@gmail.com'],
          subject: `🎉 New order #${String(order.id).slice(0, 8)} — $${amount.toFixed(2)}`,
          html: `<p>From: ${payerEmail}</p><p>Total: $${amount.toFixed(2)}</p><p>View in admin dashboard.</p>`,
        }),
      }).catch(e => console.error('Admin email failed', e));
    }

    return new Response(JSON.stringify({ orderId: order.id, total: amount }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
