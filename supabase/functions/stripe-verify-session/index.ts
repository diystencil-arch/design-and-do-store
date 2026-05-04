// Verify a Stripe session and persist the order (idempotent)
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_KEY = Deno.env.get("RESEND_API_KEY");
const LOVABLE_KEY = Deno.env.get("LOVABLE_API_KEY");

async function sb(path: string, init: RequestInit = {}) {
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(init.headers || {}),
    },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { sessionId } = await req.json();
    if (!sessionId) {
      return new Response(JSON.stringify({ error: "sessionId required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      return new Response(JSON.stringify({ error: "Not paid", status: session.payment_status }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Idempotency: return existing order if already persisted
    const existing = await sb(`orders?stripe_session_id=eq.${sessionId}&select=id,total`);
    const existingRows = await existing.json();
    if (Array.isArray(existingRows) && existingRows.length) {
      return new Response(JSON.stringify({ orderId: existingRows[0].id, total: existingRows[0].total, downloads: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const meta = session.metadata || {};
    const items = meta.items ? JSON.parse(meta.items) : [];
    const shippingAddress = meta.shippingAddress ? JSON.parse(meta.shippingAddress) : null;
    const userId = meta.userId || null;
    const payerEmail = session.customer_details?.email || meta.guestEmail || "";
    const amount = (session.amount_total || 0) / 100;

    const ids = items.map((i: any) => i.productId);
    const pRes = await sb(`products?id=in.(${ids.join(",")})&select=id,price,title,type`);
    const products = await pRes.json();
    const byId: Record<string, any> = {};
    for (const p of products) byId[p.id] = p;

    let subtotal = 0;
    for (const it of items) {
      const p = byId[it.productId];
      if (p) subtotal += Number(p.price) * Number(it.quantity || 1);
    }

    const orderRes = await sb("orders", {
      method: "POST",
      body: JSON.stringify({
        user_id: userId || null,
        guest_email: payerEmail,
        status: "paid",
        payment_provider: "stripe",
        stripe_session_id: sessionId,
        subtotal,
        shipping_cost: 0,
        total: amount,
        shipping_address: shippingAddress,
      }),
    });
    const [order] = await orderRes.json();

    const orderItems = items.map((it: any) => {
      const p = byId[it.productId];
      return {
        order_id: order.id,
        product_id: it.productId,
        variant_id: it.variantId || null,
        product_title: p?.title || it.title || "Item",
        product_type: p?.type || "physical",
        quantity: Number(it.quantity || 1),
        unit_price: Number(p?.price || 0),
      };
    });
    const itemsRes = await sb("order_items", { method: "POST", body: JSON.stringify(orderItems) });
    const createdItems = await itemsRes.json();

    const digitalLinks: { title: string; url: string }[] = [];
    for (const ci of createdItems) {
      if (ci.product_type === "digital") {
        const dlRes = await sb("digital_downloads", {
          method: "POST",
          body: JSON.stringify({ order_item_id: ci.id, user_id: userId || null, guest_email: payerEmail }),
        });
        const [dl] = await dlRes.json();
        if (dl?.download_token) {
          const origin = req.headers.get("origin") || req.headers.get("referer")?.replace(/\/$/, "") || "";
          digitalLinks.push({ title: ci.product_title, url: `${origin}/download?token=${dl.download_token}` });
        }
      }
    }

    if (RESEND_KEY && LOVABLE_KEY && payerEmail) {
      const dlHtml = digitalLinks.length
        ? `<h3>Your digital downloads</h3><ul>${digitalLinks.map(d => `<li><a href="${d.url}">${d.title}</a> (link expires in 72h, 5 downloads)</li>`).join("")}</ul>`
        : "";
      await fetch("https://connector-gateway.lovable.dev/resend/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_KEY}`, "X-Connection-Api-Key": RESEND_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "DIY Stencil <onboarding@resend.dev>",
          to: [payerEmail],
          subject: `Order confirmed — #${String(order.id).slice(0, 8)}`,
          html: `<h2>Thanks for your order!</h2><p>Order total: <strong>$${amount.toFixed(2)}</strong></p>${dlHtml}<p>We'll email tracking once your physical items ship.</p>`,
        }),
      }).catch(e => console.error("Email failed", e));

      await fetch("https://connector-gateway.lovable.dev/resend/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_KEY}`, "X-Connection-Api-Key": RESEND_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "DIY Stencil <onboarding@resend.dev>",
          to: ["diystencil@gmail.com"],
          subject: `🎉 New Stripe order #${String(order.id).slice(0, 8)} — $${amount.toFixed(2)}`,
          html: `<p>From: ${payerEmail}</p><p>Total: $${amount.toFixed(2)}</p>`,
        }),
      }).catch(e => console.error("Admin email failed", e));
    }

    return new Response(JSON.stringify({ orderId: order.id, total: amount, downloads: digitalLinks }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
