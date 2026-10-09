// Previous / next arrows for the horizontal sliders. Steps one card (plus the 1.5rem gap).
// Hooks (data-ee-slider): prev / next buttons, and a track with cards in the same <section>.
// Cards hidden by the Our Work filter (.is-hidden, set by work-filter.js) are skipped.

import { $$, hook } from '../utils/dom.js';

const TRACK = hook('slider', 'track');
const CARD = `${hook('slider', 'card')}:not(.is-hidden)`;

export default function initSliderArrows() {
  [['prev', -1], ['next', 1]].forEach(([part, dir]) => {
    $$(hook('slider', part)).forEach((btn) => {
      const section = btn.closest('section');
      const track = section && section.querySelector(TRACK);
      if (!track) return;
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const card = track.querySelector(CARD);
        const step = card ? card.getBoundingClientRect().width + 24 : track.clientWidth * 0.8;
        track.scrollBy({ left: dir * step });
      });
    });
  });
}
