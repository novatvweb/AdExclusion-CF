# AdExclusion Enterprise 🚀

**AdExclusion Enterprise** je optimiziran za Cloudflare Pages Git-integritaciju.

## ✅ Cloudflare Dashboard Konfiguracija

Kako bi Build i Purge radili ispravno, potrebno je podesiti sljedeće u Cloudflare Dashboardu:

### 1. Bindings (Settings > Functions)
- **KV Namespace Binding**: 
  - Variable name: `AD_EXCLUSION_KV`
  - KV namespace: Odaberite vaš namespace.
  - *Napomena*: `wrangler.toml` mora sadržavati ID ovog namespace-a kako bi build prošao faza validacije.

### 2. Variables and Secrets (Settings > Environment variables)
Dodajte ove varijable pod **Secrets** (encrypted) za Production i Preview okruženja:

| Variable Name | Description |
| :--- | :--- |
| `CF_API_TOKEN` | API Token sa dozvolom `Zone.Cache Purge` |
| `CF_ZONE_ID` | ID Zone vaše domene |
| `CF_PURGE_URL` | Puni URL skripte (npr. `https://adexclusion.dnevnik.hr/exclusions/sponsorship_exclusions.js`) |

### Arhitektura
- **Static Assets**: Sve datoteke iz roota (`index.html`, `App.tsx`, itd.) se serviraju automatski.
- **Functions**: Mapa `/functions` se automatski pretvara u Edge rute.
- **Edge Purge**: Prilikom svake objave, sustav šalje zahtjev Cloudflare API-ju da očisti cache za URL definiran u `CF_PURGE_URL`.

---
*Senior Systems Architect*