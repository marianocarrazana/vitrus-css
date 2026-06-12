#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DOCS_SRC = path.join(ROOT, 'docs');
const DOCS_OUT = path.join(ROOT, 'docs-dist');
const PAGES_DIR = path.join(DOCS_SRC, 'pages');

const layoutTemplate = fs.readFileSync(path.join(DOCS_SRC, 'layout.html'), 'utf8');
const navConfig = JSON.parse(fs.readFileSync(path.join(DOCS_SRC, 'nav.json'), 'utf8'));
const pagesManifest = JSON.parse(fs.readFileSync(path.join(DOCS_SRC, 'pages.json'), 'utf8'));

function slugify(text) {
  return text
    .replace(/&amp;/g, 'and')
    .replace(/<[^>]+>/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function injectSectionIds(html) {
  const used = new Set();
  return html.replace(
    /<section(\s+class="docs-section")(?![^>]*\sid=)([^>]*)>([\s\S]*?)<\/section>/g,
    (match, classAttr, rest, inner) => {
      const titleMatch = inner.match(/<h2[^>]*class="docs-section-title"[^>]*>([\s\S]*?)<\/h2>/);
      if (!titleMatch) return match;

      let id = slugify(titleMatch[1]);
      if (!id) return match;

      let candidate = id;
      let n = 2;
      while (used.has(candidate)) {
        candidate = `${id}-${n}`;
        n += 1;
      }
      used.add(candidate);
      return `<section${classAttr} id="${candidate}"${rest}>${inner}</section>`;
    },
  );
}

function addHeadingAnchors(html) {
  return html.replace(
    /<section class="docs-section" id="([^"]+)"([^>]*)>([\s\S]*?)<h2 class="docs-section-title">([\s\S]*?)<\/h2>/g,
    (match, id, sectionRest, before, titleHtml) => {
      if (before.includes('docs-section-title-wrap')) return match;
      const plain = titleHtml.replace(/<[^>]+>/g, '').trim();
      const label = plain.replace(/"/g, '&quot;');
      const h2 = `<h2 class="docs-section-title docs-section-title-wrap"><span class="docs-section-title-text">${titleHtml}</span><a class="docs-anchor" href="#${id}" aria-label="Link to ${label}">#</a></h2>`;
      return `<section class="docs-section" id="${id}"${sectionRest}>${before}${h2}`;
    },
  );
}

function processContent(html) {
  let content = injectSectionIds(html);
  content = addHeadingAnchors(content);
  return content;
}

function relativeHref(fromPage, toPage) {
  const [toPath, hash = ''] = toPage.split('#');
  const fromDir = path.dirname(fromPage);
  const rel = path.relative(fromDir, toPath).split(path.sep).join('/');
  const href = rel.startsWith('.') ? rel : `./${rel}`;
  return hash ? `${href}#${hash}` : href;
}

function renderSidebarNav(fromPage, activeNav) {
  const blocks = navConfig.sections.map((section) => {
    const items = section.links
      .map((link) => {
        const href = relativeHref(fromPage, link.page);
        const active = link.id === activeNav ? ' class="active"' : '';
        return `            <li><a href="${href}"${active}>${link.label}</a></li>`;
      })
      .join('\n');

    return `          <ul class="docs-nav">
            <li class="docs-nav-section">${section.title}</li>
${items}
          </ul>`;
  });

  return `        <nav aria-label="Documentation">
${blocks.join('\n\n')}
        </nav>`;
}

function assetPaths(depth) {
  const up = depth === 0 ? '.' : '../'.repeat(depth).slice(0, -1);
  return {
    cssHref: `${up === '.' ? '..' : `${up}/..`}/css/vitrus.scss`,
    docsCssHref: `${up}/assets/css/docs.scss`,
    themesCssHref: `${up}/assets/css/themes.scss`,
    themeJsHref: `${up}/assets/js/theme.js`,
    layoutJsHref: `${up}/assets/js/layout.js`,
    homeHref: `${up === '.' ? '.' : up}/index.html`,
  };
}

function copyDocsAssets() {
  const srcAssets = path.join(DOCS_SRC, 'assets');
  const destAssets = path.join(DOCS_OUT, 'assets');
  fs.cpSync(srcAssets, destAssets, { recursive: true, force: true });
  console.log('  copied docs/assets/ → docs-dist/assets/');
}

function buildPage(pagePath, meta) {
  const contentPath = path.join(PAGES_DIR, pagePath);
  if (!fs.existsSync(contentPath)) {
    throw new Error(`Missing page content: ${contentPath}`);
  }

  const rawContent = fs.readFileSync(contentPath, 'utf8');
  const content = processContent(rawContent.trim());
  const assets = assetPaths(meta.depth);
  const sidebarNav = renderSidebarNav(pagePath, meta.activeNav);

  const metaDescription = meta.description
    ? `    <meta name="description" content="${meta.description}" />`
    : '';

  const bundleScript = `    <script src="${meta.depth === 0 ? './' : '../'.repeat(meta.depth)}assets/js/vitrus.bundle.min.js" defer></script>`;

  let html = layoutTemplate
    .replaceAll('{{title}}', meta.title)
    .replace('{{metaDescription}}', metaDescription)
    .replaceAll('{{sidebarNav}}', sidebarNav)
    .replace('{{content}}', content)
    .replace('{{homeHref}}', assets.homeHref)
    .replace('{{cssHref}}', assets.cssHref)
    .replace('{{docsCssHref}}', assets.docsCssHref)
    .replace('{{themesCssHref}}', assets.themesCssHref)
    .replace('{{themeJsHref}}', assets.themeJsHref)
    .replace('{{layoutJsHref}}', assets.layoutJsHref)
    .replace('{{bundleScript}}', bundleScript);

  const outPath = path.join(DOCS_OUT, pagePath);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, html);
  console.log(`  wrote docs-dist/${pagePath}`);
}

function extractMainContent(html) {
  const match = html.match(/<main class="docs-main">\s*([\s\S]*?)\s*<\/main>/);
  if (!match) throw new Error('Could not find <main class="docs-main">');
  return match[1].trim();
}

export function migrateFromDocs() {
  for (const pagePath of Object.keys(pagesManifest)) {
    const srcHtml = path.join(DOCS_OUT, pagePath);
    const destPath = path.join(PAGES_DIR, pagePath);
    if (!fs.existsSync(srcHtml)) {
      console.warn(`  skip migrate (missing): ${pagePath}`);
      continue;
    }
    const content = extractMainContent(fs.readFileSync(srcHtml, 'utf8'));
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.writeFileSync(destPath, `${content}\n`);
    console.log(`  migrated docs/pages/${pagePath}`);
  }
}

function main() {
  const migrate = process.argv.includes('--migrate');
  if (migrate) {
    console.log('Migrating page content from docs-dist/ to docs/pages/…');
    migrateFromDocs();
    return;
  }

  console.log('Building docs HTML…');
  copyDocsAssets();
  for (const [pagePath, meta] of Object.entries(pagesManifest)) {
    buildPage(pagePath, meta);
  }
  console.log('Done.');
}

main();
