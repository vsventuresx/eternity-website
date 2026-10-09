// Fixed header + full-screen menu.
// - Header hides on scroll down, reveals on scroll up; always shown near the top and while the menu is open.
// - The glass eases back over light sections (.is-on-light).
// - Menu opens with a clip-path wipe and staggered links; Esc closes; focus is trapped while open.
// Hooks (data-ee-nav): wrapper > header (toggle) + menu (link ×n, menu-footer, credit)
// Styles: src/styles/global/nav.css. Spec: Workspace docs/dev-notes.md > Full-screen menu

import { $, $$, hook } from '../utils/dom.js';
import { reduceMotion, EASE } from '../utils/motion.js';

const WRAPPER = hook('nav', 'wrapper');
const HEADER = hook('nav', 'header');
const TOGGLE = hook('nav', 'toggle');
const MENU = hook('nav', 'menu');
const LINK = hook('nav', 'link');
const MENU_FOOTER = hook('nav', 'menu-footer');
const CREDIT = hook('nav', 'credit');

export default function initNav() {
  const wrap = $(WRAPPER);
  if (!wrap || wrap.dataset.ready) return;
  wrap.dataset.ready = '1';

  const header = $(HEADER, wrap);
  const toggle = $(TOGGLE, wrap);
  const menu = $(MENU, wrap);
  if (!header || !toggle || !menu) return;
  const links = $$(LINK, menu);
  const foot = $(MENU_FOOTER, menu);
  const reduce = reduceMotion();
  let open = false;
  let busy = false;
  let savedScroll = 0;

  // Keyboard vs mouse: focus inside the header only keeps it shown for keyboard users
  let kb = false;
  document.addEventListener('keydown', (e) => { if (e.key === 'Tab') kb = true; }, true);
  document.addEventListener('pointerdown', () => { kb = false; }, true);

  // ---- Light/dark detection -------------------------------------------------
  // The first page element under the header line (skipping the nav and its ancestors),
  // then its first solid background; luminance > .7 = light.
  const parseLum = (bg) => {
    const m = bg.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(',').map(parseFloat);
    if (p.length >= 4 && p[3] <= 0.5) return null;
    return (0.2126 * p[0] + 0.7152 * p[1] + 0.0722 * p[2]) / 255;
  };
  function lum(el) {
    while (el && el !== document.documentElement) {
      const l = parseLum(getComputedStyle(el).backgroundColor);
      if (l !== null) return l;
      el = el.parentElement;
    }
    const b = parseLum(getComputedStyle(document.body).backgroundColor);
    return b === null ? 1 : b;
  }
  function tone() {
    if (open) return;
    const y = Math.max(4, header.offsetHeight * 0.6);
    const target = document
      .elementsFromPoint(window.innerWidth / 2, y)
      .find((e) => !(e === wrap || wrap.contains(e) || e.contains(wrap)));
    header.classList.toggle('is-on-light', !!target && lum(target) > 0.7);
  }

  // ---- Hide on scroll down / reveal on scroll up -----------------------------
  let lastY = window.scrollY;
  let ticking = false;
  function onScroll() {
    ticking = false;
    tone();
    if (open || busy) return;
    const y = window.scrollY;
    const dy = y - lastY;
    if (y < header.offsetHeight) {
      header.classList.remove('is-hidden');
      lastY = y;
      return;
    }
    if (dy > 6) {
      if (!(kb && header.contains(document.activeElement))) header.classList.add('is-hidden');
      lastY = y;
    } else if (dy < -6) {
      header.classList.remove('is-hidden');
      lastY = y;
    }
  }
  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(onScroll);
    }
  }, { passive: true });
  window.addEventListener('resize', tone);
  window.addEventListener('load', tone);
  tone();
  header.addEventListener('focusin', () => { if (kb) header.classList.remove('is-hidden'); });

  // ---- Scroll lock (keeps the page where it was while the menu is open) -----
  function lock() {
    savedScroll = window.scrollY;
    document.documentElement.style.overflow = 'hidden';
    Object.assign(document.body.style, { position: 'fixed', top: `${-savedScroll}px`, width: '100%' });
  }
  function unlock() {
    document.documentElement.style.overflow = '';
    Object.assign(document.body.style, { position: '', top: '', width: '' });
    window.scrollTo(0, savedScroll);
    lastY = window.scrollY;
  }

  // ---- Menu open / close -----------------------------------------------------
  function setState(o) {
    open = o;
    wrap.classList.toggle('is-menu-open', o);
    if (o) header.classList.remove('is-hidden');
    toggle.setAttribute('aria-expanded', o);
    toggle.setAttribute('aria-label', o ? 'Close menu' : 'Open menu');
  }
  const menuItems = () => links.concat(foot ? [foot] : []);

  function openMenu() {
    if (busy || open) return;
    busy = true;
    setState(true);
    lock();
    menu.style.display = 'block';
    const items = menuItems();
    items.forEach((el) => { el.style.opacity = 0; });
    const done = () => {
      items.forEach((el) => { el.style.opacity = 1; });
      busy = false;
      if (kb && links[0]) links[0].focus();
    };
    if (reduce) {
      menu.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, fill: 'forwards' });
      done();
      return;
    }
    menu.animate([{ clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0 0 0 0)' }],
      { duration: 600, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'forwards' });
    const rev = links.slice().reverse();
    rev.forEach((el, i) => {
      el.animate([{ opacity: 0, transform: 'translateY(24px)' }, { opacity: 1, transform: 'translateY(0)' }],
        { duration: 450, delay: 650 + i * 70, easing: EASE, fill: 'forwards' });
    });
    if (foot) foot.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400, delay: 650 + rev.length * 70, fill: 'forwards' });
    setTimeout(done, 650 + rev.length * 70 + 450);
  }

  function closeMenu(cb) {
    if (busy || !open) return;
    busy = true;
    const items = menuItems();
    setState(false);
    const fin = () => {
      menu.getAnimations().forEach((a) => a.cancel());
      items.forEach((el) => el.getAnimations().forEach((a) => a.cancel()));
      menu.style.display = 'none';
      unlock();
      busy = false;
      tone();
      if (kb) toggle.focus();
      else if (document.activeElement && menu.contains(document.activeElement)) document.activeElement.blur();
      if (typeof cb === 'function') cb();
    };
    if (reduce) {
      menu.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: 'forwards' }).onfinish = fin;
      return;
    }
    items.forEach((el) => {
      el.animate([{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(-8px)' }],
        { duration: 150, easing: 'ease-in', fill: 'forwards' });
    });
    setTimeout(() => {
      menu.animate([{ clipPath: 'inset(0 0 0 0)' }, { clipPath: 'inset(100% 0 0 0)' }],
        { duration: 500, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'forwards' }).onfinish = fin;
    }, 150);
  }

  toggle.addEventListener('click', (e) => {
    e.preventDefault();
    if (open) closeMenu();
    else openMenu();
  });

  // Page links close the menu first, then navigate
  links.forEach((a) => {
    a.addEventListener('click', (e) => {
      if (!open) return;
      const href = a.getAttribute('href');
      if (!href || href.charAt(0) === '#') return;
      e.preventDefault();
      closeMenu(() => { window.location.href = href; });
    });
  });

  // Esc closes; Tab cycles inside the menu
  document.addEventListener('keydown', (e) => {
    if (!open) return;
    if (e.key === 'Escape') {
      kb = true;
      closeMenu();
      return;
    }
    if (e.key === 'Tab') {
      const f = [toggle, ...links, ...$$(CREDIT, menu)];
      const i = f.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) {
        e.preventDefault();
        f[f.length - 1].focus();
      } else if (!e.shiftKey && i === f.length - 1) {
        e.preventDefault();
        f[0].focus();
      }
    }
  });
}
