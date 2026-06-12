# AGENTS.md

> Instructions for LLM coding agents (and humans) working on **VitrusCSS**.
> Read this file end-to-end before making changes. The non-negotiable rules
> are flagged with **MUST** / **MUST NOT** — follow them literally.

---

## 1. What this project is

**VitrusCSS** is a CSS component library that mirrors the **Bootstrap 5
class API** and ships **glassmorphism** as the default look on every
element. It is authored in **Sass**, compiled to CSS, and documented in a
Bootstrap-style docs site that doubles as a live demo.

- Spec: [`PRODUCT.md`](./PRODUCT.md)
- Component inventory: [`components.md`](./components.md)
- Class/architecture notes: [`rules_classes.md`](./rules_classes.md)

The current build is **Phase 3b**: everything through Phase 2 (foundation,
utilities, Phase 1–2 components, runtime theming via `data-vitrus-theme`),
plus a JavaScript bundle with **Alert**, **Collapse**, **Tab**, **Dropdown**,
**Modal**, **Offcanvas**, **Toast**, **Tooltip**, **Popover**, and
**Accordion** plugins. `@popperjs/core` is bundled for overlay positioning.

---

## 2. Tech stack

| Layer        | Choice                                              |
| ------------ | --------------------------------------------------- |
| Preprocessor | Dart Sass (`sass` CLI)                              |
| Dev server   | Vite 5 (multi-page input, root: `docs-dist/`)       |
| Lint (CSS)   | Stylelint + `stylelint-config-standard-scss`        |
| Lint (JS)    | ESLint 9 flat config + `@eslint/js`                 |
| Format       | Prettier 3                                          |
| Sass API     | `modern-compiler` (Vite) — no `@import`, use `@use` |
| JS bundle    | Vite lib mode (`vite.js.config.js`) → IIFE + ESM    |

There is **no JS framework**. The docs are plain HTML. The library ships
CSS and JS in `dist/`; the demo in `demo-dist/`.

---

## 3. Repository layout

```
vitrus-css/
├── css/                       # Sass source (ITCSS order)
│   ├── vitrus.scss            # main entry — @uses every partial in order
│   ├── _variables.scss        # design tokens (color, spacing, type, glass)
│   ├── _mixins.scss           # glass-surface, glass-tinted, focus-ring, …
│   ├── _root.scss             # :root { --vitrus-* } custom properties
│   ├── _reboot.scss           # box-sizing, normalize, base typography
│   ├── _grid.scss             # .container, .row, .col[-bp-N]
│   ├── _utilities.scss        # @each-generated helpers
│   ├── _themes.scss
│   └── components/
│       ├── _buttons.scss
│       ├── _badges.scss
│       ├── _alerts.scss
│       ├── _cards.scss
│       ├── _forms.scss
│       ├── _nav.scss
│       ├── _navbar.scss
│       ├── _breadcrumb.scss
│       ├── _pagination.scss
│       ├── _spinners.scss
│       └── _progress.scss
├── js/                        # Component plugins (Phase 3)
│   ├── vitrus.js              # bundle entry — exports window.vitrus
│   ├── base-component.js
│   ├── alert.js
│   ├── collapse.js
│   ├── tab.js
│   ├── dom/                   # data map, events, selectors
│   └── util/
├── docs/                      # Docs source (layout, pages, assets)
│   ├── layout.html            # shared shell (header, sidebars, scripts)
│   ├── nav.json               # sidebar navigation (single source of truth)
│   ├── pages.json             # per-page metadata (title, activeNav, depth)
│   ├── assets/
│   │   ├── css/docs.scss      # docs-only chrome (header, sidebars, TOC)
│   │   ├── css/themes.scss    # docs theme variables
│   │   └── js/                # theme.js, layout.js
│   └── pages/                 # main content only — no chrome
│       ├── index.html
│       └── components/*.html
├── docs-dist/                 # Generated (gitignored) — Vite dev root + build input
│   ├── index.html             # built via `npm run docs:html`
│   ├── components/*.html
│   ├── assets/                # copied from docs/assets/ at build time
│   └── css → ../css           # symlink, created by `npm run setup`
├── scripts/
│   ├── build-docs-html.mjs    # assembles docs/ → docs-dist/
│   └── create-dev-symlink.mjs # creates/removes docs-dist/css symlink
├── dist/                      # build artifact (gitignored)
├── demo-dist/                 # build artifact (gitignored)
├── vite.config.js             # docs site build
├── vite.js.config.js          # JS bundle (expanded + ESM)
├── vite.js.config.min.js      # JS bundle (minified IIFE)
├── eslint.config.js
├── .stylelintrc.json
├── .prettierrc.json
├── .gitignore
├── package.json
├── PRODUCT.md
├── components.md
├── rules_classes.md
└── README.md
```

