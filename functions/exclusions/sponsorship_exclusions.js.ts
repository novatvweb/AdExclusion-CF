interface KVNamespace {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
}

type PagesFunction<Env = any> = (context: {
  request: Request;
  env: Env;
  [key: string]: any;
}) => Response | Promise<Response>;

interface Env {
  AD_EXCLUSION_KV: KVNamespace;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  // Fix: Property 'AD_EXCLUS_KV' does not exist on type 'Env'. Corrected to 'AD_EXCLUSION_KV' and removed unnecessary await on namespace object.
  const dataRaw = context.env.AD_EXCLUSION_KV;
  const data = await dataRaw.get("rules_data");
  const fallback = "/* AdExclusion: No rules found or KV not bound */";
  
  if (!data) {
    return new Response(fallback, {
      headers: { 
        "Content-Type": "application/javascript; charset=utf-8",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }

  const parsed = JSON.parse(data);
  const hasActiveRules = parsed.rules && parsed.rules.some((r: any) => !!r.isActive);
  let output = hasActiveRules ? (parsed.script || fallback) : fallback;

  // Cleanup u slučaju praznog niza u generiranoj skripti
  if (output !== fallback && output.includes("const rules = [];")) {
    output = fallback;
  }

  return new Response(output, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=60, s-maxage=60",
      "X-Content-Type-Options": "nosniff",
    },
  });
};