
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
  const dataRaw = context.env.AD_EXCLUSION_KV;
  // READ FROM DEV KEY
  const data = await dataRaw.get("rules_data_dev");
  const fallback = "/* AdExclusion (DEV): No rules found */";
  
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

  return new Response(output, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-cache", // No cache for dev environment
      "X-AdEx-Env": "development"
    },
  });
};
