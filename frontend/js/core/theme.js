 // Gestión de tema (dark/light)
const THEME_KEY = 'app-theme';
const DEFAULT_THEME = 'dark';

export function initTheme() {
  const stored = localStorage.getItem(THEME_KEY) || DEFAULT_THEME;
  applyTheme(stored);
}

export function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
}

export function toggleTheme() {
  const current = localStorage.getItem(THEME_KEY) || DEFAULT_THEME;
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  return next;
}

export function getTheme() {
  return localStorage.getItem(THEME_KEY) || DEFAULT_THEME;
}
