# Changelog

Versions match the git tags that jsDelivr serves (`@0.1.0`).

## 0.3.0 (2026-10-09)

Scripts no longer depend on class names: every Webflow element is found through a data attribute.

- Site modules use `data-ee-<module>="<part>"` (nav, footer, cursor, glow, ticker, slider, tier, map,
  marquee, draw/icon, usp, work, rail); Resource Library adds `data-rl-nav`, `-sidebar`, `-mobile-bar`,
  `-nav-section`, `-kbd`, `-page-body`, `-tag`, `-dropdown-value`, `-eyebrow`, `-who-text`.
  Full list: README → Hooks. The attributes were added in Webflow before this release.
- `site.min.js` loads `resources.min.js` itself when `[data-rl-nav]` is on the page, so the Head code
  snippet has no logic left (new `webflow/head-code.html`).
- Our Work's starting category comes from `data-ee-work-default` (was the `is-active` class).
- Ticker lists copy the original list's classes when rebuilt (no hard-coded class name).

## 0.2.0 (2026-10-06)

One snippet, one place: all custom code now loads from Site settings → Head code.

- New `webflow/head-code.html` replaces the three snippets (site head, site footer, RL Nav embed).
  The version appears once; the scripts follow the stylesheet's version.
- `resources.min.js` loads automatically on pages with the RL sidebar. No code embeds in components.
- Resource Library styles are merged into `site.min.css` (`resources.min.css` is gone).
  The black page background is scoped to pages with the RL sidebar.
- The loader works whether it's pasted into Head or Footer code.

## 0.1.0 (2026-10-06)

First version: the inline Webflow embeds moved into modules, behaviour unchanged.

- Site bundle: nav, footer, cursor, CTA/footer glow, tickers, drag-scroll, slider arrows, service tiers,
  Canada map, logo marquee, draw-on icons, USP highlight, Our Work filter, services rail.
- Resource Library bundle: sidebar, drawer, section cards, article page, on-page search and filters, search popup.
- Changes from the embeds:
  - The hidden page scrollbar is scoped to pages with the main nav (Resource Library pages keep theirs).
  - The ticker divider symbol (`#ee-mark`) is added by the ticker script, not a separate embed.
  - Search de-duplicates only rows with real URLs (rows with an unresolved link are no longer merged).
  - The duplicated `ee-sheen` keyframes are defined once.
