import {
  BODY_X, BODY_Y, BODY_W, BODY_H, BODY_RX, BAR_D,
  DOOR_CX, DOOR_CY, DOOR_R, WATER_R,
  RING_D, RING_ARC_LEN,
  SCR_X, SCR_Y, SCR_W, SCR_H,
  GRILLE_X0, GRILLE_X1, GRILLE_Y0, GRILLE_LINES, GRILLE_GAP,
  INDICATOR_Y, INDICATORS,
  CROSS_D, CROSS_ARM_ANGLES, CROSS_ARM_W, CROSS_ARM_L, CROSS_HUB_R, POOL_D, POOL_SURFACE_Y, SPLASHES,
} from "./geometry.js";
import { STYLES } from "./styles.js";
import { openingDefs, openingMarkup, doorMarkup } from "./door.js";

// A status indicator: the visible dot plus a larger transparent hit area, both
// carrying a <title> so the browser shows a native tooltip on hover. The title
// text is filled in (and localized) by the card on every update.
function indicator(id, cx, { ring = false } = {}) {
  const shape = ring
    ? `<circle class="pwr-ring" id="ind-${id}" cx="${cx}" cy="${INDICATOR_Y}" r="3"/>`
    : `<circle class="dot" id="ind-${id}" cx="${cx}" cy="${INDICATOR_Y}" r="3"/>`;
  return `
    <g class="indicator">
      ${shape}
      <circle class="hit" cx="${cx}" cy="${INDICATOR_Y}" r="5"><title id="tip-${id}"></title></circle>
    </g>`;
}

