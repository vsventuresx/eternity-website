// Our Work: category filter (Projects > Category).
// Clicking a category shows only its project cards; if a category has no projects yet, all cards stay visible.
// Markup: .home-work_category (.home-work_category-name), .home-work_cards > .project-card[data-category]

import { $, $$ } from '../../utils/dom.js';

export default function initWorkFilter() {
  const categories = $$('.home-work_category');
  if (!categories.length) return;
  const cards = () => $$('.home-work_cards .project-card');

  function pick(cat) {
    categories.forEach((c) => {
      c.classList.toggle('is-active', c === cat);
      c.setAttribute('aria-pressed', c === cat);
    });
    const name = ($('.home-work_category-name', cat) || cat).textContent.trim();
    const list = cards();
    const any = list.some((k) => k.getAttribute('data-category') === name);
    list.forEach((k) => k.classList.toggle('is-hidden', any && k.getAttribute('data-category') !== name));
    const track = $('.home-work_cards');
    if (track) track.scrollLeft = 0;
  }

  categories.forEach((c) => {
    c.setAttribute('role', 'button');
    c.setAttribute('tabindex', '0');
    c.addEventListener('click', () => pick(c));
    c.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        pick(c);
      }
    });
  });

  pick($('.home-work_category.is-active') || categories[0]);
}
