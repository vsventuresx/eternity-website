// Dot-matrix map of Canada with a pulsing Toronto hub and random arcs out to Canadian cities.
// Used by On Site Now and the footer. Arcs only run while the map is on screen and the tab is visible;
// with reduced motion the map is static.
// Hook: data-ee-map, on the placeholder in each map Code Embed: <div class="map_component" data-ee-map="true"></div>
// Styles: src/styles/components/canada-map.css

import { $$ } from '../utils/dom.js';
import { reduceMotion } from '../utils/motion.js';

// Dot rows: "row:startCol-endCol,..." on a 10.2px grid (Natural Earth outline, Lambert conic projection)
const ROWS = '0:52-54;1:50-54;2:49-54;3:48-54;4:47-54;5:46-46,48-54;6:46-54;7:45-53;8:46-52;9:39-39,42-42,47-48,50-53;10:42-44,46-53;11:34-35,38-38,43-45,47-47,49-52;12:32-35,49-52;13:49-52;14:35-36,38-38,45-45,48-52;15:34-36,38-38,42-43,46-47,49-49;16:29-31,37-39,42-43,47-47;17:15-15,28-32,35-36,39-39,42-43,45-45,47-52;18:14-16,27-33,45-45,47-52;19:13-16,27-31,49-50;20:12-19,27-29,31-33,39-39,45-46,54-54;21:11-21,23-23,27-28,30-34,36-38,42-43,45-47,49-49,52-52,54-55;22:10-23,31-38,42-43,45-46,49-53;23:9-24,30-38,41-43,45-45,48-53,55-57;24:8-26,31-38,42-43,45-45,48-60;25:7-27,30-31,33-38,42-43,45-45,48-63;26:6-28,30-38,44-46,49-63;27:5-29,31-39,44-46,49-63;28:4-30,32-40,44-46,52-54,58-64;29:3-29,37-39,42-43,45-46,52-53,58-67;30:3-30,35-36,39-39,42-43,45-47,52-54,61-70;31:3-33,35-37,45-49,52-54,58-59,62-70;32:4-38,42-43,45-49,51-54,58-59,62-66,68-70;33:3-49,51-54,62-65;34:3-54,62-67;35:6-53,62-69;36:6-51,61-70;37:6-52,59-70;38:6-50,52-53,59-60,64-68;39:6-50,52-55,65-69;40:6-49,52-57;41:5-47,53-53;42:5-47,60-65;43:6-46,55-55,58-58,60-68,74-74;44:6-45,58-58,61-68,74-75;45:5-45,61-69,74-77;46:0-1,4-44,61-69,73-78;47:0-0,4-44,62-71,73-79;48:0-0,4-43,62-79;49:4-43,61-86;50:3-43,62-88;51:4-45,63-89;52:4-45,64-90;53:3-45,64-89,91-91;54:3-46,64-89,91-91;55:1-50,64-88,90-91;56:2-2,4-51,63-87,90-92,95-96;57:2-3,5-53,63-87,91-98;58:3-3,5-57,61-87,91-99;59:3-3,5-57,62-86,91-96,98-99;60:3-4,6-58,63-83,91-96,98-98;61:4-4,6-58,63-81,84-85,91-93,96-96;62:8-59,64-79,91-91;63:10-59,64-79;64:13-60,64-78,81-83;65:15-78,80-83,90-90;66:18-77,79-83,90-91;67:21-77,79-84,88-88,90-91;68:24-85,89-91;69:28-76,78-78,81-90;70:33-76,81-89;71:42-77,82-84,86-88;72:45-77,83-83,86-87;73:50-50,53-77,85-87;74:55-77,86-86;75:57-75;76:58-72;77:59-71;78:61-70;79:61-70;80:62-68;81:62-66;82:62-66;83:62-65;84:61-63;85:61-62';

const HUB = [677.5, 826.9]; // Toronto
const CITIES = {
  Ottawa: [724.5, 776.6], Montreal: [755.2, 766.3], 'Quebec City': [780.3, 728.7], Halifax: [904.7, 728.6],
  Moncton: [874.8, 708.1], Charlottetown: [895.8, 694.7], "St. John's": [1013.1, 592.5], Winnipeg: [409.3, 708.6],
  Regina: [310.3, 682.7], Saskatoon: [291.4, 642.2], Calgary: [191.9, 636.1], Edmonton: [216.7, 589.1],
  Vancouver: [64.3, 620.2], Victoria: [52.6, 634.5], Kelowna: [114.8, 630.9], 'Thunder Bay': [518.5, 743.2],
  Sudbury: [641.9, 770.8], Whitehorse: [76.7, 342.2], Yellowknife: [270.6, 411.6], Iqaluit: [690.1, 383.7],
};
const NS = 'http://www.w3.org/2000/svg';
const STEP = 10.2;
const DOT_R = 2.1;
const MAX_LIVE = 3; // arcs in flight at once

