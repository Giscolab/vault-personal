const applyTheme = (theme) => {
  const linkId = "theme-css";
  let link = document.getElementById(linkId);

  // Met à jour l'attribut data-theme
  document.documentElement.setAttribute("data-theme", theme);

  // Si c'est le thème par défaut, pas besoin de fichier externe
  if (theme === "default") {
    if (link) link.disabled = true;
  } else {
    if (!link) {
      link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    link.href = `public/themes/${theme}.css`;
    link.disabled = false;
  }

  // Sauvegarde le thème
  localStorage.setItem("selectedTheme", theme);
};

export function initThemeSelector() {
  const savedTheme = localStorage.getItem("selectedTheme") || "default";
  applyTheme(savedTheme);

  const themeSelect = document.getElementById("theme-select");
  if (themeSelect) {
    themeSelect.value = savedTheme;
    themeSelect.addEventListener("change", (e) => {
      applyTheme(e.target.value);
    });
  }
}