---

## 4. Commands

| Command                | What it does                                                     |
| ---------------------- | ---------------------------------------------------------------- |
| `npm install`          | Installs dev deps. Run once after cloning.                       |
| `npm run setup`        | Creates the `docs-dist/css → ../css` symlink (idempotent).       |
| `npm run docs:html`    | Builds `docs-dist/` from `docs/` (HTML + copied assets).         |
| `npm run dev`          | Starts Vite at `http://localhost:5173/`. HMR on for SCSS + HTML. |
| `npm run build:css`    | Emits `dist/vitrus.css` (+ sourcemap) and `dist/vitrus.min.css`. |
| `npm run build:js`     | Emits `dist/vitrus.bundle.js`, `dist/vitrus.bundle.min.js`, `dist/vitrus.js`. |
| `npm run build:docs`   | Builds the static demo into `demo-dist/`.                        |
| `npm run build`        | Runs `build:css`, `build:js`, and `build:docs`.                  |
| `npm run lint`         | Runs ESLint + Stylelint.                                         |
| `npm run lint:fix`     | Auto-fixes what can be fixed.                                    |
| `npm run format`       | Prettier-write across the repo.                                  |
| `npm run format:check` | Prettier check (CI mode).                                        |
| `npm run clean:dev`    | Removes the `docs-dist/css` symlink.                             |

`predev` runs `setup`, `build:js`, `docs:html`, and copies the min bundle into
`docs-dist/assets/js/` for the dev server. `prebuild:docs` calls `setup` and
`docs:html`; `postbuild:docs` copies the bundle to `demo-dist/` then `clean:dev`.

---

## 5. JavaScript architecture (Phase 3)

### Bundle outputs

| File | Purpose |
| ---- | ------- |
| `dist/vitrus.bundle.js` | IIFE — drop-in `<script>` tag, exposes `window.vitrus` |
| `dist/vitrus.bundle.min.js` | Minified IIFE for production |
| `dist/vitrus.js` | ESM — `import { Alert } from 'vitrus-css'` |

### Plugin rules

- **MUST** extend `BaseComponent` (`js/base-component.js`) for every plugin.
- **MUST** use `data-vitrus-toggle`, `data-vitrus-target`, `data-vitrus-dismiss`
  (not `data-bs-*`). Document the mapping in docs when adding new plugins.
- **MUST** fire namespaced events: `vitrus:show`, `vitrus:shown`, `vitrus:hide`,
  `vitrus:hidden`, `vitrus:close`, `vitrus:closed`, etc.
- **MUST** register data-api handlers in the plugin file (delegated on `document`).
- **MUST NOT** bundle docs-only scripts (`theme.js`) into the library output.
- **MUST** add new plugins to `js/vitrus.js` and rebuild with `npm run build:js`.

### Adding a new JS component (recipe)

1. Create `js/<name>.js` extending `BaseComponent`.
2. Add glass SCSS partial in `css/components/_<name>.scss` and register in `css/vitrus.scss`.
3. Export from `js/vitrus.js` and add to the `window.vitrus` object.
4. Create `docs-dist/components/<name>.html` with live examples loading `vitrus.bundle.min.js` (via `npm run docs:html`).
5. Run `npm run lint` and `npm run build`.

Phase 3b overlays will also need `@popperjs/core` (bundled like Bootstrap's
`bootstrap.bundle.js`) and shared utilities (`Backdrop`, `FocusTrap`).

---

## 6. Sass architecture (ITCSS)

`css/vitrus.scss` imports every partial in this order:

