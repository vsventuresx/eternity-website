// Small DOM helpers shared by every module.

/** Run fn once the DOM is parsed (immediately if it already is). */
export function onReady(fn) {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
  else fn();
}

/**
 * Selector for a Webflow element tagged with a data attribute: hook('nav', 'toggle') → [data-ee-nav="toggle"].
 * Scripts find Webflow elements ONLY through these attributes, never by class name,
 * so renaming or restyling a class in Webflow can't break them. See README → Hooks.
 */
export const hook = (module, part) => `[data-ee-${module}="${part}"]`;

/** querySelector, scoped to root (document by default). */
export const $ = (sel, root = document) => root.querySelector(sel);

/** querySelectorAll as a real array. */
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/** Escape text for safe use inside innerHTML. */
export function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
