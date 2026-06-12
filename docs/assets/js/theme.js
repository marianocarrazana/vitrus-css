const STORAGE_KEY = 'vitrus-theme';
const DEFAULT_THEME = 'default';

function systemPrefersDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function resolveTheme(name) {
  if (name) return name;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return stored;
  if (systemPrefersDark()) return 'midnight';
  return DEFAULT_THEME;
}

export function applyTheme(name) {
  const theme = resolveTheme(name);
  document.documentElement.setAttribute('data-vitrus-theme', theme);
  localStorage.setItem(STORAGE_KEY, theme);
}

export function getStoredTheme() {
  return resolveTheme(document.documentElement.getAttribute('data-vitrus-theme'));
}

export function initThemePicker() {
  const select = document.getElementById('vitrus-theme-select');
  if (!select) return;

  const current = getStoredTheme();
  if (!document.documentElement.getAttribute('data-vitrus-theme')) {
    applyTheme(current);
  }

  select.value = current;

  select.addEventListener('change', () => {
    applyTheme(select.value);
  });
}

initThemePicker();
