/**
 * Applique dynamiquement une Content-Security-Policy si elle est absente.
 * Ne fonctionne que côté client (local). Ne remplace pas une vraie en-tête HTTP.
 */
export function enforceCSP() {
  const existingMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');

  if (!existingMeta) {
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data:",
      "object-src 'none'",
      "base-uri 'none'"
    ].join('; ');

    document.head.appendChild(meta);

    console.log('[CSP] Politique de sécurité injectée localement.');
  } else {
    console.log('[CSP] Politique de sécurité déjà présente.');
  }
}
