// Previous / next arrows for the horizontal sliders. Steps one card (plus the 1.5rem gap).
// Markup: section > .slider-buttons > .slider-button ×2 (first = previous), and a track in the same section.

import { $$ } from '../utils/dom.js';

const TRACKS = '.home-work_cards, .home-team_list';
const CARDS = '.project-card:not(.is-hidden), .team-card';

export default function initSliderArrows() {
  $$('.slider-buttons').forEach((group) => {
    const section = group.closest('section');
    const track = section && section.querySelector(TRACKS);
    if (!track) return;
    $$('.slider-button', group).forEach((btn, i) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const card = track.querySelector(CARDS);
        const step = card ? card.getBoundingClientRect().width + 24 : track.clientWidth * 0.8;
        track.scrollBy({ left: i === 0 ? -step : step });
      });
    });
  });
}