```
1. functions / variables  (tokens)
2. mixins                 (shared)
3. root                   (`:root` custom properties)
4. reboot                 (normalize + base typography)
5. grid                   (container, row, col)
6. components/*           (one partial per component family)
7. utilities              (high-specificity helpers, !important allowed)
```

### Rules

- **MUST** keep this order. Lower layers are referenced by higher ones.
- **MUST** use `@use` (not `@import`). `@use 'variables' as *;` exposes
  variables/mixins into the current namespace.
- **MUST NOT** put utilities in `components/`. New utility classes go in
  `css/_utilities.scss`.
- **MUST NOT** put component classes in `css/_utilities.scss`.
- **MUST** put new components in `css/components/_<name>.scss` and add a
  matching `docs/pages/components/<name>.html` page in the same change.
- **MUST** register the new component with `@use 'components/<name>';` in
  `css/vitrus.scss` in the **components block**, not at the end.

---

## 7. Design tokens

All design values live in `css/_variables.scss` and are exposed on `:root`
in `css/_root.scss` as CSS custom properties (`--vitrus-*`).

### Glass tokens (the heart of Vitrus)

```scss
$glass-bg: rgba(255, 255, 255, 0.55);
$glass-bg-strong: rgba(255, 255, 255, 0.7);
$glass-bg-soft: rgba(255, 255, 255, 0.25);
$glass-border: rgba(255, 255, 255, 0.6);
$glass-blur: 16px;
$glass-shadow: 0 8px 32px rgba(15, 23, 42, 0.12);
$glass-shadow-lg: 0 16px 48px rgba(15, 23, 42, 0.18);
$glass-radius: 1rem;
$glass-radius-sm: 0.5rem;
$glass-radius-lg: 1.5rem;
```

- **MUST** keep these tokens as the source of truth. Do not hardcode
  glass values in component partials — reference the tokens.
- **MUST** use the `glass-surface` or `glass-tinted` mixin
  (`css/_mixins.scss`) for any new glass surface.

### Sass-modern rules

- **MUST NOT** use the global `red()` / `green()` / `blue()` channel
  functions — they are deprecated. Use `color.channel($c, 'red', $space: rgb)`
  via the `rgb-channels()` helper in `css/_mixins.scss`.
- **MUST NOT** use the `if()` function (deprecated) — use `@if / @else`
  or the `$btn-fg` / `$badge-fg` foreground-color maps as templates.
- **MUST NOT** use the global `percentage()` function — use
  `math.percentage(math.div($i, $n))` instead.
- **MUST NOT** use the global `nth()` function — use `list.nth($list, $i)`.
- **MUST NOT** spread a list as a positional argument followed by another
  positional argument (`rgba($channels..., 0.5)` is an error). Use the
  `rgba-color($color, $alpha)` helper instead.
- When adding a new Sass map helper, follow the pattern in
  `css/_mixins.scss`: `@use 'sass:<module>'` at the top, document with a
  leading comment, expose via function (not mixin) when the value is
  pure.

### Vendor prefixes

- **MUST** keep `-webkit-backdrop-filter` and `-webkit-appearance`
  declarations. The `property-no-vendor-prefix` rule is intentionally
  disabled in `.stylelintrc.json` to support Safari. Re-adding the
  prefixes after an auto-fix is fine.

---

## 8. Class API rules (Bootstrap 5 parity)

- **MUST** match Bootstrap 5 class names and HTML structure unless the
  deviation is recorded in `docs/` with a clear explanation.
- **MUST** treat class names as **stable API**. Renaming a class is a
  breaking change.
- **MUST** use the OOCSS / utility pattern: `Component` + `Modifier` +
  `Utility`. Examples:
  - Component: `.btn`, `.card`, `.navbar`
  - Modifier: `.btn-primary`, `.card-body`
  - Utility: `.mt-3`, `.text-center`, `.d-flex`
- **MUST** use the `$variant` map pattern (see `_buttons.scss`,
  `_badges.scss`, `_alerts.scss`, `_cards.scss`) when adding per-variant
  styles. Add a foreground map (e.g. `$btn-fg`) when the text color
  changes between variants.
- **MUST NOT** invent a new variant outside the existing 8 semantic colors
  (`primary`, `secondary`, `success`, `danger`, `warning`, `info`,
  `light`, `dark`) without first proposing it in `PRODUCT.md`.

