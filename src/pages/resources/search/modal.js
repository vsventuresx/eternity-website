// Search popup (command palette). Opens with Ctrl/⌘K, "/", or any [data-rl-search-open] element.
// Index: the article rows already on the page (archive, results), otherwise fetched from /resource-search
// and cached in sessionStorage for 30 minutes. Results grouped by section (max 4 per group, 8 total),
// arrow keys + Enter, focus trap, recent searches, pillar suggestions, "Talk to an engineer" when nothing matches.
// Styles: src/styles/resources/modal.css

import { $, $$, escapeHtml as esc } from '../../../utils/dom.js';
import { local, session } from '../../../utils/storage.js';
import {
  TYPES, TOPICS, ENGINEER_LINK, toks, label, score, passFilters, highlight, parseItems, parsePillars, pad,
} from './matching.js';

const INDEX_URL = '/resource-search';
const CACHE_KEY = 'rl-index-v1';
const CACHE_MS = 30 * 60 * 1000;
const RECENT_KEY = 'rl-recent';

let modal;
let input;
let listEl;
let countEl;
let allLink;
let selTypes;
let selTopics;
let lastFocus;
let index = null;
let pillars = [];
let sel = -1;
let results = [];
let qtimer;
let uid = 0;

// ---- Index ---------------------------------------------------------------------
function markPillars() {
  const set = {};
  pillars.forEach((p) => { set[p.href] = 1; });
  index.forEach((it) => { it.pillar = !!set[it.href]; });
}

function loadIndex() {
  if (index) return Promise.resolve();
  const onPage = $('[data-rl-results="archive"],[data-rl-results="page"]');
  if (onPage) {
    index = parseItems(onPage);
    pillars = parsePillars(document);
    markPillars();
    return Promise.resolve();
  }
  const cached = session.getJSON(CACHE_KEY);
  if (cached && Date.now() - cached.t < CACHE_MS) {
    index = cached.items;
    pillars = cached.pillars;
    markPillars();
    return Promise.resolve();
  }
  return fetch(INDEX_URL, { credentials: 'same-origin' })
    .then((r) => r.text())
    .then((html) => {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      index = parseItems(doc).map((it) => {
        delete it.el;
        return it;
      });
      pillars = parsePillars(doc);
      markPillars();
      session.setJSON(CACHE_KEY, { t: Date.now(), items: index, pillars });
    })
    .catch(() => { index = []; });
}

// ---- Recent searches -------------------------------------------------------------
const recent = () => local.getJSON(RECENT_KEY, []);
function remember(q) {
  q = (q || '').trim();
  if (!q) return;
  const r = recent().filter((x) => x.toLowerCase() !== q.toLowerCase());
  r.unshift(q);
  local.setJSON(RECENT_KEY, r.slice(0, 5));
}

// ---- Rendering -------------------------------------------------------------------
function itemHtml(it, q) {
  uid++;
  const meta = esc([it.type, label(it.topic)].filter(Boolean).join(' · '));
  return `<a class="rl-modal_item" role="option" id="rl-opt-${uid}" href="${esc(it.href)}" data-accent="${esc(it.accent || 'Sky')}"><span class="rl-modal_item-text"><span class="rl-modal_item-title">${q ? highlight(it.title, q) : esc(it.title)}</span><span class="rl-modal_item-meta">${meta}</span></span><span class="rl-kbd rl-modal_item-hint">Enter</span><span class="rl-icon is-arrow-up" style="width:.75rem;height:.75rem"></span></a>`;
}

function select(i) {
  results.forEach((r, j) => {
    r.classList.toggle('is-selected', j === i);
    r.setAttribute('aria-selected', j === i ? 'true' : 'false');
  });
  sel = i;
  if (i > -1) {
    input.setAttribute('aria-activedescendant', results[i].id);
    results[i].scrollIntoView({ block: 'nearest' });
  } else {
    input.removeAttribute('aria-activedescendant');
  }
}

function collect() {
  results = $$('.rl-modal_item', listEl);
}

function renderStart() {
  const rec = recent();
  let html = '';
  if (rec.length) {
    html += `<div class="rl-modal_label">Recent searches</div><div class="rl-modal_recent">${rec.map((r) => `<button type="button" class="rl-modal_chip" data-q="${esc(r)}">${esc(r)}</button>`).join('')}</div>`;
  }
  if (pillars.length) {
    html += `<div class="rl-modal_label">Start here</div><div class="rl-modal_group">${pillars.slice(0, 10).map((pl) => {
      const it = (index || []).find((x) => x.href === pl.href);
      return itemHtml(it || { title: pl.title, href: pl.href, type: 'Pillar article', topic: pl.section, accent: 'Sky' }, '');
    }).join('')}</div>`;
  }
  if (!html) html = '<div class="rl-modal_empty">Type to search guides on planning, engineering, and building in Canada.</div>';
  listEl.innerHTML = html;
  collect();
  select(-1);
}

