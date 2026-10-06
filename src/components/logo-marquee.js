// Affiliates logo marquee: duplicates the logos for a seamless loop at ticker speed (70px/s),
// pauses on hover (CSS). Hides the whole section when the CMS list is empty.
// Markup: .section_home-logos > .home-logos_list > logo items

import { $ } from '../utils/dom.js';
import { reduceMotion } from '../utils/motion.js';

const SPEED = 70; // px per second

export default function initLogoMarquee() {
  const list = $('.home-logos_list');
  if (!list) return;

  if (!list.children.length) {
    const section = $('.section_home-logos');
    if (section) section.style.display = 'none';
    return;
  }
  if (reduceMotion()) return;

  const width = list.scrollWidth;
  Array.from(list.children).forEach((n) => {
    const copy = n.cloneNode(true);
    copy.setAttribute('aria-hidden', 'true');
    copy.setAttribute('tabindex', '-1');
    list.appendChild(copy);
  });
  list.style.setProperty('--marquee-duration', `${width / SPEED}s`);
}