---

## 9. Adding a new component (recipe)

1. **Token check.** Decide whether existing glass tokens cover the new
   surface. If not, add new variables to `css/_variables.scss` and
   expose them on `:root` in `css/_root.scss`.
2. **Sass partial.** Create `css/components/_<name>.scss`. Use
   `@use '../variables' as *;` and `@use '../mixins' as *;`.
3. **Wire the entry.** Add `@use 'components/<name>';` in the
   **components block** of `css/vitrus.scss`.
4. **Build:** `npm run build:css` to confirm it compiles.
5. **Docs page.** Create `docs/pages/components/<name>.html` with main
   content only (no header/sidebar — those come from the layout). Add an
   entry to `docs/pages.json` (`activeNav`, `depth: 1`, `title`) and a
   link in `docs/nav.json`. Run `npm run docs:html` to regenerate
   `docs-dist/components/<name>.html`.
6. **Verify:**
   - `npm run dev` — open the new page, check the glass effect, check
     keyboard focus rings.
   - `npm run lint`
   - `npm run build` — confirm `dist/` and `demo-dist/components/<name>.html`
     are emitted.
7. **Update `PRODUCT.md`.** Mark the component in the Phase 1/2/3
   checklist.

---

## 10. Adding a new utility (recipe)

1. Find the right place in `css/_utilities.scss`. The file is grouped:
   `display`, `flex direction`, `justify/align`, `spacing`, `typography`,
   `text colors`, `bg colors`, `sizing/positioning`.
2. If the new utility is responsive (per-breakpoint), follow the existing
   `@each $bp, $width in $grid-breakpoints` pattern with
   `@include media-breakpoint-up($bp) { … }`.
3. **MUST** mark utility declarations with `!important`. They are the
   last layer in ITCSS and the only layer allowed to win specificity
   battles.
4. Add at least one example to `docs/pages/index.html` or a relevant
   component page, then run `npm run docs:html`.

---

## 11. Glassmorphism: design language

- **Translucent backgrounds** — `rgba`/`hsla` fills at 0.1–0.6 alpha.
- **Backdrop blur** — `backdrop-filter: blur(...)` + the `-webkit-`
  prefix. Every glass surface should sit on a colorful or varied
  background or the effect is invisible.
- **Subtle borders** — semi-transparent hairlines (`rgba(255,255,255,0.5–0.6)`
  on light surfaces).
- **Soft shadows** — layered, low-opacity drop shadows. Avoid harsh
  black drops.
- **Readable contrast** — text and icons meet WCAG 2.1 AA over the
  glass surface. Use the `$btn-fg` / `$badge-fg` maps to keep light
  variants on dark text.
- **Fallback** — the `glass-surface` mixin includes a
  `@supports not (backdrop-filter)` fallback that raises the alpha to
  ~0.92. Keep this pattern in any new glass mixin.

When the docs page shows a glass element, the static gradient on
`body.docs-body` (in `docs/assets/css/docs.scss`) provides the
background variation that makes the effect visible.

---

## 12. The dev symlink

Vite is rooted at `docs-dist/`, but the library CSS lives at the project
root's `css/`. The `docs-dist/css` symlink (created by `npm run setup`,
removed by `npm run clean:dev`) bridges the two.

- **MUST** treat `docs-dist/css` as build-only. It is in `.gitignore`.
- **MUST** run `npm run setup` (or `npm run dev` / `npm run build:docs`,
  which both call `setup` as a pre-hook) after cloning.
- On Windows, symlinks require Developer Mode or admin rights. The
  `setup` script logs a clear error and exits non-zero if it cannot
  create the link.

---

## 13. Code style

- **Sass:** 2-space indent, no tabs, single quotes for strings in `.scss`
  (Prettier override). Multi-line `@each` blocks must have an empty
  line before the body.
- **HTML:** 2-space indent, double-quoted attributes, self-closing
  void elements (`<meta />`, `<link />`).
- **JS:** Standard Prettier, single quotes, trailing commas.
- **No comments unless asked.** This rule is overridden inside CSS files
  where section banners (`// --- Section name ---`) are used to delimit
  the file's structure. Do not add narrative comments to individual
  rules. If a rule needs a comment, it probably needs a better name.
