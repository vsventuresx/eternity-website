// Infinite text tickers (services and scopes bands).
// Repeats the items until one copy is wider than the screen, then duplicates that copy and slides
// exactly half the track, so the loop is seamless and never runs out of text. Speed: --ticker-speed (px/s).
// Markup: .ticker_component (.is-reverse) > .ticker_track > .ticker_list > li
// Styles: src/styles/components/ticker.css

import { $$ } from '../utils/dom.js';
import { ensureMarkSymbol } from '../assets/mark.js';

export default function initTickers() {
  const tickers = $$('.ticker_component').map((c) => {
    const track = c.querySelector('.ticker_track');
    const list = track && track.querySelector('.ticker_list');
    if (!list) return null;
    return { c, track, items: Array.from(list.children).map((n) => n.cloneNode(true)) };
  }).filter(Boolean);
  if (!tickers.length) return;

  ensureMarkSymbol(); // dividers use <use href="#ee-mark">

  function build() {
    tickers.forEach(({ c, track, items }) => {
      track.innerHTML = '';
      const list = document.createElement('ul');
      list.className = 'ticker_list';
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
