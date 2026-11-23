// Drawing primitives for the LCD: every function returns SVG markup in the
// card's 200x246 coordinate space. Digits are ordinary (non-segmented) text.

export const LCD = {
  white: "#f3f7fb",
  blue: "#5aa7ff",
  cyan: "#4fdcf0",
  violet: "#b48cff",
  orange: "#ffb04a",
  red: "#ff6b6b",
  green: "#5ee08a",
  amber: "#ffc24a",
  grey: "#8497b0",
  lilac: "#c9a6ff",
  dim: "#26334a", // an icon that is switched off
};

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");

// Text. `kind`: "label" (monospace, words) or "num" (proportional-free tabular digits).
export function text(x, y, s, size, color, { anchor = "start", weight = 700, kind = "label", id = "" } = {}) {
  return `<text${id ? ` id="${id}"` : ""} class="lcd-${kind}" x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${color}" text-anchor="${anchor}">${esc(s)}</text>`;
}

// Rough advance width of a run of digits / colons, used to lay out chips.
export function numWidth(s, size) {
  return [...String(s)].reduce((w, ch) => w + (ch === ":" ? size * 0.32 : size * 0.58), 0);
}

// "1:54" from minutes; the colon is its own tspan so it can blink.
export function formatMinutes(min) {
  const m = Math.max(0, Math.round(min));
  return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}`;
}

// The colon of a clock is drawn lower than the middle of the digits by text fonts. It gets
// lifted onto their centre line (and the following digits dropped back).
export const COLON_LIFT = "0.095em";
export function timeMarkup(min, color, blink) {
  const [h, mm] = formatMinutes(min).split(":");
  return `<tspan>${h}</tspan><tspan class="lcd-colon${blink ? " blink" : ""}" dy="-${COLON_LIFT}">:</tspan><tspan dy="${COLON_LIFT}">${mm}</tspan>`;
}

// A clock-like string such as "20:55" as digits, with the colon on the digits' centre line.
export function clockText(x, y, s, size, color, { anchor = "start", weight = 600 } = {}) {
  const parts = String(s).split(":");
  const body = parts.map((p, i) => (i === 0 ? `<tspan>${esc(p)}</tspan>` : `<tspan dy="-${COLON_LIFT}">:</tspan><tspan dy="${COLON_LIFT}">${esc(p)}</tspan>`)).join("");
  return `<text class="lcd-num" x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${color}" text-anchor="${anchor}">${body}</text>`;
}

// Scale an icon about its own origin point.
export function scaled(svg, x, y, k) {
  return `<g transform="translate(${x} ${y}) scale(${k}) translate(${-x} ${-y})">${svg}</g>`;
}

// Wrap an icon with a transparent hit area and a <title> tooltip.
export function withTip(inner, tip, box) {
  return `<g>${inner}<rect class="hit" x="${box[0]}" y="${box[1]}" width="${box[2]}" height="${box[3]}"/><title>${esc(tip)}</title></g>`;
}


const TILE = 7.2, INNER = 4.0, SW = 0.5;
const wifiColor = (bars) => ({ 3: LCD.green, 2: LCD.amber, 1: LCD.red }[bars] || LCD.dim);
function iconTile(w, h, draw, color, on, tip, cx, cy) {
  const s = Math.min(INNER / w, INNER / h);
  const frame = `<rect x="${cx - TILE / 2}" y="${cy - TILE / 2}" width="${TILE}" height="${TILE}" rx="1.9" fill="${on ? color : "none"}" fill-opacity="${on ? 0.14 : 0}" stroke="${on ? color : LCD.dim}" stroke-opacity="${on ? 0.85 : 1}" stroke-width="${SW}"/>`;
  return withTip(frame + `<g transform="translate(${cx} ${cy}) scale(${s.toFixed(4)})">${draw(SW / s, s)}</g>`, tip, [cx - 4.6, cy - 4.6, 9.2, 9.2]);
}
const f2 = (n) => n.toFixed(2);