function run() {
  const q = input.value.trim();
  const qt = toks(q);
  const ty = selTypes.value ? [selTypes.value] : [];
  const tp = selTopics.value ? [selTopics.value] : [];

  const p = new URLSearchParams();
  if (q) p.set('q', q);
  if (ty.length) p.set('type', ty.join(','));
  if (tp.length) p.set('topic', tp.join(','));
  allLink.href = INDEX_URL + (p.toString() ? `?${p}` : '');

  if (!index) {
    listEl.innerHTML = '<div class="rl-modal_empty">Loading…</div>';
    return;
  }
  if (!qt.length && !ty.length && !tp.length) {
    results = [];
    countEl.textContent = '';
    renderStart();
    return;
  }

  const hits = index
    .map((it) => ({ it, s: passFilters(it, ty, tp) ? score(it, qt) : 0 }))
    .filter((h) => h.s > 0)
    .sort((a, b) => b.s - a.s);
  countEl.textContent = hits.length + (hits.length === 1 ? ' result' : ' results');
  allLink.textContent = `View all ${hits.length} results →`;

  if (!hits.length) {
    const sug = pillars.slice(0, 4)
      .map((pl) => itemHtml({ title: pl.title, href: pl.href, type: 'Start here', topic: pl.section, accent: 'Sky' }, ''))
      .join('');
    listEl.innerHTML = `<div class="rl-modal_empty">No articles match “${esc(q)}”. <a href="${ENGINEER_LINK}">Talk to an engineer →</a></div>`
      + (sug ? `<div class="rl-modal_label">Try a pillar article</div><div class="rl-modal_group">${sug}</div>` : '');
    collect();
    select(-1);
    return;
  }

  // Group by section, best group first; at most 4 per group and 8 in total
  const groups = {};
  const order = [];
  hits.forEach((h) => {
    const k = h.it.sectionSlug || h.it.section;
    if (!groups[k]) {
      groups[k] = { name: h.it.section, num: h.it.sectionNumber, accent: h.it.accent, items: [], best: h.s };
      order.push(groups[k]);
    }
    groups[k].items.push(h.it);
  });
  order.sort((a, b) => b.best - a.best);
  let shown = 0;
  let html = '';
  order.forEach((g) => {
    if (shown >= 8) return;
    const take = g.items.slice(0, Math.min(4, 8 - shown));
    shown += take.length;
    html += `<div class="rl-modal_group" data-accent="${esc(g.accent)}"><div class="rl-modal_group-head"><span class="rl-articles_group-badge">${pad(g.num)}</span><span class="rl-modal_group-name">${esc(g.name)}</span><span class="rl-modal_group-count">${g.items.length}</span></div>${take.map((it) => itemHtml(it, q)).join('')}</div>`;
  });
  listEl.innerHTML = html;
  collect();
  select(results.length ? 0 : -1);
}

