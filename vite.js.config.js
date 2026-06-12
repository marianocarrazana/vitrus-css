import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    sourcemap: true,
    lib: {
      entry: fileURLToPath(new URL('./js/vitrus.js', import.meta.url)),
      name: 'vitrus',
      formats: ['iife', 'es'],
      fileName: (format) => (format === 'iife' ? 'vitrus.bundle.js' : 'vitrus.js'),
    },
    rollupOptions: {
      output: {
        exports: 'named',
      },
    },
  },
});
