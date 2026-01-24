// ROBUSNIJA LOGIKA: Definiramo što je produkcija. Sve ostalo je DEV.
const hostname = window.location.hostname;
const IS_PROD = hostname.includes('pages.dev') || hostname.includes('dnevnik.hr');
const IS_DEV = !IS_PROD;

console.log(`[AuthService] Hostname: ${hostname}`);
console.log(`[AuthService] Running in ${IS_DEV ? 'DEVELOPMENT (Mock)' : 'PRODUCTION (Live)'} mode`);

export const authService = {
  async login(user: string, pass: string) {
    if (IS_DEV) {
      console.log("[AuthService] Attempting mock login...");
      await new Promise(resolve => setTimeout(resolve, 600)); // Simulacija mreže
      
      if (user === 'admin' && pass === 'dev') {
        sessionStorage.setItem('adex_token', 'mock_token_dev');
        return { success: true };
      }
      return { success: false, message: "Dev lozinka je 'dev'" };
    }

    // PRODUCTION LOGIC
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user, pass })
      });
      
      const result = await response.json();
      if (result.success && result.token) {
        sessionStorage.setItem('adex_token', result.token);
      }
      return result;
    } catch (e) {
      console.error("Login error:", e);
      return { success: false, message: "Greška u komunikaciji s serverom" };
    }
  },

  logout() {
    sessionStorage.removeItem('adex_token');
    // Uklanjamo reload da bude glađe, App.tsx će hendlati state
  },

  getToken() {
    return sessionStorage.getItem('adex_token');
  },

  isAuthenticated() {
    return !!this.getToken();
  }
};