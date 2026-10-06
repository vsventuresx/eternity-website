// Footer helpers:
// - Clones the Nav logo SVG into .footer_logo-svg (one source of truth for the logo).
// - Sets the newsletter email placeholder (Webflow's form field doesn't expose it on this input).

import { $, $$ } from '../utils/dom.js';

export default function initFooter() {
  const src = $('.nav_logo-mark svg');
  $$('.footer_logo-svg').forEach((host) => {
    if (src && !host.querySelector('svg')) host.appendChild(src.cloneNode(true));
  });

  const email = document.getElementById('footer-email');
  if (email && !email.placeholder) email.placeholder = 'Enter your email';
}
