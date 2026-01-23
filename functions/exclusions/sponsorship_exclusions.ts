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
  const dataRaw = await context.env.AD_EXCLUSION_KV.get("rules_data");
  const fallback = "/* AdExclusion: No rules found */";
  
  if (!dataRaw) {
    return new Response(fallback, {
      headers: { "Content-Type": "application/javascript; charset=utf-8" }
    });
  }

  const data = JSON.parse(dataRaw);
  
  // Provjeravamo ima li ijedno pravilo status isActive: true
  const hasActiveRules = data.rules && data.rules.some((r: any) => !!r.isActive);
  
  let output = hasActiveRules ? (data.script || fallback) : fallback;

  // Ako skripta sadrži prazan niz, vraćamo fallback komentar
  if (output !== fallback && output.includes("const rules = [];")) {
    output = fallback;
  }

  return new Response(output, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=60, s-maxage=60",
      "X-Content-Type-Options": "nosniff",
    },
  });
};