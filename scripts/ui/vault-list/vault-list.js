// scripts/ui/vault-list/vault-list.js

import { showToast } from '../../utils/toast.js';
import modalManager from '../modal.js';

export function renderVaultEntries(entries) {
  const container = document.getElementById('entries');
  container.innerHTML = '';
  // MAJ dynamique du compteur :
  const countElem = document.getElementById('vault-count');
  if (countElem) countElem.textContent = entries.length;

  if (!entries.length) {
    container.innerHTML = '<p>Aucune entrée enregistrée.</p>';
    return;
  }

  // DÉTECTION DU TYPE DE COMPTE POUR L'ICÔNE ET LA COULEUR
  function getIconClass(title) {
    const t = title.toLowerCase();
    if (t.includes('bank')) return { icon: 'fa-university', cls: 'bank-icon' };
    if (t.includes('email')) return { icon: 'fa-envelope', cls: 'email-icon' };
    if (t.includes('cloud')) return { icon: 'fa-cloud', cls: 'cloud-icon' };
    if (t.includes('social')) return { icon: 'fa-share-alt', cls: 'social-icon' };
    if (t.includes('shop')) return { icon: 'fa-shopping-cart', cls: 'shopping-icon' };
    if (t.includes('film') || t.includes('stream')) return { icon: 'fa-film', cls: 'entertainment-icon' };
    return { icon: 'fa-key', cls: '' };
  }

  // CALCUL RAPIDE DE LA SOLIDITÉ
  function getStrength(password) {
    let score = 0;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  }

  for (const entry of entries) {
    const { icon, cls } = getIconClass(entry.title || '');

    // Barre de solidité
    const strength = getStrength(entry.password);
    const dotClasses = [
      strength === 0 ? 'danger' : (strength < 3 ? 'warning' : 'active'),
      strength > 1 ? (strength < 3 ? 'warning' : 'active') : '',
      strength > 2 ? 'active' : '',
      strength > 3 ? 'active' : '',
      strength > 4 ? 'active' : ''
    ];

    const wrapper = document.createElement('div');
    wrapper.className = 'vault-item';
    wrapper.dataset.id = entry.id;

    wrapper.innerHTML = `
      <div class="account-info">
        <div class="account-icon ${cls}">
          <i class="fas ${icon}"></i>
        </div>
        <div class="account-details">
          <strong>${entry.title || ''}</strong>
          <span>${entry.username || ''}</span>
          <div class="password-field">
            <input type="password" value="${entry.password}" class="password-input" readonly>
            <button class="toggle-password" title="Afficher/masquer"><i class="fas fa-eye"></i></button>
          </div>
          <div class="strength-indicator">
            <span>Solidité :</span>
            <div class="strength-dot ${dotClasses[0]}"></div>
            <div class="strength-dot ${dotClasses[1]}"></div>
            <div class="strength-dot ${dotClasses[2]}"></div>
            <div class="strength-dot ${dotClasses[3]}"></div>
            <div class="strength-dot ${dotClasses[4]}"></div>
          </div>
        </div>
      </div>
      <div class="actions">
        <button class="action-btn copy" title="Copier le mot de passe"><i class="fas fa-copy"></i></button>
        <button class="action-btn edit" title="Modifier"><i class="fas fa-edit"></i></button>
        <button class="action-btn delete" title="Supprimer"><i class="fas fa-trash"></i></button>
      </div>
    `;

    container.appendChild(wrapper);
  }

  // ACTION : COPIER
  container.querySelectorAll('.action-btn.copy').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.closest('.vault-item').querySelector('.password-input');
      if (!input) return;
      navigator.clipboard.writeText(input.value).then(() => {
        btn.innerHTML = '<i class="fas fa-check"></i>';
        setTimeout(() => (btn.innerHTML = '<i class="fas fa-copy"></i>'), 1500);
        showToast('Mot de passe copié dans le presse-papiers !', 'success');
      });
    });
  });

  // ACTION : AFFICHER/MASQUER MOT DE PASSE
  container.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.closest('.password-field').querySelector('.password-input');
      input.type = input.type === 'password' ? 'text' : 'password';
      btn.querySelector('i').classList.toggle('fa-eye');
      btn.querySelector('i').classList.toggle('fa-eye-slash');
    });
  });

  // ACTION : SUPPRIMER
  container.querySelectorAll('.action-btn.delete').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.closest('.vault-item').dataset.id;
      if (!confirm('Supprimer cette entrée ?')) return;
      try {
        const vault = await window.vaultManager.storage.loadVault();
        const updated = vault.entries.filter(e => e.id !== id);
        await window.vaultManager.storage.saveVault(updated, vault.meta);
        const decrypted = await window.vaultManager.decryptAllEntries();
        renderVaultEntries(decrypted);

        const stats = await window.vaultManager.getPasswordStats();
        // Optionnel : maj d'une section stats ailleurs
        showToast('Entrée supprimée.', 'success');
      } catch (err) {
        console.error(err);
        showToast('Erreur lors de la suppression.', 'error');
      }
    });
  });

  // ACTION : MODIFIER
  container.querySelectorAll('.action-btn.edit').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.vault-item');
      const input = item.querySelector('.password-input');
      input.removeAttribute('readonly');
      input.type = 'text';
      input.focus();

      btn.innerHTML = '<i class="fas fa-save"></i>';
      btn.title = "Enregistrer";
      // Changer la classe temporairement pour savoir qu'on est en mode édition
      btn.classList.add('editing');

      // Quand l'utilisateur valide (re-clic ou blur), on sauvegarde
      function saveEdit() {
        input.setAttribute('readonly', true);
        input.type = 'password';
        btn.innerHTML = '<i class="fas fa-edit"></i>';
        btn.title = "Modifier";
        btn.classList.remove('editing');
        // Update storage
        (async () => {
          const id = item.dataset.id;
          try {
            const vault = await window.vaultManager.storage.loadVault();
            const updated = vault.entries.map(e =>
              e.id === id ? { ...e, password: input.value } : e
            );
            await window.vaultManager.storage.saveVault(updated, vault.meta);
            const decrypted = await window.vaultManager.decryptAllEntries();
            renderVaultEntries(decrypted);
            showToast('Mot de passe mis à jour.', 'success');
          } catch (err) {
            console.error(err);
            showToast('Erreur lors de la mise à jour.', 'error');
          }
        })();
        input.removeEventListener('blur', saveEdit);
        btn.removeEventListener('click', saveEdit);
      }
      input.addEventListener('blur', saveEdit);
      btn.addEventListener('click', saveEdit);
    });
  });
}
