
# AdExclusion Enterprise 🚀

**AdExclusion Enterprise** koristi Cloudflare Pages arhitekturu za maksimalne performanse na Edge-u.

## 🚀 Cloudflare Dashboard Postavke

Ako sustav od vas traži unos u obavezna polja, unesite sljedeće:

1. **Build command**: `npm run build`
2. **Build output directory**: `.`
3. **Deploy command**: `npm run deploy`

### Ručna konfiguracija KV bindinga
U Cloudflare sučelju pod **Settings > Functions > KV namespace bindings**:
- **Variable name**: `AD_EXCLUSION_KV`
- **KV namespace**: Odaberite vaš namespace s ID-em `a8017b5da883497c93f42d18b77325a3`.

### Zašto "npm run deploy"?
Ova naredba poziva `wrangler pages deploy .`. To osigurava da Cloudflare prepozna projekt kao **Pages** (Static + Functions), a ne kao običan **Worker**, čime se rješava greška koju ste dobili.

---
*Senior Architecture Team*
