// Drawing primitives for the LCD: every function returns SVG markup in the
// card's 200x300 coordinate space. Digits are ordinary (non-segmented) text.

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

export function timeMarkup(min, color, blink) {
  const [h, mm] = formatMinutes(min).split(":");
  return `<tspan>${h}</tspan><tspan class="lcd-colon${blink ? " blink" : ""}">:</tspan><tspan>${mm}</tspan>`;
}

// Scale an icon about its own origin point.
export function scaled(svg, x, y, k) {
  return `<g transform="translate(${x} ${y}) scale(${k}) translate(${-x} ${-y})">${svg}</g>`;
}

// Wrap an icon with a transparent hit area and a <title> tooltip.
export function withTip(inner, tip, box) {
  return `<g>${inner}<rect class="hit" x="${box[0]}" y="${box[1]}" width="${box[2]}" height="${box[3]}"/><title>${esc(tip)}</title></g>`;
}

export function wifi(cx, by, bars, tip) {
  const col = { 3: LCD.green, 2: LCD.amber, 1: LCD.red }[bars] || LCD.dim;
  const a = (45 * Math.PI) / 180;
  let o = "";
  [2.0, 3.7, 5.3].forEach((r, i) => {
    const dx = r * Math.sin(a), y = by - r * Math.cos(a);
    o += `<path d="M ${(cx - dx).toFixed(2)} ${y.toFixed(2)} A ${r} ${r} 0 0 1 ${(cx + dx).toFixed(2)} ${y.toFixed(2)}" fill="none" stroke="${i < bars ? col : LCD.dim}" stroke-width="1.05" stroke-linecap="round"/>`;
  });
  o += `<circle cx="${cx}" cy="${by}" r="0.95" fill="${bars ? col : LCD.dim}"/>`;
  if (!bars) o += `<line x1="${cx - 4}" y1="${by + 1.2}" x2="${cx + 4}" y2="${by - 6.8}" stroke="${LCD.red}" stroke-width="1" stroke-linecap="round"/>`;
  return withTip(o, tip, [cx - 6.5, by - 7, 13, 10]);
}

export function bell(x, y, on, tip) {
  const c = on ? LCD.amber : LCD.dim;
  const o = `<path d="M ${x - 2} ${y + 1.2} Q ${x - 2} ${y - 2} ${x} ${y - 2.2} Q ${x + 2} ${y - 2} ${x + 2} ${y + 1.2} L ${x + 2.7} ${y + 1.9} L ${x - 2.7} ${y + 1.9} Z" fill="${c}"/><circle cx="${x}" cy="${y + 3}" r=".65" fill="${c}"/>`;
  return withTip(o, tip, [x - 4, y - 3, 8, 8]);
}

export function smartGrid(x, y, on, tip) {
  return withTip(text(x, y, "SG", 3.3, on ? LCD.green : LCD.dim, { anchor: "middle", weight: 800 }), tip, [x - 4.5, y - 4, 9, 6]);
}

export function phone(x, y, on, tip) {
  const c = on ? LCD.blue : LCD.dim;
  const o = `<rect x="${x - 1.6}" y="${y}" width="3.2" height="5" rx=".7" fill="none" stroke="${c}" stroke-width=".7"/><circle cx="${x}" cy="${y + 3.8}" r=".35" fill="${c}"/>`;
  return withTip(o, tip, [x - 3.5, y - 1, 7, 7]);
}

export function warn(x, y, tip) {
  const o = `<path d="M ${x} ${y - 4} L ${x + 3.6} ${y + 2.2} L ${x - 3.6} ${y + 2.2} Z" fill="none" stroke="${LCD.red}" stroke-width="1" stroke-linejoin="round"/><line x1="${x}" y1="${y - 2}" x2="${x}" y2="${y}" stroke="${LCD.red}" stroke-width=".9"/><circle cx="${x}" cy="${y + 1.1}" r=".5" fill="${LCD.red}"/>`;
  return withTip(o, tip, [x - 4.5, y - 4.5, 9, 8]);
}

export function spinIcon(x, y) {
  return `<path d="M ${x + 3.2} ${y + 0.9} A 2.6 2.6 0 1 0 ${x + 3.6} ${y + 3.2}" fill="none" stroke="${LCD.violet}" stroke-width="0.95" stroke-linecap="round"/><path d="M ${x + 3.9} ${y - 0.6} L ${x + 3.3} ${y + 1.3} L ${x + 5.2} ${y + 1.4} Z" fill="${LCD.violet}"/>`;
}

export function thermometer(x, y) {
  return `<rect x="${x + 1.4}" y="${y - 0.2}" width="1.3" height="4.4" rx="0.65" fill="none" stroke="${LCD.orange}" stroke-width="0.7"/><circle cx="${x + 2.05}" cy="${y + 5}" r="1.5" fill="${LCD.orange}"/>`;
}

export function stopwatch(x, y) {
  const cx = x + 2, cy = y + 3;
  return `<circle cx="${cx}" cy="${cy}" r="1.9" fill="none" stroke="${LCD.grey}" stroke-width=".6"/><line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy - 1.3}" stroke="${LCD.grey}" stroke-width=".6" stroke-linecap="round"/><line x1="${cx - 0.7}" y1="${cy - 2.9}" x2="${cx + 0.7}" y2="${cy - 2.9}" stroke="${LCD.grey}" stroke-width=".7" stroke-linecap="round"/>`;
}

export function flag(x, y) {
  return `<line x1="${x + 0.8}" y1="${y}" x2="${x + 0.8}" y2="${y + 5.4}" stroke="${LCD.green}" stroke-width=".6" stroke-linecap="round"/><polygon points="${x + 0.8},${y + 0.2} ${x + 4.6},${y + 1.5} ${x + 0.8},${y + 2.9}" fill="${LCD.green}"/>`;
}

// Small outlined tag, e.g. the program type. The text is centred in the pill.
export function pill(x, baselineY, s, color, size = 2.9) {
  const w = s.length * size * 0.6 + 3.6, h = size * 1.65, cy = baselineY - size * 0.38;
  return {
    width: w,
    svg:
      `<rect x="${x}" y="${(cy - h / 2).toFixed(2)}" width="${w.toFixed(2)}" height="${h}" rx="${h / 2}" fill="none" stroke="${color}" stroke-width=".65"/>` +
      text(+(x + w / 2).toFixed(2), +(cy + size * 0.35).toFixed(2), s, size, color, { anchor: "middle" }),
  };
}
