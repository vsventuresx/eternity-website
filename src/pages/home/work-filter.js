// Our Work: category filter (Projects > Category).
// Clicking a category shows only its project cards; if a category has no projects yet, all cards stay visible.
// Hooks (data-ee-work): category (> category-name), cards > card[data-category].
// data-ee-work-default marks the category selected on load (otherwise the first).
// Sets .is-active on the chosen category and .is-hidden on filtered cards (styled in CSS).

import { $, $$, hook } from '../../utils/dom.js';

const CATEGORY = hook('work', 'category');
const CATEGORY_NAME = hook('work', 'category-name');
const CARDS = hook('work', 'cards');
const CARD = hook('work', 'card');

export default function initWorkFilter() {
  const categories = $$(CATEGORY);
  if (!categories.length) return;
  const cards = () => $$(`${CARDS} ${CARD}`);

  function pick(cat) {
    categories.forEach((c) => {
      c.classList.toggle('is-active', c === cat);
      c.setAttribute('aria-pressed', c === cat);
    });
    const name = ($(CATEGORY_NAME, cat) || cat).textContent.trim();
    const list = cards();
    const any = list.some((k) => k.getAttribute('data-category') === name);
    list.forEach((k) => k.classList.toggle('is-hidden', any && k.getAttribute('data-category') !== name));
    const track = $(CARDS);
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

  pick(categories.find((c) => c.hasAttribute('data-ee-work-default')) || categories[0]);
}