// Wi-Fi: a dot and three arcs with the SAME clear gap between neighbours (dot to arc 1, arc 1 to arc 2, ...)
export function wifi(cx, cy, bars, tip) {
  const col = wifiColor(bars), A = (50 * Math.PI) / 180, GAP = 1.5, RD = 1.1;
  const geo = (sw) => {
    const r1 = RD + GAP + sw / 2, r2 = r1 + GAP + sw, r3 = r2 + GAP + sw;
    const W = 2 * r3 * Math.sin(A) + sw, H = r3 + sw / 2 + RD;
    return { R: [r1, r2, r3], W, H, cyDot: r3 + sw / 2 - H / 2 };
  };
  let g = geo(0.96);
  for (let i = 0; i < 3; i++) g = geo(SW / Math.min(INNER / g.W, INNER / g.H)); // line width depends on the fit, which depends on the line width
  return iconTile(g.W, g.H, (sw) => {
    let o = "";
    g.R.forEach((r, i) => {
      const dx = r * Math.sin(A), dy = r * Math.cos(A);
      o += `<path d="M ${f2(-dx)} ${f2(g.cyDot - dy)} A ${f2(r)} ${f2(r)} 0 0 1 ${f2(dx)} ${f2(g.cyDot - dy)}" fill="none" stroke="${i < bars ? col : LCD.dim}" stroke-width="${f2(sw)}" stroke-linecap="round"/>`;
    });
    o += `<circle cx="0" cy="${f2(g.cyDot)}" r="${RD}" fill="${bars ? col : LCD.dim}"/>`;
    if (!bars) o += `<line x1="${f2(-g.W / 2)}" y1="${f2(g.H / 2)}" x2="${f2(g.W / 2)}" y2="${f2(-g.H / 2)}" stroke="${LCD.red}" stroke-width="${f2(sw)}" stroke-linecap="round"/>`;
    return o;
  }, col, bars > 0, tip, cx, cy);
}

export function bell(cx, cy, on, tip) {
  const c = on ? LCD.amber : LCD.dim, y = -0.65;
  const body = `M -3 ${y + 1.9} H 3 M -2.3 ${y + 1.9} C -2.3 ${y + 0.6} -2.1 ${y - 0.4} -1.7 ${y - 1.1} C -1.2 ${y - 2.1} -0.6 ${y - 2.6} 0 ${y - 2.6} C 0.6 ${y - 2.6} 1.2 ${y - 2.1} 1.7 ${y - 1.1} C 2.1 ${y - 0.4} 2.3 ${y + 0.6} 2.3 ${y + 1.9} M -0.9 ${y + 3.1} Q 0 ${y + 3.9} 0.9 ${y + 3.1}`;
  return iconTile(6, 6.5, (sw) => `<path d="${body}" fill="none" stroke="${c}" stroke-width="${f2(sw)}" stroke-linecap="round" stroke-linejoin="round"/>`, LCD.amber, on, tip, cx, cy);
}

export function smartGrid(cx, cy, on, tip) {
  const c = on ? LCD.green : LCD.dim;
  return iconTile(5, 7.6, (sw) => `<path d="M 1 -3.8 L -2.5 0.5 L -0.2 0.5 L -1 3.8 L 2.5 -0.6 L 0.2 -0.6 Z" fill="none" stroke="${c}" stroke-width="${f2(sw)}" stroke-linejoin="round"/>`, LCD.green, on, tip, cx, cy);
}

export function phone(cx, cy, on, tip) {
  const c = on ? LCD.blue : LCD.dim;
  return iconTile(3.8, 6.8, (sw) => `<rect x="-1.9" y="-3.4" width="3.8" height="6.8" rx="1" fill="none" stroke="${c}" stroke-width="${f2(sw)}"/><line x1="-0.6" y1="2" x2="0.6" y2="2" stroke="${c}" stroke-width="${f2(sw)}" stroke-linecap="round"/>`, LCD.blue, on, tip, cx, cy);
}

