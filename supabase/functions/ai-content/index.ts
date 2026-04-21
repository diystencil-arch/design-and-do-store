// AI content generation via Lovable AI Gateway (Gemini)
// Endpoints (mode in body): "title" | "description" | "tags" | "blog"
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

interface ReqBody {
  mode: "title" | "description" | "tags" | "blog";
  title?: string;
  description?: string;
  productType?: string;
  imageUrl?: string;
  tags?: string[];
  language?: string; // for blog
}

const LANG_NAMES: Record<string, string> = {
  en: "English", nl: "Dutch", fr: "French", de: "German", it: "Italian",
  ja: "Japanese", pl: "Polish", pt: "Portuguese", ru: "Russian", es: "Spanish",
};

async function callGemini(messages: any[], tools?: any[], toolChoice?: any) {
  const body: any = {
    model: "google/gemini-2.5-flash",
    messages,
  };
  if (tools) {
    body.tools = tools;
    body.tool_choice = toolChoice;
  }
  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`AI gateway ${resp.status}: ${t}`);
  }
  return resp.json();
}

function userVisionContent(prompt: string, imageUrl?: string) {
  if (!imageUrl) return prompt;
  return [
    { type: "text", text: prompt },
    { type: "image_url", image_url: { url: imageUrl } },
  ];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");
    const body = (await req.json()) as ReqBody;
    const { mode, title, description, productType, imageUrl, tags, language } = body;

    const brand = "DIY Stencil — handmade craft stencils, SVG cut files, laser-cut wood and acrylic. Warm, friendly, hands-on craft brand.";

    if (mode === "title") {
      const data = await callGemini([
        { role: "system", content: `You write short, SEO-friendly e-commerce product titles for ${brand}` },
        { role: "user", content: userVisionContent(
          `Write ONE compelling product title (max 70 characters) for a ${productType || "product"}.${description ? ` Existing description: ${description.slice(0, 400)}` : ""} Return ONLY the title text, no quotes.`,
          imageUrl
        ) },
      ]);
      const text = data.choices?.[0]?.message?.content?.trim().replace(/^["']|["']$/g, "") || "";
      return new Response(JSON.stringify({ result: text }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (mode === "description") {
      const data = await callGemini([
        { role: "system", content: `You write SEO-optimized, conversion-focused e-commerce product descriptions for ${brand}` },
        { role: "user", content: userVisionContent(
          `Write a product description for "${title || "this product"}" (${productType || "product"}). 80-140 words. Warm, hands-on, craft-loving tone. Mention materials, use cases, and one clear benefit. End with a soft call-to-action. No headings, no markdown.`,
          imageUrl
        ) },
      ]);
      const text = data.choices?.[0]?.message?.content?.trim() || "";
      return new Response(JSON.stringify({ result: text }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (mode === "tags") {
      const data = await callGemini(
        [
          { role: "system", content: `You suggest concise SEO tags for craft products at ${brand}` },
          { role: "user", content: userVisionContent(
            `Suggest 5-8 short tags (1-2 words each, lowercase) for "${title || "this product"}" (${productType || "product"}).${description ? ` Description: ${description.slice(0, 400)}` : ""}`,
            imageUrl
          ) },
        ],
        [{
          type: "function",
          function: {
            name: "return_tags",
            description: "Return product tags",
            parameters: {
              type: "object",
              properties: {
                tags: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 10 },
              },
              required: ["tags"],
            },
          },
        }],
        { type: "function", function: { name: "return_tags" } }
      );
      const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
      const parsed = args ? JSON.parse(args) : { tags: [] };
      return new Response(JSON.stringify({ result: parsed.tags }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (mode === "blog") {
      const lang = language || "en";
      const langName = LANG_NAMES[lang] || "English";
      const data = await callGemini(
        [
          { role: "system", content: `You are a craft and DIY blogger for ${brand}. Write engaging, SEO-friendly blog posts in ${langName}.` },
          { role: "user", content: userVisionContent(
            `Write a complete blog post in ${langName} about the product "${title || "this product"}" (${productType || "product"}). ${description ? `Product details: ${description.slice(0, 600)}` : ""}${tags?.length ? ` Tags: ${tags.join(", ")}` : ""}
            
The blog should include: an engaging hook, what the product is, 3-5 creative use cases or styling/usage tips, care instructions if relevant, and a closing CTA. 500-800 words. Use simple markdown (## subheadings, lists). Return JSON via the tool call.`,
            imageUrl
          ) },
        ],
        [{
          type: "function",
          function: {
            name: "return_blog",
            description: "Return blog post fields",
            parameters: {
              type: "object",
              properties: {
                title: { type: "string", description: "Catchy blog title in target language" },
                slug: { type: "string", description: "URL slug, lowercase, hyphens, no special chars" },
                excerpt: { type: "string", description: "1-2 sentence summary, max 200 chars" },
                content: { type: "string", description: "Full markdown blog body" },
                meta_title: { type: "string", description: "SEO title, max 60 chars" },
                meta_description: { type: "string", description: "SEO description, max 160 chars" },
                tags: { type: "array", items: { type: "string" } },
              },
              required: ["title", "slug", "excerpt", "content", "meta_title", "meta_description", "tags"],
            },
          },
        }],
        { type: "function", function: { name: "return_blog" } }
      );
      const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
      const parsed = args ? JSON.parse(args) : null;
      if (!parsed) throw new Error("No blog content returned");
      return new Response(JSON.stringify({ result: parsed }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown mode" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-content error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    const status = msg.includes("429") ? 429 : msg.includes("402") ? 402 : 500;
    return new Response(JSON.stringify({ error: msg }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
