// Line icons that draw themselves in (paths from Figma).
// CTA steps draw on as they scroll into view (staggered 150ms); audience links redraw on hover (CSS).
// Icons are matched to elements in page order. Markup: .home-cta_step > .home-cta_step-icon, .audience-link_icon

import { $$ } from '../utils/dom.js';
import { reduceMotion } from '../utils/motion.js';

const STEP_ICONS = [
  ['0 0 28 39', 'M26.175 10.075L16.975 0.875H0.875V37.675H26.175V10.075ZM16.975 0.875V10.075H26.175M13.525 30.775V16.975M19.275 22.725L13.525 16.975L7.775 22.725'],
  ['0 0 30 41', 'M5.475 5.475H0.875V39.975H28.475V5.475H23.875M6.625 25.025L12.375 30.775L22.725 19.275M7.775 0.875H21.575V10.075H7.775V0.875Z'],
  ['0 0 39 31', 'M5.475 25.025C5.475 12.375 11.225 4.325 19.275 4.325C27.325 4.325 33.075 12.375 33.075 25.025M15.25 14.675V4.9V0.875H23.3V4.9V14.675M0.875 25.025H37.675V29.625H0.875V25.025Z'],
];
const AUDIENCE_ICONS = [
  ['0 0 32 32', 'M4 15.5L16 4.5L28 15.5M7 13.5V27.5H25V13.5M13 27.5V19.5H19V27.5'],
  ['0 0 32 32', 'M4 28H28M24 28V13L16 6L8 13V28M8 13H24M4 4V10M28 4V10M4 7H28'],
  ['0 0 32 32', 'M3 26H29M6 26V10M11 26V10M16 26V10M21 26V10M26 26V10M3 10H29M3 6H29'],
];

const svg = ([viewBox, d]) =>
  `<svg class="ee-draw" viewBox="${viewBox}" fill="none" aria-hidden="true"><path pathLength="1" d="${d}" stroke="#FF8603" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

function fill(selector, icons) {
  $$(selector).forEach((host, i) => {
    if (icons[i] && !host.querySelector('svg')) host.innerHTML = svg(icons[i]);
  });
}

export default function initDrawIcons() {
  fill('.home-cta_step-icon', STEP_ICONS);
  fill('.audience-link_icon', AUDIENCE_ICONS);

  const steps = $$('.home-cta_step');
  if (!steps.length) return;
  if (!('IntersectionObserver' in window) || reduceMotion()) {
    steps.forEach((s) => s.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.4 });
  steps.forEach((s, i) => {
    const p = s.querySelector('.ee-draw path');
    if (p) p.style.transitionDelay = `${i * 150}ms`;
    io.observe(s);
  });
}
