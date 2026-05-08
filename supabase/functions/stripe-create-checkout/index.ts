// Create a Stripe Checkout Session for cart items
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

async function sb(path: string, init: RequestInit = {}) {
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { items, email, shippingAddress, userId, currency = "usd", promoCode } = await req.json();
    if (!items?.length) {
      return new Response(JSON.stringify({ error: "items required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ids = items.map((i: any) => i.productId);
    const pRes = await sb(`products?id=in.(${ids.join(",")})&select=id,price,title,type,images`);
    const products = await pRes.json();
    const byId: Record<string, any> = {};
    for (const p of products) byId[p.id] = p;

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const line_items = items.map((it: any) => {
      const p = byId[it.productId];
      const image = Array.isArray(p?.images) ? p.images[0] : undefined;
      return {
        price_data: {
          currency,
          product_data: {
            name: p?.title || it.title || "Item",
            ...(image ? { images: [image] } : {}),
          },
          unit_amount: Math.round(Number(p?.price || 0) * 100),
        },
        quantity: Number(it.quantity || 1),
      };
    });

    // Server-side promo validation + Stripe coupon
    let appliedPromo: { code: string; discount: number } | null = null;
    let discounts: any[] | undefined;
    if (promoCode) {
      const prRes = await sb(`promo_codes?code=eq.${encodeURIComponent(promoCode)}&is_active=eq.true&select=*`);
      const [pc] = await prRes.json();
      const subtotal = items.reduce((s: number, it: any) => s + Number(byId[it.productId]?.price || 0) * Number(it.quantity || 1), 0);
      const now = new Date();
      const valid = pc
        && (!pc.starts_at || new Date(pc.starts_at) <= now)
        && (!pc.ends_at || new Date(pc.ends_at) >= now)
        && (!pc.max_uses || pc.used_count < pc.max_uses)
        && subtotal >= Number(pc.min_subtotal || 0);
      if (valid) {
        const coupon = pc.discount_type === 'percent'
          ? await stripe.coupons.create({ percent_off: Number(pc.discount_value), duration: 'once', name: pc.code })
          : await stripe.coupons.create({ amount_off: Math.round(Number(pc.discount_value) * 100), currency, duration: 'once', name: pc.code });
        discounts = [{ coupon: coupon.id }];
        const dval = pc.discount_type === 'percent' ? subtotal * Number(pc.discount_value) / 100 : Number(pc.discount_value);
        appliedPromo = { code: pc.code, discount: Math.min(dval, subtotal) };
      }
    }

    const origin = req.headers.get("origin") || "";
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      ...(discounts ? { discounts } : {}),
      customer_email: email || undefined,
      success_url: `${origin}/order-success?stripe_session={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout`,
      metadata: {
        userId: userId || "",
        items: JSON.stringify(items.map((i: any) => ({
          productId: i.productId, variantId: i.variantId || null, quantity: i.quantity, title: i.title,
        }))),
        shippingAddress: shippingAddress ? JSON.stringify(shippingAddress) : "",
        guestEmail: email || "",
        promoCode: appliedPromo?.code || "",
        promoDiscount: appliedPromo ? String(appliedPromo.discount) : "",
      },
    });

    return new Response(JSON.stringify({ url: session.url, id: session.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
