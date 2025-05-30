import { showToast } from '../../utils/toast.js';

export function renderVaultEntries(entries) {
  const container = document.getElementById('entries');
  container.innerHTML = '';

  if (!entries.length) {
    container.innerHTML = '<p>Aucune entrée enregistrée.</p>';
    return;
  }

  for (const entry of entries) {
    const wrapper = document.createElement('div');
    wrapper.className = 'vault-list__item';
    wrapper.dataset.id = entry.id;

    wrapper.innerHTML = `
      <div class="vault-list__content">
        <div class="vault-item__field">
          <span class="vault-item__label">Site</span>
          <span class="vault-list__title">
            ${entry.title.includes('.') ? `<a href="https://${entry.title}" target="_blank">${entry.title}</a>` : entry.title}
          </span>
        </div>

<div class="vault-item__field">
  <span class="vault-item__label">Utilisateur</span>
  <span class="vault-list__username masked" data-value="${entry.username}">••••••••••••••••</span>
  <div class="vault-list__actions">
    <button type="button" class="btn btn--outline btn-toggle" data-target="username" data-value="${entry.username}">👁️</button>
    <button type="button" class="btn btn--outline btn-copy" data-copy="${entry.username}">COPY</button>
    <button type="button" class="btn btn--outline btn-edit" data-field="username">EDIT</button>
  </div>
</div>

<div class="vault-item__field">
  <span class="vault-item__label">Mot de passe</span>
  <span class="vault-list__password masked" data-value="${entry.password}">••••••••••••••••</span>
  <div class="vault-list__actions">
    <button type="button" class="btn btn--outline btn-toggle" data-target="password" data-value="${entry.password}">👁️</button>
    <button type="button" class="btn btn--outline btn-copy" data-copy="${entry.password}">COPY</button>
    <button type="button" class="btn btn--outline btn-edit" data-field="password">EDIT</button>
  </div>
</div>

<div class="vault-list__actions">
  <button type="button" class="btn btn--outline btn-delete" data-id="${entry.id}">DELETE</button>
</div>

    `;

    container.appendChild(wrapper);
  }

// COPY
container.querySelectorAll('.btn-copy').forEach(btn => {
  btn.addEventListener('click', () => {
    const value = btn.dataset.copy;
    if (!value) return;
    navigator.clipboard.writeText(value).then(() => {
      btn.textContent = '✅';
      setTimeout(() => (btn.textContent = 'COPY'), 1500);
    });
  });
});

// TOGGLE visibility
container.querySelectorAll('.btn-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.target;
    const parent = btn.closest('.vault-item__field');
    const span = parent.querySelector(`.vault-list__${target}`);
    const value = span.dataset.value;

    const isMasked = span.classList.contains('masked');
    span.textContent = isMasked ? value : '••••••••••••••••';
    span.classList.toggle('masked');
  });
});



  // DELETE
  container.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.closest('.vault-list__item').dataset.id;
      if (!confirm('Supprimer cette entrée ?')) return;

      try {
        const vault = await window.vaultManager.storage.loadVault();
        const updated = vault.entries.filter(e => e.id !== id);
        await window.vaultManager.storage.saveVault(updated, vault.meta);
        const decrypted = await window.vaultManager.decryptAllEntries();
        renderVaultEntries(decrypted);

        const stats = await window.vaultManager.getPasswordStats();
        document.getElementById('stats-section').innerText =
          `Total: ${stats.total} | Réutilisés: ${stats.reused} | Faibles: ${stats.weak}`;

        showToast('Entrée supprimée.', 'success');
      } catch (err) {
        console.error(err);
        showToast('Erreur lors de la suppression.', 'error');
      }
    });
  });

  // EDIT
  container.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', () => {
      const field = btn.dataset.field;
      const item = btn.closest('.vault-list__item');
      const span = item.querySelector(`.vault-list__${field}`);
      const currentValue = field === 'password' ? span.textContent.replace(/•/g, '') : span.textContent;

      const input = document.createElement('input');
      input.type = field === 'password' ? 'text' : 'text';
      input.value = currentValue;
      input.className = 'vault-item__input';

      const actions = btn.parentElement;
      actions.innerHTML = '';

      const saveBtn = document.createElement('button');
      saveBtn.textContent = 'SAVE';
      saveBtn.className = 'btn btn--outline';

      const cancelBtn = document.createElement('button');
      cancelBtn.textContent = 'CANCEL';
      cancelBtn.className = 'btn btn--outline';

      actions.appendChild(saveBtn);
      actions.appendChild(cancelBtn);

      span.replaceWith(input);
      input.focus();

      cancelBtn.addEventListener('click', () => {
        input.replaceWith(span);
        actions.innerHTML = '';
        const restore = document.createElement('button');
        restore.textContent = 'EDIT';
        restore.className = 'btn btn--outline btn-edit';
        restore.dataset.field = field;
        actions.appendChild(restore);
        renderVaultEntries(entries); // full rerender for now
      });

      saveBtn.addEventListener('click', async () => {
        const id = item.dataset.id;
        const newValue = input.value;

        try {
          const vault = await window.vaultManager.storage.loadVault();
          const updated = vault.entries.map(e =>
            e.id === id ? { ...e, [field]: newValue } : e
          );
          await window.vaultManager.storage.saveVault(updated, vault.meta);
          const decrypted = await window.vaultManager.decryptAllEntries();
          renderVaultEntries(decrypted);
          showToast(`Champ "${field}" mis à jour.`, 'success');
        } catch (err) {
          console.error(err);
          showToast('Erreur lors de la mise à jour.', 'error');
        }
      });
    });
  });
}
