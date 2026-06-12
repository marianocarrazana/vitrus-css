# VitrusCSS

A CSS component library that mirrors the **Bootstrap 5 class API** while delivering a distinctive **glassmorphism** visual language across every element and component.

- Bootstrap-compatible class names and markup
- Glassmorphism as the default look (translucent fills, backdrop blur, soft borders, layered shadows)
- Sass-authored, compiled to CSS
- CSS-custom-property theming with dark-mode ready tokens
- Self-documenting: the docs site (`docs/` → built to `docs-dist/`) explains usage, shows live examples, and serves as the primary QA surface

> **Status:** Phase 3b shipped — full JS bundle with Alert, Collapse, Tab, Dropdown, Modal, Offcanvas, Toast, Tooltip, Popover, and Accordion plugins (Popper bundled).

---

## Quick start (CDN-style)

```html
<link rel="stylesheet" href="dist/vitrus.min.css" />
<script src="dist/vitrus.bundle.min.js" defer></script>
```

Interactive components use `data-vitrus-toggle`, `data-vitrus-target`, and `data-vitrus-dismiss` (Vitrus equivalents of Bootstrap's `data-bs-*` attributes). Class names and markup match Bootstrap 5.

## Sass integration

```scss
// Override tokens before the import
$primary: #6366f1;

@import 'vitrus-css/css/vitrus';
```

## Run the docs locally

```bash
npm install
npm run dev     # builds docs-dist/ from docs/, then starts Vite at :5173
```

Then open <http://localhost:5173>. The docs site is also the live component demo — every example uses the compiled VitrusCSS over a static gradient so the glass effect is visible.

`npm run dev` runs `docs:html` (generates `docs-dist/` from `docs/`), creates
the `docs-dist/css` symlink, and copies the JS bundle automatically.

## Build a distribution bundle

```bash
npm run build:css   # emits dist/vitrus.css, dist/vitrus.min.css
npm run build:js    # emits dist/vitrus.bundle.js, dist/vitrus.bundle.min.js, dist/vitrus.js
npm run build       # builds CSS, JS, and the static docs site (demo-dist/)
```

## Project structure

```
css/                  # Sass source (ITCSS order)
  vitrus.scss         # main entry
  _variables.scss
  _mixins.scss
  _root.scss
  _reboot.scss
  _grid.scss
  _utilities.scss
  components/
    _buttons.scss
    _badges.scss
    _alerts.scss
    _cards.scss
    _forms.scss
    _nav.scss
    _navbar.scss
    _breadcrumb.scss
    _pagination.scss
    _spinners.scss
    _progress.scss
  _themes.scss
docs/                 # Docs source (layout, pages, SCSS/JS assets)
  layout.html
  nav.json
  pages/
  assets/css/
  assets/js/
docs-dist/            # Generated dev tree (gitignored; Vite root)
js/                   # Component plugins (Alert, Collapse, Tab, …)
dist/                 # Compiled CSS + JS bundles (build artifact)
demo-dist/            # Built static demo site (build artifact)
scripts/              # Build & dev helpers
```

## License

MIT
