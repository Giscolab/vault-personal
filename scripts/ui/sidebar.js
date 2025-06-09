function showView(viewId) {
  document.querySelectorAll('.view').forEach(sec => sec.hidden = true);
  document.getElementById(viewId).hidden = false;

  document.querySelectorAll('.sidebar nav a').forEach(a => a.classList.remove('active'));
  if (viewId === 'dashboard-view') {
    document.getElementById('nav-dashboard').classList.add('active');
  }
  if (viewId === 'passwords-view') {
    document.getElementById('nav-passwords').classList.add('active');
  }
  if (viewId === 'security-report-view') {
    document.getElementById('nav-security').classList.add('active');
  }
  if (viewId === 'settings-view') {
    document.getElementById('nav-settings').classList.add('active');
  }
}

// --- Nouvelle encapsulation ---
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('nav-dashboard').addEventListener('click', (e) => {
    e.preventDefault();
    showView('dashboard-view');
  });
  document.getElementById('nav-passwords').addEventListener('click', (e) => {
    e.preventDefault();
    showView('passwords-view');
  });
  document.getElementById('nav-security').addEventListener('click', (e) => {
    e.preventDefault();
    showView('security-report-view');
  });
  document.getElementById('nav-settings').addEventListener('click', (e) => {
    e.preventDefault();
    showView('settings-view');
  });

  // Affiche la vue dashboard par défaut
  showView('dashboard-view');
});
