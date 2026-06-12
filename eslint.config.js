import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    ignores: ['dist/**', 'demo-dist/**', 'node_modules/**'],
  },
];
