// Visitor preferences that change how (or whether) things animate.

/** True when the visitor asked the OS for reduced motion. Every animation checks this. */
export const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** True for a precise pointer (mouse/trackpad). Cursor and glow effects only run on these. */
export const finePointer = () => window.matchMedia('(pointer: fine)').matches;

/** Shared easing so motion feels consistent across the site. */
export const EASE = 'cubic-bezier(.22,1,.36,1)';
