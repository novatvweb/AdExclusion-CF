type PagesFunction<Env = any> = (context: {
  request: Request;
  env: Env;
  next: () => Promise<Response>;
}) => Response | Promise<Response>;

interface Env {
  ADMIN_PASS?: string;
}

export const onRequest: PagesFunction<Env> = async ({ request, env, next }) => {
  const url = new URL(request.url);

  // Dozvoli pristup ruti za prijavu i javnim isključenjima
  if (url.pathname === "/api/login" || url.pathname.startsWith("/exclusions/")) {
    return next();
  }

  // Provjera konfiguracije na Edge-u
  if (!env.ADMIN_PASS) {
    return new Response(JSON.stringify({ 
      success: false, 
      message: "Server Error: Missing ADMIN_PASS configuration." 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  const authHeader = request.headers.get("Authorization");
  const expectedToken = btoa(`admin:${env.ADMIN_PASS}`);

  if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
    return new Response(JSON.stringify({ 
      success: false, 
      message: "Niste autorizirani za ovu akciju (401 Unauthorized)." 
    }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  return next();
};