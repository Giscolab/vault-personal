// scripts/ui/vault-list/vault-list.js
import {
	showToast
} from '../../utils/toast.js';
import modalManager from '../modal.js';

function renderVaultEntries(entries) {
	const container = document.getElementById('entries');
	container.innerHTML = '';
	const countElem = document.getElementById('vault-count');
	if (countElem) countElem.textContent = entries.length;
	if (!entries.length) {
		container.innerHTML = '<p>Aucune entrée enregistrée.</p>';
		return;
	}

	function getIconClass(title) {
  const t = title?.toLowerCase() || '';
  if (t.includes('bank')) return { icon: 'fa-university', cls: 'bank-icon' };
  if (t.includes('email')) return { icon: 'fa-envelope', cls: 'email-icon' };
  if (t.includes('cloud')) return { icon: 'fa-cloud', cls: 'cloud-icon' };
  if (t.includes('social')) return { icon: 'fa-share-alt', cls: 'social-icon' };
  if (t.includes('shop')) return { icon: 'fa-shopping-cart', cls: 'shopping-icon' };
  if (t.includes('film') || t.includes('stream')) return { icon: 'fa-film', cls: 'entertainment-icon' };
  return { icon: 'fa-key', cls: '' };
}

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
  const score = getStrength(entry.password);

  const dotClasses = [
    score === 0 ? 'danger' : (score < 3 ? 'warning' : 'active'),
    score > 1 ? (score < 3 ? 'warning' : 'active') : '',
    score > 2 ? 'active' : '',
    score > 3 ? 'active' : '',
    score > 4 ? 'active' : ''
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
        <div class="url-field">
          <input type="url" value="${entry.url || ''}" class="url-input" readonly>
        </div>
        <div class="password-field">
          <input type="password" value="${entry.password}" class="password-input" readonly>
          <button class="toggle-password" title="Afficher/masquer"><i class="fas fa-eye"></i></button>
        </div>
        <div class="strength-indicator">
          <span>Solidité :</span>
          ${dotClasses.map(cls => `<div class="strength-dot ${cls}"></div>`).join('')}
          <div class="strength-percent">${score * 20}%</div>
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

	container.querySelectorAll('.action-btn.copy').forEach(btn => {
		btn.addEventListener('click', () => {
			const input = btn.closest('.vault-item').querySelector('.password-input');
			if (!input) return;
			navigator.clipboard.writeText(input.value).then(() => {
				const id = btn.closest('.vault-item').dataset.id;
				window.vaultManager.markEntryAccessed(id);
				renderRecentAccesses(); // ✅ Ajouté ici
				btn.innerHTML = '<i class="fas fa-check"></i>';
				setTimeout(() => (btn.innerHTML = '<i class="fas fa-copy"></i>'), 1500);
				showToast('Mot de passe copié dans le presse-papiers !', 'success');
			});
		});
	});
	container.querySelectorAll('.toggle-password').forEach(btn => {
		btn.addEventListener('click', () => {
			const input = btn.closest('.password-field').querySelector('.password-input');
			input.type = input.type === 'password' ? 'text' : 'password';
			btn.querySelector('i').classList.toggle('fa-eye');
			btn.querySelector('i').classList.toggle('fa-eye-slash');
		});
	});
	container.querySelectorAll('.action-btn.delete').forEach(btn => {
		btn.addEventListener('click', async () => {
			const id = btn.closest('.vault-item').dataset.id;
			window.vaultManager.markEntryAccessed(id);
			if (!confirm('Supprimer cette entrée ?')) return;
			try {
				const vault = await window.vaultManager.storage.loadVault();
				const updated = vault.entries.filter(e => e.id !== id);
				await window.vaultManager.storage.saveVault(updated, vault.meta);
				const decrypted = await window.vaultManager.decryptAllEntries();
				renderVaultEntries(decrypted);
				renderRecentAccesses(); // ✅
				showToast('Entrée supprimée.', 'success');
			} catch (err) {
				console.error(err);
				showToast('Erreur lors de la suppression.', 'error');
			}
		});
	});
	container.querySelectorAll('.action-btn.edit').forEach(btn => {
		btn.addEventListener('click', () => {
			const item = btn.closest('.vault-item');
			const input = item.querySelector('.password-input');
			const urlInput = item.querySelector('.url-input');
			input.removeAttribute('readonly');
			input.type = 'text';
			input.focus();
			urlInput?.removeAttribute('readonly');
			urlInput?.focus();
			btn.innerHTML = '<i class="fas fa-save"></i>';
			btn.title = "Enregistrer";
			btn.classList.add('editing');
			function saveEdit() {
				input.setAttribute('readonly', true);
				input.type = 'password';
				btn.innerHTML = '<i class="fas fa-edit"></i>';
				btn.title = "Modifier";
				btn.classList.remove('editing');
				(async () => {
					const id = item.dataset.id;
					try {
						const vault = await window.vaultManager.storage.loadVault();
						const updated = vault.entries.map(e => e.id === id ? {
							...e,
							password: input.value,
							url: urlInput?.value || ''
						} : e);
						await window.vaultManager.storage.saveVault(updated, vault.meta);
						await window.vaultManager.markEntryAccessed(id);
						const decrypted = await window.vaultManager.decryptAllEntries();
						renderVaultEntries(decrypted);
						renderRecentAccesses(); // ✅
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

  // ✅ Événement envoyé ici, quand TOUT est fini
  document.dispatchEvent(new CustomEvent('vault-entries-rendered'));
}

async function renderRecentAccesses(limit = 4) {
	const container = document.getElementById('recent-entries');
	container.innerHTML = '';
	const entries = window.vaultManager.getEntries().filter(e => e.lastAccessed).sort((a, b) => b.lastAccessed - a.lastAccessed).slice(0, limit);
	if (!entries.length) {
		container.innerHTML = '<p>Aucun accès récent.</p>';
		return;
	}
	for (const entry of entries) {
		const wrapper = document.createElement('div');
		wrapper.className = 'vault-item';
		const title = entry.title?.toLowerCase() || '';
		const iconClass = title.includes('bank') ? 'fa-university bank-icon' : title.includes('email') ? 'fa-envelope email-icon' : title.includes('cloud') ? 'fa-cloud cloud-icon' : title.includes('social') ? 'fa-share-alt social-icon' : 'fa-key';
		wrapper.innerHTML = `
      <div class="account-info">
        <div class="account-icon ${iconClass.split(' ')[1] || ''}">
          <i class="fas ${iconClass.split(' ')[0]}"></i>
        </div>
        <div class="account-details">
          <strong>${entry.title || 'Sans titre'}</strong>
          <span>${entry.username || ''}</span>
        </div>
      </div>
      <div class="actions">
        <button class="copy" title="Copier"><i class="fas fa-copy"></i></button>
        <button class="edit" title="Modifier"><i class="fas fa-edit"></i></button>
      </div>
    `;
		wrapper.querySelector('.copy').addEventListener('click', () => {
			navigator.clipboard.writeText(entry.password);
			window.vaultManager.markEntryAccessed(entry.id);
			renderRecentAccesses();
		});
		wrapper.querySelector('.edit').addEventListener('click', () => {
			window.vaultManager.markEntryAccessed(entry.id);
		});
		container.appendChild(wrapper);
	}
}
export {
	renderVaultEntries,
	renderRecentAccesses
};