// Status glyph: play, pause, clock (waiting), check (finished)
export function statusTile(kind, cx, cy, color, tip) {
  const G = {
    play: [4.4, 5.2, (sw) => `<polygon points="-2.2,-2.6 -2.2,2.6 2.2,0" fill="${color}" stroke="${color}" stroke-width="${f2(sw)}" stroke-linejoin="round"/>`],
    pause: [4.3, 5.2, () => `<rect x="-2.15" y="-2.6" width="1.6" height="5.2" rx=".4" fill="${color}"/><rect x="0.55" y="-2.6" width="1.6" height="5.2" rx=".4" fill="${color}"/>`],
    wait: [4.8, 4.8, (sw) => `<circle cx="0" cy="0" r="2.4" fill="none" stroke="${color}" stroke-width="${f2(sw)}"/><path d="M 0 -1.3 V 0.1 L 1.1 0.9" fill="none" stroke="${color}" stroke-width="${f2(sw)}" stroke-linecap="round" stroke-linejoin="round"/>`],
    done: [4.4, 3.6, (sw) => `<path d="M -2.2 0.2 L -0.6 1.8 L 2.2 -1.8" fill="none" stroke="${color}" stroke-width="${f2(sw)}" stroke-linecap="round" stroke-linejoin="round"/>`],
  }[kind];
  return iconTile(G[0], G[1], G[2], color, true, tip, cx, cy);
}

// A TwinDos bottle as a tile: a drop with the bottle number inside (shown when the bottle is low or empty).
export function dropTile(n, cx, cy, color, tip) {
  return iconTile(5.6, 7.6, (sw) => `<path d="M 0 -3.8 C 0.7 -2.3 2.8 -0.7 2.8 0.8 A 2.8 2.8 0 1 1 -2.8 0.8 C -2.8 -0.7 -0.7 -2.3 0 -3.8 Z" fill="none" stroke="${color}" stroke-width="${f2(sw)}" stroke-linejoin="round"/><text x="0" y="2.4" font-family="Consolas,monospace" font-size="5.4" font-weight="700" fill="${color}" text-anchor="middle">${n}</text>`, color, true, tip, cx, cy);
}

// The drop used in the bottom row: 4.4 wide, 5.9 tall (like the other icons of the row), top-left at (x, y), the bottle number inside.
export function dropIcon(x, y, color, n) {
  const cx = x + 2.2;
  return `<path d="M ${cx} ${y} C ${cx + 0.6} ${y + 1.2} ${cx + 2.2} ${y + 2.5} ${cx + 2.2} ${y + 3.7} A 2.2 2.2 0 1 1 ${cx - 2.2} ${y + 3.7} C ${cx - 2.2} ${y + 2.5} ${cx - 0.6} ${y + 1.2} ${cx} ${y} Z" fill="${color}" fill-opacity=".18" stroke="${color}" stroke-width=".5" stroke-linejoin="round"/><text x="${cx}" y="${y + 4.85}" font-family="Consolas,monospace" font-size="3.3" font-weight="700" fill="${color}" text-anchor="middle">${n}</text>`;
}

// A thin vertical bar between two groups of the bottom row.
export function divider(x, y) {
  return `<line x1="${x}" y1="${y - 6.8}" x2="${x}" y2="${y + 0.8}" stroke="#2b3a52" stroke-width=".5"/>`;
}

export function warn(x, y, tip) {
  const o = `<path d="M ${x} ${y - 4} L ${x + 3.6} ${y + 2.2} L ${x - 3.6} ${y + 2.2} Z" fill="none" stroke="${LCD.red}" stroke-width=".6" stroke-linejoin="round"/><line x1="${x}" y1="${y - 2}" x2="${x}" y2="${y}" stroke="${LCD.red}" stroke-width=".6"/><circle cx="${x}" cy="${y + 1.1}" r=".5" fill="${LCD.red}"/>`;
  return withTip(o, tip, [x - 4.5, y - 4.5, 9, 8]);
}

