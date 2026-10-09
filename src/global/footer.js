// Footer helpers:
// - Clones the Nav logo SVG into the footer logo placeholder (one source of truth for the logo).
// - Sets the newsletter email placeholder (Webflow's form field doesn't expose it on this input).
// Hooks: data-ee-logo="source" (nav logo, holds the SVG), data-ee-logo="target" (footer embed),
//        data-ee-footer="email" (newsletter input)

import { $, $$, hook } from '../utils/dom.js';

const LOGO_SOURCE = hook('logo', 'source');
const LOGO_TARGET = hook('logo', 'target');
const EMAIL = hook('footer', 'email');

export default function initFooter() {
  const src = $(`${LOGO_SOURCE} svg`);
  $$(LOGO_TARGET).forEach((host) => {
    if (src && !host.querySelector('svg')) host.appendChild(src.cloneNode(true));
  });

  const email = $(EMAIL);
  if (email && !email.placeholder) email.placeholder = 'Enter your email';
}
