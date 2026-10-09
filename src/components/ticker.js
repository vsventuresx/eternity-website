// Infinite text tickers (services and scopes bands).
// Repeats the items until one copy is wider than the screen, then duplicates that copy and slides
// exactly half the track, so the loop is seamless and never runs out of text. Speed: --ticker-speed (px/s).
// Hooks (data-ee-ticker): component > track > list > li. The markup lives in the ticker Code Embeds.
// Rebuilt lists copy the original list's classes, so styling follows whatever Webflow uses.
// Styles: src/styles/components/ticker.css

import { $, $$, hook } from '../utils/dom.js';
import { ensureMarkSymbol } from '../assets/mark.js';

export default function initTickers() {
  const tickers = $$(hook('ticker', 'component')).map((c) => {
    const track = $(hook('ticker', 'track'), c);
    const list = track && $(hook('ticker', 'list'), track);
    if (!list) return null;
    return { c, track, listClass: list.className, items: Array.from(list.children).map((n) => n.cloneNode(true)) };
  }).filter(Boolean);
  if (!tickers.length) return;

  ensureMarkSymbol(); // dividers use <use href="#ee-mark">

  function build() {
    tickers.forEach(({ c, track, listClass, items }) => {
      track.innerHTML = '';
      const list = document.createElement('ul');
      list.className = listClass;
      list.setAttribute('data-ee-ticker', 'list');
      track.appendChild(list);
      const need = Math.max(window.innerWidth, c.offsetWidth) + 200;
      let guard = 0;
      do {
        items.forEach((n) => list.appendChild(n.cloneNode(true)));
        guard++;
      } while (list.offsetWidth < need && guard < 30);
      const copy = list.cloneNode(true);
      copy.setAttribute('aria-hidden', 'true');
      track.appendChild(copy);
      const speed = parseFloat(getComputedStyle(c).getPropertyValue('--ticker-speed')) || 50;
      track.style.setProperty('--ticker-duration', `${list.offsetWidth / speed}s`);
    });
  }

  build();

  // Rebuild only when the window gets wider (narrower still has enough text)
  let widest = window.innerWidth;
  let t;
  window.addEventListener('resize', () => {
    clearTimeout(t);
    t = setTimeout(() => {
      if (window.innerWidth > widest) {
        widest = window.innerWidth;
        build();
      }
    }, 250);
  });
}
