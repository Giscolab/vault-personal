console.log('[✔] Chargement depuis localStorage:', !!localStorage.getItem('vault'));
/**
 * Classe représentant un coffre local manipulé en mémoire.
 * Ne fait pas de persistance ni de chiffrement directement.
 */
export class Vault {
  constructor(entries = []) {
    this.entries = entries; // Entrées en clair (déjà déchiffrées)
  }

  /**
   * Ajoute une nouvelle entrée (non chiffrée, structure simple).
   * @param {Object} entry - { id, title, username, password }
   */
  addEntry(entry) {
    this.entries.push(entry);
  }

  /**
   * Supprime une entrée par son ID.
   * @param {string} id - UUID de l'entrée
   */
  removeEntry(id) {
    this.entries = this.entries.filter(e => e.id !== id);
  }

  /**
   * Retourne toutes les entrées.
   * @returns {Array<Object>}
   */
  getAllEntries() {
    return [...this.entries];
  }

  /**
   * Modifie une entrée existante (remplacement complet).
   * @param {string} id - UUID
   * @param {Object} updatedEntry - Données mises à jour
   */
  updateEntry(id, updatedEntry) {
    this.entries = this.entries.map(e => (e.id === id ? updatedEntry : e));
  }

  /**
   * Vérifie si une entrée existe.
   * @param {string} id
   * @returns {boolean}
   */
  hasEntry(id) {
    return this.entries.some(e => e.id === id);
  }

  /**
   * Vide complètement le vault.
   */
  clear() {
    this.entries = [];
  }
}
