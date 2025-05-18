import { setupUILogger } from './utils/logger.js';
setupUILogger();

// === Cryptographie
import { encryptData, decryptData, encryptDataWithWorker, decryptDataWithWorker } from './core/crypto/aes-gcm.js';
import { deriveMasterKey, deriveMasterKeyWithWorker } from './core/crypto/pbkdf2.js';

// === Stockage
import { openDB } from './core/storage/indexeddb.js';
import { exportVault, importVault } from './core/storage/backup.js';
import { VaultSchema } from './core/storage/schema.js';
import { StorageManager } from './core/storage/manager.js';

// === Vault
import { VaultManager } from './core/vault/manager.js';
import { Vault } from './core/vault/vault.js';

// === Sécurité
import { AutoLock } from './security/autolock.js';
import { zeroize } from './security/memory.js';
import { enforceCSP } from './security/csp.js';
import { auditVault } from './security/audit.js';

// === UI
import { showAuthScreen, hideAuthScreen } from './ui/auth-screen/auth-screen.js';
import { evaluatePasswordStrength, renderStrengthMeter } from './ui/password-meter/password-meter.js';
import { renderVaultEntries } from './ui/vault-list/vault-list.js';

// === Utilitaires
import { PasswordGenerator } from './utils/password-generator.js';
import { IDBHelper } from './utils/idb-helper.js';
import { showToast } from './utils/toast.js';

// === Sécurité CSP
enforceCSP();

// === Initialisation du gestionnaire principal
const vaultManager = new VaultManager();
vaultManager.storage = new StorageManager();
vaultManager.isFirstTime = false;
window.vaultManager = vaultManager;

// Affichage/Masquage du mot de passe maître
document.getElementById('toggle-password-visibility').addEventListener('change', (e) => {
  const input = document.getElementById('master-password');
  input.type = e.target.checked ? 'text' : 'password';
});

// Vérifie support IndexedDB
if (!window.indexedDB) {
  showToast("IndexedDB n’est pas supporté par ce navigateur ou ce mode.");
  throw new Error("IndexedDB not supported.");
}

// === Ouverture IndexedDB et détection du premier lancement
vaultManager.storage.initializeDB().then(async () => {
  const existingVault = await vaultManager.storage.loadVault();

  if (!existingVault) {
    const restored = await vaultManager.storage.restoreFromLocalBackup();
    if (restored) {
      console.log('[INIT] Vault restauré depuis backup localStorage.');
    } else {
      console.log('[INIT] Aucun vault détecté — création du mot de passe maître requise.');
      const titleElement = document.getElementById('auth-title');
      const btnElement = document.getElementById('unlock-vault');
      if (titleElement) titleElement.textContent = 'Créer un mot de passe maître';
      if (btnElement) btnElement.textContent = 'Créer';
      vaultManager.isFirstTime = true;
    }
  } else {
    console.log('[INIT] Vault détecté — déverrouillage nécessaire.');
  }
}).catch((err) => {
  console.error('[ERREUR] Impossible d’ouvrir la base IndexedDB :', err);
  showToast("Erreur critique : échec d’accès au stockage sécurisé.");
});


// AutoLock actif après authentification
const locker = new AutoLock(() => {
  vaultManager.masterKey = null;
  showAuthScreen();
  showToast('Session verrouillée automatiquement.', 'error');
}, 300000);

// Générateur de mot de passe
document.getElementById('generate-password').addEventListener('click', () => {
  const password = PasswordGenerator.generate();
  document.getElementById('entry-password').value = password;
});

// Force du mot de passe en live
document.getElementById('entry-password').addEventListener('input', (e) => {
  const strength = evaluatePasswordStrength(e.target.value);
  renderStrengthMeter(strength);
});

