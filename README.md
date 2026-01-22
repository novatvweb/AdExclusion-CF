
# AdExclusion Enterprise 🚀

**AdExclusion Enterprise** je optimiziran za Cloudflare Pages Git-integritaciju.

## ✅ Rješenje za "Authentication Error [code: 10000]"

Greška se pojavljivala jer je sustav pokušavao izvršiti `wrangler deploy` unutar CI/CD okruženja koje je već u procesu deploymenta. 

### Ispravne postavke Dashboarda:

S obzirom na polja sa slike, unesite točno ovo:

1. **Build command**: `npm run build`
2. **Build output directory**: `.`
3. **Deploy command**: `npm run deploy` (Ovo će sada samo ispisati poruku i dopustiti Cloudflareu da završi svoj nativni proces)

### Arhitektura
- **Static Assets**: Sve datoteke iz roota (`index.html`, `App.tsx`, itd.) se serviraju automatski.
- **Functions**: Mapa `/functions` se automatski pretvara u Edge rute.
- **KV Binding**: Provjerite u `Settings > Functions` da je `AD_EXCLUSION_KV` povezan s ispravnim namespaceom.

---
*Senior Systems Architect*
