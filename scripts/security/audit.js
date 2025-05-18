/**
 * Analyse les entrées déchiffrées du vault et identifie les faiblesses.
 * @param {Array<Object>} entries - Entrées en clair : { id, title, username, password }
 * @returns {Object} - Statistiques : total, weak, reused, liste des doublons
 */
export function auditVault(entries) {
  const stats = {
    total: entries.length,
    reused: 0,
    weak: 0,
    duplicates: []
  };

  const passwordMap = new Map();

  for (const entry of entries) {
    const pwd = entry.password;

    // Critère de mot de passe faible
    const isWeak = pwd.length < 10 || !/[A-Z]/.test(pwd) || !/[0-9]/.test(pwd);
    if (isWeak) stats.weak++;

    // Recherche de duplication
    if (passwordMap.has(pwd)) {
      stats.reused++;
      stats.duplicates.push({
        id: entry.id,
        title: entry.title,
        duplicateWith: passwordMap.get(pwd)
      });
    } else {
      passwordMap.set(pwd, entry.title);
    }
  }

  return stats;
}
