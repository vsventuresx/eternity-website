// Service Tier cards.
// Desktop: the whole card links to the service (stretched .service-tier_link, CSS only).
// Mobile (< 768px): accordion, one open at a time, first one open by default.
// Markup: .service-tier > .service-tier_header + .service-tier_body > .service-tier_body-inner
// Styles: src/styles/components/service-tiers.css. Spec: Workspace docs/dev-notes.md > Services

import { $$ } from '../utils/dom.js';
import { reduceMotion } from '../utils/motion.js';

export default function initServiceTiers() {
  const tiers = $$('.service-tier').filter((t) => t.querySelector('.service-tier_header') && t.querySelector('.service-tier_body'));
  if (!tiers.length) return;

  const mq = window.matchMedia('(max-width: 767px)');
  const reduce = reduceMotion();
  const parts = (t) => ({ head: t.querySelector('.service-tier_header'), body: t.querySelector('.service-tier_body') });

  function setOpen(t, open, animate) {
    const { head, body } = parts(t);
    t.classList.toggle('is-open', open);
    head.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (!animate || reduce) {
      body.style.height = open ? 'auto' : '0px';
      body.style.opacity = open ? '1' : '0';
      return;
    }
    if (open) {
      const full = body.scrollHeight;
      body.style.height = '0px';
      void body.offsetHeight; // commit the start height so the transition runs
      body.style.height = `${full}px`;
      body.style.opacity = '1';
      body.addEventListener('transitionend', function te(e) {
        if (e.propertyName !== 'height') return;
        body.removeEventListener('transitionend', te);
        if (t.classList.contains('is-open')) body.style.height = 'auto';
      });
    } else {
      body.style.height = `${body.offsetHeight}px`;
      void body.offsetHeight;
      body.style.height = '0px';
      body.style.opacity = '0';
    }
  }

  function toggle(t) {
    const open = !t.classList.contains('is-open');
    tiers.forEach((o) => { if (o !== t && o.classList.contains('is-open')) setOpen(o, false, true); });
    setOpen(t, open, true);
  }

  tiers.forEach((t, i) => {
    const { head, body } = parts(t);
    if (!body.id) body.id = `service-tier-${i + 1}`;
    head.addEventListener('click', () => { if (mq.matches) toggle(t); });
    head.addEventListener('keydown', (e) => {
      if (mq.matches && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        toggle(t);
      }
    });
  });

  // Switch between accordion (mobile) and plain cards (desktop)
  function mode() {
    tiers.forEach((t, i) => {
      const { head, body } = parts(t);
      if (mq.matches) {
        head.setAttribute('role', 'button');
        head.setAttribute('tabindex', '0');
        head.setAttribute('aria-controls', body.id);
        setOpen(t, i === 0, false);
      } else {
        ['role', 'tabindex', 'aria-controls', 'aria-expanded'].forEach((a) => head.removeAttribute(a));
        t.classList.remove('is-open');
        body.style.height = '';
        body.style.opacity = '';
      }
    });
  }
  mode();
  if (mq.addEventListener) mq.addEventListener('change', mode);
  else mq.addListener(mode);
}
