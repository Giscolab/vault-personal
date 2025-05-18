export function showToast(message, type = 'success', duration = 3000) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  // Appliquer le message et la classe
  toast.textContent = message;
  toast.className = `toast ${type}`;
  toast.hidden = false;

  // Réinitialiser le timer précédent s'il existe
  clearTimeout(toast._hideTimer);
  toast._hideTimer = setTimeout(() => {
    toast.hidden = true;
  }, duration);
}
