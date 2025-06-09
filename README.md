
### **README**

````markdown
# 🔐 Vault Personal — Gestionnaire de mots de passe chiffré, 100% local

**Vault Personal** est un gestionnaire de mots de passe personnel, totalement autonome, conçu pour une utilisation **hors ligne** et sans aucune dépendance externe.  
_Le code, les styles, les scripts et la sécurité sont intégralement sous votre contrôle, sans cloud ni tracking._

---

## 🏗️ Structure et philosophie

- **100% local** : tout fonctionne en client-side, rien n’est envoyé, aucune API externe, aucun CDN.
- **Chiffrement avancé** :  
  - **AES-GCM 256 bits** pour chaque entrée  
  - **PBKDF2-HMAC-SHA512** (itérations custom) pour la dérivation de clé maître
  - **Web Crypto API** pour toutes les opérations sensibles
- **Stockage sécurisé** via **IndexedDB**  
- **Modularité poussée** :  
  - Feuilles de style CSS découpées (`base`, `components`, `layout`, `utilities`)
  - Scripts JavaScript organisés (`core`, `security`, `ui`, `utils`)
  - Aucune dépendance externe (toutes les librairies sont locales, même Chart.js)
- **Accessibilité et responsive** par design (navigation clavier, utilitaires CSS, structure adaptée mobile/desktop)
- **Tests unitaires** accessibles via `/tests/`
- **Documentation complète** dans `/docs/` et à la racine

---

## 🚀 Démarrage

1. Clonez le dépôt :
   ```bash
   git clone https://github.com/Giscolab/vault-personal.git
   cd vault-personal
````

2. Lancez localement (Windows) :

   ```cmd
   start start_vault_local.bat
   ```
3. Accédez à [http://localhost:8000](http://localhost:8000) dans votre navigateur

> *Utilisation possible en offline sur tous les navigateurs modernes. Zéro serveur, zéro installation.*

---

## ✨ Fonctionnalités concrètes

* **Gestion locale et chiffrée de vos identifiants**
* **Export/Import** sécurisé (CSV & .vault)
* **Analyse de sécurité intégrée** (scores, forces, alertes)
* **Auto-verrouillage après inactivité**
* **Gestion du presse-papier avec effacement automatique**
* **UI modulaire et notifications toast**
* **Composants CSS personnalisés (score, toast, modale, etc.)**
* **Statistiques et visualisations (Chart.js local)**
* **Responsive et accessibilité intégrées**

---

## 🛡️ Sécurité et bonnes pratiques

* Le **mot de passe maître** n’est jamais stocké.
* Chaque entrée est chiffrée individuellement avec un IV aléatoire.
* Les opérations cryptographiques s’exécutent en mémoire isolée (Web Workers).
* **CSP stricte** appliquée dans le template HTML.
* Aucun code tiers, aucune bibliothèque chargée dynamiquement.

---

## 🛠️ Roadmap / évolutions à venir

* Authentification forte (TOTP/2FA)
* Partage chiffré (Shamir Secret Sharing)
* Intégration WebAuthn
* Audit de sécurité automatisé

---

Projet personnel, développé par **Franck**.
Retours, contributions ou forks bienvenus.
[GitHub — Giscolab/vault-personal](https://github.com/Giscolab/vault-personal)

```
