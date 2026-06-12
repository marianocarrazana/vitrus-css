import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    ignores: ['dist/**', 'demo-dist/**', 'node_modules/**'],
  },
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        Event: 'readonly',
        Element: 'readonly',
        HTMLElement: 'readonly',
        Node: 'readonly',
        setTimeout: 'readonly',
        getComputedStyle: 'readonly',
      },
    },
  },
];
