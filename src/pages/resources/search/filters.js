// On-page search, Type/Topic filters, grouping and grid/list view for the archive, section and results pages.
// [data-rl-results="archive" | "section" | "page"] holds a hidden source list ([data-rl-source]) of article rows;
// rows are regrouped into [data-rl-results-groups] by section (or by sub-group on a section page).
// Archive: the section cards show until a filter is active, then the results replace them.
// Section page: 4 rows per group with "View all n". State is kept in ?q=&type=&topic=.
// Other hooks: [data-rl-page-body] (view mode), [data-rl-tag] (row tags), [data-rl-dropdown] > [data-rl-dropdown-value].
// The menu, groups and buttons it builds have their own rl-menu_* / rl-articles_* classes (created here).
// Styles: src/styles/resources/filters.css

import { $, $$, escapeHtml as esc } from '../../../utils/dom.js';
import { session } from '../../../utils/storage.js';
import { currentSectionSlug } from '../sidebar.js';
import {
  TYPES, TOPICS, toks, same, label, score, passFilters, parseItems, pad, readParams, writeParams,
} from './matching.js';

// ---- Multi-select dropdown (Type / Topic) ---------------------------------------
function buildMenu(dd, options, get, set) {
  let menu = null;

  function close() {
    if (!menu) return;
    menu.remove();
    menu = null;
    dd.setAttribute('aria-expanded', 'false');
    document.removeEventListener('click', outside, true);
  }
  function outside(e) {
    if (!dd.contains(e.target)) close();
  }
  function render() {
    const sel = get();
    menu.innerHTML = options.map((o) => {
      const on = sel.some((s) => same(s, o));
      return `<button type="button" class="rl-menu_option" role="menuitemcheckbox" aria-checked="${on}" data-v="${esc(o)}"><span class="rl-menu_box"></span>${esc(o)}</button>`;
    }).join('') + `<div class="rl-menu_foot"><button type="button" class="rl-menu_clear">Clear</button><span class="rl-menu_count">${sel.length ? `${sel.length} selected` : 'All'}</span></div>`;
  }
  function open() {
    menu = document.createElement('div');
    menu.className = 'rl-menu';
    menu.setAttribute('role', 'menu');
    dd.appendChild(menu);
    render();
    dd.setAttribute('aria-expanded', 'true');
    setTimeout(() => document.addEventListener('click', outside, true), 0);
    const first = menu.querySelector('.rl-menu_option');
    if (first) first.focus();

    menu.addEventListener('click', (e) => {
      e.stopPropagation();
      const b = e.target.closest('.rl-menu_option');
      if (b) {
        const v = b.getAttribute('data-v');
        const sel = get().slice();
        const i = sel.findIndex((s) => same(s, v));
        if (i > -1) sel.splice(i, 1);
        else sel.push(v);
        set(sel);
        render();
        const nb = menu.querySelector(`[data-v="${v}"]`);
        if (nb) nb.focus();
        return;
      }
      if (e.target.closest('.rl-menu_clear')) {
        set([]);
        render();
      }
    });
    menu.addEventListener('keydown', (e) => {
      const all = Array.from(menu.querySelectorAll('button'));
      const i = all.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        all[(i + 1) % all.length].focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        all[(i - 1 + all.length) % all.length].focus();
      } else if (e.key === 'Escape') {
        e.stopPropagation();
        close();
        dd.focus();
      } else if (e.key === 'Tab') {
        close();
      }
    });
  }

  dd.addEventListener('click', (e) => {
    if (menu && menu.contains(e.target)) return;
    if (menu) close();
    else open();
  });
  dd.addEventListener('keydown', (e) => {
    if (menu && menu.contains(e.target)) return;
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
      e.preventDefault();
      if (!menu) open();
    }
  });
}

