import { RING_D, RING_ARC_LEN } from "./geometry.js";
import { buildTemplate } from "./template.js";
import { phaseColor } from "./phase.js";
import { isPoweredOff } from "./display/display.js";
import { createAppliance } from "./appliances/index.js";
import { resolveLanguage, makeTranslator } from "./i18n/index.js";
import { resolveEntities } from "./entities.js";
import { keyAndText, normStatus, normProgram, snake } from "./vocabulary.js";

// A card for a household appliance (washer, dryer, ...). It is not tied to a brand or an
// integration: it asks for a `device` (all its entities are picked up by role), or for a
// `prefix`, or for each entity separately (see entities.js).
export class ApplianceCard extends HTMLElement {
  setConfig(config) {
    if (!config.device && !config.prefix && !(config.entities && Object.keys(config.entities).length)) {
      throw new Error("appliance card: set `device` (or `prefix`, or an `entities` map)");
    }
    const type = config.appliance === "dryer" ? "dryer" : "washer";
    const appliance = createAppliance(type);
    this._appliance = appliance;
    this._entities = null; // resolved against Home Assistant in the `hass` setter
    this._config = {
      type,
      device: config.device || null,
      prefix: config.prefix || null,
      userEntities: config.entities && typeof config.entities === "object" ? config.entities : {},
      language: config.language || null,
      hinge: config.door_hinge === "right" ? "right" : "left",
      debug: config.debug === true,
      // Per-card program name overrides: { program_key: "Shown text" }.
      programNames: config.program_names && typeof config.program_names === "object" ? config.program_names : {},
    };
    this._lang = null;
    this._segments = [];
    this._lastPct = null;
    if (this._built) {
      this._build(); // re-render with the new config
      if (this._hass) this.hass = this._hass;
    }
  }

  getCardSize() {
    return 12;
  }

  static getStubConfig() {
    return { appliance: "washer" };
  }

  static getConfigElement() {
    return document.createElement("home-appliance-card-editor");
  }

  // Entities by role. Resolved again when Home Assistant's entity registry changes.
  _resolve(hass) {
    if (this._entities && this._entitiesRef === hass.entities) return;
    this._entitiesRef = hass.entities;
    this._entities = resolveEntities(
      hass,
      { device: this._config.device, prefix: this._config.prefix, entities: this._config.userEntities },
      this._appliance.entityFields
    );
  }

