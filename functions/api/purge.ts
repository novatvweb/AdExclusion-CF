
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
  CF_API_TOKEN?: string;
  CF_ZONE_ID?: string;
  CF_PURGE_URL?: string;
  CF_PURGE_URL_DEV?: string;
  AD_EXCLUSION_KV: KVNamespace;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { target } = await context.request.json();
  
  const token = context.env.CF_API_TOKEN;
  const zoneId = context.env.CF_ZONE_ID;
  
  // Choose URL based on target environment
  const targetUrl = target === 'dev' 
    ? context.env.CF_PURGE_URL_DEV 
    : context.env.CF_PURGE_URL;

  if (!token || !zoneId || !targetUrl) {
    const errorMsg = `Purge skipped: Missing configuration for ${target || 'prod'} environment.`;
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
        return new Response(JSON.stringify({ 
            success: false, 
            message: `Cloudflare API error: ${cfResponse.status}`
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
