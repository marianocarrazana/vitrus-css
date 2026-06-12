import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const source = resolve(root, 'dist/vitrus.bundle.min.js');

function copyBundle(dest) {
  const target = resolve(root, dest);
  mkdirSync(dirname(target), { recursive: true });
  copyFileSync(source, target);
}

const target = process.argv[2];

if (target === 'docs-dist') {
  copyBundle('docs-dist/assets/js/vitrus.bundle.min.js');
} else if (target === 'demo') {
  copyBundle('demo-dist/assets/js/vitrus.bundle.min.js');
} else {
  console.error('Usage: node scripts/copy-bundle.mjs <docs-dist|demo>');
  process.exit(1);
}
