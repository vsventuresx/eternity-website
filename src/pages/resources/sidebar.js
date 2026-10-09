// Resource Library sidebar (RL Nav component).
// - Pads section numbers ("4" → "04") on anything with [data-rl-pad="2"] (the sidebar badges).
// - Marks the current section active (section page URL, or [data-rl-current-section] on article pages)
//   and "Library home" on /resources.
// - Fills in a section link's URL from data-section-slug if Webflow left it empty.
// Hooks: [data-rl-nav] > [data-rl-nav-section][data-section-slug] > [data-rl-pad]; [data-rl-home]

import { $, $$ } from '../../utils/dom.js';

/** The current section's slug, from the page wrapper or the /resource-section/<slug> URL. */
export function currentSectionSlug() {
  const holder = $('[data-rl-current-section]');
  const slug = holder ? holder.getAttribute('data-rl-current-section') : '';
  if (slug) return slug;
  const m = location.pathname.match(/^\/resource-section\/([^/]+)/);
  return m ? m[1] : '';
}

export default function initSidebar() {
  const nav = $('[data-rl-nav]');
  if (!nav) return;
  const path = location.pathname.replace(/\/$/, '');

  // Pad numbers
  $$('[data-rl-pad]').forEach((el) => {
    const n = (el.textContent || '').trim();
    if (/^\d+$/.test(n)) el.textContent = n.padStart(+el.getAttribute('data-rl-pad') || 2, '0');
  });

  // Section links: fallback URL + active state
  const cur = currentSectionSlug();
  $$('[data-rl-nav-section]', nav).forEach((a) => {
    const href = a.getAttribute('href') || '';
    const slug = a.getAttribute('data-section-slug') || href.split('/').pop();
    if (slug && (!href || href === '#' || /^[0-9a-f]{24}$/.test(href))) a.setAttribute('href', `/resource-section/${slug}`);
    if (cur && slug === cur) {
      a.classList.add('is-active');
      a.setAttribute('aria-current', 'page');
    }
  });

  if (path === '/resources') {
    $$('[data-rl-home]', nav).forEach((a) => {
      a.classList.add('is-active');
      a.setAttribute('aria-current', 'page');
    });
  }
}
