// Text matching and data helpers shared by the on-page filters and the search popup.
// Articles are read from data-* attributes on [data-rl-item] rows (bound to CMS fields in Webflow).

import { escapeHtml } from '../../../utils/dom.js';

export const TYPES = ['Component', 'Decision', 'Process', 'Scope', 'Regional', 'Technical'];
export const TOPICS = ['Budgeting', 'Construction', 'Engineering', 'Homeowners', 'Permitting', 'Renovations'];
export const ENGINEER_LINK = 'mailto:hello@eternity.design';

// ---- Words -------------------------------------------------------------------
/** Lowercase, accents stripped. */
export const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
/** Naive plural stem: "piles" → "pile" (not "glass"). */
export const stem = (w) => (w.length > 3 && /s$/.test(w) && !/ss$/.test(w) ? w.slice(0, -1) : w);
/** Split into stemmed word tokens. */
export const toks = (s) => norm(s).split(/[^a-z0-9]+/).filter(Boolean).map(stem);
/** Same word, ignoring case, accents and plural ("Homeowner" = "Homeowners"). */
export const same = (a, b) => stem(norm(a).trim()) === stem(norm(b).trim());
/** Display label for a CMS option (the CMS option is "Homeowner"). */
export const label = (v) => (same(v, 'Homeowners') ? 'Homeowners' : v);

// ---- Ranking -----------------------------------------------------------------
// Per query word: title starts with it 100, a title word starts with it 60, title contains it 40,
// type/topic/section/group 30, summary 10. Every word must match somewhere. Pillar articles +5.
export function score(it, qt) {
  if (!qt.length) return 1;
  const t = it._t || (it._t = toks(it.title));
  const g = it._g || (it._g = toks([it.type, it.topic, it.section, it.group].join(' ')));
  const s = it._s || (it._s = toks(it.summary));
  let total = 0;
  for (const q of qt) {
    let v = 0;
    if (t.length && t[0].indexOf(q) === 0) v = 100;
    else if (t.some((w) => w.indexOf(q) === 0)) v = 60;
    else if (t.some((w) => w.indexOf(q) > -1)) v = 40;
    else if (g.some((w) => w.indexOf(q) === 0)) v = 30;
    else if (s.some((w) => w.indexOf(q) === 0)) v = 10;
    if (!v) return 0;
    total += v;
  }
  return total + (it.pillar ? 5 : 0);
}

export const passFilters = (it, types, topics) =>
  (!types.length || types.some((x) => same(x, it.type))) && (!topics.length || topics.some((x) => same(x, it.topic)));

/** Title with matched words wrapped in <mark>, HTML-escaped. */
export function highlight(title, q) {
  let out = escapeHtml(title);
  toks(q).forEach((tk) => {
    if (tk.length < 2) return;
    const re = new RegExp(`(${tk.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig');
    out = out.replace(/(<[^>]+>)|([^<]+)/g, (m, tag, txt) => tag || txt.replace(re, '<mark>$1</mark>'));
  });
  return out;
}

// ---- Reading CMS rows ------------------------------------------------------------
export function parseItems(root) {
  const seen = {};
  return Array.from(root.querySelectorAll('[data-rl-item]')).map((el) => ({
    el,
    title: el.getAttribute('data-title') || el.textContent.trim(),
    href: el.getAttribute('href') || '#',
    summary: el.getAttribute('data-summary') || '',
    type: el.getAttribute('data-type') || '',
    topic: el.getAttribute('data-topic') || '',
    section: el.getAttribute('data-section') || '',
    sectionSlug: el.getAttribute('data-section-slug') || '',
    sectionNumber: parseInt(el.getAttribute('data-section-number'), 10) || 99,
    accent: el.getAttribute('data-accent') || 'Sky',
    group: el.getAttribute('data-group') || '',
    groupOrder: parseFloat(el.getAttribute('data-group-order')) || 999,
  })).filter((it) => {
    // De-duplicate by URL; rows without a real URL fall back to the title so they're never merged
    const key = /^\/[^#]/.test(it.href) ? it.href : `t:${it.title}`;
    if (seen[key]) return false;
    seen[key] = 1;
    return true;
  });
}

export const parsePillars = (root) =>
  Array.from(root.querySelectorAll('[data-rl-pillar]')).map((el) => ({
    title: el.textContent.trim(),
    href: el.getAttribute('href') || '#',
    section: el.getAttribute('data-section') || '',
    sectionSlug: el.getAttribute('data-section-slug') || '',
  }));

/** Two-digit section number; blank for "no section" (99). */
export const pad = (n) => (n >= 99 ? '' : String(n).padStart(2, '0'));

// ---- URL state (?q=&type=&topic=) ----------------------------------------------
export function readParams() {
  const p = new URLSearchParams(location.search);
  const list = (k) => (p.get(k) || '').split(',').map((s) => s.trim()).filter(Boolean);
  return { q: p.get('q') || '', types: list('type'), topics: list('topic') };
}

export function writeParams(st) {
  const p = new URLSearchParams(location.search);
  ['q', 'type', 'topic'].forEach((k) => p.delete(k));
  if (st.q) p.set('q', st.q);
  if (st.types.length) p.set('type', st.types.join(','));
  if (st.topics.length) p.set('topic', st.topics.join(','));
  const s = p.toString();
  try {
    history.replaceState(null, '', location.pathname + (s ? `?${s}` : '') + location.hash);
  } catch (e) {
    /* sandboxed previews can block replaceState */
  }
}
