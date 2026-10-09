// eternity.design: site-wide bundle (dist/site.min.js), loaded on every page.
// Each module checks for its own elements and does nothing when they're absent,
// so the same bundle is safe on every page. Modules are independent; order doesn't matter.
// On Resource Library pages ([data-rl-nav]) it also loads resources.min.js from the same version.

import { onReady } from './utils/dom.js';
import { runModules } from './utils/run.js';

import initNav from './global/nav.js';
import initFooter from './global/footer.js';
import initCursor from './global/cursor.js';
import initGlow from './global/glow.js';

import initTickers from './components/ticker.js';
import initDragScroll from './components/drag-scroll.js';
import initSliderArrows from './components/slider-arrows.js';
import initServiceTiers from './components/service-tiers.js';
import initCanadaMaps from './components/canada-map.js';
import initLogoMarquee from './components/logo-marquee.js';
import initDrawIcons from './components/draw-icons.js';

import initUspHighlight from './pages/home/usp-highlight.js';
import initWorkFilter from './pages/home/work-filter.js';
import initServicesRail from './pages/home/services-rail.js';

// Where this file was loaded from (jsDelivr version folder, or localhost in dev mode)
const SELF = document.currentScript ? document.currentScript.src : '';

function loadResourceLibrary() {
  if (!SELF || !document.querySelector('[data-rl-nav]')) return;
  const s = document.createElement('script');
  s.src = SELF.replace(/site\.min\.js.*$/, 'resources.min.js');
  document.head.appendChild(s);
}

onReady(() => {
  loadResourceLibrary();
  runModules([
    // Global
    ['nav', initNav],
    ['footer', initFooter],
    ['cursor', initCursor],
    ['glow', initGlow],
    // Components
    ['ticker', initTickers],
    ['drag-scroll', initDragScroll],
    ['slider-arrows', initSliderArrows],
    ['service-tiers', initServiceTiers],
    ['canada-map', initCanadaMaps],
    ['logo-marquee', initLogoMarquee],
    ['draw-icons', initDrawIcons],
    // Home page
    ['usp-highlight', initUspHighlight],
    ['work-filter', initWorkFilter],
    ['services-rail', initServicesRail],
  ]);
});
