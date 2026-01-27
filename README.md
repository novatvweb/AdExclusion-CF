
# AdExclusion Enterprise 🚀

**AdExclusion Enterprise** je optimiziran za Cloudflare Pages Git-integritaciju.

## ✅ Cloudflare Dashboard Konfiguracija

Kako bi Build, Login i Purge radili ispravno, potrebno je podesiti sljedeće u Cloudflare Dashboardu:

### 1. Bindings (Settings > Functions)
- **KV Namespace Binding**: 
  - Variable name: `AD_EXCLUSION_KV`
  - KV namespace: Odaberite vaš namespace.

### 2. Variables and Secrets (Settings > Environment variables)
Dodajte ove varijable pod **Secrets** (encrypted) za Production i Preview okruženja:

| Variable Name | Description | Mandatory |
| :--- | :--- | :--- |
| `ADMIN_PASS` | Lozinka za pristup admin sučelju (SuperAdmin, username: `admin`) | **DA** |
| `USER_PASS` | Lozinka za pristup standardnog korisnika (username: `user`) | **NE** (Opcijonalno) |
| `CF_API_TOKEN` | API Token sa dozvolom `Zone.Cache Purge` | DA (za Purge) |
| `CF_ZONE_ID` | ID Zone vaše domene | DA (za Purge) |
| `CF_PURGE_URL` | Puni URL skripte (npr. `https://adexclusion.dnevnik.hr/exclusions/sponsorship_exclusions.js`) | DA (za Purge) |

### Razine Pristupa (RBAC)
- **admin**: Puni pristup sustavu, uključujući Custom JavaScript Injection.
- **user**: Standardni pristup (uređivanje pravila), ali bez mogućnosti dodavanja ili pregleda Custom JS koda.

### Arhitektura
- **Static Assets**: Sve datoteke iz roota (`index.html`, `App.tsx`, itd.) se serviraju automatski.
- **Functions**: Mapa `/functions` se automatski pretvara u Edge rute.
- **Edge Auth**: Prijava se vrši putem `/api/login` koji provjerava lozinku direktno iz Cloudflare Secrets, bez slanja lozinke klijentu.
- **Edge Purge**: Prilikom svake objave, sustav šalje zahtjev Cloudflare API-ju da očisti cache za URL definiran u `CF_PURGE_URL`.

---
*Senior Systems Architect*
