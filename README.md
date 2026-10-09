# eternity-website

Custom code for **[eternity.design](https://eternity.design)**, the Eternity Engineering website built in Webflow.

Webflow hosts the pages. This repo holds only the custom behaviour and styles that Webflow can't do natively. It builds them into a few small files that the site loads from jsDelivr.

```
src/  ──(npm run build)──▶  dist/site.min.css      all styles, every page
                            dist/site.min.js       every page
                            dist/resources.min.js  only pages with the RL sidebar
                                   │
                                   ▼
       https://cdn.jsdelivr.net/gh/vsventuresx/eternity-website@<version>/dist/...
                                   │
                                   ▼
       Webflow: one snippet in Site settings → Head code (webflow/head-code.html)
```

## Folder structure

```
src/
├─ site.js                 Entry: every page. Lists every module it starts.
├─ resources.js            Entry: Resource Library pages only (loaded when .rl-nav_component exists).
├─ global/                 On every page (nav, footer, cursor, glow)
├─ components/             Reusable pieces, wherever they appear (ticker, sliders, map…)
├─ pages/
│  ├─ home/                Logic that belongs to the home page only
│  └─ resources/           Resource Library: sidebar, drawer, article, search/
├─ assets/                 Shared artwork as code (the infinity mark)
├─ utils/                  Small helpers (DOM, reduced motion, safe storage, module runner)
└─ styles/                 CSS that Webflow classes can't express, mirroring the JS folders
webflow/                   The Head code snippet + setup and dev-mode notes
dist/                      Built output, committed, served by jsDelivr (don't edit by hand)
```

**Organised by feature, not by page.** A component used on several pages (the Canada map is in both On Site Now and the footer) lives in one file.

## Modules

Each module finds its own elements and does nothing if they're not on the page, so the bundles are safe to load everywhere.

## Hooks: data attributes, never class names

Scripts find Webflow elements **only** through `data-` attributes set in Webflow (Element settings → Custom attributes). Classes are free to be renamed, restyled or swapped: as long as the attribute stays on the element, the script keeps working.

- **Site modules:** `data-ee-<module>="<part>"`, e.g. `data-ee-nav="toggle"`. Built in code with `hook('nav', 'toggle')` (`src/utils/dom.js`).
- **Resource Library:** `data-rl-<part>`, e.g. `data-rl-results`, `data-rl-nav`.
- **Allowed exceptions:** classes the scripts create themselves (`ee-cursor`, `usp-word`, `ee-draw`, `rl-menu_*`, `rl-modal_*`, `rl-articles_*`), state classes the scripts toggle (`is-open`, `is-active`, `is-hidden`…), and Webflow's own system classes (`w-dyn-item`, `w-dyn-bind-empty`, `w-button`), which can't be renamed.
- Before adding or editing a module, check it with: `grep -rnE "(querySelector|closest|\\$\\$?)\\(['\`]\\." src` (should only show the exceptions above).

### Site bundle (`site.min.js`)

| Module | Hooks | Does |
|---|---|---|
| `global/nav` | `data-ee-nav` = `wrapper`, `header`, `toggle`, `menu`, `link`, `menu-footer`, `credit` | Fixed header: hides on scroll down, reveals on scroll up, glass eases back over light sections; full-screen menu with focus trap |
| `global/footer` | `data-ee-logo` = `source` (nav logo), `target` (footer embed); `data-ee-footer="email"` | Clones the nav logo into the footer; email placeholder |
| `global/cursor` | `data-cursor` = `view` / `drag` (optional); `data-ee-cursor-inverse` | Custom dot + ring cursor; white inside inverse zones (hero, USP) |
| `global/glow` | `data-ee-glow` = `cta-zone`, `cta`, `footer-zone`, `footer` | CTA glow follows the pointer and continues into the footer |
| `components/ticker` | `data-ee-ticker` = `component`, `track`, `list` (in the ticker embeds) | Seamless infinite text tickers |
| `components/drag-scroll` | `data-ee-slider="track"` | Mouse drag-to-scroll with momentum |
| `components/slider-arrows` | `data-ee-slider` = `prev`, `next`, `track`, `card` (same `<section>`) | Previous / next buttons for the sliders |
| `components/service-tiers` | `data-ee-tier` = `card`, `header`, `body` | Desktop: whole card is a link. Mobile: accordion |
| `components/canada-map` | `data-ee-map` (on the map embed placeholder) | Dot-matrix map, Toronto hub, arcs to cities |
| `components/logo-marquee` | `data-ee-marquee` = `section`, `list` | Affiliates logo loop; hides the section if empty |
| `components/draw-icons` | `data-ee-draw="step"`; `data-ee-icon` = `step`, `audience` | Self-drawing line icons |
| `pages/home/usp-highlight` | `data-ee-usp` = `band`, `statement` | Words light up as the USP scrolls in |
| `pages/home/work-filter` | `data-ee-work` = `category`, `category-name`, `cards`, `card` (+ `data-category`); `data-ee-work-default` | Our Work category filter |
| `pages/home/services-rail` | `data-ee-rail` = `rail`, `progress`, `node`; `data-ee-tier="card"` | Progress rail follows the hovered service |

`site.min.js` also loads `resources.min.js` (same version) on pages that have `[data-rl-nav]`.

### Resource Library bundle (`resources.min.js`)

| Module | Hooks | Does |
|---|---|---|
| `resources/sidebar` | `data-rl-nav`, `data-rl-nav-section` (+ `data-section-slug`), `data-rl-pad`, `data-rl-home`, `data-rl-current-section` | Active section, number padding (01–10), link fallback |
| `resources/drawer` | `data-rl-nav`, `data-rl-sidebar`, `data-rl-mobile-bar`, `data-rl-drawer-toggle` | Sidebar as a drawer on tablet/mobile |
| `resources/section-cards` | `data-rl-section-card`, `data-rl-pillar-slot`, `data-rl-pillar` | "Start with: …" pillar line on archive cards |
| `resources/article` | `data-rl-article`, `data-rl-section-link`, `data-rl-eyebrow`, `data-rl-illustration`, `data-rl-who`, `data-rl-who-text`, `data-rl-related`, `data-rl-related-list`, `data-rl-rel-item` | Section tab, hides empty fields, "More in {group}" list |
| `resources/search/filters` | `data-rl-results`, `data-rl-source`, `data-rl-item` (+ data fields), `data-rl-input`, `data-rl-dropdown`, `data-rl-dropdown-value`, `data-rl-view`, `data-rl-tag`, `data-rl-page-body`, `data-rl-pillar-card` | On-page search, Type/Topic filters, grouping, grid/list view, `?q=` state |
| `resources/search/modal` | `data-rl-search-open`, `data-rl-kbd`, Ctrl/⌘K, `/` | Search popup |

Specs and design decisions: the project workspace `docs/dev-notes.md` and `docs/resource-library.md`.

## Commands

Requires [Node.js](https://nodejs.org) 18 or later. Work from a copy on a local disk (e.g. `C:\Repos\eternity-website`): `npm install` fails on Google Drive / Shared Drive folders.

```bash
npm install        # once
npm run dev        # rebuild on save + serve dist/ at http://localhost:3000 (see webflow/README.md, Dev mode)
npm run build      # production build into dist/
```

## Conventions

- **One module = one file = one job**, exporting a default `init` function. Add new modules to `src/site.js` or `src/resources.js`.
- **Hooks:** data attributes only (see [Hooks](#hooks-data-attributes-never-class-names)). A new module adds its attributes in Webflow first, then reads them with `hook()`.
- **Respect reduced motion** (`utils/motion.js`): every animation has a still fallback.
- **CSS:** style in Webflow classes first. Only keyframes, pseudo-elements, masks and JS-driven states go in `src/styles/`.
- **Plain JS, no frameworks.** esbuild bundles and minifies; nothing else to install.

## Releasing

1. Update `version` in `package.json` and add an entry to `CHANGELOG.md`.
2. `npm run build`.
3. Commit (including `dist/`), then tag and push:
   ```bash
   git tag 0.3.0
   git push && git push --tags
   ```
4. In Webflow → Site settings → Head code, change the version in the stylesheet link (e.g. `@0.2.0` → `@0.3.0`), then publish.

**Rollback:** set the Head code version back to the previous release and publish. Never use `@main` or `@latest` on the live site: jsDelivr caches them unpredictably.
