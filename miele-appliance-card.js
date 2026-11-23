// Miele appliance card — washer/dryer styled after the real appliance's own
// front panel: a tall white body, a dark control strip flush with the top
// with a built-in LCD screen, and a large dark porthole door with a metal
// rim. A gauge-style progress arc wraps the door (open at the bottom,
// 7 o'clock to 5 o'clock), the door's hub spins while a cycle runs, and the
// screen shows the translated phase plus a digital countdown clock.
// Vanilla custom element, no build step, no external libraries, no brand
// marks (no "Miele"/model badges) — shape only.
//
// Config:
//   type: custom:miele-appliance-card
//   appliance: washer | dryer     # picks the silhouette
//   prefix: bathroom_washing_machine   # entity_id prefix shared by this device's entities
//   name: Стиральная машина        # optional, defaults to appliance-based label
//   entities:                      # optional, overrides the by-convention ids below
//     status, phase, progress, remaining, finish_time, running, failure, door, wifi

// --- layout geometry (viewBox 0 0 200 300) ---
const BODY_X = 2, BODY_Y = 2, BODY_W = 196, BODY_H = 296;
const BODY_RX = 6;
const BAR_H = 34; // dark control strip, flush with the top of the body
const DOOR_CX = 100, DOOR_CY = 155;
const DOOR_R = 82; // metal rim
const RING_R = 90; // progress gauge, outside the rim
const SWEEP_DEG = 300;
const START_CLOCK_DEG = 210; // 7 o'clock

function clockPoint(cx, cy, r, deg) {
  const rad = (deg * Math.PI) / 180;
  return [cx + r * Math.sin(rad), cy - r * Math.cos(rad)];
}
const [RING_X0, RING_Y0] = clockPoint(DOOR_CX, DOOR_CY, RING_R, START_CLOCK_DEG);
const [RING_X1, RING_Y1] = clockPoint(DOOR_CX, DOOR_CY, RING_R, START_CLOCK_DEG + SWEEP_DEG);
const RING_ARC_LEN = RING_R * ((SWEEP_DEG * Math.PI) / 180);
const RING_D = `M ${RING_X0.toFixed(2)} ${RING_Y0.toFixed(2)} A ${RING_R} ${RING_R} 0 1 1 ${RING_X1.toFixed(2)} ${RING_Y1.toFixed(2)}`;

// The control bar: only its top two corners are rounded (to match the body's own
// top corners); its bottom edge is a plain straight cut, like the real panel.
const BAR_D = `M ${BODY_X + BODY_RX} ${BODY_Y} L ${BODY_X + BODY_W - BODY_RX} ${BODY_Y} A ${BODY_RX} ${BODY_RX} 0 0 1 ${BODY_X + BODY_W} ${BODY_Y + BODY_RX} L ${BODY_X + BODY_W} ${BODY_Y + BAR_H} L ${BODY_X} ${BODY_Y + BAR_H} L ${BODY_X} ${BODY_Y + BODY_RX} A ${BODY_RX} ${BODY_RX} 0 0 1 ${BODY_X + BODY_RX} ${BODY_Y} Z`;

// Screen rect, inside the top bar.
const SCR_X = 84, SCR_Y = 4, SCR_W = 110, SCR_H = 30; // equal 2-unit margin above and below, within BAR_H

// Vent grille, lower-right of the body.
const GRILLE_X0 = 118, GRILLE_X1 = 184, GRILLE_Y0 = 248, GRILLE_LINES = 9, GRILLE_GAP = 5;

// Water inside the drum glass, while a washer runs anything other than spin/drain.
// A real front-loader drum has a visible paddle cross (the "крестовина" / lifters)
// that water gets dragged around by as it turns — not flat side-to-side waves.
const WATER_R = 58; // matches the largest concentric ring, so the two never show at once

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
const RIB_D = ribPetal();

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
const PANEL_HOLES = panelHoles();

// The water itself does NOT spin with the drum — at wash speed it settles as
// a pool at the bottom under gravity, roughly level, while the paddles (which
// do rotate) sweep through and above it, kicking up spray each time one dips
// in. Drawn as a circle segment, but the surface is a choppy line (a handful
// of small bumps), not a perfectly flat one, closed by the drum wall along
// the bottom.
const POOL_SURFACE_Y = 8; // the surface sits this far below the drum's centre, on average
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
const POOL_D = choppyPoolPath();

