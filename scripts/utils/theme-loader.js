// Ce script est exécuté en priorité depuis le <head>
(function () {
  const selectedTheme = localStorage.getItem('selectedTheme') || 'default';
  const link = document.createElement('link');
  link.id = 'theme-css';
  link.rel = 'stylesheet';
  link.href = `public/themes/${selectedTheme}.css`;
  document.head.appendChild(link);
})();