// Formulaire d'authentification
document.getElementById('auth-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const password = document.getElementById('master-password').value;

  if (!password || password.length < 6) {
    showToast("Le mot de passe maître doit contenir au moins 6 caractères.", "error");
    return;
  }

  const vault = await vaultManager.storage.loadVault();

  if (!vault) {
    // 🆕 Initialisation
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const key = await deriveMasterKey(password, salt);
    vaultManager.masterKey = key;

    const validation = await encryptData({ check: 'ok' }, key);

    await vaultManager.storage.saveVault(
      [],
      {
        salt: btoa(String.fromCharCode(...salt)),
        last_modified: new Date().toISOString(),
        validation
      }
    );

    vaultManager.isFirstTime = false;
    showToast("Vault initialisé avec succès.", "success");

  } else {
    // 🔐 Authentification
    try {
      const salt = Uint8Array.from(atob(vault.meta.salt), c => c.charCodeAt(0));
      const key = await deriveMasterKey(password, salt);
      vaultManager.masterKey = key;

    // === LOGS DE DÉBOGAGE CRYPTO ===
    console.log("Salt utilisé:", vault.meta.salt);
    if (vault.meta.validation) {
      console.log("IV utilisé:", vault.meta.validation.iv);
      console.log("Ciphertext:", vault.meta.validation.ciphertext);
    }


      // ✅ Test de validation
      const validation = vault.meta.validation;
      const test = await decryptData(validation, key);
      if (!test || test.check !== 'ok') throw new Error('Validation échouée');

      // ✅ Clé correcte, on peut déchiffrer les entrées
      await vaultManager.decryptAllEntries();

    } catch (err) {
      vaultManager.masterKey = null;
      showToast("Mot de passe maître incorrect.", "error");
      return;
    }
  }


  hideAuthScreen();

  const stats = await vaultManager.getPasswordStats();
  document.getElementById('stats-section').innerText =
    `Total: ${stats.total} | Réutilisés: ${stats.reused} | Faibles: ${stats.weak}`;

  const entries = await vaultManager.decryptAllEntries();
  renderVaultEntries(entries);
});


// === EXPORT DU COFFRE (.vault)
document.getElementById('btn-export').addEventListener('click', async () => {
  try {
    const vault = await vaultManager.storage.loadVault();
    const blob = exportVault(vault);
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `vault_${new Date().toISOString().split('T')[0]}.vault`;
    a.click();

    URL.revokeObjectURL(url);
    showToast("Export du coffre terminé.", "success");
  } catch (err) {
    console.error('[Vault Export] Échec :', err);
    showToast("Erreur lors de l’export du coffre.", "error");
  }
});

// === DÉCLENCHE L’INPUT FICHIER (.vault)
document.getElementById('btn-import').addEventListener('click', () => {
  document.getElementById('file-import').click();
});

// === IMPORT DU COFFRE (.vault)
document.getElementById('file-import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const confirmation = confirm("Cette action écrasera le coffre actuel. Continuer ?");
  if (!confirmation) {
    showToast("Import annulé par l'utilisateur.", "warning");
    return;
  }

  try {
    const data = await importVault(file);

    // ✅ Validation minimale des champs
    if (!data.meta || !data.meta.salt || !data.meta.validation) {
      showToast("Fichier .vault invalide ou incomplet.", "error");
      return;
    }

    // ✅ Force le champ 'id' requis par IndexedDB
    const vaultToImport = {
      id: 'current',
      entries: Array.isArray(data.entries) ? data.entries : [],
      meta: data.meta
    };

    await vaultManager.storage.importFullVault(vaultToImport);
    showToast('Vault importé avec succès. Rechargez la page pour l’utiliser.', 'success');
  } catch (err) {
    console.error('[Vault Import] Échec :', err);
    showToast('Erreur à l’importation : vault invalide.', 'error');
  }
});


// Formulaire d'ajout d'entrée
document.getElementById('entry-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const title = document.getElementById('entry-title').value.trim();
  const username = document.getElementById('entry-username').value.trim();
  const password = document.getElementById('entry-password').value;

  if (!title || !username || !password) {
    showToast("Tous les champs sont requis.", "error");
    return;
  }

  try {
    await vaultManager.addEntry({ title, username, password });
    document.getElementById('entry-title').value = '';
    document.getElementById('entry-username').value = '';
    document.getElementById('entry-password').value = '';

    const stats = await vaultManager.getPasswordStats();
    document.getElementById('stats-section').innerText =
      `Total: ${stats.total} | Réutilisés: ${stats.reused} | Faibles: ${stats.weak}`;

    showToast("Entrée enregistrée avec succès.", "success");
  } catch (err) {
    console.error("Erreur lors de l'enregistrement :", err);
    showToast("Échec lors de l'enregistrement.", "error");
  }
  
  
});

