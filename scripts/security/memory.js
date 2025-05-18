/**
 * Efface de la mémoire un tableau de type Uint8Array ou ArrayBuffer
 * en le remplissant de zéros. Utilisé pour des données sensibles (sel, clés, etc).
 * @param {ArrayBuffer|Uint8Array} buffer
 */
export function zeroize(buffer) {
  if (buffer instanceof ArrayBuffer) {
    buffer = new Uint8Array(buffer);
  }
  if (buffer instanceof Uint8Array) {
    buffer.fill(0);
  } else {
    console.warn('[zeroize] Type non supporté:', typeof buffer);
  }
}
