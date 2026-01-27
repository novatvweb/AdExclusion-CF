
type PagesFunction<Env = any> = (context: {
  request: Request;
  env: Env;
  next: () => Promise<Response>;
}) => Response | Promise<Response>;

interface Env {
  ADMIN_PASS?: string;
  USER_PASS?: string;
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
  
  // Generiramo očekivane tokene za oba korisnika
  const adminToken = btoa(`admin:${env.ADMIN_PASS}`);
  
  // Za usera provjeravamo samo ako je postavljen pass, inače taj login nije moguć
  const userToken = env.USER_PASS ? btoa(`user:${env.USER_PASS}`) : null;

  if (!authHeader) {
     return new Response(JSON.stringify({ success: false, message: "Missing Authorization header." }), { status: 401 });
  }

  // Provjera tokena (Bearer schema)
  const providedToken = authHeader.replace('Bearer ', '');

  if (providedToken === adminToken) {
    return next();
  }

  if (userToken && providedToken === userToken) {
    return next();
  }

  return new Response(JSON.stringify({ 
    success: false, 
    message: "Niste autorizirani za ovu akciju (401 Unauthorized)." 
  }), {
    status: 401,
    headers: { "Content-Type": "application/json" }
  });
};
