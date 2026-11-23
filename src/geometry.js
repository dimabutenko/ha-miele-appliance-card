// Layout geometry (viewBox 0 0 200 300) and the static SVG paths derived from it.

export const BODY_X = 2, BODY_Y = 2, BODY_W = 196, BODY_H = 296;
export const BODY_RX = 6;
export const BAR_H = 34; // dark control strip, flush with the top of the body
export const DOOR_CX = 100, DOOR_CY = 155;
export const DOOR_R = 82; // metal rim
export const RING_R = 90; // progress gauge, outside the rim
export const SWEEP_DEG = 300;
export const START_CLOCK_DEG = 210; // 7 o'clock

export function clockPoint(cx, cy, r, deg) {
  const rad = (deg * Math.PI) / 180;
  return [cx + r * Math.sin(rad), cy - r * Math.cos(rad)];
}

const [RING_X0, RING_Y0] = clockPoint(DOOR_CX, DOOR_CY, RING_R, START_CLOCK_DEG);
const [RING_X1, RING_Y1] = clockPoint(DOOR_CX, DOOR_CY, RING_R, START_CLOCK_DEG + SWEEP_DEG);
export const RING_ARC_LEN = RING_R * ((SWEEP_DEG * Math.PI) / 180);
export const RING_D = `M ${RING_X0.toFixed(2)} ${RING_Y0.toFixed(2)} A ${RING_R} ${RING_R} 0 1 1 ${RING_X1.toFixed(2)} ${RING_Y1.toFixed(2)}`;

// The control bar: only its top two corners are rounded (to match the body's own
// top corners); its bottom edge is a plain straight cut, like the real panel.
export const BAR_D = `M ${BODY_X + BODY_RX} ${BODY_Y} L ${BODY_X + BODY_W - BODY_RX} ${BODY_Y} A ${BODY_RX} ${BODY_RX} 0 0 1 ${BODY_X + BODY_W} ${BODY_Y + BODY_RX} L ${BODY_X + BODY_W} ${BODY_Y + BAR_H} L ${BODY_X} ${BODY_Y + BAR_H} L ${BODY_X} ${BODY_Y + BODY_RX} A ${BODY_RX} ${BODY_RX} 0 0 1 ${BODY_X + BODY_RX} ${BODY_Y} Z`;

// Screen rect, inside the top bar.
export const SCR_X = 84, SCR_Y = 4, SCR_W = 110, SCR_H = 30; // equal 2-unit margin above and below, within BAR_H

// Vent grille, lower-right of the body.
export const GRILLE_X0 = 118, GRILLE_X1 = 184, GRILLE_Y0 = 248, GRILLE_LINES = 9, GRILLE_GAP = 5;

// Status indicators in the control bar (left to right).
export const INDICATOR_Y = 19;
export const INDICATORS = {
  wifi: 16,
  door: 27,
  fault: 38,
  power: 58,
};

// Water inside the drum glass, while a washer runs anything other than spin/drain.
export const WATER_R = 58; // matches the largest concentric ring, so the two never show at once

// This is the back wall of the drum, seen straight through the door — not a
// separate paddle arm. Three curved, tapering ribs run from near the centre
// hub out to near the rim, pinwheel-fashion; the panels between them are
// perforated with drain holes, same as the real pattern. The whole thing is
// one flat disc that simply rotates.
function ribPetal() {
  const p0 = [DOOR_CX, DOOR_CY];
  const p1 = clockPoint(DOOR_CX, DOOR_CY, 54, 16);
  const cOut = clockPoint(DOOR_CX, DOOR_CY, 38, 44);
  const cIn = clockPoint(DOOR_CX, DOOR_CY, 24, -10);
  const f = (p) => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`;
  return `M ${f(p0)} Q ${f(cOut)} ${f(p1)} Q ${f(cIn)} ${f(p0)} Z`;
}
export const RIB_D = ribPetal();

// Drain holes, a few concentric arcs within each of the 3 panels between ribs
// (panels are centred on local angle 60°, since ribs sit at 0/120/240).
function panelHoles() {
  const rings = [
    { r: 20, count: 4, span: 46 },
    { r: 32, count: 6, span: 54 },
    { r: 44, count: 7, span: 58 },
  ];
  const pts = [];
  for (const { r, count, span } of rings) {
    for (let i = 0; i < count; i++) {
      const deg = 60 - span / 2 + (span * i) / (count - 1);
      pts.push(clockPoint(DOOR_CX, DOOR_CY, r, deg));
    }
  }
  return pts;
}
export const PANEL_HOLES = panelHoles();

// The water itself does NOT spin with the drum — at wash speed it settles as
// a pool at the bottom under gravity, roughly level, while the paddles (which
// do rotate) sweep through and above it, kicking up spray each time one dips
// in. Drawn as a circle segment, but the surface is a choppy line (a handful
// of small bumps), not a perfectly flat one, closed by the drum wall along
// the bottom.
export const POOL_SURFACE_Y = 8; // the surface sits this far below the drum's centre, on average
const POOL_HALF_W = Math.sqrt(WATER_R * WATER_R - POOL_SURFACE_Y * POOL_SURFACE_Y);
function choppyPoolPath() {
  const bumps = [0, -2.5, 1.5, -3, 2, -2, 1, -1.5, 0]; // small vertical jitter along the surface
  const n = bumps.length - 1;
  const xAt = (i) => DOOR_CX - POOL_HALF_W + (2 * POOL_HALF_W * i) / n;
  let d = `M ${xAt(0).toFixed(2)} ${(DOOR_CY + POOL_SURFACE_Y + bumps[0]).toFixed(2)}`;
  for (let i = 1; i <= n; i++) {
    const midX = (xAt(i - 1) + xAt(i)) / 2;
    const midY = DOOR_CY + POOL_SURFACE_Y + (bumps[i - 1] + bumps[i]) / 2 - 1.2;
    d += ` Q ${midX.toFixed(2)} ${midY.toFixed(2)} ${xAt(i).toFixed(2)} ${(DOOR_CY + POOL_SURFACE_Y + bumps[i]).toFixed(2)}`;
  }
  d += ` A ${WATER_R} ${WATER_R} 0 1 1 ${xAt(0).toFixed(2)} ${(DOOR_CY + POOL_SURFACE_Y + bumps[0]).toFixed(2)} Z`;
  return d;
}
export const POOL_D = choppyPoolPath();

// Splash droplets where a paddle dips through the pool, clustered near the
// bottom centre — several small dots, each arcing up and fading, repeating
// once per paddle pass (3 paddles share the 4.6s drum rotation).
const SPLASH_PERIOD = 4.6 / 3;
export const SPLASHES = [
  { dx: -14, dy: -22, delay: 0, dur: SPLASH_PERIOD, size: 2.2 },
  { dx: -6, dy: -30, delay: 0.06, dur: SPLASH_PERIOD, size: 1.6 },
  { dx: 2, dy: -34, delay: 0.02, dur: SPLASH_PERIOD, size: 2 },
  { dx: 9, dy: -26, delay: 0.1, dur: SPLASH_PERIOD, size: 1.4 },
  { dx: 16, dy: -20, delay: 0.14, dur: SPLASH_PERIOD, size: 1.8 },
  { dx: -2, dy: -18, delay: 0.18, dur: SPLASH_PERIOD, size: 1.3 },
];
