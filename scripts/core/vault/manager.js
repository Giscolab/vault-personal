import { VaultSchema } from '../../core/storage/schema.js';
import { StorageManager } from '../../core/storage/manager.js';
import { Vault } from './vault.js';
import { encryptData, decryptData } from '../../core/crypto/aes-gcm.js';
import { deriveMasterKey } from '../../core/crypto/pbkdf2.js';

export class VaultManager {
  constructor() {
    this.storage = new StorageManager(); // ✅ Utilisation unique
    this.vault = new Vault();            // Entrées déchiffrées en mémoire
    this.masterKey = null;               // CryptoKey AES-GCM dérivée
    this.salt = null;                    // Uint8Array
  }

  async initialize(password) {
    await this.storage.initializeDB(); // ✅ ouverture assurée
    const vaultRecord = await this.storage.loadVault();

    if (!vaultRecord) {
      this.salt = crypto.getRandomValues(new Uint8Array(16));
      this.masterKey = await deriveMasterKey(password, this.salt);

      const newVault = structuredClone(VaultSchema);
      newVault.meta.salt = this._arrayToBase64(this.salt);
      newVault.meta.created_at = new Date().toISOString();
      newVault.meta.last_modified = new Date().toISOString();

      await this.storage.saveVault([], newVault.meta);
    } else {
  this.salt = this._base64ToArray(vaultRecord.meta.salt);
  this.masterKey = await deriveMasterKey(password, this.salt);

  this.vault.clear();
  for (const entry of vaultRecord.entries) {
    const data = await decryptData(entry, this.masterKey);
    this.vault.addEntry({ id: entry.id, ...data });
  }
  window.vault = this.vault; // ✅ ligne ajoutée proprement ici
}
  }

  async addEntry(entryData) {
    const id = crypto.randomUUID();
    const encrypted = await encryptData(entryData, this.masterKey);
    const vault = await this._loadRawVault();

    vault.entries.push({
      id,
      ...encrypted
    });

    vault.meta.last_modified = new Date().toISOString();
    await this.storage.saveVault(vault.entries, vault.meta);

    this.vault.addEntry({ id, ...entryData }); // pour l'affichage direct
  }

  async decryptAllEntries() {
    const vault = await this._loadRawVault();
    const decrypted = [];

    for (const entry of vault.entries) {
      const data = await decryptData(entry, this.masterKey);
      decrypted.push({ id: entry.id, ...data });
    }

    this.vault.clear();
    decrypted.forEach(entry => this.vault.addEntry(entry));
    return decrypted;
  }

async getPasswordStats() {
  const entries = this.vault.getAllEntries();
  const stats = { total: entries.length, reused: 0, weak: 0 };

  const seen = new Set();

  for (const e of entries) {
    if (seen.has(e.password)) stats.reused++;
    else seen.add(e.password);

    if (e.password.length < 10 || !/[A-Z]/.test(e.password) || !/[0-9]/.test(e.password)) {
      stats.weak++;
    }
  }

  // === AJOUT CALCUL SCORE ===
  let score = 0;
  if (stats.total > 0) {
    score = Math.round(100 * (stats.total - stats.weak - stats.reused) / stats.total);
    if (score < 0) score = 0;
  }

  // Tu peux aussi ajouter old si tu veux
  // let old = ... (par exemple, à calculer selon la date de modif ou autre)

  return {
    ...stats,
    score,        // <--- AJOUT OBLIGATOIRE !
    old: 0        // <--- Si tu n’as pas encore old, mets 0 temporairement
  };
}

  async markEntryAccessed(entryId) {
    const vault = await this._loadRawVault();
    const now = Date.now();
    
    for (let encryptedEntry of vault.entries) {
      if (encryptedEntry.id === entryId) {
        // Déchiffrer l’entrée
        const data = await decryptData(encryptedEntry, this.masterKey);
        data.lastAccessed = now;
        data.accessCount = (data.accessCount || 0) + 1;

        // Réencrypter avec les nouveaux champs
        const updatedEncrypted = await encryptData(data, this.masterKey);
        Object.assign(encryptedEntry, updatedEncrypted);
        break;
      }
    }

    vault.meta.last_modified = new Date().toISOString();
    await this.storage.saveVault(vault.entries, vault.meta);

    // Met aussi à jour en mémoire
    const localEntry = this.vault.getEntryById(entryId);
    if (localEntry) {
      localEntry.lastAccessed = now;
      localEntry.accessCount = (localEntry.accessCount || 0) + 1;
	  this.vault.updateEntry(localEntry);

    }
  }


  getEntries() {
    return this.vault.getAllEntries();
  }

  // 🔐 Chargement direct du vault (brut)
  async _loadRawVault() {
    await this.storage.initializeDB();
    const result = await this.storage.loadVault();
    return result || structuredClone(VaultSchema);
  }

  // 🔧 conversion de base64 <-> Uint8Array
  _arrayToBase64(arr) {
    return btoa(String.fromCharCode(...arr));
  }

  _base64ToArray(str) {
    return Uint8Array.from(atob(str), c => c.charCodeAt(0));
  }
}
export const vaultManager = new VaultManager();


