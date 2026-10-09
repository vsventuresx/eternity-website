// CTA glow that follows the pointer and continues into the footer.
// One shared target drives both glows, so the light travels across the section boundary
// (it passes behind the footer panel). Rests centred on the CTA when the pointer leaves.
// Hooks (data-ee-glow): cta-zone > cta, footer-zone > footer

import { $, hook } from '../utils/dom.js';
import { reduceMotion, finePointer } from '../utils/motion.js';

export default function initGlow() {
  const cta = $(hook('glow', 'cta-zone'));
  const glow = $(hook('glow', 'cta'));
  const foot = $(hook('glow', 'footer-zone'));
  const fglow = $(hook('glow', 'footer'));
  const enabled = !reduceMotion() && finePointer();

  if (fglow && (!cta || !enabled)) fglow.style.display = 'none';
  if (!cta || !glow || !enabled) return;

  let tx = 0;
  let ty = 0;
  let gx = 0;
  let gy = 0;
  let raf = null;

  function apply() {
    glow.style.transform = `translate(${gx}px,${gy}px)`;
    if (fglow && foot) {
      const c = cta.getBoundingClientRect();
      const f = foot.getBoundingClientRect();
      const dx = c.left + c.width / 2 - (f.left + f.width / 2);
      const dy = c.top + c.height / 2 - (f.top + f.height / 2);
      fglow.style.transform = `translate(${gx + dx}px,${gy + dy}px)`;
    }
  }
  function loop() {
    gx += (tx - gx) * 0.12;
    gy += (ty - gy) * 0.12;
    apply();
    raf = Math.abs(tx - gx) > 0.5 || Math.abs(ty - gy) > 0.5 ? requestAnimationFrame(loop) : null;
  }
  const go = () => { if (!raf) raf = requestAnimationFrame(loop); };
  function move(e) {
    const r = cta.getBoundingClientRect();
    tx = e.clientX - (r.left + r.width / 2);
    ty = e.clientY - (r.top + r.height / 2);
    go();
  }
  const inZone = (el) => !!el && (cta.contains(el) || (!!foot && foot.contains(el)));

  [cta, foot].forEach((zone) => {
    if (!zone) return;
    zone.addEventListener('pointermove', move);
    zone.addEventListener('pointerleave', (e) => {
      if (!inZone(e.relatedTarget)) {
        tx = 0;
        ty = 0;
        go();
      }
    });
  });

  apply();
  window.addEventListener('resize', apply);
}
