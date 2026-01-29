
interface KVNamespace {
  get(key: string): Promise<string | null>;
}

type PagesFunction<Env = any> = (context: {
  request: Request;
  env: Env;
  [key: string]: any;
}) => Response | Promise<Response>;

interface Env {
  AD_EXCLUSION_KV?: KVNamespace;
  AD_EXCLUSION_KV_DEV?: KVNamespace;
  CF_API_TOKEN?: string;
  CF_ZONE_ID?: string;
  CF_PURGE_URL?: string;
  CF_PURGE_URL_DEV?: string;
  CRON_SECRET?: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    // 1. SECURITY CHECK
    const authHeader = context.request.headers.get('x-cron-secret');
    const configuredSecret = context.env.CRON_SECRET;

    // Ako secret nije postavljen u env, blokiraj sve radi sigurnosti
    if (!configuredSecret) {
      return new Response("Server Misconfiguration: CRON_SECRET missing", { status: 500 });
    }

    if (authHeader !== configuredSecret) {
      return new Response("Unauthorized: Invalid Cron Secret", { status: 401 });
    }

    // 2. SETUP ENVIRONMENT
    const url = new URL(context.request.url);
    const target = url.searchParams.get('target') === 'dev' ? 'dev' : 'prod';
    const db = target === 'dev' ? context.env.AD_EXCLUSION_KV_DEV : context.env.AD_EXCLUSION_KV;
    const purgeUrl = target === 'dev' ? context.env.CF_PURGE_URL_DEV : context.env.CF_PURGE_URL;
    const zoneId = context.env.CF_ZONE_ID;
    const apiToken = context.env.CF_API_TOKEN;

    if (!db || !purgeUrl || !zoneId || !apiToken) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: "Missing DB, URL, ZoneID or Token configuration" 
      }), { status: 500 });
    }

    // 3. FETCH RULES DIRECTLY FROM KV
    // Čitamo direktno iz KV-a jer smo u istom Worker kontekstu (server-side)
    // Ključ je ovisan o env-u (vidi sync.ts logiku)
    const storageKey = target === 'dev' ? "rules_data_dev" : "rules_data";
    const dataRaw = await db.get(storageKey);
    
    if (!dataRaw) {
      return new Response(JSON.stringify({ success: true, message: "No rules in database", action: "none" }), { 
        headers: { "Content-Type": "application/json" } 
      });
    }

    const { rules } = JSON.parse(dataRaw);
    const now = Date.now();
    
    // 4. DETECTION LOGIC
    // Tražimo pravila koja su se promijenila u zadnjih 90 sekundi (dovoljno za cron koji se vrti svaku minutu)
    // Gledamo i StartDate i EndDate.
    const TIME_WINDOW = 90 * 1000; // 90 sekundi

    const transitioningRules = rules.filter((r: any) => {
      if (!r.isActive) return false; // Ignoriramo deaktivirana pravila

      let isStarting = false;
      let isEnding = false;

      // Da li je pravilo upravo počelo? (Sada je unutar 90s od starta)
      if (r.startDate) {
        const diff = Math.abs(now - r.startDate);
        if (diff <= TIME_WINDOW) isStarting = true;
      }

      // Da li je pravilo upravo završilo? (Sada je unutar 90s od kraja)
      if (r.endDate) {
        const diff = Math.abs(now - r.endDate);
        if (diff <= TIME_WINDOW) isEnding = true;
      }

      return isStarting || isEnding;
    });

    if (transitioningRules.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: "No rules transitioning at this time.", 
        serverTime: new Date().toISOString(),
        checkedRules: rules.length
      }), { 
        headers: { "Content-Type": "application/json" } 
      });
    }

    // 5. EXECUTE PURGE
    console.log(`[SCHEDULER] Triggering purge due to rules: ${transitioningRules.map((r:any) => r.name).join(', ')}`);

    const cfResponse = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        files: [purgeUrl]
      })
    });

    const purgeResult = await cfResponse.json();

    return new Response(JSON.stringify({
      success: true,
      action: "PURGE_TRIGGERED",
      reason: "Rule Transition Detected",
      transitioningRules: transitioningRules.map((r:any) => ({ name: r.name, start: r.startDate, end: r.endDate })),
      cfResult: purgeResult
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
