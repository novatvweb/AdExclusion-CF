
type PagesFunction<Env = any> = (context: {
  request: Request;
  env: Env;
  [key: string]: any;
}) => Response | Promise<Response>;

export const onRequestPost: PagesFunction = async (context) => {
  const start = Date.now();
  try {
    const { url } = await context.request.json();

    if (!url || !url.startsWith('http')) {
      return new Response(JSON.stringify({ success: false, message: "Neispravan URL" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const allowedDomains = ['dnevnik.hr', 'gol.hr', 'zimo.hr', 'zadovoljna.hr', 'punkufer.hr'];
    const urlObj = new URL(url);
    if (!allowedDomains.some(d => urlObj.hostname.endsWith(d))) {
      return new Response(JSON.stringify({ success: false, message: "Domeni nije dozvoljen pristup" }), {
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Fetch s timeoutom (Cloudflare Workers imaju limite, moramo biti brzi)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html',
        'Cache-Control': 'no-cache'
      }
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return new Response(JSON.stringify({ success: false, message: `Portal vratio grešku ${response.status}` }), {
        status: 502,
        headers: { "Content-Type": "application/json" }
      });
    }

    const html = await response.text();
    
    // Tražimo ključnu riječ koja označava početak targetinga
    const targetingKey = '"targeting":';
    const idx = html.indexOf(targetingKey);
    
    if (idx === -1) {
      return new Response(JSON.stringify({ success: false, message: "Targeting podaci nisu pronađeni u HTML-u" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Uzimamo samo mali prozor teksta nakon ključa (štedi CPU memoriju)
    const snippet = html.substring(idx, idx + 1500);

    // Robusnija ekstrakcija polja (podržava : "vrijednost" i : "vrijednost")
    const extract = (field: string) => {
      const regex = new RegExp(`"${field}"\\s*:\\s*"([^"]+)"`);
      const match = snippet.match(regex);
      return match ? match[1] : "";
    };

    // Ekstrakcija keywordsa koji su u obliku ["val1", "val2"]
    const extractKeywords = () => {
      const regex = /"keywords"\s*:\s*\[([^\]]+)\]/;
      const match = snippet.match(regex);
      if (!match) return [];
      return match[1]
        .split(',')
        .map(k => k.trim().replace(/"/g, ''))
        .filter(k => k.length > 0);
    };

    const data = {
      site: extract('site') || (url.includes('gol') ? 'gol' : 'dnevnik'),
      keywords: extractKeywords(),
      description_url: extract('description_url') || url,
      ads_enabled: !snippet.includes('"ads_enabled": false'),
      page_type: extract('page_type') || 'article',
      content_id: extract('content_id'),
      domain: urlObj.hostname,
      section: extract('section'),
      top_section: extract('top_section'),
      ab_test: extract('ab_test')
    };

    return new Response(JSON.stringify({ 
      success: true, 
      data, 
      debug: { processTime: Date.now() - start } 
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err: any) {
    const isTimeout = err.name === 'AbortError';
    return new Response(JSON.stringify({ 
      success: false, 
      message: isTimeout ? "Portal prespor (Timeout)" : "Greška pri obradi",
      error: String(err)
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
