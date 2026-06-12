# VitrusCSS

A CSS component library that mirrors the **Bootstrap 5 class API** while delivering a distinctive **glassmorphism** visual language across every element and component.

- Bootstrap-compatible class names and markup
- Glassmorphism as the default look (translucent fills, backdrop blur, soft borders, layered shadows)
- Sass-authored, compiled to CSS
- CSS-custom-property theming with dark-mode ready tokens
- Self-documenting: the `docs/` site explains usage, shows live examples, and serves as the primary QA surface

> **Status:** Phase 1 MVP — reboot, grid, core utilities, and the first wave of components (buttons, badges, alerts, cards, forms). JS-dependent components (dropdown, modal, toast, tooltip, popover, offcanvas, accordion) ship in Phase 3.

---

## Quick start (CDN-style)

```html
<link rel="stylesheet" href="dist/vitrus.min.css" />
```

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
npm run build       # builds the CSS bundle and the static docs site (demo-dist/)
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
docs/                 # Documentation + live demo (run with `npm run dev`)
  css → ../css        # dev-only symlink, created by `npm run setup`
dist/                 # Compiled CSS (build artifact)
demo-dist/            # Built static demo site (build artifact)
scripts/              # Build & dev helpers
```

## License

MIT
