
// Added local definitions for Cloudflare environment types to fix compilation errors
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
  const data = await context.env.AD_EXCLUSION_KV.get("rules_data");
  return new Response(data || JSON.stringify({ rules: [], script: "" }), {
    headers: { "Content-Type": "application/json" },
  });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const body = await context.request.json();
  const currentDataRaw = await context.env.AD_EXCLUSION_KV.get("rules_data");
  const currentData = currentDataRaw ? JSON.parse(currentDataRaw) : { rules: [], script: "" };
  
  const updatedData = { ...currentData, ...body };
  // Fixed typo: Property 'AD_EXCLUS_KV' does not exist on type 'Env'. Correcting to 'AD_EXCLUSION_KV'.
  await context.env.AD_EXCLUSION_KV.put("rules_data", JSON.stringify(updatedData));
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
};
