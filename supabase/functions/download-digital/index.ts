// Validates a digital download token, increments counter, returns a short-lived signed URL
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    if (!token) return new Response(JSON.stringify({ error: 'token required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    const { data: dl, error } = await admin
      .from('digital_downloads')
      .select('id, order_item_id, download_count, download_limit, expires_at')
      .eq('download_token', token)
      .maybeSingle();

    if (error || !dl) return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    if (new Date(dl.expires_at) < new Date()) return new Response(JSON.stringify({ error: 'Link expired' }), { status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    if (dl.download_count >= dl.download_limit) return new Response(JSON.stringify({ error: 'Download limit reached' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    // Get product → digital_files.storage_path
    const { data: oi } = await admin.from('order_items').select('product_id, product_title').eq('id', dl.order_item_id).maybeSingle();
    if (!oi?.product_id) return new Response(JSON.stringify({ error: 'Item not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const { data: df } = await admin.from('digital_files').select('storage_path').eq('product_id', oi.product_id).maybeSingle();
    if (!df?.storage_path) return new Response(JSON.stringify({ error: 'File not uploaded yet — contact support' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const { data: signed, error: signErr } = await admin.storage.from('digital-files').createSignedUrl(df.storage_path, 300, { download: true });
    if (signErr || !signed?.signedUrl) return new Response(JSON.stringify({ error: 'Could not generate link' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    await admin.from('digital_downloads').update({ download_count: dl.download_count + 1 }).eq('id', dl.id);

    return new Response(JSON.stringify({ url: signed.signedUrl, title: oi.product_title, remaining: dl.download_limit - dl.download_count - 1 }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
