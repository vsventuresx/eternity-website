// Article page extras.
// - Section tab links to /resource-section/<slug>.
// - Hides the illustration and "Who it's for" when their CMS fields are empty.
// - Hides the eyebrow's "· Group" part when the article has no group.
// - "More in {group}": up to 4 articles from the same group and section (from the hidden list),
//   excluding this page. Hides the card when there are none.
// Hooks: [data-rl-article][data-rl-current-section][data-rl-current-group] on the page wrapper,
//        [data-rl-section-link], [data-rl-eyebrow], [data-rl-illustration], [data-rl-who] > [data-rl-who-text],
//        [data-rl-related] > [data-rl-related-list], hidden list a[data-rl-rel-item][data-group][data-section-slug]

import { $, $$ } from '../../utils/dom.js';

const isEmpty = (el) => !el || !el.textContent.trim() || el.classList.contains('w-dyn-bind-empty');

export default function initArticle() {
  const art = $('[data-rl-article]');
  if (!art) return;
  const slug = art.getAttribute('data-rl-current-section') || '';
  const group = art.getAttribute('data-rl-current-group') || '';
  const here = location.pathname.replace(/\/$/, '');

  const sectionLink = $('[data-rl-section-link]');
  if (sectionLink && slug) sectionLink.setAttribute('href', `/resource-section/${slug}`);

  const ill = $('[data-rl-illustration]');
  if (ill) {
    const img = ill.querySelector('img');
    if (!img || !img.getAttribute('src') || img.classList.contains('w-dyn-bind-empty')) ill.style.display = 'none';
  }

  const who = $('[data-rl-who]');
  if (who && isEmpty(who.querySelector('[data-rl-who-text]'))) who.style.display = 'none';

  const eyebrow = $('[data-rl-eyebrow]', art);
  if (eyebrow && !group && eyebrow.children.length === 3) {
    eyebrow.children[1].style.display = 'none';
    eyebrow.children[2].style.display = 'none';
  }

  const list = $('[data-rl-related-list]');
  const card = $('[data-rl-related]');
  if (!list) return;
  const picks = $$('[data-rl-rel-item]').filter((a) => {
    const href = (a.getAttribute('href') || '').replace(/\/$/, '');
    return href !== here && group && a.getAttribute('data-group') === group
      && (!slug || a.getAttribute('data-section-slug') === slug);
  }).slice(0, 4);
  picks.forEach((a) => list.appendChild(a));
  if (!picks.length && card) card.style.display = 'none';
}