// Splash droplets where a paddle dips through the pool, clustered near the
// bottom centre — several small dots, each arcing up and fading, repeating
// once per paddle pass (3 paddles share the 4.6s drum rotation).
const SPLASH_PERIOD = 4.6 / 3;
const SPLASHES = [
  { dx: -14, dy: -22, delay: 0, dur: SPLASH_PERIOD, size: 2.2 },
  { dx: -6, dy: -30, delay: 0.06, dur: SPLASH_PERIOD, size: 1.6 },
  { dx: 2, dy: -34, delay: 0.02, dur: SPLASH_PERIOD, size: 2 },
  { dx: 9, dy: -26, delay: 0.1, dur: SPLASH_PERIOD, size: 1.4 },
  { dx: 16, dy: -20, delay: 0.14, dur: SPLASH_PERIOD, size: 1.8 },
  { dx: -2, dy: -18, delay: 0.18, dur: SPLASH_PERIOD, size: 1.3 },
];

// Phase enum keys straight from the integration (enums.py ProgramPhaseWashingMachine /
// ProgramPhaseTumbleDryer), translated so the screen reads like the appliance's own
// display rather than raw snake_case.
const PHASE_LABELS = {
  not_running: "Простой",
  pre_wash: "Предварительная стирка",
  soak: "Замачивание",
  main_wash: "Основная стирка",
  rinse: "Полоскание",
  rinse_hold: "Полоскание (пауза)",
  rinses: "Полоскание",
  rinse_out_lint: "Удаление ворса",
  cleaning: "Очистка",
  cooling_down: "Охлаждение",
  comfort_cooling: "Комфортное охлаждение",
  safety_cooling: "Защитное охлаждение",
  drain: "Слив",
  spin: "Отжим",
  thermo_spin: "Термоотжим",
  anti_crease: "Защита от сминания",
  finished: "Готово",
  venting: "Проветривание",
  starch_stop: "Пауза для крахмаления",
  freshen_up_and_moisten: "Освежение",
  steam_smoothing: "Паровое разглаживание",
  smoothing: "Разглаживание",
  hygiene: "Гигиена",
  drying: "Сушка",
  disinfecting: "Дезинфекция",
  automatic_start: "Автостарт",
  flex_load_active: "FlexLoad",
  program_running: "Выполняется",
  machine_iron: "Машинная глажка",
  hand_iron: "Под глажку",
  hand_iron_1: "Под глажку+",
  hand_iron_2: "Лёгкая глажка",
  normal: "Обычная сушка",
  normal_plus: "Обычная сушка+",
  extra_dry: "Экстра сухо",
  moisten: "Увлажнение",
  timed_drying: "Сушка по времени",
  warm_air: "Тёплый обдув",
  slightly_dry: "Слегка влажно",
};

function pad2(n) {
  return String(n).padStart(2, "0");
}

class MieleApplianceCard extends HTMLElement {
  setConfig(config) {
    if (!config.prefix && !config.entities) {
      throw new Error("miele-appliance-card: set `prefix` (or an explicit `entities` map)");
    }
    const appliance = config.appliance === "dryer" ? "dryer" : "washer";
    const p = config.prefix;
    const defaults = p
      ? {
          status: `sensor.${p}_status`,
          phase: `sensor.${p}_program_phase`,
          progress: `sensor.${p}_progress`,
          remaining: `sensor.${p}_remaining`,
          finish_time: `sensor.${p}_finish_time`,
          running: `binary_sensor.${p}_running`,
          failure: `binary_sensor.${p}_failure`,
          door: `binary_sensor.${p}_door`,
          wifi: `sensor.${p}_wifi_signal`,
        }
      : {};
    // Drop empty/falsy overrides (e.g. a UI entity picker left blank) so they
    // fall back to the prefix-derived default instead of pointing at "".
    const overrides = Object.fromEntries(Object.entries(config.entities || {}).filter(([, v]) => v));
    this._config = {
      appliance,
      name: config.name || (appliance === "dryer" ? "Сушилка" : "Стиральная машина"),
      entities: { ...defaults, ...overrides },
    };
    this._built = false;
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
    if (!this._built) {
      this._build();
      this._built = true;
    }
    this._update();
  }

  disconnectedCallback() {
    if (this._clockTimer) clearInterval(this._clockTimer);
  }

  _st(id) {
    const s = this._hass && id ? this._hass.states[id] : undefined;
    return s ? s.state : undefined;
  }

  _num(id) {
    const v = this._st(id);
    const n = v === undefined ? NaN : parseFloat(v);
    return Number.isFinite(n) ? n : null;
  }

  _phaseColor(phase) {
    if (!phase) return null;
    const p = phase.toLowerCase();
    if (/spin|drain/.test(p)) return "#8a5fd1";
    if (/rinse|venting|freshen/.test(p)) return "#2bb6c9";
    if (/wash/.test(p)) return "#3f7fd1";
    if (/dry|warm_air|moisten|normal|hygiene|disinfect/.test(p)) return "#e0922b";
    if (/iron|smooth|cool|anti_crease|thermo_spin|starch/.test(p)) return "#a37fe0";
    return null;
  }

