import { RING_D, RING_ARC_LEN } from "./geometry.js";
import { buildTemplate } from "./template.js";
import { phaseColor } from "./phase.js";
import { resolveLanguage, makeTranslator, phaseLabel } from "./i18n/index.js";

function pad2(n) {
  return String(n).padStart(2, "0");
}

export class MieleApplianceCard extends HTMLElement {
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
      language: config.language || null,
      entities: { ...defaults, ...overrides },
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
    this._clockTimer = setInterval(() => this._tickClock(), 1000);
  }

  _stopClock() {
    if (this._clockTimer) clearInterval(this._clockTimer);
    this._clockTimer = null;
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
    this._targetMs = running
      ? this._finishMs(finishIso) ?? (remaining !== null ? Date.now() + remaining * 60000 : null)
      : null;
    this._tickClock();

    // Status indicators (colour + hover tooltip).
    const dotColor = (ok, warn) => (ok ? "#4caf50" : warn ? "#e0922b" : "#5a5a60");
    root.getElementById("ind-wifi").setAttribute(
      "fill",
      wifi === null ? "#5a5a60" : wifi > 55 ? "#4caf50" : wifi > 25 ? "#e0922b" : "#e05555"
    );
    root.getElementById("ind-door").setAttribute("fill", dotColor(!doorOpen, doorOpen));
    root.getElementById("ind-fault").setAttribute("fill", failure ? "#e05555" : running ? "#4caf50" : "#5a5a60");
    root.getElementById("ind-power").style.stroke = running
      ? "var(--success-color, #4caf50)"
      : "var(--error-color, #e05555)";

    const wifiUnit = this._hass.states[e.wifi]?.attributes?.unit_of_measurement || "";
    this._setTip("wifi", wifi === null ? t("tooltips.wifi_unknown") : `${t("tooltips.wifi")}: ${wifi}${wifiUnit ? ` ${wifiUnit}` : ""}`);
    this._setTip("door", doorOpen ? t("tooltips.door_open") : t("tooltips.door_closed"));
    this._setTip("fault", failure ? t("tooltips.fault_error") : t("tooltips.fault_ok"));
    this._setTip("power", `${t("tooltips.power")}: ${running ? t("tooltips.power_running") : t("tooltips.power_idle")}`);
  }
}
