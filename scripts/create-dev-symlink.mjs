#!/usr/bin/env node
// Creates (or removes) the docs-dist/css → ../css symlink that lets Vite serve
// the library source from its docs-dist/ root during dev and build.
//
// Run via `npm run setup` (or automatically via the `predev` / `prebuild:docs`
// hooks). Safe to run repeatedly: it skips creation if the symlink already
// points to the right place.

import { fileURLToPath } from 'node:url';
import { existsSync, lstatSync, symlinkSync, unlinkSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const linkPath = resolve(projectRoot, 'docs-dist', 'css');
const target = resolve(projectRoot, 'css');
const remove = process.argv.includes('--remove');

function log(msg) {
  process.stdout.write(`[setup] ${msg}\n`);
}

if (remove) {
  if (existsSync(linkPath)) {
    unlinkSync(linkPath);
    log('removed docs-dist/css symlink');
  } else {
    log('no symlink to remove');
  }
  process.exit(0);
}

try {
  if (existsSync(linkPath)) {
    const stat = lstatSync(linkPath);
    if (stat.isSymbolicLink()) {
      log('docs-dist/css symlink already in place');
      process.exit(0);
    }
    log(`docs-dist/css exists and is not a symlink; please remove it manually`);
    process.exit(0);
  }
  symlinkSync(target, linkPath, 'dir');
  log(`created docs-dist/css → ${target}`);
} catch (err) {
  log(`failed to create symlink: ${err.message}`);
  log('on Windows, run as administrator or enable Developer Mode');
  process.exit(1);
}
