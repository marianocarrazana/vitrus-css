import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const docsRoot = fileURLToPath(new URL('./docs-dist', import.meta.url));

// Recursively find every *.html file under docs-dist/ and register each as a
// Rollup input. Output paths mirror the source layout.
function collectHtmlInputs(dir, base = dir) {
  const inputs = {};
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      Object.assign(inputs, collectHtmlInputs(full, base));
    } else if (entry.endsWith('.html')) {
      const key = relative(base, full).replace(/\\/g, '/');
      inputs[key] = full;
    }
  }
  return inputs;
}

const htmlInputs = collectHtmlInputs(docsRoot);

export default defineConfig({
  root: docsRoot,
  base: './',
  publicDir: false,
  server: {
    port: 5173,
    open: false,
  },
  build: {
    // LightningCSS (Vite 8 default) drops unprefixed backdrop-filter; use esbuild instead.
    cssMinify: 'esbuild',
    outDir: fileURLToPath(new URL('./demo-dist', import.meta.url)),
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: htmlInputs,
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        loadPaths: [fileURLToPath(new URL('./css', import.meta.url))],
      },
    },
  },
});
