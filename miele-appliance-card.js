/* Generated from src/ by 'npm run build' - do not edit. */

// src/geometry.js
var BODY_X = 2;
var BODY_Y = 2;
var BODY_W = 196;
var BODY_H = 296;
var BODY_RX = 6;
var BAR_H = 34;
var DOOR_CX = 100;
var DOOR_CY = 155;
var DOOR_R = 82;
var RING_R = 90;
var SWEEP_DEG = 300;
var START_CLOCK_DEG = 210;
function clockPoint(cx, cy, r, deg) {
  const rad = deg * Math.PI / 180;
  return [cx + r * Math.sin(rad), cy - r * Math.cos(rad)];
}
var [RING_X0, RING_Y0] = clockPoint(DOOR_CX, DOOR_CY, RING_R, START_CLOCK_DEG);
var [RING_X1, RING_Y1] = clockPoint(DOOR_CX, DOOR_CY, RING_R, START_CLOCK_DEG + SWEEP_DEG);
var RING_ARC_LEN = RING_R * (SWEEP_DEG * Math.PI / 180);
var RING_D = `M ${RING_X0.toFixed(2)} ${RING_Y0.toFixed(2)} A ${RING_R} ${RING_R} 0 1 1 ${RING_X1.toFixed(2)} ${RING_Y1.toFixed(2)}`;
var BAR_D = `M ${BODY_X + BODY_RX} ${BODY_Y} L ${BODY_X + BODY_W - BODY_RX} ${BODY_Y} A ${BODY_RX} ${BODY_RX} 0 0 1 ${BODY_X + BODY_W} ${BODY_Y + BODY_RX} L ${BODY_X + BODY_W} ${BODY_Y + BAR_H} L ${BODY_X} ${BODY_Y + BAR_H} L ${BODY_X} ${BODY_Y + BODY_RX} A ${BODY_RX} ${BODY_RX} 0 0 1 ${BODY_X + BODY_RX} ${BODY_Y} Z`;
var SCR_X = 84;
var SCR_Y = 4;
var SCR_W = 110;
var SCR_H = 30;
var GRILLE_X0 = 118;
var GRILLE_X1 = 184;
var GRILLE_Y0 = 248;
var GRILLE_LINES = 9;
var GRILLE_GAP = 5;
var INDICATOR_Y = 19;
var INDICATORS = {
  wifi: 16,
  door: 27,
  fault: 38,
  power: 58
};
var WATER_R = 58;
function ribPetal() {
  const p0 = [DOOR_CX, DOOR_CY];
  const p1 = clockPoint(DOOR_CX, DOOR_CY, 54, 16);
  const cOut = clockPoint(DOOR_CX, DOOR_CY, 38, 44);
  const cIn = clockPoint(DOOR_CX, DOOR_CY, 24, -10);
  const f = (p) => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`;
  return `M ${f(p0)} Q ${f(cOut)} ${f(p1)} Q ${f(cIn)} ${f(p0)} Z`;
}
var RIB_D = ribPetal();
function panelHoles() {
  const rings = [
    { r: 20, count: 4, span: 46 },
    { r: 32, count: 6, span: 54 },
    { r: 44, count: 7, span: 58 }
  ];
  const pts = [];
  for (const { r, count, span } of rings) {
    for (let i = 0; i < count; i++) {
      const deg = 60 - span / 2 + span * i / (count - 1);
      pts.push(clockPoint(DOOR_CX, DOOR_CY, r, deg));
    }
  }
  return pts;
}
var PANEL_HOLES = panelHoles();
var POOL_SURFACE_Y = 8;
var POOL_HALF_W = Math.sqrt(WATER_R * WATER_R - POOL_SURFACE_Y * POOL_SURFACE_Y);
function choppyPoolPath() {
  const bumps = [0, -2.5, 1.5, -3, 2, -2, 1, -1.5, 0];
  const n = bumps.length - 1;
  const xAt = (i) => DOOR_CX - POOL_HALF_W + 2 * POOL_HALF_W * i / n;
  let d = `M ${xAt(0).toFixed(2)} ${(DOOR_CY + POOL_SURFACE_Y + bumps[0]).toFixed(2)}`;
  for (let i = 1; i <= n; i++) {
    const midX = (xAt(i - 1) + xAt(i)) / 2;
    const midY = DOOR_CY + POOL_SURFACE_Y + (bumps[i - 1] + bumps[i]) / 2 - 1.2;
    d += ` Q ${midX.toFixed(2)} ${midY.toFixed(2)} ${xAt(i).toFixed(2)} ${(DOOR_CY + POOL_SURFACE_Y + bumps[i]).toFixed(2)}`;
  }
  d += ` A ${WATER_R} ${WATER_R} 0 1 1 ${xAt(0).toFixed(2)} ${(DOOR_CY + POOL_SURFACE_Y + bumps[0]).toFixed(2)} Z`;
  return d;
}
var POOL_D = choppyPoolPath();
var SPLASH_PERIOD = 4.6 / 3;
var SPLASHES = [
  { dx: -14, dy: -22, delay: 0, dur: SPLASH_PERIOD, size: 2.2 },
  { dx: -6, dy: -30, delay: 0.06, dur: SPLASH_PERIOD, size: 1.6 },
  { dx: 2, dy: -34, delay: 0.02, dur: SPLASH_PERIOD, size: 2 },
  { dx: 9, dy: -26, delay: 0.1, dur: SPLASH_PERIOD, size: 1.4 },
  { dx: 16, dy: -20, delay: 0.14, dur: SPLASH_PERIOD, size: 1.8 },
  { dx: -2, dy: -18, delay: 0.18, dur: SPLASH_PERIOD, size: 1.3 }
];

// src/styles.js
var STYLES = `
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
  /* Explicit pixel transform-origin (not fill-box) \u2014 the ribs are asymmetric per
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
    left: ${100 * SCR_X / (BODY_W + 4)}%; top: ${100 * SCR_Y / (BODY_H + 4)}%;
    width: ${100 * SCR_W / (BODY_W + 4)}%; height: ${100 * SCR_H / (BODY_H + 4)}%;
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1px;
    box-sizing: border-box; pointer-events: none; overflow: hidden;
    font-family: "Consolas", "SFMono-Regular", monospace; text-align: center;
  }
  .screen-line1 { font-size: 3.6cqw; font-weight: 600; letter-spacing: 0.01em; color: #8be9c7; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
  .screen-clock { font-size: 4.6cqw; font-weight: 700; font-variant-numeric: tabular-nums; color: #8be9c7; }
  .screen-clock .colon { animation: blink 1s step-end infinite; }
  .screen-line1.failure, .screen-clock.failure { color: #ff9a9a; }
`;

// src/template.js
function indicator(id, cx, { ring = false } = {}) {
  const shape = ring ? `<circle class="pwr-ring" id="ind-${id}" cx="${cx}" cy="${INDICATOR_Y}" r="3"/>` : `<circle class="dot" id="ind-${id}" cx="${cx}" cy="${INDICATOR_Y}" r="3"/>`;
  return `
    <g class="indicator">
      ${shape}
      <circle class="hit" cx="${cx}" cy="${INDICATOR_Y}" r="5"><title id="tip-${id}"></title></circle>
    </g>`;
}
function buildTemplate() {
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
              <clipPath id="waterClip"><circle cx="${DOOR_CX}" cy="${DOOR_CY}" r="${WATER_R}"/></clipPath>
            </defs>
            <rect class="body" x="${BODY_X}" y="${BODY_Y}" width="${BODY_W}" height="${BODY_H}" rx="${BODY_RX}"/>
            <path class="bar" d="${BAR_D}"/>
            ${indicator("wifi", INDICATORS.wifi)}
            ${indicator("door", INDICATORS.door)}
            ${indicator("fault", INDICATORS.fault)}
            ${indicator("power", INDICATORS.power, { ring: true })}
            <rect class="screen-bezel" x="${SCR_X}" y="${SCR_Y}" width="${SCR_W}" height="${SCR_H}" rx="4"/>
            <path class="ring-track" id="ring-track" d="${RING_D}"
                  stroke-dasharray="${RING_ARC_LEN.toFixed(2)}" stroke-dashoffset="0"/>
            <g id="ring-fill"></g>
            <circle class="rim" cx="${DOOR_CX}" cy="${DOOR_CY}" r="${DOOR_R}"/>
            <g class="drum" id="drum">
              <circle cx="${DOOR_CX}" cy="${DOOR_CY}" r="58" fill="none" stroke="#343a42" stroke-width="1" opacity="0.5"/>
              <circle cx="${DOOR_CX}" cy="${DOOR_CY}" r="40" fill="none" stroke="#343a42" stroke-width="1" opacity="0.4"/>
              <circle cx="${DOOR_CX}" cy="${DOOR_CY}" r="22" fill="none" stroke="#343a42" stroke-width="1" opacity="0.35"/>
            </g>
            <g class="crosspiece" id="crosspiece" clip-path="url(#waterClip)">
              ${[0, 120, 240].map(
    (deg) => `
              <g transform="rotate(${deg} ${DOOR_CX} ${DOOR_CY})">
                ${PANEL_HOLES.map((p) => `<circle class="panel-hole" cx="${p[0].toFixed(2)}" cy="${p[1].toFixed(2)}" r="1.1"/>`).join("")}
              </g>
              <path class="rib" d="${RIB_D}" transform="rotate(${deg} ${DOOR_CX} ${DOOR_CY})"/>`
  ).join("")}
              <circle class="rib-hub" cx="${DOOR_CX}" cy="${DOOR_CY}" r="7"/>
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
            <circle class="glass-tint" cx="${DOOR_CX}" cy="${DOOR_CY}" r="${WATER_R}"/>
            <rect class="grille-frame" x="${GRILLE_X0 - 3}" y="${GRILLE_Y0 - 3}" width="${GRILLE_X1 - GRILLE_X0 + 6}" height="${(GRILLE_LINES - 1) * GRILLE_GAP + 6}" rx="2"/>
            ${Array.from(
    { length: GRILLE_LINES },
    (_, i) => `<line class="vent" x1="${GRILLE_X0}" y1="${GRILLE_Y0 + i * GRILLE_GAP}" x2="${GRILLE_X1}" y2="${GRILLE_Y0 + i * GRILLE_GAP}"/>`
  ).join("")}
          </svg>
          <div class="screen-text">
            <div class="screen-line1" id="screen-line1"></div>
            <div class="screen-clock" id="screen-clock"></div>
          </div>
        </div>
      </div>
    </ha-card>
  `;
}

// src/phase.js
function phaseColor(phase) {
  if (!phase) return null;
  const p = phase.toLowerCase();
  if (/spin|drain/.test(p)) return "#8a5fd1";
  if (/rinse|venting|freshen/.test(p)) return "#2bb6c9";
  if (/wash/.test(p)) return "#3f7fd1";
  if (/dry|warm_air|moisten|normal|hygiene|disinfect/.test(p)) return "#e0922b";
  if (/iron|smooth|cool|anti_crease|thermo_spin|starch/.test(p)) return "#a37fe0";
  return null;
}

// src/i18n/en.js
var en_default = {
  meta: { name: "English" },
  ui: {
    failure: "Error"
  },
  tooltips: {
    wifi: "Wi-Fi signal",
    wifi_unknown: "Wi-Fi signal: no data",
    door: "Door",
    door_open: "Door: open",
    door_closed: "Door: closed",
    fault: "Fault indicator",
    fault_error: "Fault: error",
    fault_ok: "Fault: none",
    power: "Power",
    power_running: "Running",
    power_idle: "Idle"
  },
  editor: {
    appliance: "Appliance",
    appliance_washer: "Washer",
    appliance_dryer: "Dryer",
    prefix: "Entity prefix",
    language: "Language",
    language_auto: "Auto (Home Assistant language)",
    entities: "Entity overrides (optional)",
    running: "Running (binary_sensor)",
    failure: "Failure (binary_sensor)",
    door: "Door (binary_sensor)",
    status: "Status (sensor)",
    phase: "Program phase (sensor)",
    progress: "Progress % (sensor)",
    remaining: "Remaining time (sensor)",
    finish_time: "Finish time (sensor)",
    wifi: "Wi-Fi signal (sensor)"
  },
  // Keys come straight from the integration's phase enums.
  phases: {
    not_running: "Idle",
    pre_wash: "Prewash",
    soak: "Soak",
    main_wash: "Main wash",
    rinse: "Rinse",
    rinse_hold: "Rinse hold",
    rinses: "Rinse",
    rinse_out_lint: "Lint removal",
    cleaning: "Cleaning",
    cooling_down: "Cooling down",
    comfort_cooling: "Comfort cooling",
    safety_cooling: "Safety cooling",
    drain: "Drain",
    spin: "Spin",
    thermo_spin: "Thermo spin",
    anti_crease: "Anti-crease",
    finished: "Finished",
    venting: "Venting",
    starch_stop: "Starch stop",
    freshen_up_and_moisten: "Freshen up",
    steam_smoothing: "Steam smoothing",
    smoothing: "Smoothing",
    hygiene: "Hygiene",
    drying: "Drying",
    disinfecting: "Disinfecting",
    automatic_start: "Automatic start",
    flex_load_active: "FlexLoad",
    program_running: "Running",
    machine_iron: "Machine iron",
    hand_iron: "Hand iron",
    hand_iron_1: "Hand iron+",
    hand_iron_2: "Light hand iron",
    normal: "Normal dry",
    normal_plus: "Normal dry+",
    extra_dry: "Extra dry",
    moisten: "Moisten",
    timed_drying: "Timed drying",
    warm_air: "Warm air",
    slightly_dry: "Slightly dry"
  }
};

// src/i18n/ru.js
var ru_default = {
  meta: { name: "\u0420\u0443\u0441\u0441\u043A\u0438\u0439" },
  ui: {
    failure: "\u041E\u0448\u0438\u0431\u043A\u0430"
  },
  tooltips: {
    wifi: "\u0421\u0438\u0433\u043D\u0430\u043B Wi-Fi",
    wifi_unknown: "\u0421\u0438\u0433\u043D\u0430\u043B Wi-Fi: \u043D\u0435\u0442 \u0434\u0430\u043D\u043D\u044B\u0445",
    door: "\u0414\u0432\u0435\u0440\u0446\u0430",
    door_open: "\u0414\u0432\u0435\u0440\u0446\u0430: \u043E\u0442\u043A\u0440\u044B\u0442\u0430",
    door_closed: "\u0414\u0432\u0435\u0440\u0446\u0430: \u0437\u0430\u043A\u0440\u044B\u0442\u0430",
    fault: "\u0418\u043D\u0434\u0438\u043A\u0430\u0442\u043E\u0440 \u043D\u0435\u0438\u0441\u043F\u0440\u0430\u0432\u043D\u043E\u0441\u0442\u0438",
    fault_error: "\u041D\u0435\u0438\u0441\u043F\u0440\u0430\u0432\u043D\u043E\u0441\u0442\u044C: \u043E\u0448\u0438\u0431\u043A\u0430",
    fault_ok: "\u041D\u0435\u0438\u0441\u043F\u0440\u0430\u0432\u043D\u043E\u0441\u0442\u044C: \u043D\u0435\u0442",
    power: "\u041F\u0438\u0442\u0430\u043D\u0438\u0435",
    power_running: "\u0420\u0430\u0431\u043E\u0442\u0430\u0435\u0442",
    power_idle: "\u041F\u0440\u043E\u0441\u0442\u043E\u0439"
  },
  editor: {
    appliance: "\u041F\u0440\u0438\u0431\u043E\u0440",
    appliance_washer: "\u0421\u0442\u0438\u0440\u0430\u043B\u044C\u043D\u0430\u044F \u043C\u0430\u0448\u0438\u043D\u0430",
    appliance_dryer: "\u0421\u0443\u0448\u0438\u043B\u043A\u0430",
    prefix: "\u041F\u0440\u0435\u0444\u0438\u043A\u0441 \u0441\u0443\u0449\u043D\u043E\u0441\u0442\u0435\u0439",
    language: "\u042F\u0437\u044B\u043A",
    language_auto: "\u0410\u0432\u0442\u043E (\u044F\u0437\u044B\u043A Home Assistant)",
    entities: "\u041F\u0435\u0440\u0435\u043E\u043F\u0440\u0435\u0434\u0435\u043B\u0435\u043D\u0438\u0435 \u0441\u0443\u0449\u043D\u043E\u0441\u0442\u0435\u0439 (\u043D\u0435\u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u043D\u043E)",
    running: "\u0420\u0430\u0431\u043E\u0442\u0430\u0435\u0442 (binary_sensor)",
    failure: "\u041D\u0435\u0438\u0441\u043F\u0440\u0430\u0432\u043D\u043E\u0441\u0442\u044C (binary_sensor)",
    door: "\u0414\u0432\u0435\u0440\u0446\u0430 (binary_sensor)",
    status: "\u0421\u0442\u0430\u0442\u0443\u0441 (sensor)",
    phase: "\u0424\u0430\u0437\u0430 \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u044B (sensor)",
    progress: "\u041F\u0440\u043E\u0433\u0440\u0435\u0441\u0441 % (sensor)",
    remaining: "\u041E\u0441\u0442\u0430\u043B\u043E\u0441\u044C \u0432\u0440\u0435\u043C\u0435\u043D\u0438 (sensor)",
    finish_time: "\u0412\u0440\u0435\u043C\u044F \u043E\u043A\u043E\u043D\u0447\u0430\u043D\u0438\u044F (sensor)",
    wifi: "\u0421\u0438\u0433\u043D\u0430\u043B Wi-Fi (sensor)"
  },
  phases: {
    not_running: "\u041F\u0440\u043E\u0441\u0442\u043E\u0439",
    pre_wash: "\u041F\u0440\u0435\u0434\u0432\u0430\u0440\u0438\u0442\u0435\u043B\u044C\u043D\u0430\u044F \u0441\u0442\u0438\u0440\u043A\u0430",
    soak: "\u0417\u0430\u043C\u0430\u0447\u0438\u0432\u0430\u043D\u0438\u0435",
    main_wash: "\u041E\u0441\u043D\u043E\u0432\u043D\u0430\u044F \u0441\u0442\u0438\u0440\u043A\u0430",
    rinse: "\u041F\u043E\u043B\u043E\u0441\u043A\u0430\u043D\u0438\u0435",
    rinse_hold: "\u041F\u043E\u043B\u043E\u0441\u043A\u0430\u043D\u0438\u0435 (\u043F\u0430\u0443\u0437\u0430)",
    rinses: "\u041F\u043E\u043B\u043E\u0441\u043A\u0430\u043D\u0438\u0435",
    rinse_out_lint: "\u0423\u0434\u0430\u043B\u0435\u043D\u0438\u0435 \u0432\u043E\u0440\u0441\u0430",
    cleaning: "\u041E\u0447\u0438\u0441\u0442\u043A\u0430",
    cooling_down: "\u041E\u0445\u043B\u0430\u0436\u0434\u0435\u043D\u0438\u0435",
    comfort_cooling: "\u041A\u043E\u043C\u0444\u043E\u0440\u0442\u043D\u043E\u0435 \u043E\u0445\u043B\u0430\u0436\u0434\u0435\u043D\u0438\u0435",
    safety_cooling: "\u0417\u0430\u0449\u0438\u0442\u043D\u043E\u0435 \u043E\u0445\u043B\u0430\u0436\u0434\u0435\u043D\u0438\u0435",
    drain: "\u0421\u043B\u0438\u0432",
    spin: "\u041E\u0442\u0436\u0438\u043C",
    thermo_spin: "\u0422\u0435\u0440\u043C\u043E\u043E\u0442\u0436\u0438\u043C",
    anti_crease: "\u0417\u0430\u0449\u0438\u0442\u0430 \u043E\u0442 \u0441\u043C\u0438\u043D\u0430\u043D\u0438\u044F",
    finished: "\u0413\u043E\u0442\u043E\u0432\u043E",
    venting: "\u041F\u0440\u043E\u0432\u0435\u0442\u0440\u0438\u0432\u0430\u043D\u0438\u0435",
    starch_stop: "\u041F\u0430\u0443\u0437\u0430 \u0434\u043B\u044F \u043A\u0440\u0430\u0445\u043C\u0430\u043B\u0435\u043D\u0438\u044F",
    freshen_up_and_moisten: "\u041E\u0441\u0432\u0435\u0436\u0435\u043D\u0438\u0435",
    steam_smoothing: "\u041F\u0430\u0440\u043E\u0432\u043E\u0435 \u0440\u0430\u0437\u0433\u043B\u0430\u0436\u0438\u0432\u0430\u043D\u0438\u0435",
    smoothing: "\u0420\u0430\u0437\u0433\u043B\u0430\u0436\u0438\u0432\u0430\u043D\u0438\u0435",
    hygiene: "\u0413\u0438\u0433\u0438\u0435\u043D\u0430",
    drying: "\u0421\u0443\u0448\u043A\u0430",
    disinfecting: "\u0414\u0435\u0437\u0438\u043D\u0444\u0435\u043A\u0446\u0438\u044F",
    automatic_start: "\u0410\u0432\u0442\u043E\u0441\u0442\u0430\u0440\u0442",
    flex_load_active: "FlexLoad",
    program_running: "\u0412\u044B\u043F\u043E\u043B\u043D\u044F\u0435\u0442\u0441\u044F",
    machine_iron: "\u041C\u0430\u0448\u0438\u043D\u043D\u0430\u044F \u0433\u043B\u0430\u0436\u043A\u0430",
    hand_iron: "\u041F\u043E\u0434 \u0433\u043B\u0430\u0436\u043A\u0443",
    hand_iron_1: "\u041F\u043E\u0434 \u0433\u043B\u0430\u0436\u043A\u0443+",
    hand_iron_2: "\u041B\u0451\u0433\u043A\u0430\u044F \u0433\u043B\u0430\u0436\u043A\u0430",
    normal: "\u041E\u0431\u044B\u0447\u043D\u0430\u044F \u0441\u0443\u0448\u043A\u0430",
    normal_plus: "\u041E\u0431\u044B\u0447\u043D\u0430\u044F \u0441\u0443\u0448\u043A\u0430+",
    extra_dry: "\u042D\u043A\u0441\u0442\u0440\u0430 \u0441\u0443\u0445\u043E",
    moisten: "\u0423\u0432\u043B\u0430\u0436\u043D\u0435\u043D\u0438\u0435",
    timed_drying: "\u0421\u0443\u0448\u043A\u0430 \u043F\u043E \u0432\u0440\u0435\u043C\u0435\u043D\u0438",
    warm_air: "\u0422\u0451\u043F\u043B\u044B\u0439 \u043E\u0431\u0434\u0443\u0432",
    slightly_dry: "\u0421\u043B\u0435\u0433\u043A\u0430 \u0432\u043B\u0430\u0436\u043D\u043E"
  }
};

// src/i18n/index.js
var LANGUAGES = { en: en_default, ru: ru_default };
var DEFAULT_LANGUAGE = "en";
function resolveLanguage(configLang, hass) {
  const pick = (code) => {
    if (!code) return null;
    const short = String(code).toLowerCase().split(/[-_]/)[0];
    return LANGUAGES[short] ? short : null;
  };
  return pick(configLang) || pick(hass && (hass.locale?.language || hass.language)) || DEFAULT_LANGUAGE;
}
function lookup(dict, path) {
  return path.split(".").reduce((o, k) => o == null ? void 0 : o[k], dict);
}
function makeTranslator(lang) {
  const dict = LANGUAGES[lang] || LANGUAGES[DEFAULT_LANGUAGE];
  const fallback = LANGUAGES[DEFAULT_LANGUAGE];
  return (path) => lookup(dict, path) ?? lookup(fallback, path) ?? path;
}
function phaseLabel(t, key) {
  if (!key || key === "unknown" || key === "off" || key === "on") return null;
  const label = t(`phases.${key}`);
  return label === `phases.${key}` ? key.replace(/_/g, " ") : label;
}

// src/card.js
function pad2(n) {
  return String(n).padStart(2, "0");
}
var MieleApplianceCard = class extends HTMLElement {
  setConfig(config) {
    if (!config.prefix && !config.entities) {
      throw new Error("miele-appliance-card: set `prefix` (or an explicit `entities` map)");
    }
    const appliance = config.appliance === "dryer" ? "dryer" : "washer";
    const p = config.prefix;
    const defaults = p ? {
      status: `sensor.${p}_status`,
      phase: `sensor.${p}_program_phase`,
      progress: `sensor.${p}_progress`,
      remaining: `sensor.${p}_remaining`,
      finish_time: `sensor.${p}_finish_time`,
      running: `binary_sensor.${p}_running`,
      failure: `binary_sensor.${p}_failure`,
      door: `binary_sensor.${p}_door`,
      wifi: `sensor.${p}_wifi_signal`
    } : {};
    const overrides = Object.fromEntries(Object.entries(config.entities || {}).filter(([, v]) => v));
    this._config = {
      appliance,
      language: config.language || null,
      entities: { ...defaults, ...overrides }
    };
    this._lang = null;
    this._segments = [];
    this._lastPct = null;
    if (this._built) {
      this._build();
      if (this._hass) this.hass = this._hass;
    }
  }
  getCardSize() {
    return 14;
  }
  static getStubConfig() {
    return { type: "custom:miele-appliance-card", appliance: "washer", prefix: "bathroom_washing_machine" };
  }
  static getConfigElement() {
    return document.createElement("miele-appliance-card-editor");
  }
  set hass(hass) {
    this._hass = hass;
    if (!this._built) this._build();
    const lang = resolveLanguage(this._config.language, hass);
    if (lang !== this._lang) {
      this._lang = lang;
      this._t = makeTranslator(lang);
    }
    this._update();
  }
  connectedCallback() {
    if (this._built) this._startClock();
  }
  disconnectedCallback() {
    this._stopClock();
  }
  _startClock() {
    this._stopClock();
    this._clockTimer = setInterval(() => this._tickClock(), 1e3);
  }
  _stopClock() {
    if (this._clockTimer) clearInterval(this._clockTimer);
    this._clockTimer = null;
  }
  _st(id) {
    const s = this._hass && id ? this._hass.states[id] : void 0;
    return s ? s.state : void 0;
  }
  _num(id) {
    const v = this._st(id);
    const n = v === void 0 ? NaN : parseFloat(v);
    return Number.isFinite(n) ? n : null;
  }
  _build() {
    const root = this.shadowRoot || this.attachShadow({ mode: "open" });
    root.innerHTML = buildTemplate();
    this._root = root;
    this._built = true;
    this._segments = [];
    this._lastPct = null;
    this._startClock();
  }
  // Keeps a trail of {color, start, end} (in %) along the gauge: each phase
  // paints only the stretch of the arc covered while it was running, so an
  // earlier phase's share doesn't repaint when a later one takes over.
  _updateSegments(running, pct, color) {
    if (!running) {
      if (pct === null || pct === 0) this._segments = [];
      this._lastPct = null;
      return;
    }
    const p = pct ?? 0;
    if (this._lastPct === null || p < this._lastPct) {
      this._segments = [{ color, start: 0, end: p }];
    } else {
      const last = this._segments[this._segments.length - 1];
      if (last && last.color === color) {
        last.end = p;
      } else {
        this._segments.push({ color, start: this._lastPct, end: p });
      }
    }
    this._lastPct = p;
  }
  _renderSegments() {
    const g = this._root.getElementById("ring-fill");
    const segs = this._segments;
    while (g.children.length > segs.length) g.removeChild(g.lastChild);
    while (g.children.length < segs.length) {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", RING_D);
      path.setAttribute("class", "ring-seg");
      g.appendChild(path);
    }
    segs.forEach((seg, i) => {
      const el = g.children[i];
      const startLen = RING_ARC_LEN * seg.start / 100;
      const endLen = RING_ARC_LEN * seg.end / 100;
      const segLen = Math.max(0, endLen - startLen);
      el.setAttribute("stroke", seg.color);
      el.setAttribute("stroke-dasharray", `${segLen.toFixed(2)} ${(RING_ARC_LEN - segLen).toFixed(2)}`);
      el.setAttribute("stroke-dashoffset", `${(-startLen).toFixed(2)}`);
    });
  }
  _finishMs(iso) {
    if (!iso || iso === "unknown" || iso === "unavailable") return null;
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? null : d.getTime();
  }
  _tickClock() {
    const root = this._root;
    if (!root) return;
    const el = root.getElementById("screen-clock");
    if (!this._running || this._targetMs == null) {
      el.innerHTML = "";
      return;
    }
    const totalSec = Math.max(0, Math.round((this._targetMs - Date.now()) / 1e3));
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor(totalSec % 3600 / 60);
    const s = totalSec % 60;
    el.innerHTML = h > 0 ? `${h}<span class="colon">:</span>${pad2(m)}<span class="colon">:</span>${pad2(s)}` : `${m}<span class="colon">:</span>${pad2(s)}`;
  }
  _setTip(id, text) {
    this._root.getElementById(`tip-${id}`).textContent = text;
  }
  _update() {
    if (!this._hass) return;
    const e = this._config.entities;
    const root = this._root;
    const t = this._t;
    const running = this._st(e.running) === "on";
    const failure = this._st(e.failure) === "on";
    const progress = this._num(e.progress);
    const status = this._st(e.status);
    const phase = this._st(e.phase);
    const remaining = this._num(e.remaining);
    const finishIso = this._st(e.finish_time);
    const wifi = this._num(e.wifi);
    const doorOpen = this._st(e.door) === "on";
    const isSpinPhase = /spin|drain/.test((phase || "").toLowerCase());
    const isWasher = this._config.appliance !== "dryer";
    const showWater = isWasher && running && !isSpinPhase;
    root.getElementById("water").style.opacity = showWater ? "1" : "0";
    const crosspiece = root.getElementById("crosspiece");
    crosspiece.style.opacity = isWasher ? "1" : "0";
    crosspiece.classList.toggle("spin", isWasher && running);
    crosspiece.classList.toggle("fast", isWasher && running && isSpinPhase);
    const drum = root.getElementById("drum");
    drum.style.opacity = isWasher ? "0" : "1";
    drum.classList.toggle("spin", !isWasher && running);
    drum.classList.toggle("dryer", !isWasher);
    const pct = progress === null ? null : Math.max(0, Math.min(100, progress));
    let stateColor = "var(--disabled-text-color, #5a5a60)";
    if (failure) stateColor = "var(--error-color, #e05555)";
    else if (running) stateColor = phaseColor(phase) || "var(--primary-color, #26a69a)";
    else if (pct === 100) stateColor = "var(--success-color, #4caf50)";
    const idle = !running && !failure && pct !== 100;
    const ringTrack = root.getElementById("ring-track");
    ringTrack.style.stroke = stateColor;
    ringTrack.style.opacity = idle ? "0" : "";
    if (running) {
      this._updateSegments(true, pct, stateColor);
    } else if (failure) {
      this._segments = [{ color: stateColor, start: 0, end: pct ?? 0 }];
      this._lastPct = null;
    } else if (pct === 100) {
      this._segments = [{ color: stateColor, start: 0, end: 100 }];
      this._lastPct = null;
    } else {
      this._updateSegments(false, pct, stateColor);
    }
    this._renderSegments();
    const label = failure ? t("ui.failure") : phaseLabel(t, phase) || phaseLabel(t, status) || "";
    const line1 = root.getElementById("screen-line1");
    line1.textContent = label;
    line1.classList.toggle("failure", failure);
    root.getElementById("screen-clock").classList.toggle("failure", failure);
    this._running = running;
    this._targetMs = running ? this._finishMs(finishIso) ?? (remaining !== null ? Date.now() + remaining * 6e4 : null) : null;
    this._tickClock();
    const dotColor = (ok, warn) => ok ? "#4caf50" : warn ? "#e0922b" : "#5a5a60";
    root.getElementById("ind-wifi").setAttribute(
      "fill",
      wifi === null ? "#5a5a60" : wifi > 55 ? "#4caf50" : wifi > 25 ? "#e0922b" : "#e05555"
    );
    root.getElementById("ind-door").setAttribute("fill", dotColor(!doorOpen, doorOpen));
    root.getElementById("ind-fault").setAttribute("fill", failure ? "#e05555" : running ? "#4caf50" : "#5a5a60");
    root.getElementById("ind-power").style.stroke = running ? "var(--success-color, #4caf50)" : "var(--error-color, #e05555)";
    const wifiUnit = this._hass.states[e.wifi]?.attributes?.unit_of_measurement || "";
    this._setTip("wifi", wifi === null ? t("tooltips.wifi_unknown") : `${t("tooltips.wifi")}: ${wifi}${wifiUnit ? ` ${wifiUnit}` : ""}`);
    this._setTip("door", doorOpen ? t("tooltips.door_open") : t("tooltips.door_closed"));
    this._setTip("fault", failure ? t("tooltips.fault_error") : t("tooltips.fault_ok"));
    this._setTip("power", `${t("tooltips.power")}: ${running ? t("tooltips.power_running") : t("tooltips.power_idle")}`);
  }
};

// src/editor.js
var ENTITY_FIELDS = [
  { name: "running", domain: "binary_sensor" },
  { name: "failure", domain: "binary_sensor" },
  { name: "door", domain: "binary_sensor" },
  { name: "status", domain: "sensor" },
  { name: "phase", domain: "sensor" },
  { name: "progress", domain: "sensor" },
  { name: "remaining", domain: "sensor" },
  { name: "finish_time", domain: "sensor" },
  { name: "wifi", domain: "sensor" }
];
var MieleApplianceCardEditor = class extends HTMLElement {
  setConfig(config) {
    this._config = config;
    this._render();
  }
  set hass(hass) {
    this._hass = hass;
    this._render();
  }
  connectedCallback() {
    this._render();
  }
  _schema(t) {
    return [
      {
        name: "appliance",
        selector: {
          select: {
            mode: "dropdown",
            options: [
              { value: "washer", label: t("editor.appliance_washer") },
              { value: "dryer", label: t("editor.appliance_dryer") }
            ]
          }
        }
      },
      { name: "prefix", selector: { text: {} } },
      {
        name: "language",
        selector: {
          select: {
            mode: "dropdown",
            options: [
              { value: "", label: t("editor.language_auto") },
              ...Object.entries(LANGUAGES).map(([value, l]) => ({ value, label: l.meta.name }))
            ]
          }
        }
      },
      {
        name: "entities",
        type: "expandable",
        title: t("editor.entities"),
        schema: ENTITY_FIELDS.map(({ name, domain }) => ({
          name,
          selector: { entity: { domain } }
        }))
      }
    ];
  }
  _render() {
    if (!this._hass || !this._config) return;
    if (!this._form) {
      this._form = document.createElement("ha-form");
      this._form.addEventListener("value-changed", (ev) => {
        ev.stopPropagation();
        const value = { ...ev.detail.value };
        if (!value.language) delete value.language;
        this._config = value;
        this.dispatchEvent(
          new CustomEvent("config-changed", { detail: { config: this._config }, bubbles: true, composed: true })
        );
      });
      this.appendChild(this._form);
    }
    const t = makeTranslator(resolveLanguage(this._config.language, this._hass));
    this._form.hass = this._hass;
    this._form.data = { language: "", ...this._config };
    this._form.schema = this._schema(t);
    this._form.computeLabel = (s) => t(`editor.${s.name}`);
  }
};

// src/main.js
customElements.define("miele-appliance-card-editor", MieleApplianceCardEditor);
customElements.define("miele-appliance-card", MieleApplianceCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "miele-appliance-card",
  name: "Miele Appliance Card",
  description: "Washer/dryer card styled after the real appliance panel, with a gauge progress arc, a spinning door hub and an LCD screen showing status and a digital countdown."
});
