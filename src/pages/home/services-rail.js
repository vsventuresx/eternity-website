// Services rail (desktop): hovering or focusing a Service Tier fills the progress line up to its node.
// Hooks: data-ee-rail = rail > progress + node ×n; service cards data-ee-tier="card" ×n (same order as the nodes).
// Sets .is-active on the filled nodes (styled in CSS).

import { $, $$, hook } from '../../utils/dom.js';

export default function initServicesRail() {
  const rail = $(hook('rail', 'rail'));
  const progress = $(hook('rail', 'progress'));
  const nodes = $$(hook('rail', 'node'));
  const tiers = $$(hook('tier', 'card'));
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
