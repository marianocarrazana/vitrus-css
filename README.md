# VitrusCSS

A CSS component library that mirrors the **Bootstrap 5 class API** while delivering a distinctive **glassmorphism** visual language across every element and component.

- Bootstrap-compatible class names and markup
- Glassmorphism as the default look (translucent fills, backdrop blur, soft borders, layered shadows)
- Sass-authored, compiled to CSS
- CSS-custom-property theming with dark-mode ready tokens
- Self-documenting: the `docs/` site explains usage, shows live examples, and serves as the primary QA surface

> **Status:** Phase 3a — CSS foundation through Phase 2, plus a JavaScript bundle (`vitrus.bundle.min.js`) with Alert, Collapse, and Tab plugins. Overlay components (dropdown, modal, toast, tooltip, popover, offcanvas, accordion) ship in Phase 3b.

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
npm run setup   # creates the docs/css → ../css symlink (idempotent)
npm run dev
```

Then open <http://localhost:5173>. The docs site is also the live component demo — every example uses the compiled VitrusCSS over a static gradient so the glass effect is visible.

`npm run dev` and `npm run build:docs` run `setup` automatically via the
`predev` / `prebuild:docs` hooks; the explicit `setup` step is only
required right after `npm install`.

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
docs/                 # Documentation + live demo (run with `npm run dev`)
  css → ../css        # dev-only symlink, created by `npm run setup`
js/                   # Component plugins (Alert, Collapse, Tab, …)
dist/                 # Compiled CSS + JS bundles (build artifact)
demo-dist/            # Built static demo site (build artifact)
scripts/              # Build & dev helpers
```

## License

MIT