  _phaseLabel(key) {
    if (!key || key === "unknown" || key === "off" || key === "on") return null;
    return PHASE_LABELS[key] || key.replace(/_/g, " ");
  }

  _build() {
    const root = this.attachShadow({ mode: "open" });
    root.innerHTML = `
      <style>
        :host { display: block; }
        ha-card { padding: 16px; overflow: hidden; }
        .wrap { display: flex; flex-direction: column; align-items: center; gap: 10px; width: 100%; }
        .title { font-size: 1.1em; font-weight: 500; align-self: flex-start; opacity: 0.9; }
        .stage { width: 100%; aspect-ratio: ${BODY_W + 4} / ${BODY_H + 4}; position: relative; container-type: inline-size; }
        svg { width: 100%; height: 100%; overflow: visible; display: block; }
        .body { fill: url(#bodyGrad); stroke: #c7c7c9; stroke-width: 1.5; }
        .bar { fill: #262b33; }
        .vent { stroke: #cfcfcf; stroke-width: 1.4; }
        .grille-frame { fill: none; stroke: #d6d6d7; stroke-width: 1; }
        .pwr-ring { fill: none; stroke: #7d8590; stroke-width: 1.2; }
        .dot { stroke: rgba(0,0,0,0.35); stroke-width: 0.5; transition: fill 0.4s ease; }
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
      </style>
      <ha-card>
        <div class="wrap">
          <div class="title">${this._config.name}</div>
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
              <circle class="dot" id="dot-wifi" cx="16" cy="19" r="3"/>
              <circle class="dot" id="dot-door" cx="27" cy="19" r="3"/>
              <circle class="dot" id="dot-fault" cx="38" cy="19" r="3"/>
              <circle class="pwr-ring" id="pwr-ring" cx="58" cy="19" r="3"/>
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
                ${[0, 120, 240]
                  .map(
                    (deg) => `
                <g transform="rotate(${deg} ${DOOR_CX} ${DOOR_CY})">
                  ${PANEL_HOLES.map((p) => `<circle class="panel-hole" cx="${p[0].toFixed(2)}" cy="${p[1].toFixed(2)}" r="1.1"/>`).join("")}
                </g>
                <path class="rib" d="${RIB_D}" transform="rotate(${deg} ${DOOR_CX} ${DOOR_CY})"/>`
                  )
                  .join("")}
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
              ${Array.from({ length: GRILLE_LINES }, (_, i) =>
                `<line class="vent" x1="${GRILLE_X0}" y1="${GRILLE_Y0 + i * GRILLE_GAP}" x2="${GRILLE_X1}" y2="${GRILLE_Y0 + i * GRILLE_GAP}"/>`
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
    this._root = root;
    this._segments = [];
    this._lastPct = null;
    this._clockTimer = setInterval(() => this._tickClock(), 1000);
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
      const startLen = (RING_ARC_LEN * seg.start) / 100;
      const endLen = (RING_ARC_LEN * seg.end) / 100;
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
    const totalSec = Math.max(0, Math.round((this._targetMs - Date.now()) / 1000));
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    el.innerHTML =
      h > 0
        ? `${h}<span class="colon">:</span>${pad2(m)}<span class="colon">:</span>${pad2(s)}`
        : `${m}<span class="colon">:</span>${pad2(s)}`;
  }

  _update() {
    if (!this._hass) return;
    const e = this._config.entities;
    const root = this._root;

    const running = this._st(e.running) === "on";
    const failure = this._st(e.failure) === "on";
    const progress = this._num(e.progress);
    const status = this._st(e.status);
    const phase = this._st(e.phase);
    const remaining = this._num(e.remaining);
    const finishIso = this._st(e.finish_time);
    const wifi = this._num(e.wifi);
    const doorOpen = this._st(e.door) === "on";

    // Water waves while a washer runs any phase other than spin/drain — the
    // fast concentric-ring spin (below) reads as a visibly different kind of
    // motion for that phase, same as the real machine looks and sounds different.
    const isSpinPhase = /spin|drain/.test((phase || "").toLowerCase());
    const isWasher = this._config.appliance !== "dryer";
    const showWater = isWasher && running && !isSpinPhase;
    root.getElementById("water").style.opacity = showWater ? "1" : "0";

    // Washer: the crosspiece itself stands in for the drum — it turns slowly
    // under the water during wash, then fast and bare once spin kicks the
    // water out. Dryer: no crosspiece graphic, just the plain tumbling drum.
    const crosspiece = root.getElementById("crosspiece");
    crosspiece.style.opacity = isWasher ? "1" : "0";
    crosspiece.classList.toggle("spin", isWasher && running);
    crosspiece.classList.toggle("fast", isWasher && running && isSpinPhase);

    const drum = root.getElementById("drum");
    drum.style.opacity = isWasher ? "0" : "1";
    drum.classList.toggle("spin", !isWasher && running);
    drum.classList.toggle("dryer", !isWasher);

    root.getElementById("pwr-ring").style.stroke = running
      ? "var(--success-color, #4caf50)"
      : "var(--error-color, #e05555)";

    const pct = progress === null ? null : Math.max(0, Math.min(100, progress));
    let stateColor = "var(--disabled-text-color, #5a5a60)";
    if (failure) stateColor = "var(--error-color, #e05555)";
    else if (running) stateColor = this._phaseColor(phase) || "var(--primary-color, #26a69a)";
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

    const label = failure ? "Ошибка" : this._phaseLabel(phase) || this._phaseLabel(status) || "";
    const line1 = root.getElementById("screen-line1");
    line1.textContent = label;
    line1.classList.toggle("failure", failure);
    root.getElementById("screen-clock").classList.toggle("failure", failure);

    this._running = running;
    this._targetMs = running
      ? this._finishMs(finishIso) ?? (remaining !== null ? Date.now() + remaining * 60000 : null)
      : null;
    this._tickClock();

    const dotColor = (ok, warn) => (ok ? "#4caf50" : warn ? "#e0922b" : "#5a5a60");
    root.getElementById("dot-wifi").setAttribute(
      "fill",
      wifi === null ? "#5a5a60" : wifi > 55 ? "#4caf50" : wifi > 25 ? "#e0922b" : "#e05555"
    );
    root.getElementById("dot-door").setAttribute("fill", dotColor(!doorOpen, doorOpen));
    root.getElementById("dot-fault").setAttribute("fill", failure ? "#e05555" : running ? "#4caf50" : "#5a5a60");
  }
}

// UI config editor via HA's own <ha-form> — name/appliance/prefix plus every
// entity override, grouped in a collapsed "Entity overrides" section. Any
// override left empty falls back to the `prefix`-derived default (see
// setConfig below, which drops empty/false entries before merging).
const ENTITY_FIELDS = [
  { name: "running", domain: "binary_sensor" },
  { name: "failure", domain: "binary_sensor" },
  { name: "door", domain: "binary_sensor" },
  { name: "status", domain: "sensor" },
  { name: "phase", domain: "sensor" },
  { name: "progress", domain: "sensor" },
  { name: "remaining", domain: "sensor" },
  { name: "finish_time", domain: "sensor" },
  { name: "wifi", domain: "sensor" },
];
const EDITOR_LABELS = {
  name: "Name",
  appliance: "Appliance",
  prefix: "Entity prefix",
  entities: "Entity overrides (optional)",
  running: "Running (binary_sensor)",
  failure: "Failure (binary_sensor)",
  door: "Door (binary_sensor)",
  status: "Status (sensor)",
  phase: "Program phase (sensor)",
  progress: "Progress % (sensor)",
  remaining: "Remaining time (sensor)",
  finish_time: "Finish time (sensor)",
  wifi: "Wifi signal (sensor)",
};

class MieleApplianceCardEditor extends HTMLElement {
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

  _schema() {
    return [
      { name: "name", selector: { text: {} } },
      {
        name: "appliance",
        selector: {
          select: {
            mode: "dropdown",
            options: [
              { value: "washer", label: "Washer" },
              { value: "dryer", label: "Dryer" },
            ],
          },
        },
      },
      { name: "prefix", selector: { text: {} } },
      {
        name: "entities",
        type: "expandable",
        title: EDITOR_LABELS.entities,
        schema: ENTITY_FIELDS.map(({ name, domain }) => ({
          name,
          selector: { entity: { domain } },
        })),
      },
    ];
  }

  _render() {
    if (!this._hass || !this._config) return;
    if (!this._form) {
      this._form = document.createElement("ha-form");
      this._form.addEventListener("value-changed", (ev) => {
        ev.stopPropagation();
        this._config = ev.detail.value;
        this.dispatchEvent(
          new CustomEvent("config-changed", { detail: { config: this._config }, bubbles: true, composed: true })
        );
      });
      this.appendChild(this._form);
    }
    this._form.hass = this._hass;
    this._form.data = this._config;
    this._form.schema = this._schema();
    this._form.computeLabel = (s) => EDITOR_LABELS[s.name] || s.name;
  }
}
customElements.define("miele-appliance-card-editor", MieleApplianceCardEditor);

customElements.define("miele-appliance-card", MieleApplianceCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "miele-appliance-card",
  name: "Miele Appliance Card",
  description: "Washer/dryer card styled after the real appliance panel, with a gauge progress arc, a spinning door hub and an LCD screen showing status and a digital countdown.",
});