// ---- Building / open / close ------------------------------------------------------
function build() {
  const opts = (list, lab) => `<option value="">${lab}: All</option>${list.map((o) => `<option value="${esc(o)}">${lab}: ${esc(o)}</option>`).join('')}`;
  modal = document.createElement('div');
  modal.className = 'rl-modal';
  modal.innerHTML = `<div class="rl-modal_overlay" data-rl-close></div>
<div class="rl-modal_panel" role="dialog" aria-modal="true" aria-label="Search the Resource Library">
  <div class="rl-modal_head"><span class="rl-modal_icon"></span><input class="rl-modal_input" type="text" role="combobox" aria-expanded="true" aria-controls="rl-modal-list" aria-autocomplete="list" placeholder="Search the Resource Library…" autocomplete="off" spellcheck="false"><button type="button" class="rl-kbd" data-rl-close aria-label="Close search">Esc</button></div>
  <div class="rl-modal_filters"><select class="rl-modal_select" data-f="type" aria-label="Filter by type">${opts(TYPES, 'Type')}</select><select class="rl-modal_select" data-f="topic" aria-label="Filter by topic">${opts(TOPICS, 'Topic')}</select><span class="rl-modal_count" aria-live="polite"></span></div>
  <div class="rl-modal_body" id="rl-modal-list" role="listbox" aria-label="Results"></div>
  <div class="rl-modal_foot"><div class="rl-modal_hints"><span class="rl-kbd">↑</span><span class="rl-kbd">↓</span><span>Navigate</span><span class="rl-kbd">Enter</span><span>Open</span><span class="rl-kbd">Esc</span><span>Close</span></div><a class="rl-modal_all" href="${INDEX_URL}">View all results →</a></div>
</div>`;
  document.body.appendChild(modal);
  input = $('.rl-modal_input', modal);
  listEl = $('.rl-modal_body', modal);
  countEl = $('.rl-modal_count', modal);
  allLink = $('.rl-modal_all', modal);
  selTypes = $('[data-f="type"]', modal);
  selTopics = $('[data-f="topic"]', modal);

  modal.addEventListener('click', (e) => {
    if (e.target.closest('[data-rl-close]')) {
      e.preventDefault();
      closeModal();
    }
    const chip = e.target.closest('.rl-modal_chip');
    if (chip) {
      input.value = chip.getAttribute('data-q');
      run();
      input.focus();
    }
    if (e.target.closest('.rl-modal_item')) remember(input.value);
  });
  input.addEventListener('input', () => {
    clearTimeout(qtimer);
    qtimer = setTimeout(run, 120);
  });
  [selTypes, selTopics].forEach((s) => s.addEventListener('change', run));
  modal.addEventListener('keydown', onKey);
  allLink.addEventListener('click', () => remember(input.value));
}

function onKey(e) {
  if (e.key === 'Escape') {
    e.preventDefault();
    closeModal();
    return;
  }
  if (e.key === 'ArrowDown' && results.length) {
    e.preventDefault();
    select((sel + 1) % results.length);
    return;
  }
  if (e.key === 'ArrowUp' && results.length) {
    e.preventDefault();
    select(sel <= 0 ? results.length - 1 : sel - 1);
    return;
  }
  if (e.key === 'Enter' && document.activeElement === input) {
    e.preventDefault();
    remember(input.value);
    location.href = sel > -1 ? results[sel].href : allLink.href;
    return;
  }
  if (e.key === 'Tab') {
    const f = $$('input,select,button,a[href]', modal).filter((x) => x.offsetParent !== null);
    const i = f.indexOf(document.activeElement);
    if (e.shiftKey && i <= 0) {
      e.preventDefault();
      f[f.length - 1].focus();
    } else if (!e.shiftKey && i === f.length - 1) {
      e.preventDefault();
      f[0].focus();
    }
  }
}

function openModal(prefill) {
  if (!modal) build();
  if (modal.classList.contains('is-open')) return;
  window.dispatchEvent(new CustomEvent('rl:search-open')); // closes the mobile drawer
  lastFocus = document.activeElement;
  modal.classList.add('is-open');
  document.documentElement.style.overflow = 'hidden';
  if (typeof prefill === 'string') input.value = prefill;
  requestAnimationFrame(() => {
    modal.classList.add('is-visible');
    input.focus();
    input.select();
  });
  run();
  loadIndex().then(run);
}

function closeModal() {
  if (!modal || !modal.classList.contains('is-open')) return;
  modal.classList.remove('is-visible');
  setTimeout(() => modal.classList.remove('is-open'), 200);
  document.documentElement.style.overflow = '';
  if (lastFocus && lastFocus.focus) lastFocus.focus();
}

export default function initSearchModal() {
  if (window.__rlModal) return;
  window.__rlModal = true;

  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-rl-search-open]')) {
      e.preventDefault();
      openModal();
    }
  });
  document.addEventListener('keydown', (e) => {
    const k = (e.key || '').toLowerCase();
    const inField = /^(input|textarea|select)$/i.test(e.target.tagName || '') || e.target.isContentEditable;
    if ((e.ctrlKey || e.metaKey) && k === 'k') {
      e.preventDefault();
      openModal();
      return;
    }
    if (k === '/' && !inField && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      openModal();
    }
  });

  // Mac shortcut label
  if (/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)) {
    $$('[data-rl-kbd]').forEach((k) => {
      if (/ctrl/i.test(k.textContent)) k.textContent = '⌘K';
    });
  }

  // Warm the index when the browser is idle, so the first search is instant
  const warm = () => loadIndex();
  if ('requestIdleCallback' in window) requestIdleCallback(warm, { timeout: 4000 });
  else setTimeout(warm, 2500);
}
