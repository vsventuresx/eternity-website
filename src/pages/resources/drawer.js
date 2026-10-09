// Mobile/tablet (≤ 991px): the sidebar becomes a drawer opened from the bottom bar.
// Closes on Esc, outside click, a link click, or when the search popup opens (event "rl:search-open").
// Hooks: [data-rl-nav] > [data-rl-sidebar] + [data-rl-mobile-bar] > [data-rl-drawer-toggle]
// Sets .is-open on the nav while the drawer is open (styled in CSS).
// Styles: src/styles/resources/sidebar.css

import { $, $$ } from '../../utils/dom.js';

export default function initDrawer() {
  const nav = $('[data-rl-nav]');
  if (!nav || nav.dataset.rlDrawer) return;
  nav.dataset.rlDrawer = '1';
  const toggle = $('[data-rl-drawer-toggle]', nav);

  const isOpen = () => nav.classList.contains('is-open');
  function setDrawer(open) {
    nav.classList.toggle('is-open', open);
    if (toggle) {
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close sections menu' : 'Open sections menu');
    }
    document.documentElement.style.overflow = open ? 'hidden' : '';
  }

  if (toggle) {
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      setDrawer(!isOpen());
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) {
      setDrawer(false);
      if (toggle) toggle.focus();
    }
  });
  $$('[data-rl-sidebar] a', nav).forEach((a) => {
    a.addEventListener('click', () => {
      if (isOpen() && !a.hasAttribute('data-rl-search-open')) setDrawer(false);
    });
  });
  window.addEventListener('rl:search-open', () => setDrawer(false));
  // Click on the blurred overlay (outside the sidebar and the bar) closes it
  document.addEventListener('click', (e) => {
    if (!isOpen()) return;
    if (!e.target.closest('[data-rl-sidebar]') && !e.target.closest('[data-rl-mobile-bar]')) setDrawer(false);
  });
}
