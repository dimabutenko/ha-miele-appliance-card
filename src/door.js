import { DOOR_CX, DOOR_CY } from "./geometry.js";

// The open-door look: the door swings out on a vertical hinge at one side of the
// opening. Seen from the front at ~92° it is almost edge-on: a thin metal frame
// plus the deep, clear glass bowl that sticks out of its inner face (a truncated
// cone with rounded corners, like a real front-loader's door).
//
// Projection of a door point: x = hinge + u*cos(a) + w*sin(a), where u runs across
// the door from the hinge and w is the height above the door's inner face.
export const DOOR_OPEN_DEG = 92;
export const DOOR_BOWL_DEPTH = 34; // how far the glass bowl sticks out
const FRAME_R = 82; // door frame radius (same as the closed door's rim)
const FRAME_T = 7; // frame thickness
const BOWL_BASE_R = 62; // bowl radius where it meets the frame
const BOWL_TIP_R = 44; // bowl radius at its outer face

const f = (n) => n.toFixed(2);

export function openingDefs() {
  return `
              <linearGradient id="doorMetal" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stop-color="#6d757c"/><stop offset="0.5" stop-color="#e4e9ec"/><stop offset="1" stop-color="#8d959c"/>
              </linearGradient>
              <linearGradient id="doorOuter" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stop-color="#4f575e"/><stop offset="1" stop-color="#9aa2a9"/>
              </linearGradient>
              <linearGradient id="doorGlass" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stop-color="#bcd0de" stop-opacity="0.42"/>
                <stop offset="0.55" stop-color="#e9f3f9" stop-opacity="0.22"/>
                <stop offset="1" stop-color="#9db5c6" stop-opacity="0.42"/>
              </linearGradient>
              <radialGradient id="gasketGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0.80" stop-color="#101316"/><stop offset="0.90" stop-color="#4b5158"/><stop offset="1" stop-color="#22262b"/>
              </radialGradient>
              <radialGradient id="backWall" cx="50%" cy="46%" r="55%">
                <stop offset="0" stop-color="#e4dfd0"/><stop offset="0.7" stop-color="#a8a392"/><stop offset="1" stop-color="#585548"/>
              </radialGradient>
              <radialGradient id="wallShade" cx="50%" cy="50%" r="50%">
                <stop offset="0.86" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.65"/>
              </radialGradient>
              <filter id="doorShadowBlur"><feGaussianBlur stdDeviation="2.4"/></filter>`;
}

// What you see through the open door: the dark bezel and rubber gasket, the
// perforated drum wall, and the drum's flat back wall (lit from inside).
// The crosspiece, water etc. are drawn on top by the card.
export function openingMarkup() {
  return `
            <g class="open-only">
              <circle cx="${DOOR_CX}" cy="${DOOR_CY}" r="82" fill="#16191d" stroke="#9aa0a6" stroke-width="3"/>
              <circle cx="${DOOR_CX}" cy="${DOOR_CY}" r="76" fill="url(#gasketGrad)"/>
              <circle cx="${DOOR_CX}" cy="${DOOR_CY}" r="70" fill="none" stroke="#6a717a" stroke-width="1" opacity="0.55"/>
              <circle cx="${DOOR_CX}" cy="${DOOR_CY}" r="65.5" fill="none" stroke="#000" stroke-width="2" opacity="0.5"/>
              <circle cx="${DOOR_CX}" cy="${DOOR_CY}" r="62" fill="#0c0f12"/>
              <circle cx="${DOOR_CX}" cy="${DOOR_CY}" r="60" fill="none" stroke="#4b535b" stroke-width="2.4" stroke-dasharray="1.1 3.9"/>
              <circle cx="${DOOR_CX}" cy="${DOOR_CY}" r="57.5" fill="url(#backWall)"/>
              <circle cx="${DOOR_CX}" cy="${DOOR_CY}" r="57.5" fill="url(#wallShade)"/>
            </g>`;
}

// `hinge`: "left" | "right". The right-hand door is the left-hand one mirrored.
export function doorMarkup(hinge = "left") {
  const a = (DOOR_OPEN_DEG * Math.PI) / 180;
  const c = Math.cos(a);
  const s = Math.sin(a);
  const hingeX = DOOR_CX - FRAME_R;
  const rx = Math.abs(FRAME_R * c);
  const xi = hingeX + FRAME_R * c; // inner-face ellipse centre
  const xo = xi - FRAME_T * s; // outer-face ellipse centre
  const tip = xi + DOOR_BOWL_DEPTH * s; // x of the bowl's outer face
  const top = DOOR_CY - BOWL_BASE_R, bot = DOOR_CY + BOWL_BASE_R;
  const tipTop = DOOR_CY - BOWL_TIP_R, tipBot = DOOR_CY + BOWL_TIP_R;
  const bowl = `M ${f(xi)} ${top} L ${f(tip - 8)} ${tipTop - 3} Q ${f(tip)} ${tipTop - 1} ${f(tip)} ${tipTop + 8} L ${f(tip)} ${tipBot - 8} Q ${f(tip)} ${tipBot + 1} ${f(tip - 8)} ${tipBot + 3} L ${f(xi)} ${bot} Z`;
  const inset = `M ${f(xi + 1.5)} ${top + 4} L ${f(tip - 9)} ${tipTop + 1} Q ${f(tip - 3)} ${tipTop + 2} ${f(tip - 3)} ${tipTop + 9} L ${f(tip - 3)} ${tipBot - 9} Q ${f(tip - 3)} ${tipBot - 2} ${f(tip - 9)} ${tipBot - 1} L ${f(xi + 1.5)} ${bot - 4}`;
  const mirror = hinge === "right" ? ` transform="translate(${DOOR_CX * 2} 0) scale(-1 1)"` : "";
  return `
            <g class="open-only"${mirror}>
              <ellipse cx="${f(xi + DOOR_BOWL_DEPTH * 0.7)}" cy="${DOOR_CY + 3}" rx="${f(DOOR_BOWL_DEPTH * 0.45 + 3)}" ry="64" fill="#000" opacity="0.22" filter="url(#doorShadowBlur)"/>
              <path d="M ${f(xo)} ${DOOR_CY - 84} L ${f(xi)} ${DOOR_CY - 84} A ${f(rx)} 84 0 0 1 ${f(xi)} ${DOOR_CY + 84} L ${f(xo)} ${DOOR_CY + 84} A ${f(rx)} 84 0 0 1 ${f(xo)} ${DOOR_CY - 84} Z" fill="url(#doorOuter)" stroke="#4a5158" stroke-width="0.8"/>
              <ellipse cx="${f(xi)}" cy="${DOOR_CY}" rx="${f(rx)}" ry="84" fill="url(#doorMetal)" stroke="#555d64" stroke-width="0.8"/>
              <path d="${bowl}" fill="url(#doorGlass)" stroke="#e6eff5" stroke-opacity="0.85" stroke-width="1" stroke-linejoin="round"/>
              <path d="${inset}" fill="none" stroke="#e6eff5" stroke-opacity="0.4" stroke-width="0.8"/>
              <path d="M ${f(xi + DOOR_BOWL_DEPTH * 0.3)} ${DOOR_CY - 52} L ${f(tip - 6)} ${tipTop + 4}" fill="none" stroke="#fff" stroke-opacity="0.55" stroke-width="1.6" stroke-linecap="round"/>
              <rect x="${f(xi)}" y="${top}" width="3" height="${bot - top}" fill="#6b7279" opacity="0.75"/>
            </g>`;
}