// A circular arrow: a 290° clockwise arc whose arrowhead sits on the arc's end,
// pointing along its tangent (so it always lines up, whatever the size).
export function spinIcon(x, y, color = LCD.violet) {
  const r = 2.6, cx = x + r, cy = y + r;
  const pt = (deg) => {
    const a = (deg * Math.PI) / 180;
    return [cx + r * Math.sin(a), cy - r * Math.cos(a)];
  };
  const [sx, sy] = pt(35), [ex, ey] = pt(325);
  const a = (325 * Math.PI) / 180;
  const tx = Math.cos(a), ty = Math.sin(a); // clockwise tangent at the end
  const nx = -ty, ny = tx; // normal
  const f = (n) => n.toFixed(2);
  const head = `${f(ex + tx * 1.7)},${f(ey + ty * 1.7)} ${f(ex + nx * 1.25)},${f(ey + ny * 1.25)} ${f(ex - nx * 1.25)},${f(ey - ny * 1.25)}`;
  return `<path d="M ${f(sx)} ${f(sy)} A ${r} ${r} 0 1 1 ${f(ex)} ${f(ey)}" fill="none" stroke="${color}" stroke-width=".55" stroke-linecap="round"/><polygon points="${head}" fill="${color}"/>`;
}

export function thermometer(x, y, color = LCD.orange) {
  return `<rect x="${x + 1.4}" y="${y - 0.2}" width="1.3" height="4.4" rx="0.65" fill="none" stroke="${color}" stroke-width=".6"/><circle cx="${x + 2.05}" cy="${y + 5}" r="1.5" fill="${color}"/>`;
}

export function stopwatch(x, y) {
  const cx = x + 2, cy = y + 3;
  return `<circle cx="${cx}" cy="${cy}" r="1.9" fill="none" stroke="${LCD.grey}" stroke-width=".5"/><line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy - 1.3}" stroke="${LCD.grey}" stroke-width=".5" stroke-linecap="round"/><line x1="${cx - 0.7}" y1="${cy - 2.9}" x2="${cx + 0.7}" y2="${cy - 2.9}" stroke="${LCD.grey}" stroke-width=".5" stroke-linecap="round"/>`;
}

export function flag(x, y) {
  return `<line x1="${x + 0.8}" y1="${y}" x2="${x + 0.8}" y2="${y + 5.4}" stroke="${LCD.green}" stroke-width=".5" stroke-linecap="round"/><polygon points="${x + 0.8},${y + 0.2} ${x + 4.6},${y + 1.5} ${x + 0.8},${y + 2.9}" fill="${LCD.green}"/>`;
}


// Colour of a spin speed / temperature chip by its value, interpolated between stops.
const STOPS = {
  temp: [[20, "#5aa7ff"], [30, "#4fdcf0"], [40, "#5ee08a"], [60, "#ffb04a"], [90, "#ff6b6b"]],
  spin: [[400, "#5aa7ff"], [800, "#8c8cff"], [1000, "#b48cff"], [1200, "#e08cff"], [1600, "#ff7ac8"]],
};
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
export function valueColor(kind, v) {
  const st = STOPS[kind];
  if (!st || !Number.isFinite(v)) return LCD.white;
  if (v <= st[0][0]) return st[0][1];
  for (let i = 1; i < st.length; i++) {
    if (v <= st[i][0]) {
      const [v0, c0] = st[i - 1], [v1, c1] = st[i], k = (v - v0) / (v1 - v0);
      const a = hex(c0), b = hex(c1);
      return "#" + a.map((x, j) => Math.round(x + (b[j] - x) * k).toString(16).padStart(2, "0")).join("");
    }
  }
  return st[st.length - 1][1];
}
