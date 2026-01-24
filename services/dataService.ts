import { authService } from './authService.ts';

// ISTA LOGIKA: Sve što nije produkcija je DEV.
const hostname = window.location.hostname;
const IS_PROD = hostname.includes('pages.dev') || hostname.includes('dnevnik.hr');
const IS_DEV = !IS_PROD;

export const dataService = {
  async getRules() {
    if (IS_DEV) {
      console.log("[DataService] Returning mock rules...");
      return {
        rules: [
          {
            id: 'mock-1',
            name: 'Mock: Heineken Euro 2026',
            conditions: [{ targetKey: 'section', operator: 'equals', value: 'sport', caseSensitive: false }],
            logicalOperator: 'AND',
            targetElementSelector: '.bg-branding-main',
            action: 'hide',
            isActive: true,
            respectAdsEnabled: true,
            createdAt: Date.now()
          },
          {
            id: 'mock-2',
            name: 'Mock: Sakrij Banner na Naslovnici',
            conditions: [{ targetKey: 'page_type', operator: 'equals', value: 'home', caseSensitive: false }],
            logicalOperator: 'AND',
            targetElementSelector: '#banner-top',
            action: 'hide',
            isActive: false,
            respectAdsEnabled: false,
            createdAt: Date.now()
          }
        ]
      };
    }

    // PRODUCTION LOGIC
    const response = await fetch('/api/sync', {
      headers: { 
        'Authorization': `Bearer ${authService.getToken()}` 
      }
    });

    if (response.status === 401) {
      authService.logout();
      throw new Error("Session expired");
    }

    return response.json();
  },

  async saveRules(rules: any[], script?: string) {
    if (IS_DEV) {
      console.log("🛠️ Dev Mode: Pravila spremljena (mock)", rules);
      // Simulacija kašnjenja
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true };
    }

    const response = await fetch('/api/sync', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authService.getToken()}`
      },
      body: JSON.stringify({ rules, script })
    });

    if (response.status === 401) {
      authService.logout();
      throw new Error("Session expired");
    }

    return response.json();
  },

  async purgeCache() {
    if (IS_DEV) {
        console.log("🛠️ Dev Mode: Cache purged (mock)");
        return { success: true };
    }

    const response = await fetch('/api/purge', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${authService.getToken()}`
      }
    });
    return response.json();
  }
};