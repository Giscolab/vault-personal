# 🔐 Vault Personal – Gestionnaire de mots de passe local ultra sécurisé

> Projet personnel 100% client-side sans dépendance externe, basé sur Web Crypto API et IndexedDB.  
> Pensé pour usage **hors ligne**, **sans serveur**, **avec sécurité sérieuse**.

---

## 🧱 Structure du projet

```
C:.
├── index.html
├── start_vault_local.bat
├── public/
│   ├── style.css
│   └── icons/ (favicon, PWA icons, manifest)
├── scripts/
│   ├── app.js
│   ├── core/
│   │   ├── crypto/ (chiffrement + workers)
│   │   ├── storage/ (IndexedDB, backup, schéma)
│   │   └── vault/ (logique vault)
│   ├── security/ (autolock, CSP, audit)
│   ├── ui/ (auth-screen, password-meter, vault-list)
│   └── utils/ (idb-helper, password-generator)
├── tests/
│   ├── crypto.spec.js
│   └── vault.spec.js
└── arborescence.txt / .md (docs internes)
```

---

## 🚀 Lancement local

1. Ouvre un terminal `cmd` :
```bash
cd C:\Users\Franck\Desktop\password-manager
start start_vault_local.bat
```

2. Ouvre ton navigateur :
```
http://localhost:8000
```

---

## 🔐 Fonctionnalités

- Chiffrement AES-GCM 256 bits
- Dérivation PBKDF2-HMAC-SHA512 (150 000 itérations)
- Salt aléatoire 128 bits, stocké en base
- Web Workers pour les opérations crypto isolées
- AutoLock après inactivité
- Générateur de mots de passe sécurisés
- Analyse de la force et détection de doublons
- Backup `.vault` exportable et réimportable
- Zéro dépendance externe (aucune lib, aucun CDN)

---

## 🔬 Tests disponibles

Lancer dans navigateur avec :

```html
<script type="module" src="tests/crypto.spec.js"></script>
<script type="module" src="tests/vault.spec.js"></script>
```

---

## 📌 Notes de sécurité

- Aucune donnée n’est envoyée en ligne
- Le vault est **chiffré au repos dans IndexedDB**
- La mémoire est isolée autant que possible
- CSP active + code segmenté pour réduire surface XSS

---

## 📅 À venir

- Support TOTP (2FA)
- Export chiffré signé + Shamir Secret Sharing
- WebAuthn + Hardware Key
- Audit OWASP automatisé

---

## 👨‍💻 Auteur

Projet personnel développé par Franck pour une gestion locale privée et maîtrisée de ses identifiants.
