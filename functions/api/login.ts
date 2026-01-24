type PagesFunction<Env = any> = (context: {
  request: Request;
  env: Env;
  [key: string]: any;
}) => Response | Promise<Response>;

interface Env {
  ADMIN_PASS?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { user, pass } = await context.request.json();
    const correctPass = context.env.ADMIN_PASS;

    // Ako Secret nije postavljen u Dashboardu, odbijamo prijavu radi sigurnosti
    if (!correctPass) {
      console.error("ADMIN_PASS secret is missing in Cloudflare Dashboard.");
      return new Response(JSON.stringify({ success: false, message: "Server configuration error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Provjera: Korisnik mora biti 'admin', a lozinka mora odgovarati Secretu
    if (user === 'admin' && pass === correctPass) {
      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ success: false, message: "Neispravni podaci" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, message: "Invalid request" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
};