# 🔐 Vault Personal – Gestionnaire de mots de passe local ultra sécurisé

> Projet personnel 100% client-side, sans dépendance externe, basé sur Web Crypto API et IndexedDB.  
> Pensé pour usage **hors ligne**, **sans serveur**, avec une sécurité avancée.

---

## ✨ Nouveautés et évolutions

- **Refonte complète de l’organisation du projet :**
  - Modularisation des feuilles de style CSS avec des sous-dossiers (`base`, `components`, `layout`, `utilities`) pour une meilleure maintenabilité et évolutivité.
  - Introduction de fichiers dédiés à la documentation (`README.md` à la racine et dans `/docs`).
  - Ajout de scripts utilitaires, notamment pour l’import/export de données (`import-csv.js`).
  - Ajout ou mise à jour régulière de fichiers d’état du projet (`structure.txt`, `arborescence_vault.md`).

- **Sécurité renforcée :**
  - Politique CSP strictement renforcée dans le template HTML (`default-src 'none'; object-src 'none'; base-uri 'none'; ...`).
  - Chiffrement AES-GCM 256 bits, dérivation PBKDF2-HMAC-SHA512 avec 150 000 itérations et salt aléatoire de 128 bits.
  - Isolation mémoire via web workers pour toutes les opérations sensibles.
  - AutoLock après inactivité prolongée pour réduire le risque en cas d’oubli.

- **Expérience utilisateur et accessibilité :**
  - Refactoring de l’UI avec des classes CSS explicites et réutilisables.
  - Amélioration du responsive et de l’accessibilité avec des utilitaires dédiés.
  - Ajout de notifications toast, analyse de la force des mots de passe, et gestion centralisée des erreurs.

- **Fonctionnalités clés :**
  - Gestion locale hors ligne de tous les identifiants (aucune donnée transmise en ligne).
  - Sauvegarde/export chiffré du coffre, import depuis d’autres formats (notamment CSV pour migration depuis Edge).
  - Tests unitaires intégrés accessibles dans le navigateur.

---

## 🚀 Lancer l’application en local

1. Ouvrir un terminal :
   ```cmd
   cd C:\Users\Franck\Desktop\password-manager
   start start_vault_local.bat
Accéder à : http://localhost:8000 dans le navigateur.

🛡️ Sécurité et confidentialité
Aucune donnée transmise ou stockée en ligne.

Vault chiffré et stocké localement via IndexedDB.

Surface d’attaque réduite grâce à une CSP stricte et un code segmenté.

Aucun CDN, aucune dépendance externe, code 100% local.

🧪 Tests et qualité
Scripts de test disponibles dans le dossier /tests/ pour vérifier la robustesse du chiffrement et du stockage.

Les tests peuvent être exécutés dans le navigateur en important les modules correspondants.

📅 Roadmap et évolutions prévues
Support de l’authentification forte TOTP (2FA)

Export chiffré signé et partage sécurisé (Shamir Secret Sharing)

Support WebAuthn (clé physique)

Audit automatisé selon les recommandations OWASP

👤 Auteur
Projet développé par Franck pour une gestion locale, privée et souveraine des identifiants.
