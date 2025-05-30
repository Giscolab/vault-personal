# 🔐 Vault Personal – Gestionnaire de mots de passe local et sécurisé

**Vault Personal** est une application web locale ultra-sécurisée pour stocker, chiffrer et gérer ses mots de passe **hors ligne**, sans dépendance à un serveur distant, ni cloud.

---

## 📦 Fonctionnalités

- 🔐 **Mot de passe maître** requis pour accéder aux données
- 🔑 **Chiffrement AES-GCM 256 bits** avec dérivation PBKDF2-HMAC-SHA512
- 🧠 **Auto-verrouillage** après inactivité (configurable)
- ✍️ Ajout d’entrées : site/service, identifiant, mot de passe
- 🔎 Interface responsive, sombre, intuitive
- 👁️ Affichage masqué/démasqué + copier/coller sécurisé
- 📋 Export / Import du coffre (.vault)
- ✅ Sauvegarde automatique dans `IndexedDB` et `localStorage`
- 📊 Statistiques : mots de passe faibles, réutilisés
- 🔔 Notifications toast dynamiques

---

## 🔧 Technologies utilisées

| Domaine           | Outils utilisés                      |
|-------------------|--------------------------------------|
| Frontend UI       | HTML5, CSS3 (Material Dark)          |
| JavaScript        | Vanilla JS + Web Components (modulaires) |
| Cryptographie     | Web Crypto API (AES-GCM, PBKDF2)     |
| Stockage local    | IndexedDB + localStorage (fallback)  |
| Sécurité           | CSP, auto-lock, workers, zeroization |
| Tests             | Modules `*.spec.js` natifs           |

---

## 🚀 Lancement local

1. **Cloner ou extraire** ce projet :
   ```bash
   git clone https://github.com/ton-utilisateur/vault-personal
