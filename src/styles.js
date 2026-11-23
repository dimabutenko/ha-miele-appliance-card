import { BODY_W, BODY_H, DOOR_CX, DOOR_CY } from "./geometry.js";

// The appliance itself is the card: no title, and ha-card is stripped of its
// background, border, shadow and padding so no container is visible.
export const STYLES = `
  :host { display: block; }
  ha-card {
    background: none; border: none; box-shadow: none; border-radius: 0;
    padding: 0; overflow: visible;
  }
  .wrap { display: flex; flex-direction: column; align-items: center; width: 100%; }
  .stage { width: 100%; aspect-ratio: ${BODY_W + 4} / ${BODY_H + 4}; position: relative; }
  svg { width: 100%; height: 100%; overflow: visible; display: block; }
  .body { fill: url(#bodyGrad); stroke: #c7c7c9; stroke-width: 1.5; }
  .bar { fill: #262b33; }
  .vent { stroke: #cfcfcf; stroke-width: 1.4; }
  .grille-frame { fill: none; stroke: #d6d6d7; stroke-width: 1; }
  .pwr-ring { fill: none; stroke: #7d8590; stroke-width: 1.2; }
  .dot { stroke: rgba(0,0,0,0.35); stroke-width: 0.5; transition: fill 0.4s ease; }
  .closed-only, .open-only { transition: opacity 0.5s ease; }
  .open-only { opacity: 0; }
  .stage.open .open-only { opacity: 1; }
  .stage.open .closed-only { opacity: 0; }
  .hit { fill: transparent; cursor: help; }
  .screen-bezel { fill: url(#lcdGrad); stroke: #3a4350; stroke-width: 1; }
  .rim { fill: url(#doorGrad); stroke: #9aa0a6; stroke-width: 3; }
  .ring-track { fill: none; stroke-width: 6; stroke-linecap: round; opacity: 0.3; transition: stroke 0.4s ease; }
  .ring-seg { fill: none; stroke-width: 6; stroke-linecap: round; transition: stroke-dashoffset 0.6s ease, stroke-dasharray 0.6s ease; }
  @keyframes blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0.15; } }
  .water, .steam { transition: opacity 0.6s ease; }
  .steam-puff {
    transform-origin: center; transform-box: fill-box; opacity: 0;
    animation: steam var(--dur) ease-in-out infinite; animation-delay: var(--delay);
  }
  @keyframes steam {
    0% { opacity: 0; transform: translate(0, 0) scale(0.6); }
    25% { opacity: 0.95; }
    60% { opacity: 0.7; transform: translate(var(--sx), -34px) scale(1.15); }
    100% { opacity: 0; transform: translate(calc(var(--sx) * 1.6), -66px) scale(1.7); }
  }
  /* Explicit pixel transform-origin (not fill-box) — the ribs are asymmetric per
     copy, so a bounding-box-derived pivot drifts off the true drum centre. */
  .crosspiece {
    transform-origin: ${DOOR_CX}px ${DOOR_CY}px;
    transition: opacity 0.5s ease;
    animation: crosspieceSpin 4.6s linear infinite;
    animation-play-state: paused;
  }
  .crosspiece.spin { animation-play-state: running; }
  .crosspiece.spin.fast { animation-duration: 1.1s; }
  @keyframes crosspieceSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  .cross-wall { fill: #1b2025; stroke: #1b2025; stroke-width: 4.5; stroke-linejoin: round; opacity: 0.9; }
  .cross-face { fill: url(#crossGrad); }
  .cross-bevel { fill: none; stroke: #6f7a82; stroke-width: 3.2; stroke-linejoin: round; opacity: 0.75; }
  .cross-edge { fill: none; stroke: #eef3f5; stroke-width: 0.8; stroke-linejoin: round; opacity: 0.7; }
  .cross-hub { fill: url(#hubGrad); pointer-events: none; }
  .pool { fill: url(#waterGrad); opacity: 0.78; stroke: #bfe8f5; stroke-width: 1; stroke-opacity: 0.45; }
  .splash {
    fill: #d6f1fb; transform-origin: center; transform-box: fill-box;
    animation: splash var(--dur) ease-out infinite; animation-delay: var(--delay);
  }
  @keyframes splash {
    0% { opacity: 0; transform: translate(0, 0) scale(0.4); }
    10% { opacity: 1; transform: translate(calc(var(--dx) * 0.3), calc(var(--dy) * 0.4)) scale(1); }
    35% { opacity: 0.85; transform: translate(var(--dx), var(--dy)) scale(0.85); }
    70% { opacity: 0; transform: translate(calc(var(--dx) * 1.15), calc(var(--dy) * 0.15)) scale(0.5); }
    100% { opacity: 0; }
  }
  .glass-tint { fill: rgba(5, 9, 11, 0.45); }
  .glass-shine { fill: url(#shineGrad); pointer-events: none; }
  /* LCD text: words in monospace, digits in the theme's UI font with fixed-width figures. */
  .lcd-label { font-family: "Consolas", "SFMono-Regular", monospace; pointer-events: none; }
  .lcd-num { font-family: var(--primary-font-family, Roboto, "Segoe UI", system-ui, sans-serif); font-variant-numeric: tabular-nums; pointer-events: none; }
  .lcd-colon.blink { animation: blink 1s step-end infinite; }
`;
