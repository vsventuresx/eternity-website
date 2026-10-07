# Webflow setup

How the built files get onto eternity.design.

## One snippet, one place

Paste [`head-code.html`](head-code.html) into **Site settings → Custom code → Head code**. That's all the custom code the site needs:

| Loads | Where |
|---|---|
| `site.min.css` (all styles, including the Resource Library's) | every page |
| `site.min.js` | every page |
| `resources.min.js` | only pages with the RL sidebar (`.rl-nav_component`) |

The version (`@0.2.0`) appears once, in the stylesheet link. The scripts load from the same version automatically.

**Footer code stays empty.** No code embeds are needed in pages or components, except the markup placeholders the code fills in:

| Placeholder embed | Contents |
|---|---|
| On Site Now map, footer map | `<div class="map_component" aria-hidden="true"></div>` |
| Footer logo | `<div class="footer_logo-svg" style="width:100%;height:100%"></div>` |
| Nav logo | the logo SVG (artwork) |
| USP trace drawing, the two tickers | artwork / content markup |

The **Global Styles** component stays as is: it's Finsweet's Client-First base CSS.

## Switching from 0.1.0 (one-time)

1. Replace everything in Head code with [`head-code.html`](head-code.html), and empty Footer code.
2. **RL Nav component:** delete both code embeds (`<!-- Resource Library core …` and `<!-- Resource Library search …`). Add nothing in their place.
3. **Home page:** make sure the two footer embeds hold only their placeholders (table above).
4. Publish to staging and check the home page and every Resource Library page.

## Dev mode (test local changes on staging)

1. In this repo: `npm run dev` (serves `dist/` at http://localhost:3000 and rebuilds on save).
2. On the staging site, open the browser console once and run:
   ```js
   localStorage.setItem('ee-dev', '1')
   ```
3. Reload. That browser now loads every file from your computer; visitors still get the jsDelivr version.
   Chrome may ask to let the site "access other apps and services on this device" (local network access): allow it for the staging domain.
4. Turn it off with `localStorage.removeItem('ee-dev')`.

## Releasing

See the root [README](../README.md#releasing). In Webflow, a release is one edit: the version in the Head code link.
