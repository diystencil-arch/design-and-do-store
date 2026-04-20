// Sends a tracking / status update email to a customer for an existing order
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const RESEND_KEY = Deno.env.get('RESEND_API_KEY');
const LOVABLE_KEY = Deno.env.get('LOVABLE_API_KEY');

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const { orderId, trackingNumber, carrier, note } = await req.json();
    if (!orderId) return new Response(JSON.stringify({ error: 'orderId required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    // Fetch order
    const oRes = await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${orderId}&select=*`, {
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
    });
    const [order] = await oRes.json();
    if (!order) return new Response(JSON.stringify({ error: 'Order not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const email = order.guest_email;
    if (!email) return new Response(JSON.stringify({ error: 'No customer email on order' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    // Update tracking number on order if provided
    if (trackingNumber) {
      await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${orderId}`, {
        method: 'PATCH',
        headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ tracking_number: trackingNumber, status: 'shipped' }),
      });
    }

    if (!RESEND_KEY || !LOVABLE_KEY) {
      return new Response(JSON.stringify({ error: 'Email not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const shortId = String(order.id).slice(0, 8);
    const trackingHtml = trackingNumber
      ? `<p>Your tracking number${carrier ? ` (${carrier})` : ''}: <strong>${trackingNumber}</strong></p>`
      : '';
    const noteHtml = note ? `<p>${String(note).replace(/</g, '&lt;')}</p>` : '';

    const send = await fetch('https://connector-gateway.lovable.dev/resend/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_KEY}`,
        'X-Connection-Api-Key': RESEND_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'DIY Stencil <onboarding@resend.dev>',
        to: [email],
        subject: trackingNumber ? `📦 Your order #${shortId} has shipped!` : `Update on your order #${shortId}`,
        html: `<h2>Order #${shortId} update</h2>${trackingHtml}${noteHtml}<p>Thanks for shopping with DIY Stencil!</p>`,
      }),
    });

    if (!send.ok) {
      const err = await send.text();
      console.error('Email send failed', err);
      return new Response(JSON.stringify({ error: 'Email send failed', details: err }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ ok: true, sentTo: email }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