const el = (name, attrs) => {
  const n = document.createElementNS(NS, name);
  Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v));
  return n;
};
const rand = (a, b) => a + Math.random() * (b - a);

function dotsPath() {
  let d = '';
  ROWS.split(';').forEach((row) => {
    const [r, runs] = row.split(':');
    const cy = +r * STEP + STEP / 2;
    runs.split(',').forEach((run) => {
      const [a, b] = run.split('-').map(Number);
      for (let c = a; c <= b; c++) {
        const cx = c * STEP + STEP / 2;
        d += `M${cx - DOT_R} ${cy}a${DOT_R} ${DOT_R} 0 1 0 ${2 * DOT_R} 0a${DOT_R} ${DOT_R} 0 1 0 ${-2 * DOT_R} 0`;
      }
    });
  });
  return d;
}

function buildMap(host, reduce) {
  if (host.querySelector('svg')) return;
  const svg = el('svg', { viewBox: '0 0 1014 880' });
  host.appendChild(svg);
  svg.appendChild(el('path', { class: 'map_dots', d: dotsPath() }));
  const arcs = el('g', {});
  svg.appendChild(arcs);
  [['map_hub-ring', 7], ['map_hub-ring is-delayed', 7], ['map_hub-core', 7]].forEach(([cls, r]) => {
    svg.appendChild(el('circle', { class: cls, cx: HUB[0], cy: HUB[1], r }));
  });
  if (reduce) return;

  const names = Object.keys(CITIES);
  let live = 0;
  let visible = false;
  let timer = null;

  function fire() {
    if (!visible || document.hidden) return;
    if (live < MAX_LIVE) launch(CITIES[names[Math.floor(Math.random() * names.length)]]);
    timer = setTimeout(fire, rand(900, 2200));
  }

  function launch(to) {
    // Curve the arc upwards (towards the north) from the hub
    const dx = to[0] - HUB[0];
    const dy = to[1] - HUB[1];
    const dist = Math.sqrt(dx * dx + dy * dy);
    let nx = -dy / dist;
    let ny = dx / dist;
    if (ny > 0) { nx = -nx; ny = -ny; }
    const lift = dist * rand(0.28, 0.42);
    const d = `M${HUB[0]} ${HUB[1]}Q${HUB[0] + dx / 2 + nx * lift} ${HUB[1] + dy / 2 + ny * lift} ${to[0]} ${to[1]}`;

    const trail = el('path', { class: 'map_arc-trail', d });
    const head = el('path', { class: 'map_arc', d });
    arcs.appendChild(trail);
    arcs.appendChild(head);
    const len = head.getTotalLength();
    const drawMs = 1100 + dist * 2.2;
    const tail = Math.min(len * 0.45, 260);
    const easing = 'cubic-bezier(.45,0,.25,1)';

    trail.style.strokeDasharray = len;
    trail.style.strokeDashoffset = len;
    trail.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration: drawMs, easing, fill: 'forwards' }).onfinish = () => {
      trail.animate([{ opacity: 1 }, { opacity: 1, offset: 0.35 }, { opacity: 0 }], { duration: 2400, fill: 'forwards' }).onfinish = () => trail.remove();
    };

    head.style.strokeDasharray = `${tail} ${len + tail}`;
    live++;
    head.animate([{ strokeDashoffset: tail, opacity: 0 }, { opacity: 1, offset: 0.12 }, { strokeDashoffset: -len, opacity: 1 }],
      { duration: drawMs, easing, fill: 'forwards' }).onfinish = () => {
      head.remove();
      live--;
      // Ping + city dot where the arc lands
      const ping = el('circle', { class: 'map_ping', cx: to[0], cy: to[1], r: 2 });
      const dot = el('circle', { class: 'map_city', cx: to[0], cy: to[1], r: 3 });
      arcs.appendChild(ping);
      arcs.appendChild(dot);
      ping.style.transformBox = 'fill-box';
      ping.style.transformOrigin = 'center';
      ping.animate([{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(8)', opacity: 0 }],
        { duration: 1400, easing: 'cubic-bezier(.22,1,.36,1)' }).onfinish = () => ping.remove();
      dot.animate([{ opacity: 1 }, { opacity: 1, offset: 0.4 }, { opacity: 0 }], { duration: 2600 }).onfinish = () => dot.remove();
    };
  }

  new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    clearTimeout(timer);
    if (visible) fire();
  }).observe(host);
  document.addEventListener('visibilitychange', () => {
    clearTimeout(timer);
    if (!document.hidden && visible) fire();
  });
}

export default function initCanadaMaps() {
  const reduce = reduceMotion();
  $$('[data-ee-map]').forEach((host) => buildMap(host, reduce));
}