- Run `npm run format` before `npm run lint`. The two tools occasionally
  disagree (e.g. Prettier removes an empty line that Stylelint wants
  preserved). Re-run `npm run lint -- --fix` after formatting.

---

## 14. Before you claim you're done

Run **all** of the following and confirm each passes:

```bash
npm run lint
npm run build
```

Then a manual smoke test:

```bash
npm run dev
```

Open `http://localhost:5173/`, then:

- Click through to every page in the left sidebar.
- Verify the glass effect is visible (translucent, blurred) on at least
  one element per page.
- Tab through the page; focus rings must be visible on every focusable
  element.
- Resize the window to < 992px and check the header menu opens the offcanvas nav.

If you changed a component, also:

- Open the matching `docs-dist/components/<name>.html` and verify every
  example.
- Toggle the disabled state, the hover state, and the focus state in
  DevTools.
- Verify `dist/vitrus.css` and `dist/vitrus.min.css` were regenerated
  and include your changes (search for one of your new selectors).

---

## 15. Definition of done (for a Phase 1 component)

- [ ] Token changes (if any) added to `_variables.scss` and exposed on
      `:root` in `_root.scss`.
- [ ] Component partial in `css/components/_<name>.scss` using the
      variant-map pattern.
- [ ] Registered in `css/vitrus.scss`.
- [ ] `dist/vitrus.css` and `dist/vitrus.min.css` build cleanly.
- [ ] `docs-dist/components/<name>.html` exists (run `npm run docs:html`) with at least one default and
  one variant example, plus a copy-friendly code block per example.
- [ ] Nav link added in `docs/nav.json`; page entry in `docs/pages.json`.
- [ ] Lint passes.
- [ ] No `console.log` / no `!important` outside `css/_utilities.scss` /
      no inline `style=` in the new docs page (a `style="position: relative"`
      for the overlay card is acceptable, anything else is a smell).

---

## 16. What you MUST NOT do

- **MUST NOT** introduce `@import` in any Sass file. Use `@use`.
- **MUST NOT** use the global `red()` / `green()` / `blue()` /
  `percentage()` / `nth()` / `if()` functions. Use the modern Sass
  module APIs (`sass:color`, `sass:math`, `sass:list`).
- **MUST NOT** rename a class without updating every docs page and the
  migration notes in `docs/`.
- **MUST NOT** add `!important` outside the utilities layer.
- **MUST NOT** commit `node_modules/`, `dist/`, `demo-dist/`, or `docs-dist/`
  (the generated dev/build tree; recreated by `npm run docs:html`).
- **MUST NOT** add a new top-level dependency without justification in
  the relevant `package.json` `description` / comments.
- **MUST NOT** implement Phase 3 (JS-driven) components in Phase 1 PRs.
  Stay within the current phase's checklist.
- **MUST NOT** bypass the variant-map pattern with bespoke per-variant
  copy-paste rules.

---

## 17. Quick reference: file → responsibility

