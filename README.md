# AdExclusion Enterprise 🚀
**The Edge-Native Sponsorship Management Engine**

**AdExclusion Enterprise** je administrativni alat i Edge-native sustav dizajniran za news portale visoke posjećenosti. Omogućuje prodajnim i ad-ops timovima dinamičko upravljanje izuzecima sponzorstava (sponsorship blacklist) u realnom vremenu, bez potrebe za intervencijom developera ili novim deploymentima koda na glavnom portalu.

## 🌟 Ključne Značajke
- **Cloudflare Edge Performance**: Sustav koristi Cloudflare Workers i KV storage kako bi isporučio pravila za sakrivanje elemenata s nultom latencijom, direktno s najbliže Edge lokacije korisniku.
- **Dynamic Targeting Engine**: Pravila se aktiviraju na temelju `page_meta` metapodataka (site, section, keywords, content_id, page_type) koji su već prisutni na news portalu.
- **AI-Powered Rule Assistant**: Integrirani **Google Gemini AI** omogućuje korisnicima kreiranje kompleksnih CSS selektora i pravila koristeći prirodni jezik (npr. *"Sakrij branding na svim člancima o nogometu"*).
- **Real-time Simulator (Sandbox)**: Ugrađeni simulator omogućuje administratorima da testiraju pravila protiv mock podataka prije same objave na produkciju.
- **CLS Optimization**: Sustav generira optimizirani CSS injektor koji minimizira *Layout Shift* (CLS), osiguravajući da se sponzorski elementi sakriju prije nego što postanu vidljivi korisniku.

## 🏗️ Tehnološki Stog (Architecture)
- **Frontend**: React 19 + Tailwind CSS (Enterprise UI/UX).
- **Backend**: Cloudflare Pages Functions (Serverless Edge API).
- **Storage**: Cloudflare KV (Globalno distribuirani Key-Value store).
- **AI**: Google Gemini Pro API (za inteligentno generiranje pravila).
- **Deployment**: Potpuno optimizirano za Cloudflare Pages & Workers ekosustav.

---

## 🚀 Upute za Deployment na Cloudflare Pages

Slijedite ove korake kako biste postavili aplikaciju na svoju `adexclussion.dnevnik.hr` domenu (ili bilo koju drugu CF domenu).

### 1. Priprema Cloudflare KV (Baze podataka)
Prije deploymenta, moramo kreirati prostor u kojem će Cloudflare čuvati pravila.
1. Prijavite se na [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Idite na **Workers & Pages** -> **KV**.
3. Kliknite **Create a Namespace**.
4. Nazovite ga `AD_EXCLUSION_KV`.
5. Kopirajte dobiveni **ID** (dugački niz znakova).

### 2. Konfiguracija koda
1. Otvorite datoteku `wrangler.toml` u rootu projekta.
2. Zamijenite `YOUR_KV_NAMESPACE_ID` s ID-om koji ste kopirali u prethodnom koraku.

### 3. Slanje koda na GitHub
1. Kreirajte novi repozitorij na GitHubu.
2. Gurnite (push) kod iz vašeg lokalnog direktorija na GitHub.

### 4. Postavljanje Cloudflare Pages aplikacije
1. Na Cloudflare Dashboardu idite na **Workers & Pages** -> **Create application**.
2. Odaberite karticu **Pages** -> **Connect to Git**.
3. Povežite svoj GitHub račun i odaberite ovaj repozitorij.
4. **Build settings**:
   - **Framework preset**: `None`
   - **Build command**: (Ostavite prazno, aplikacija se pokreće klijentski)
   - **Build output directory**: `/` (root)
5. Kliknite **Save and Deploy**.

### 5. Konfiguracija Environment Varijabli i KV Bindinga
Nakon prvog deploymenta, moramo povezati aplikaciju s bazom i AI ključem:
1. U postavkama Pages projekta idite na **Settings** -> **Functions**.
2. Pod **KV namespace bindings** kliknite **Add binding**.
   - **Variable name**: `AD_EXCLUSION_KV`
   - **KV namespace**: Odaberite vaš `AD_EXCLUSION_KV` s liste.
3. Idite na **Settings** -> **Environment variables**.
4. Dodajte novu varijablu:
   - **Variable name**: `API_KEY`
   - **Value**: Vaš Google Gemini API Key.
5. **VAŽNO**: Da bi promjene postale aktivne, idite na **Deployments** i pokrenite **Retry deployment** (ili napravite novi commit na GitHub).

---

## 🛠️ Kako sustav radi?
1. **Dashboard**: Administrator definira pravilo (npr. ako je `keywords` sadrži "Heineken", sakrij `.bg-branding-main`).
2. **Edge Sync**: Pritiskom na "Objavi", pravila se spremaju u Cloudflare KV i generira se statička JS datoteka.
3. **Portal Integration**: News portal učitava laganu skriptu (`sponsorship_exclusions.js`) koja na klijentu provjerava metapodatke stranice i trenutno primjenjuje restrikcije putem dinamičkog CSS-a.

## 📈 Enterprise Ready
Dizajnirano za sustave poput **DNEVNIK.hr** i srodne portale unutar **United Group** / **Nova TV** mreže, gdje su brzina isporuke i preciznost targetinga kritični za korisničko iskustvo i ad-revenue.

---
*Created and maintained by the Digital Ops Team.*