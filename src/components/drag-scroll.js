// Mouse drag-to-scroll for horizontal sliders, with a little momentum.
// Touch keeps the native swipe. A drag never triggers the card link underneath.
// Hooks: data-ee-slider="track" (Engineers, Our Work)

import { $$, hook } from '../utils/dom.js';
import { reduceMotion } from '../utils/motion.js';

const SLIDERS = hook('slider', 'track');

function dragScroll(el, reduce) {
  let down = false;
  let moved = false;
  let startX = 0;
  let startL = 0;
  let lastX = 0;
  let lastT = 0;
  let vx = 0;
  let raf = null;

  el.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    down = true;
    moved = false;
    startX = lastX = e.clientX;
    startL = el.scrollLeft;
    lastT = performance.now();
    vx = 0;
    cancelAnimationFrame(raf);
  });

  window.addEventListener('pointermove', (e) => {
    if (!down) return;
    const dx = e.clientX - startX;
    if (!moved && Math.abs(dx) > 5) {
      moved = true;
      el.classList.add('is-dragging');
    }
    if (!moved) return;
    e.preventDefault();
    el.scrollLeft = startL - dx;
    const now = performance.now();
    vx = (e.clientX - lastX) / Math.max(1, now - lastT);
    lastX = e.clientX;
    lastT = now;
  });

  window.addEventListener('pointerup', () => {
    if (!down) return;
    down = false;
    if (!moved) return;
    let v = reduce ? 0 : -vx * 16;
    (function glide() {
      v *= 0.92;
      el.scrollLeft += v;
      if (Math.abs(v) > 0.5) raf = requestAnimationFrame(glide);
      else el.classList.remove('is-dragging');
    })();
  });

  // Swallow the click that ends a drag, so cards don't open
  el.addEventListener('click', (e) => {
    if (moved) {
      e.preventDefault();
      e.stopPropagation();
      moved = false;
    }
  }, true);
  el.addEventListener('dragstart', (e) => e.preventDefault());
}

export default function initDragScroll() {
  const reduce = reduceMotion();
  $$(SLIDERS).forEach((el) => dragScroll(el, reduce));
}
