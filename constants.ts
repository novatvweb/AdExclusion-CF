
import { TargetingKey } from './types';

export const TARGETING_KEYS: { label: string; value: TargetingKey }[] = [
  { label: 'Portal (Site)', value: 'site' },
  { label: 'Ključne riječi (Keywords)', value: 'keywords' },
  { label: 'Rubrika (Section)', value: 'section' },
  { label: 'Glavna rubrika (Top Section)', value: 'top_section' },
  { label: 'Vrsta stranice (Page Type)', value: 'page_type' },
  { label: 'ID Članka (Content ID)', value: 'content_id' },
  { label: 'Puna adresa (URL)', value: 'description_url' },
  { label: 'Oglasi omogućeni?', value: 'ads_enabled' },
  { label: 'Domena', value: 'domain' },
  { label: 'AB Test Grupa', value: 'ab_test' }
];

export const DEFAULT_SELECTORS = [
  { label: 'Branding (Background)', value: '.bg-branding-main' },
  { label: 'Glavni Promo Box', value: '#promo-box-general' },
  { label: 'Sponzor u dnu (Footer)', value: '.footer-sponsor-logo' },
  { label: 'Bočni Banner (Sky)', value: '.sky-ads-wrapper' }
];
