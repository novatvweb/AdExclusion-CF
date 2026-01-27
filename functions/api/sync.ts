
// Cloudflare environment types
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
  // UI always loads the primary rules set (Prod/Workspace)
  const data = await context.env.AD_EXCLUSION_KV.get("rules_data");
  return new Response(data || JSON.stringify({ rules: [], script: "" }), {
    headers: { "Content-Type": "application/json" },
  });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const body = await context.request.json();
  const { target, ...payload } = body;
  
  // Decide which KV key to update based on target
  const storageKey = target === 'dev' ? "rules_data_dev" : "rules_data";
  
  const currentDataRaw = await context.env.AD_EXCLUSION_KV.get(storageKey);
  const currentData = currentDataRaw ? JSON.parse(currentDataRaw) : { rules: [], script: "" };
  
  // Merge new rules/script into the selected environment
  const updatedData = { ...currentData, ...payload };
  await context.env.AD_EXCLUSION_KV.put(storageKey, JSON.stringify(updatedData));
  
  // If we published to DEV, we also want to keep PROD/Workspace synced as the "source of truth"
  // so the user doesn't lose their edits in the UI.
  if (target === 'dev') {
     const workspaceDataRaw = await context.env.AD_EXCLUSION_KV.get("rules_data");
     const workspaceData = workspaceDataRaw ? JSON.parse(workspaceDataRaw) : { rules: [], script: "" };
     await context.env.AD_EXCLUSION_KV.put("rules_data", JSON.stringify({ ...workspaceData, rules: payload.rules }));
  }
  
  return new Response(JSON.stringify({ success: true, environment: target || 'prod' }), {
    headers: { "Content-Type": "application/json" },
  });
};
