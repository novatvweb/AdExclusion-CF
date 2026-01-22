
/**
 * EXCLUSION ENGINE (Lightweight Vanilla JS)
 * 
 * Ovo je "lite" verzija logike koju trebate zalijepiti na news portal.
 * Dizajnirana je da bude non-blocking i brza.
 */

/*
// @ts-ignore - Assuming page_meta exists globally on portal
window.runSponsorshipExclusion = function(rules) {
  if (!window.page_meta || !window.page_meta.third_party_apps || !window.page_meta.third_party_apps.ntAds) {
    return;
  }

  const targeting = window.page_meta.third_party_apps.ntAds.targeting;

  rules.forEach(rule => {
    const { key, op, val, sel } = rule;
    const actualValue = targeting[key];
    let isMatch = false;

    if (op === 'equals') {
      isMatch = actualValue === val;
    } else if (op === 'contains') {
      if (Array.isArray(actualValue)) {
        isMatch = actualValue.includes(val);
      } else if (typeof actualValue === 'string') {
        isMatch = actualValue.includes(val);
      }
    }

    if (isMatch) {
      // Optimizacija: Koristimo CSS umjesto JS hide-a da izbjegnemo Layout Shift (CLS)
      const styleId = 'hide-sponsor-style-' + key;
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `${sel} { display: none !important; pointer-events: none !important; visibility: hidden !important; }`;
        document.head.appendChild(style);
      }
    }
  });
};
*/
export {};