export function buildTemplate({ hinge = "left" } = {}) {
  return `
    <style>${STYLES}</style>
    <ha-card>
      <div class="wrap">
        <div class="stage">
          <svg viewBox="0 0 ${BODY_W + 4} ${BODY_H + 4}">
            <defs>
              <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#fbfbfb"/>
                <stop offset="100%" stop-color="#e6e6e7"/>
              </linearGradient>
              <radialGradient id="doorGrad" cx="36%" cy="30%" r="80%">
                <stop offset="0%" stop-color="#3a4049"/>
                <stop offset="55%" stop-color="#20242a"/>
                <stop offset="100%" stop-color="#0c0e11"/>
              </radialGradient>
              <radialGradient id="waterGrad" cx="40%" cy="25%" r="85%">
                <stop offset="0%" stop-color="#2e7891"/>
                <stop offset="60%" stop-color="#184a5c"/>
                <stop offset="100%" stop-color="#0d2b36"/>
              </radialGradient>
              <linearGradient id="lcdGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stop-color="#0b1220"/><stop offset="1" stop-color="#060a12"/>
              </linearGradient>
              <linearGradient id="crossGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#e3e9ec"/>
                <stop offset="100%" stop-color="#9aa4ab"/>
              </linearGradient>
              <!-- Across-the-arm shading: a rounded ridge down the middle, dark flanks. -->
              <linearGradient id="ridgeGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stop-color="#10151a" stop-opacity="0.5"/>
                <stop offset="30%" stop-color="#10151a" stop-opacity="0.05"/>
                <stop offset="50%" stop-color="#ffffff" stop-opacity="0.5"/>
                <stop offset="70%" stop-color="#10151a" stop-opacity="0.05"/>
                <stop offset="100%" stop-color="#10151a" stop-opacity="0.5"/>
              </linearGradient>
              <!-- Fades each arm's shading out toward the hub so the arms melt into the dome. -->
              <linearGradient id="ridgeFadeG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stop-color="#fff"/><stop offset="0.5" stop-color="#fff"/><stop offset="0.93" stop-color="#000"/>
              </linearGradient>
              <mask id="ridgeFade" maskUnits="userSpaceOnUse" x="${DOOR_CX - CROSS_ARM_W}" y="${DOOR_CY - CROSS_ARM_L}" width="${CROSS_ARM_W * 2}" height="${CROSS_ARM_L}">
                <rect x="${DOOR_CX - CROSS_ARM_W}" y="${DOOR_CY - CROSS_ARM_L}" width="${CROSS_ARM_W * 2}" height="${CROSS_ARM_L}" fill="url(#ridgeFadeG)"/>
              </mask>
              <radialGradient id="hubGrad" cx="40%" cy="34%" r="68%">
                <stop offset="0%" stop-color="#ffffff" stop-opacity="0.85"/>
                <stop offset="45%" stop-color="#cdd5da" stop-opacity="0.5"/>
                <stop offset="80%" stop-color="#7c868d" stop-opacity="0.18"/>
                <stop offset="100%" stop-color="#7c868d" stop-opacity="0"/>
              </radialGradient>
              <linearGradient id="shineGrad" x1="0" y1="0" x2="0.7" y2="1">
                <stop offset="0%" stop-color="#ffffff" stop-opacity="0.22"/>
                <stop offset="45%" stop-color="#ffffff" stop-opacity="0"/>
              </linearGradient>
              <clipPath id="crossClip"><path d="${CROSS_D}"/></clipPath>
              <clipPath id="waterClip"><circle cx="${DOOR_CX}" cy="${DOOR_CY}" r="${WATER_R}"/></clipPath>
            ${openingDefs()}
            </defs>
            <rect class="body" x="${BODY_X}" y="${BODY_Y}" width="${BODY_W}" height="${BODY_H}" rx="${BODY_RX}"/>
            <path class="bar" d="${BAR_D}"/>
            ${indicator("power", INDICATORS.power, { ring: true })}
            <rect class="screen-bezel" x="${SCR_X}" y="${SCR_Y}" width="${SCR_W}" height="${SCR_H}" rx="4"/>
            <g id="lcd"></g>
            <path class="ring-track" id="ring-track" d="${RING_D}"
                  stroke-dasharray="${RING_ARC_LEN.toFixed(2)}" stroke-dashoffset="0"/>
            <g id="ring-fill"></g>
            ${openingMarkup()}
            <circle class="rim closed-only" cx="${DOOR_CX}" cy="${DOOR_CY}" r="${DOOR_R}"/>
            <g class="drum" id="drum">
              <circle cx="${DOOR_CX}" cy="${DOOR_CY}" r="58" fill="none" stroke="#343a42" stroke-width="1" opacity="0.5"/>
              <circle cx="${DOOR_CX}" cy="${DOOR_CY}" r="40" fill="none" stroke="#343a42" stroke-width="1" opacity="0.4"/>
              <circle cx="${DOOR_CX}" cy="${DOOR_CY}" r="22" fill="none" stroke="#343a42" stroke-width="1" opacity="0.35"/>
            </g>
            <g class="crosspiece" id="crosspiece" clip-path="url(#waterClip)">
              <path class="cross-wall" d="${CROSS_D}"/>
              <path class="cross-face" d="${CROSS_D}"/>
              <g clip-path="url(#crossClip)">
                ${CROSS_ARM_ANGLES.map(
                  (deg) => `
                <rect x="${DOOR_CX - CROSS_ARM_W / 2}" y="${DOOR_CY - CROSS_ARM_L}" width="${CROSS_ARM_W}" height="${CROSS_ARM_L}"
                      fill="url(#ridgeGrad)" mask="url(#ridgeFade)" transform="rotate(${deg} ${DOOR_CX} ${DOOR_CY})"/>`
                ).join("")}
                <path class="cross-bevel" d="${CROSS_D}"/>
              </g>
              <path class="cross-edge" d="${CROSS_D}"/>
              <circle class="cross-hub" clip-path="url(#crossClip)" cx="${DOOR_CX}" cy="${DOOR_CY}" r="${CROSS_HUB_R}"/>
              <circle cx="${DOOR_CX}" cy="${DOOR_CY}" r="2.6" fill="#59626a" opacity="0.8"/>
            </g>
            <g class="water" id="water" clip-path="url(#waterClip)" opacity="0">
              <path class="pool" d="${POOL_D}">
                <animateTransform attributeName="transform" type="rotate"
                  values="-5 ${DOOR_CX} ${DOOR_CY}; 5 ${DOOR_CX} ${DOOR_CY}; -5 ${DOOR_CX} ${DOOR_CY}"
                  keyTimes="0;0.5;1" dur="3.4s" repeatCount="indefinite"/>
              </path>
              ${SPLASHES.map(
                (s) => `
              <circle class="splash" cx="${DOOR_CX}" cy="${DOOR_CY + POOL_SURFACE_Y}" r="${s.size}"
                      style="--dx:${s.dx}px;--dy:${s.dy}px;--dur:${s.dur.toFixed(2)}s;--delay:${s.delay}s;"/>`
              ).join("")}
            </g>
            <circle class="glass-tint closed-only" cx="${DOOR_CX}" cy="${DOOR_CY}" r="${WATER_R}"/>
            <circle class="glass-shine closed-only" cx="${DOOR_CX}" cy="${DOOR_CY}" r="${WATER_R}"/>
            ${doorMarkup(hinge)}
            <rect class="grille-frame" x="${GRILLE_X0 - 3}" y="${GRILLE_Y0 - 3}" width="${GRILLE_X1 - GRILLE_X0 + 6}" height="${(GRILLE_LINES - 1) * GRILLE_GAP + 6}" rx="2"/>
            ${Array.from({ length: GRILLE_LINES }, (_, i) =>
              `<line class="vent" x1="${GRILLE_X0}" y1="${GRILLE_Y0 + i * GRILLE_GAP}" x2="${GRILLE_X1}" y2="${GRILLE_Y0 + i * GRILLE_GAP}"/>`
            ).join("")}
          </svg>
        </div>
      </div>
    </ha-card>
  `;
}
