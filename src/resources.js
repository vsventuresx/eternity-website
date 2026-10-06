// eternity.design: Resource Library bundle (dist/resources.min.js).
// Loaded only on Resource Library pages, from the RL Nav component (see webflow/README.md).

import { onReady } from './utils/dom.js';
import { runModules } from './utils/run.js';

import initSidebar from './pages/resources/sidebar.js';
import initDrawer from './pages/resources/drawer.js';
import initSectionCards from './pages/resources/section-cards.js';
import initArticle from './pages/resources/article.js';
import initFilters from './pages/resources/search/filters.js';
import initSearchModal from './pages/resources/search/modal.js';

onReady(() => {
  runModules([
    ['rl-sidebar', initSidebar], // pads numbers first, so later modules read "04"
    ['rl-drawer', initDrawer],
    ['rl-section-cards', initSectionCards],
    ['rl-article', initArticle],
    ['rl-filters', initFilters],
    ['rl-search-modal', initSearchModal],
  ]);
});
