// Cloudflare API definitions
interface KVNamespace {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
}

type PagesFunction<Env = any> = (context: {
  request: Request;
  env: Env;
  [key: string]: any;
}) => Response | Promise<Response>;

// Assume standard env variables are provided via CF Dashboard as Secrets
interface Env {
  CF_API_TOKEN?: string;
  CF_ZONE_ID?: string;
  AD_EXCLUSION_KV: KVNamespace;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const token = context.env.CF_API_TOKEN;
  const zoneId = context.env.CF_ZONE_ID;
  const targetUrl = "https://adexclusion.dnevnik.hr/exclusions/sponsorship_exclusions.js";

  // Check if variables are missing
  if (!token || !zoneId) {
    const errorMsg = `Purge skipped: ${!token ? 'CF_API_TOKEN' : ''} ${!zoneId ? 'CF_ZONE_ID' : ''} not configured.`;
    console.warn(errorMsg);
    return new Response(JSON.stringify({ success: false, message: errorMsg }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const cfResponse = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        files: [targetUrl]
      })
    });

    if (!cfResponse.ok) {
        const errorText = await cfResponse.text();
        return new Response(JSON.stringify({ 
            success: false, 
            message: `Cloudflare API returned error status: ${cfResponse.status}`,
            details: errorText
        }), {
            status: cfResponse.status,
            headers: { "Content-Type": "application/json" }
        });
    }

    const result = await cfResponse.json();
    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};