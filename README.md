# eternity-website

Custom code for **[eternity.design](https://eternity.design)**, the Eternity Engineering website built in Webflow.

Webflow hosts the pages. This repo holds only the custom behaviour and styles that Webflow can't do natively. It builds them into a few small files that the site loads from jsDelivr.

```
src/  ──(npm run build)──▶  dist/site.min.js + site.min.css           every page
                            dist/resources.min.js + resources.min.css Resource Library only
                                   │
                                   ▼
       https://cdn.jsdelivr.net/gh/vsventuresx/eternity-website@<version>/dist/...  ──▶  Webflow
```

## Folder structure

```
src/
├─ site.js                 Entry: every page. Lists every module it starts.
├─ resources.js            Entry: Resource Library pages only.
├─ global/                 On every page (nav, footer, cursor, glow)
├─ components/             Reusable pieces, wherever they appear (ticker, sliders, map…)
├─ pages/
│  ├─ home/                Logic that belongs to the home page only
│  └─ resources/           Resource Library: sidebar, drawer, article, search/
├─ assets/                 Shared artwork as code (the infinity mark)
├─ utils/                  Small helpers (DOM, reduced motion, safe storage, module runner)
└─ styles/                 CSS that Webflow classes can't express, mirroring the JS folders
webflow/                   Snippets to paste into Webflow + migration and dev-mode notes
dist/                      Built output, committed, served by jsDelivr (don't edit by hand)
```

**Organised by feature, not by page.** A component used on several pages (the Canada map is in both On Site Now and the footer) lives in one file.

## Modules

Each module finds its own elements and does nothing if they're not on the page, so the bundles are safe to load everywhere.

### Site bundle (`site.min.js`)

| Module | Looks for | Does |
|---|---|---|
| `global/nav` | `.nav_wrapper` | Fixed header: hides on scroll down, reveals on scroll up, glass eases back over light sections; full-screen menu with focus trap |
| `global/footer` | `.footer_logo-svg`, `#footer-email` | Clones the nav logo into the footer; email placeholder |
| `global/cursor` | (desktop + fine pointer) | Custom dot + ring cursor; `data-cursor="view"` / `"drag"` states |
| `global/glow` | `.home-cta_glow`, `.footer_glow` | CTA glow follows the pointer and continues into the footer |
| `components/ticker` | `.ticker_component` | Seamless infinite text tickers |
| `components/drag-scroll` | `.home-team_list`, `.home-work_cards` | Mouse drag-to-scroll with momentum |
| `components/slider-arrows` | `.slider-buttons` | Previous / next buttons for the sliders |
| `components/service-tiers` | `.service-tier` | Desktop: whole card is a link. Mobile: accordion |
| `components/canada-map` | `.map_component` | Dot-matrix map, Toronto hub, arcs to cities |
| `components/logo-marquee` | `.home-logos_list` | Affiliates logo loop; hides the section if empty |
| `components/draw-icons` | `.home-cta_step-icon`, `.audience-link_icon` | Self-drawing line icons |
| `pages/home/usp-highlight` | `.home-usp_statement` | Words light up as the USP scrolls in |
| `pages/home/work-filter` | `.home-work_category` | Our Work category filter |
| `pages/home/services-rail` | `.home-services_rail` | Progress rail follows the hovered service |

### Resource Library bundle (`resources.min.js`)

| Module | Looks for | Does |
|---|---|---|
| `resources/sidebar` | `.rl-nav_component` | Active section, number padding (01–10), link fallback |
| `resources/drawer` | `[data-rl-drawer-toggle]` | Sidebar as a drawer on tablet/mobile |
| `resources/section-cards` | `[data-rl-section-card]` | "Start with: …" pillar line on archive cards |
| `resources/article` | `[data-rl-article]` | Section tab, hides empty fields, "More in {group}" list |
| `resources/search/filters` | `[data-rl-results]` | On-page search, Type/Topic filters, grouping, grid/list view, `?q=` state |
| `resources/search/modal` | `[data-rl-search-open]`, Ctrl/⌘K, `/` | Search popup |

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
- **Hooks:** modules currently find elements by their Client-First class names (e.g. `.ticker_component`). New modules should prefer `data-` attributes (e.g. `data-ticker`) so a class rename in Webflow can't break them. Existing modules move over as they're touched.
- **Respect reduced motion** (`utils/motion.js`): every animation has a still fallback.
- **CSS:** style in Webflow classes first. Only keyframes, pseudo-elements, masks and JS-driven states go in `src/styles/`.
- **Plain JS, no frameworks.** esbuild bundles and minifies; nothing else to install.

## Releasing

1. Update `version` in `package.json` and add an entry to `CHANGELOG.md`.
2. `npm run build`.
3. Commit (including `dist/`), then tag and push:
   ```bash
   git tag 0.2.0
   git push && git push --tags
   ```
4. In Webflow, change `@0.1.0` → `@0.2.0` in the three snippets (`webflow/`), then publish.

**Rollback:** point the snippets back at the previous version and publish. Never use `@main` or `@latest` on the live site: jsDelivr caches them unpredictably.
