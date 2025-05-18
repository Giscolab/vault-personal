import { showToast } from '../../utils/toast.js';

export function renderVaultEntries(entries) {
  const container = document.getElementById('entries');
  container.innerHTML = '';

  if (!entries.length) {
    container.innerHTML = '<p>Aucune entrée enregistrée.</p>';
    return;
  }

  for (const entry of entries) {
    const card = document.createElement('div');
    card.className = 'vault-entry';

    const isURL = entry.title.startsWith('http') || entry.title.includes('.');
    const link = isURL
      ? `<a href="https://${entry.title}" target="_blank" rel="noopener noreferrer">${entry.title}</a>`
      : `<strong>${entry.title}</strong>`;

    card.innerHTML = `
      <div class="entry-title">${link}</div>

      <div class="entry-field">
        <span class="label">Utilisateur :</span>
        <input type="password" value="${entry.username}" readonly class="masked" />
        <button class="toggle-visibility">👁️</button>
      </div>

      <div class="entry-field">
        <span class="label">Mot de passe :</span>
        <input type="password" value="${entry.password}" readonly class="masked" />
        <button class="toggle-visibility">👁️</button>
        <button class="copy-password">📋</button>
      </div>

      <div class="entry-field" style="justify-content: flex-end;">
        <button class="delete-entry" data-id="${entry.id}">🗑️ Supprimer</button>
      </div>
    `;

    container.appendChild(card);
  }

  // 👁️ Toggle visibilité
  container.querySelectorAll('.toggle-visibility').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.previousElementSibling;
      input.type = input.type === 'text' ? 'password' : 'text';
    });
  });

  // 📋 Copie mot de passe
  container.querySelectorAll('.copy-password').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.previousElementSibling;
      navigator.clipboard.writeText(input.value).then(() => {
        btn.textContent = '✅';
        setTimeout(() => (btn.textContent = '📋'), 1500);
      });
    });
  });

  // 🗑️ Suppression
  container.querySelectorAll('.delete-entry').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      const confirmDelete = confirm('Supprimer cette entrée ? Cette action est irréversible.');
      if (!confirmDelete) return;

      try {
        const vault = await window.vaultManager.storage.loadVault();
        const updatedEntries = vault.entries.filter(e => e.id !== id);
        await window.vaultManager.storage.saveVault(updatedEntries, vault.meta);
        const decrypted = await window.vaultManager.decryptAllEntries();
        renderVaultEntries(decrypted);

        const stats = await window.vaultManager.getPasswordStats();
        document.getElementById('stats-section').innerText =
          `Total: ${stats.total} | Réutilisés: ${stats.reused} | Faibles: ${stats.weak}`;

        showToast("Entrée supprimée.", "success");
      } catch (err) {
        console.error(err);
        showToast("Erreur lors de la suppression.", "error");
      }
    });
  });
}