| File                             | Responsibility                                                                              |
| -------------------------------- | ------------------------------------------------------------------------------------------- |
| `css/_variables.scss`            | All design tokens (single source of truth).                                                 |
| `css/_mixins.scss`               | `glass-surface`, `glass-tinted`, `focus-ring`, `media-*`, helpers.                          |
| `css/_root.scss`                 | `:root` custom-property mirror of every token.                                              |
| `css/_reboot.scss`               | Box-sizing, body, headings, links, focus-visible.                                           |
| `css/_grid.scss`                 | `.container`, `.container-fluid`, `.row`, `.col[-bp-N]`.                                    |
| `css/_utilities.scss`            | Generated helpers; `!important` allowed here.                                               |
| `css/components/_buttons.scss`   | `.btn`, `.btn-{variant}`, `.btn-outline-*`, `.btn-close`.                                   |
| `css/components/_badges.scss`    | `.badge` + `.bg-*` variant tints.                                                           |
| `css/components/_alerts.scss`    | `.alert` + variants, `.alert-dismissible`.                                                  |
| `css/components/_cards.scss`     | `.card` family, `.card-group`, `.card-img-overlay`.                                         |
| `css/components/_forms.scss`     | `.form-control`, `.form-select`, `.form-check`, `.form-switch`, `.input-group`, validation. |
| `css/components/_nav.scss`       | `.nav`, `.nav-tabs`, `.nav-pills`, `.tab-content`, `.tab-pane`.                            |
| `css/components/_navbar.scss`    | `.navbar`, `.navbar-brand`, `.navbar-nav`, `.navbar-expand-*`, toggler, collapse.           |
| `css/components/_breadcrumb.scss`| `.breadcrumb`, `.breadcrumb-item`.                                                          |
| `css/components/_pagination.scss`| `.pagination`, `.page-item`, `.page-link`, sizing modifiers.                                |
| `css/components/_spinners.scss`  | `.spinner-border`, `.spinner-grow`, size modifiers.                                         |
| `css/components/_progress.scss`  | `.progress`, `.progress-bar`, striped/animated variants.                                    |
| `css/_themes.scss`               | `data-vitrus-theme` presets including `midnight` dark glass.                                  |
| `docs/layout.html`               | Shared docs shell (header, nav, TOC mount, scripts).                                      |
| `docs/nav.json`                  | Sidebar navigation — edit once, rebuild all pages.                                            |
| `docs/pages.json`                | Per-page metadata (`title`, `activeNav`, `depth`).                                          |
| `docs/pages/<path>.html`         | Page main content only (examples + code blocks).                                            |
| `scripts/build-docs-html.mjs`    | Assembles `docs/` → `docs-dist/` HTML.                                                      |
| `docs-dist/index.html`           | Built landing page (token swatches, component overview, roadmap).                           |
| `docs-dist/components/<name>.html` | Built component docs (default + variant + code blocks).                                   |
| `docs/assets/css/docs.scss`      | Docs-only chrome (header, sidebars, TOC). Never in library output.                           |
| `docs/assets/css/themes.scss`    | Docs theme CSS variables per `data-vitrus-theme`.                                            |
| `docs/assets/js/layout.js`       | TOC generation + scroll spy for docs pages.                                                 |
| `docs/assets/js/theme.js`        | Header theme picker wiring.                                                                 |
| `js/vitrus.js`                   | Bundle entry; exports `window.vitrus` and ESM named exports.                                |
| `js/alert.js`                    | Alert dismiss plugin (`data-vitrus-dismiss="alert"`).                                       |
| `js/collapse.js`                 | Collapse toggle plugin (`data-vitrus-toggle="collapse"`).                                   |
| `js/tab.js`                      | Tab switching plugin (`data-vitrus-toggle="tab"`).                                          |
| `js/dropdown.js`                 | Dropdown menu plugin (`data-vitrus-toggle="dropdown"`).                                     |
| `js/modal.js`                    | Modal dialog plugin (`data-vitrus-toggle="modal"`).                                         |
| `js/offcanvas.js`                | Offcanvas panel plugin (`data-vitrus-toggle="offcanvas"`).                                  |
| `js/toast.js`                    | Toast notification plugin.                                                                  |
| `js/tooltip.js`                  | Tooltip plugin (`data-vitrus-toggle="tooltip"`).                                            |
| `js/popover.js`                  | Popover plugin (`data-vitrus-toggle="popover"`).                                            |
| `js/accordion.js`                | Accordion helper delegating to Collapse.                                                    |
| `js/util/backdrop.js`            | Shared backdrop for modal/offcanvas.                                                        |
| `js/util/focustrap.js`           | Focus trap for modal/offcanvas.                                                             |
| `js/util/scrollbar.js`           | Body scroll lock while overlays are open.                                                   |
| `vite.config.js`                 | Multi-page input discovery, `root: docs-dist/`, Sass loadPaths.                              |
| `vite.js.config.js`              | Library build → `dist/vitrus.bundle.js`, `dist/vitrus.js`.                                  |
| `scripts/create-dev-symlink.mjs` | Bridges `docs-dist/css` → `../css` for dev/build.                                           |
| `scripts/copy-bundle.mjs`        | Copies min bundle to `docs-dist/` or `demo-dist/` for serving.                              |

---

## 18. Getting help

- Spec / vision: `PRODUCT.md`
- Component scope: `components.md`
- Class rules / utilities: `rules_classes.md`
- Open a GitHub issue at the project repo.
