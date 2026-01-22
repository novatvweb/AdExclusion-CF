
# AdExclusion Enterprise 🚀

**AdExclusion Enterprise** je administrativni alat dizajniran za news portale visoke posjećenosti. Omogućuje ad-ops timovima dinamičko upravljanje izuzecima sponzorstava u realnom vremenu.

## 🏗️ Tehnološki Stog
- **Frontend**: React (Single-file consolidated App.tsx).
- **Backend**: Cloudflare Pages Functions.
- **Storage**: Cloudflare KV.

## 🚀 Upute za Deployment na Cloudflare Pages

### 1. Konfiguracija KV-a
U Cloudflare Dashboardu kreirajte KV Namespace pod nazivom `AD_EXCLUSION_KV`.

### 2. Deployment preko CLI-ja
S obzirom da koristite Pages, koristite sljedeću naredbu:
```bash
npx wrangler pages deploy .
```
*(Napomena: Ako dobijete Workers error, provjerite da ne koristite `wrangler deploy` bez prefiksa `pages`)*.

### 3. Environment Varijable
U Pages postavkama na Dashboardu podesite:
1. **KV binding**: povežite `AD_EXCLUSION_KV` varijablu s vašim KV namespaceom.
2. **API_KEY**: (Opcionalno, ako koristite AI funkcije u budućnosti).

---
*Digital Ops Team.*
