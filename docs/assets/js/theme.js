const STORAGE_KEY = 'vitrus-theme';
const DEFAULT_THEME = 'default';

export function applyTheme(name) {
  const theme = name || DEFAULT_THEME;
  document.documentElement.setAttribute('data-vitrus-theme', theme);
  localStorage.setItem(STORAGE_KEY, theme);
}

export function getStoredTheme() {
  return localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME;
}

export function initThemePicker() {
  const select = document.getElementById('vitrus-theme-select');
  if (!select) return;

  const current = document.documentElement.getAttribute('data-vitrus-theme') || getStoredTheme();
  select.value = current;

  select.addEventListener('change', () => {
    applyTheme(select.value);
  });
}

initThemePicker();
