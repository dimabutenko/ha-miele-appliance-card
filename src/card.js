import { RING_D, RING_ARC_LEN } from "./geometry.js";
import { buildTemplate } from "./template.js";
import { phaseColor } from "./phase.js";
import { isPoweredOff } from "./display/display.js";
import { createAppliance } from "./appliances/index.js";
import { resolveLanguage, makeTranslator } from "./i18n/index.js";

export class MieleApplianceCard extends HTMLElement {
  setConfig(config) {
    if (!config.prefix && !config.entities) {
      throw new Error("miele-appliance-card: set `prefix` (or an explicit `entities` map)");
    }
    const type = config.appliance === "dryer" ? "dryer" : "washer";
    const appliance = createAppliance(type);
    // Drop empty/falsy overrides (e.g. a UI entity picker left blank) so they
    // fall back to the prefix-derived default instead of pointing at "".
    const overrides = Object.fromEntries(Object.entries(config.entities || {}).filter(([, v]) => v));
    this._appliance = appliance;
    this._config = {
      type,
      language: config.language || null,
      hinge: config.door_hinge === "right" ? "right" : "left",
      entities: { ...appliance.defaultEntities(config.prefix), ...overrides },
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
      const base = makeTranslator(lang);
      const names = this._config.programNames;
      this._t = (key, ...rest) => {
        if (key.startsWith("programs.")) {
          const o = names[key.slice(9)];
          if (o) return String(o);
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
    return this._config.entities[name];
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
    return {
      running: this._str("running") === "on",
      failure: this._str("failure") === "on",
      doorOpen: this._str("door") === "on",
      status: this._known("status"),
      phase: this._known("phase"),
      progress: num("progress"),
      remaining: num("remaining"),
      elapsed: num("elapsed"),
      startIn: num("start_in"),
      finishMs: this._ms("finish_time"),
      wifi: num("wifi"),
      wifiUnit: this._unit("wifi"),
      targetTemp: num("target_temperature"),
      tempUnit: this._unit("target_temperature"),
      programId: str("program_id"),
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
    const pct = s.progress === null ? null : Math.max(0, Math.min(100, s.progress));
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
