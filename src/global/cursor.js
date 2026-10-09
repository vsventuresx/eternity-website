// Custom cursor: orange dot + trailing ring. Desktop only (fine pointer), off with reduced motion.
// States from the element under the pointer:
//   [data-cursor="view" | "drag"] → large filled ring with a label
//   links / buttons               → medium ring with ↗
// Inverts to white inside [data-ee-cursor-inverse] (the hero and the USP band).
// .w-button is Webflow's own button class (fixed by Webflow, can't be renamed).
// Styles: src/styles/global/cursor.css

import { reduceMotion, finePointer } from '../utils/motion.js';

const LABEL = { link: '↗', view: 'View', drag: '← Drag →' };
const STATES = ['link', 'view', 'drag'];
const INVERSE_ZONES = '[data-ee-cursor-inverse]';

export default function initCursor() {
  if (reduceMotion() || !finePointer() || document.querySelector('.ee-cursor')) return;

  document.documentElement.classList.add('has-cursor');
  const cur = document.createElement('div');
  cur.className = 'ee-cursor';
  cur.setAttribute('aria-hidden', 'true');
  cur.innerHTML = '<div class="ee-cursor_ring"><span class="ee-cursor_label"></span></div><div class="ee-cursor_dot"></div>';
  document.body.appendChild(cur);

  const ring = cur.querySelector('.ee-cursor_ring');
  const dot = cur.querySelector('.ee-cursor_dot');
  const label = cur.querySelector('.ee-cursor_label');
  let mx = -100;
  let my = -100;
  let rx = -100;
  let ry = -100;

  // The ring eases towards the pointer every frame; the dot follows it exactly
  (function tick() {
    rx += (mx - rx) * 0.15;
    ry += (my - ry) * 0.15;
    ring.style.transform = `translate3d(${rx}px,${ry}px,0)`;
    requestAnimationFrame(tick);
  })();

  document.addEventListener('pointermove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.transform = `translate3d(${mx}px,${my}px,0)`;
    cur.classList.add('is-on');
    const t = e.target.closest ? e.target : null;
    const hit = t && t.closest('[data-cursor],a,button,[role=button],.w-button');
    const state = hit ? hit.getAttribute('data-cursor') || 'link' : '';
    STATES.forEach((s) => cur.classList.toggle(`is-${s}`, s === state));
    label.textContent = LABEL[state] || '';
    cur.classList.toggle('is-inverse', !!(t && t.closest(INVERSE_ZONES)) && !state);
  });

  document.documentElement.addEventListener('mouseleave', () => cur.classList.remove('is-on'));
}
