// Services rail (desktop): hovering or focusing a Service Tier fills the progress line up to its node.
// Markup: .home-services_rail > .home-services_rail-progress + .home-services_rail-node ×n, .service-tier ×n

import { $, $$ } from '../../utils/dom.js';

export default function initServicesRail() {
  const rail = $('.home-services_rail');
  const progress = $('.home-services_rail-progress');
  const nodes = $$('.home-services_rail-node');
  const tiers = $$('.service-tier');
  if (!rail || !progress || !nodes.length) return;

  function fill(i) {
    if (!nodes[i]) return;
    const r = rail.getBoundingClientRect();
    const n = nodes[i].getBoundingClientRect();
    progress.style.width = `${n.left - r.left + n.width / 2}px`;
    nodes.forEach((x, j) => x.classList.toggle('is-active', j <= i));
  }

  tiers.forEach((t, i) => {
    t.addEventListener('mouseenter', () => fill(i));
    t.addEventListener('focus', () => fill(i));
  });
  fill(0);
}
