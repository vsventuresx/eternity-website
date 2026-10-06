// USP band: the statement's words light up one by one as it scrolls in.
// Finishes before the band's bottom edge reaches the bottom of the screen.
// Markup: .section_home-usp > .home-usp_statement (plain text). Words are wrapped in .usp-word spans.

import { $, escapeHtml } from '../../utils/dom.js';
import { reduceMotion } from '../../utils/motion.js';

const DIM = 0.35;

export default function initUspHighlight() {
  const statement = $('.home-usp_statement');
  const band = $('.section_home-usp');
  if (!statement || !band || statement.querySelector('.usp-word')) return;

  statement.innerHTML = statement.textContent.trim().split(/\s+/)
    .map((w) => `<span class="usp-word">${escapeHtml(w)}</span>`).join(' ');
  const words = statement.querySelectorAll('.usp-word');
  if (reduceMotion()) return; // CSS shows every word at full opacity

  let ticking = false;
  function update() {
    ticking = false;
    const r = statement.getBoundingClientRect();
    const b = band.getBoundingClientRect();
    const vh = window.innerHeight;
    const start = vh * 0.9;
    const end = Math.min(vh * 0.7, vh - (b.bottom - r.bottom) - 8);
    const total = Math.max(1, r.height + (start - end));
    const progress = Math.max(0, Math.min(1, (start - r.top) / total));
    const lit = progress * words.length;
    for (let i = 0; i < words.length; i++) {
      words[i].style.opacity = DIM + (1 - DIM) * Math.max(0, Math.min(1, lit - i));
    }
  }
  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });
  window.addEventListener('resize', update);
  update();
}
