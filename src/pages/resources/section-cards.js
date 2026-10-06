// Archive section cards: fills "Start with: <pillar article>" from the hidden pillar list.
// Markup: a.rl-section-card[data-rl-section-card] > [data-rl-pillar-slot];
//         hidden list items [data-rl-pillar][data-section-slug]

import { $$ } from '../../utils/dom.js';

export default function initSectionCards() {
  const cards = $$('[data-rl-section-card]');
  if (!cards.length) return;

  const pillars = {};
  $$('[data-rl-pillar]').forEach((p) => {
    const slug = p.getAttribute('data-section-slug');
    if (slug && !pillars[slug]) pillars[slug] = p.textContent.trim();
  });

  cards.forEach((card) => {
    const slot = card.querySelector('[data-rl-pillar-slot]');
    if (!slot) return;
    const slug = (card.getAttribute('href') || '').split('/').pop();
    slot.textContent = pillars[slug] ? `Start with: ${pillars[slug]}` : '';
  });
}
