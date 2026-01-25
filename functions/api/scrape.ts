
type PagesFunction<Env = any> = (context: {
  request: Request;
  env: Env;
  [key: string]: any;
}) => Response | Promise<Response>;

export const onRequestPost: PagesFunction = async (context) => {
  try {
    const { url } = await context.request.json();

    if (!url || !url.startsWith('http')) {
      return new Response(JSON.stringify({ success: false, message: "Neispravan URL" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Sigurnosna provjera domene
    const allowedDomains = ['dnevnik.hr', 'gol.hr', 'zimo.hr', 'zadovoljna.hr', 'punkufer.hr'];
    const urlObj = new URL(url);
    const domainMatch = allowedDomains.some(d => urlObj.hostname.endsWith(d));

    if (!domainMatch) {
      return new Response(JSON.stringify({ success: false, message: "Scraping dozvoljen samo za Nova TV portale" }), {
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'AdExclusion-Bot/2.0 (Edge Scraper)'
      }
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ success: false, message: "Portal nije dostupan" }), {
        status: 502,
        headers: { "Content-Type": "application/json" }
      });
    }

    const html = await response.text();
    
    // Regex ekstrakcija page_meta objekta
    // Tražimo blok koji sadrži page_meta = { ... }
    const metaRegex = /page_meta\s*=\s*({[\s\S]*?});/;
    const match = html.match(metaRegex);

    if (!match || !match[1]) {
      return new Response(JSON.stringify({ success: false, message: "Nisu pronađeni targeting podaci na stranici" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Čišćenje JSON-a (ponekad JS objekti nisu validni JSON-ovi direktno)
    // Za ovaj alat pretpostavljamo da je struktura konzistentna
    try {
      const pageMeta = JSON.parse(match[1]);
      const targeting = pageMeta?.third_party_apps?.ntAds?.targeting || {};
      
      // Mapiranje na naš TargetingData format
      const extractedData = {
        site: targeting.site || "",
        keywords: Array.isArray(targeting.keywords) ? targeting.keywords : (targeting.keywords ? [targeting.keywords] : []),
        description_url: url,
        ads_enabled: targeting.ads_enabled !== false,
        page_type: targeting.page_type || "",
        content_id: targeting.content_id || "",
        domain: urlObj.hostname,
        section: targeting.section || "",
        top_section: targeting.top_section || "",
        ab_test: targeting.ab_test || ""
      };

      return new Response(JSON.stringify({ success: true, data: extractedData }), {
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    } catch (e) {
      return new Response(JSON.stringify({ success: false, message: "Greška pri parsiranju metapodataka" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