  set hass(hass) {
    this._hass = hass;
    this._resolve(hass);
    if (!this._built) this._build();
    const lang = resolveLanguage(this._config.language, hass);
    if (lang !== this._lang) {
      this._lang = lang;
      const base = makeTranslator(lang);
      const names = this._config.programNames;
      this._t = (key, ...rest) => {
        if (key.startsWith("programs.")) {
          const o = names[key.slice(9)];
          if (o) return String(o);
          if (this._config.type === "washer") {
            const w = base(`programsWasher.${key.slice(9)}`);
            if (!w.startsWith("programsWasher.")) return w;
          }
        }
        return base(key, ...rest);
      };
      this._display = this._appliance.createDisplay(this._t);
      this._display.attach(this._root);
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
    this._clockTimer = setInterval(() => this._display && this._display.tick(), 1000);
  }

  _stopClock() {
    if (this._clockTimer) clearInterval(this._clockTimer);
    this._clockTimer = null;
  }

  _build() {
    const root = this.shadowRoot || this.attachShadow({ mode: "open" });
    root.innerHTML = buildTemplate({ hinge: this._config.hinge });
    this._root = root;
    this._built = true;
    this._segments = [];
    this._lastPct = null;
    this._lang = null; // forces the display to be re-created and re-attached
    this._startClock();
  }

  // Entity helpers, addressed by role name (`running`, `door`, ...).
  _id(name) {
    return this._entities ? this._entities[name] : undefined;
  }

  _str(name) {
    const s = this._hass.states[this._id(name)];
    return s ? s.state : undefined;
  }

  _num(name) {
    const v = this._str(name);
    const n = v === undefined ? NaN : parseFloat(v);
    return Number.isFinite(n) ? n : null;
  }

  _unit(name) {
    return this._hass.states[this._id(name)]?.attributes?.unit_of_measurement || "";
  }

  _known(name) {
    const v = this._str(name);
    return v === undefined || v === "unknown" || v === "unavailable" ? null : v;
  }

  _ms(name) {
    const v = this._known(name);
    if (!v) return null;
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d.getTime();
  }

  // The card's normalised view of Home Assistant state, shared by the drum,
  // the ring and the LCD.
  _readState() {
    const num = (n) => this._num(n);
    const str = (n) => this._known(n);
    const has = (n) => this._id(n) !== undefined && this._hass.states[this._id(n)] !== undefined;

    // The program and the phase may come as keys (`main_wash`) or as text with the key in an
    // attribute; both end up as a normalised key plus an optional ready-made text.
    const program = keyAndText(this._hass.states[this._id("program_id")], "program_key", normProgram);
    const phase = keyAndText(this._hass.states[this._id("phase")], "phase_key", snake);
    const statusRaw = this._known("status");
    let status = statusRaw ? normStatus(statusRaw) : null;

    // `finished` says the program is over although the appliance still reports itself as in use.
    const finished = this._str("finished") === "on";
    if (finished && (status === "in_use" || !status)) status = "program_ended";
    // Without a `running` entity, "in use and not finished" is the best reading.
    const running = has("running") ? this._str("running") === "on" : status === "in_use" && !finished;

    // A delayed start may come as minutes or as the time it will start.
    let startIn = num("start_in");
    const startMs = this._ms("start_time");
    if (startIn === null && startMs !== null) startIn = Math.max(0, Math.ceil((startMs - Date.now()) / 60000));

    return {
      running,
      failure: this._str("failure") === "on",
      doorOpen: this._str("door") === "on",
      status,
      phase: phase.key,
      phaseText: phase.text,
      progress: num("progress"),
      remaining: num("remaining"),
      elapsed: num("elapsed"),
      startIn,
      finishMs: this._ms("finish_time"),
      wifi: num("wifi"),
      hasWifi: has("wifi"),
      wifiUnit: this._unit("wifi"),
      targetTemp: num("target_temperature"),
      tempUnit: this._unit("target_temperature"),
      programId: program.key,
      programText: program.text,
      debug: this._config.debug,
      programRaw: this._str("program_id"),
      notification: this._str("notification") === "on",
      smartGrid: this._str("smart_grid") === "on",
      mobileStart: this._str("mobile_start") === "on",
      standbyState: str("standby"),
      spinUnit: this._unit("spin_speed"),
      ...this._appliance.readState(num, str),
    };
  }

  // Ring fill in %. Miele often leaves the `progress` sensor at 0 for the whole cycle, so
  // when it does, estimate it from the time left: 1 - left / longest total seen. The total
  // is remembered in localStorage so a page reload mid-cycle keeps the estimate.
  _progressPct(s) {
    const clamp = (v) => Math.max(0, Math.min(100, v));
    const sensor = s.progress === null ? null : clamp(s.progress);
    if (!s.running || s.failure) {
      this._est = null;
      this._storeTotal(null);
      return sensor;
    }
    if (sensor > 0) {
      this._est = null;
      return sensor;
    }
    const now = Date.now();
    const left = s.finishMs != null ? Math.max(0, (s.finishMs - now) / 60000) : s.remaining;
    if (left == null) return sensor;
    if (!this._est) {
      const saved = this._loadTotal();
      this._est = { total: saved && saved.finishMs > now - 120000 ? saved.total : left, pct: 0 };
    }
    const e = this._est;
    e.total = Math.max(e.total, left + (s.elapsed || 0), 1);
    e.pct = Math.max(e.pct, clamp((1 - left / e.total) * 100)); // never moves backwards
    this._storeTotal({ total: e.total, finishMs: s.finishMs ?? now + left * 60000 });
    return Math.round(e.pct * 10) / 10;
  }

  _totalKey() {
    return `home-appliance-card:${this._id("remaining") || this._config.device || this._config.prefix}`;
  }

  _loadTotal() {
    try {
      return JSON.parse(localStorage.getItem(this._totalKey()));
    } catch (_) {
      return null;
    }
  }

  _storeTotal(v) {
    try {
      if (v) localStorage.setItem(this._totalKey(), JSON.stringify(v));
      else localStorage.removeItem(this._totalKey());
    } catch (_) {
      /* storage unavailable: the estimate just restarts after a reload */
    }
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

  _setTip(id, text) {
    this._root.getElementById(`tip-${id}`).textContent = text;
  }

  _update() {
    if (!this._hass) return;
    const root = this._root;
    const t = this._t;
    const s = this._readState();

    // Door: open it and the drum area shows the inside of the drum.
    root.querySelector(".stage").classList.toggle("open", s.doorOpen);

    // Drum, crosspiece and water follow the appliance's own behaviour.
    const view = this._appliance.drumView(s);
    root.getElementById("water").style.opacity = view.water ? "1" : "0";
    root.getElementById("steam").style.opacity = view.steam ? "1" : "0";
    const crosspiece = root.getElementById("crosspiece");
    crosspiece.classList.toggle("spin", view.crosspiece.spin);
    crosspiece.classList.toggle("fast", view.crosspiece.fast);

    // Progress ring.
    const pct = this._progressPct(s);
    let stateColor = "var(--disabled-text-color, #5a5a60)";
    if (s.failure) stateColor = "var(--error-color, #e05555)";
    else if (s.running) stateColor = phaseColor(s.phase) || "var(--primary-color, #26a69a)";
    else if (pct === 100) stateColor = "var(--success-color, #4caf50)";

    const idle = !s.running && !s.failure && pct !== 100;
    const ringTrack = root.getElementById("ring-track");
    ringTrack.style.stroke = stateColor;
    ringTrack.style.opacity = idle ? "0" : "";
    if (s.running) {
      this._updateSegments(true, pct, stateColor);
    } else if (s.failure) {
      this._segments = [{ color: stateColor, start: 0, end: pct ?? 0 }];
      this._lastPct = null;
    } else if (pct === 100) {
      this._segments = [{ color: stateColor, start: 0, end: 100 }];
      this._lastPct = null;
    } else {
      this._updateSegments(false, pct, stateColor);
    }
    this._renderSegments();

    // The LCD, and the power button: green while the machine is on, red while it is off.
    this._display.update(s);
    const off = isPoweredOff(s);
    root.getElementById("ind-power").style.stroke = off
      ? "var(--error-color, #e05555)"
      : "var(--success-color, #4caf50)";
    this._setTip(
      "power",
      `${t("tooltips.power")}: ${off ? t("tooltips.power_off") : s.running ? t("tooltips.power_running") : t("tooltips.power_on")}`
    );
  }
}
