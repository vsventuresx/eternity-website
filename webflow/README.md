# Webflow setup

How the built files get onto eternity.design, and how to switch the Webflow site over from the old inline embeds.

## Where the code is loaded

| Snippet | Paste into | Loads |
|---|---|---|
| [`site-head.html`](site-head.html) | Site settings → Custom code → **Head code** | `site.min.css` (every page) |
| [`site-footer.html`](site-footer.html) | Site settings → Custom code → **Footer code** | `site.min.js` (every page) |
| [`rl-nav-embed.html`](rl-nav-embed.html) | One Code Embed inside the **RL Nav** component | `resources.min.css` + `resources.min.js` (Resource Library pages only) |

The version number (`@0.1.0`) appears in all three snippets. A release changes it in all three, then you publish.

## Migration from the inline embeds (one-time)

Do this on staging first, check every page, then publish to the live domain.

1. Paste the three snippets above.
2. **Home page**: trim or delete these Code Embeds (the code now lives in the bundle):

   | Embed (first line) | Action |
   |---|---|
   | `<!-- Eternity homepage code: tickers, hero sheen …` | **Delete** |
   | `<!-- Homepage interactions: Our Work filter …` | **Delete** |
   | `<!-- Services: desktop = whole card links …` | **Delete** |
   | `<!-- Footer code: Canada map …` | **Replace** with just `<div class="map_component" aria-hidden="true"></div>` |
   | `<!-- Footer logo: cloned from the Nav logo …` | **Replace** with just `<div class="footer_logo-svg" style="width:100%;height:100%"></div>` |
   | USP trace drawing (`<svg class="home-usp_trace-svg" …`) | Keep (artwork, not code) |
   | The two tickers (`<div class="ticker_component" …`) | Keep (content) |
   | `<div class="map_component" …>` (On Site Now) | Keep (map placeholder) |

3. **Nav component**: delete the embed starting `<!-- Nav: fixed header with a gradient glass fade …`. Keep the logo SVG embed.
4. **RL Nav component**: delete the two embeds (`<!-- Resource Library core …` and `<!-- Resource Library search …`) and add one embed with [`rl-nav-embed.html`](rl-nav-embed.html).
5. **Global Styles component**: leave it. It's Finsweet's Client-First base CSS and belongs in Webflow.
6. Publish to staging and check: header hide/reveal and menu, tickers, USP highlight, Our Work filter and sliders, services (desktop hover + mobile accordion), maps, logo marquee, cursor and CTA glow, footer logo; on the Resource Library: sidebar, drawer, search, filters, popup, article page.

## Dev mode (test local changes on staging)

1. In this repo: `npm run dev` (serves `dist/` at http://localhost:3000 and rebuilds on save).
2. On the staging site, open the browser console once and run:
   ```js
   localStorage.setItem('ee-dev', '1')
   ```
3. Reload. That browser now loads the files from your computer; visitors still get the jsDelivr version.
   Chrome may ask to let the site "access other apps and services on this device" (local network access): allow it for the staging domain.
4. Turn it off with `localStorage.removeItem('ee-dev')`.

## Releasing

See the root [README](../README.md#releasing).