// ---- Page ----------------------------------------------------------------------
export default function initFilters() {
  const res = $('[data-rl-results]');
  if (!res || res.dataset.rlReady) return;
  res.dataset.rlReady = '1';

  const mode = res.getAttribute('data-rl-results'); // archive | section | page
  const body = res.closest('[data-rl-page-body]') || document.body;
  const source = $('[data-rl-source]', res) || res;
  let items = parseItems(source);

  // Section page: keep only this section's articles and pillar cards
  // (safety net; the Designer lists should also be filtered to the current section)
  if (mode === 'section') {
    const cur = currentSectionSlug();
    if (cur) {
      items = items.filter((it) => {
        const keep = it.sectionSlug === cur;
        if (!keep && it.el && it.el.parentNode) it.el.parentNode.removeChild(it.el);
        return keep;
      });
      $$('[data-rl-pillar-card]').forEach((c) => {
        if (c.getAttribute('data-section-slug') !== cur) {
          const item = c.closest('.w-dyn-item') || c;
          item.parentNode.removeChild(item);
        }
      });
    }
  }

  const groupsEl = $('[data-rl-results-groups]', res);
  const metaEl = $('[data-rl-results-meta]', res) || $('[data-rl-results-meta]');
  const emptyEl = $('[data-rl-empty]', res);
  const sectionsEl = $('[data-rl-sections]');
  const titleEl = $('[data-rl-query-title]');
  const input = $('[data-rl-input]');
  const st = readParams();
  if (input) input.value = st.q;

  $$('[data-rl-tag]').forEach((t) => { if (same(t.textContent, 'Homeowners')) t.textContent = 'Homeowners'; });

  // Build groups: by section (archive, results) or by sub-group (section page)
  const bySection = mode !== 'section';
  const groups = {};
  const order = [];
  items.forEach((it) => {
    const key = bySection ? it.sectionSlug || it.section || 'other' : it.group || 'Articles';
    if (!groups[key]) {
      groups[key] = {
        name: bySection ? it.section || 'Other' : it.group || 'Articles',
        num: it.sectionNumber,
        ord: bySection ? it.sectionNumber : it.groupOrder,
        accent: it.accent,
        slug: it.sectionSlug,
        items: [],
        expanded: false,
      };
      order.push(groups[key]);
    }
    groups[key].items.push(it);
  });
  order.sort((a, b) => a.ord - b.ord || a.name.localeCompare(b.name));

  order.forEach((g) => {
    const wrap = document.createElement('div');
    wrap.className = 'rl-articles_group';
    wrap.setAttribute('data-accent', g.accent);
    const heading = bySection
      ? `<a class="rl-articles_group-heading" href="/resource-section/${esc(g.slug)}"><span class="rl-articles_group-badge">${pad(g.num)}</span><span>${esc(g.name)}</span></a>`
      : `<h2 class="rl-articles_group-heading">${esc(g.name)}</h2>`;
    wrap.innerHTML = `<div class="rl-articles_group-header">${heading}<div class="rl-articles_group-count"></div></div><div class="rl-articles_group-list"></div>`;
    const list = wrap.querySelector('.rl-articles_group-list');
    g.items.forEach((it) => list.appendChild(it.el));
    if (mode === 'section') {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'rl-articles_view-all';
      btn.addEventListener('click', () => {
        g.expanded = true;
        apply();
      });
      wrap.appendChild(btn);
      g.btn = btn;
    }
    g.el = wrap;
    g.countEl = wrap.querySelector('.rl-articles_group-count');
    if (groupsEl) groupsEl.appendChild(wrap);
  });

  // Dropdowns
  const dropdowns = {};
  $$('[data-rl-dropdown]').forEach((dd) => {
    const kind = dd.getAttribute('data-rl-dropdown');
    dropdowns[kind] = dd;
    buildMenu(dd, kind === 'type' ? TYPES : TOPICS,
      () => (kind === 'type' ? st.types : st.topics),
      (v) => {
        if (kind === 'type') st.types = v;
        else st.topics = v;
        apply(true);
      });
  });
  function setDropdownValue(kind, vals) {
    const dd = dropdowns[kind];
    const el = dd && $('[data-rl-dropdown-value]', dd);
    if (el) el.textContent = !vals.length ? 'All' : label(vals[0]) + (vals.length > 1 ? ` +${vals.length - 1}` : '');
  }

  // Search box (debounced)
  if (input) {
    let t;
    input.addEventListener('input', () => {
      clearTimeout(t);
      t = setTimeout(() => {
        st.q = input.value.trim();
        apply(true);
      }, 120);
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && input.value) {
        input.value = '';
        st.q = '';
        apply(true);
      }
    });
  }

  // Grid / list toggle (remembered for the session, per page type)
  const viewKey = `rl-view-${mode}`;
  function setView(v) {
    body.classList.toggle('is-list-view', mode === 'archive' && v === 'list');
    body.classList.toggle('is-grid-view', mode !== 'archive' && v === 'grid');
    $$('[data-rl-view]').forEach((b) => {
      const on = b.getAttribute('data-rl-view') === v;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    session.set(viewKey, v);
  }
  $$('[data-rl-view]').forEach((b) => b.addEventListener('click', (e) => {
    e.preventDefault();
    setView(b.getAttribute('data-rl-view'));
  }));
  setView(session.get(viewKey, mode === 'archive' ? 'grid' : 'list'));

  // Apply search + filters to every group
  function apply(push) {
    const qt = toks(st.q);
    const active = !!(qt.length || st.types.length || st.topics.length);
    let total = 0;
    let sections = 0;
    order.forEach((g) => {
      let visible = 0;
      g.items.forEach((it) => {
        const ok = passFilters(it, st.types, st.topics) && score(it, qt) > 0;
        it.el.hidden = !ok;
        it.el.classList.remove('is-collapsed');
        if (ok) visible++;
      });
      const collapse = mode === 'section' && !active && !g.expanded && visible > 4;
      if (collapse) {
        let n = 0;
        g.items.forEach((it) => {
          if (!it.el.hidden && ++n > 4) it.el.classList.add('is-collapsed');
        });
      }
      if (g.btn) {
        g.btn.hidden = !collapse;
        g.btn.textContent = `View all ${visible} in ${g.name}  →`;
      }
      g.el.hidden = !visible;
      g.countEl.textContent = visible + (active ? (visible === 1 ? ' result' : ' results') : (visible === 1 ? ' article' : ' articles'));
      total += visible;
      if (visible) sections++;
    });
    if (metaEl) {
      metaEl.textContent = mode === 'section' ? ''
        : `${total}${total === 1 ? ' article' : ' articles'} across ${sections}${sections === 1 ? ' section' : ' sections'}`;
    }
    if (emptyEl) emptyEl.style.display = !total && (active || mode !== 'archive') ? 'flex' : 'none';
    if (mode === 'archive') {
      if (sectionsEl) sectionsEl.style.display = active ? 'none' : '';
      res.style.display = active ? '' : 'none';
    }
    if (titleEl) titleEl.textContent = st.q ? `Results for “${st.q}”` : 'All articles';
    setDropdownValue('type', st.types);
    setDropdownValue('topic', st.topics);
    if (push) writeParams(st);
  }
  apply(false);
}
