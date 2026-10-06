# Changelog

Versions match the git tags that jsDelivr serves (`@0.1.0`).

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
