
type PagesFunction<Env = any> = (context: {
  request: Request;
  env: Env;
  [key: string]: any;
}) => Response | Promise<Response>;

interface Env {
  ADMIN_PASS?: string;
  USER_PASS?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { user, pass } = await context.request.json();
    const adminPass = context.env.ADMIN_PASS;
    const userPass = context.env.USER_PASS;

    if (!adminPass) {
      console.error("ADMIN_PASS secret is missing in Cloudflare Dashboard.");
      return new Response(JSON.stringify({ success: false, message: "Server configuration error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Check Admin
    if (user === 'admin' && pass === adminPass) {
      const token = btoa(`${user}:${pass}`);
      return new Response(JSON.stringify({ success: true, token, role: 'admin' }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // Check Standard User
    if (user === 'user' && userPass && pass === userPass) {
      const token = btoa(`${user}:${pass}`);
      return new Response(JSON.stringify({ success: true, token, role: 'user' }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ success: false, message: "Neispravni podaci za prijavu" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, message: "Neispravan zahtjev" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
};
