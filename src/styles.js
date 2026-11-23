import { BODY_W, BODY_H, SCR_X, SCR_Y, SCR_W, SCR_H, DOOR_CX, DOOR_CY } from "./geometry.js";

// The appliance itself is the card: no title, and ha-card is stripped of its
// background, border, shadow and padding so no container is visible.
export const STYLES = `
  :host { display: block; }
  ha-card {
    background: none; border: none; box-shadow: none; border-radius: 0;
    padding: 0; overflow: visible;
  }
  .wrap { display: flex; flex-direction: column; align-items: center; width: 100%; }
  .stage { width: 100%; aspect-ratio: ${BODY_W + 4} / ${BODY_H + 4}; position: relative; container-type: inline-size; }
  svg { width: 100%; height: 100%; overflow: visible; display: block; }
  .body { fill: url(#bodyGrad); stroke: #c7c7c9; stroke-width: 1.5; }
  .bar { fill: #262b33; }
  .vent { stroke: #cfcfcf; stroke-width: 1.4; }
  .grille-frame { fill: none; stroke: #d6d6d7; stroke-width: 1; }
  .pwr-ring { fill: none; stroke: #7d8590; stroke-width: 1.2; }
  .dot { stroke: rgba(0,0,0,0.35); stroke-width: 0.5; transition: fill 0.4s ease; }
  .hit { fill: transparent; cursor: help; }
  .screen-bezel { fill: #0b0f0d; stroke: #2a2f2d; stroke-width: 1.2; }
  .rim { fill: url(#doorGrad); stroke: #9aa0a6; stroke-width: 3; }
  .ring-track { fill: none; stroke-width: 6; stroke-linecap: round; opacity: 0.3; transition: stroke 0.4s ease; }
  .ring-seg { fill: none; stroke-width: 6; stroke-linecap: round; transition: stroke-dashoffset 0.6s ease, stroke-dasharray 0.6s ease; }
  .drum { transform-origin: center; transform-box: fill-box; transition: opacity 0.5s ease; }
  .drum.spin { animation: spin 2.4s linear infinite; }
  .drum.spin.dryer { animation: tumble 2.8s ease-in-out infinite; }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes tumble { 0% { transform: rotate(0deg); } 50% { transform: rotate(190deg); } 100% { transform: rotate(360deg); } }
  @keyframes blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0.15; } }
  .water { transition: opacity 0.5s ease; }
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
  .rib { fill: #c3cbd0; opacity: 0.85; }
  .rib-hub { fill: #c3cbd0; opacity: 0.85; }
  .panel-hole { fill: #343b42; opacity: 0.6; }
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
  .screen-text {
    position: absolute;
    left: ${(100 * SCR_X) / (BODY_W + 4)}%; top: ${(100 * SCR_Y) / (BODY_H + 4)}%;
    width: ${(100 * SCR_W) / (BODY_W + 4)}%; height: ${(100 * SCR_H) / (BODY_H + 4)}%;
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1px;
    box-sizing: border-box; pointer-events: none; overflow: hidden;
    font-family: "Consolas", "SFMono-Regular", monospace; text-align: center;
  }
  .screen-line1 { font-size: 3.6cqw; font-weight: 600; letter-spacing: 0.01em; color: #8be9c7; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
  .screen-clock { font-size: 4.6cqw; font-weight: 700; font-variant-numeric: tabular-nums; color: #8be9c7; }
  .screen-clock .colon { animation: blink 1s step-end infinite; }
  .screen-line1.failure, .screen-clock.failure { color: #ff9a9a; }
`;
