import { phaseLabel } from "../i18n/index.js";
import { lcdPhaseColor } from "../phase.js";
import {
  LCD, text, numWidth, timeMarkup, formatMinutes, withTip,
  wifi, bell, smartGrid, phone, warn,
  spinIcon, thermometer, stopwatch, flag, pill,
} from "./lcd.js";

// Where things sit on the screen (card coordinates; the screen is x 32..194, y 4..34).
const X_LEFT = 38; // left edge of text and chips
const X_TIME = 170.5; // right edge of the big time
const Y_LABEL = 14, Y_CHIPS = 28.4, Y_SUB = 32;
const WIFI_X = 180.2, FLAG_X = 189;

// Statuses where the machine is effectively switched off: the screen goes dark.
const OFF_STATUSES = new Set(["off", "not_connected"]);

// Abstract LCD. It owns everything the washer and the dryer screens share —
// the status line, the big time, elapsed/finish, Wi-Fi, the status icons — and
// asks the concrete display for the appliance-specific chips via `params()`.
//
// `s` is the card's normalised state:
//   running, failure, status, phase, remaining, elapsed, startIn (minutes),
//   finishMs, wifi, wifiUnit, programType, notification, smartGrid, mobileStart,
//   standbyState, plus whatever the concrete display reads (spinSpeed, ...).
export class Display {
  constructor(t) {
    if (new.target === Display) throw new TypeError("Display is abstract");
    this.t = t;
  }

  // Appliance-specific chips along the bottom-left. Return a list of
  // { kind: "spin" | "temp" | "tag", value, unit?, tip }.
  params() {
    throw new Error("Display.params() must be implemented by a concrete display");
  }

  attach(root) {
    this.g = root.getElementById("lcd");
  }

  // What to show for this state: the status line, the big time and how it ticks.
  describe(s) {
    const t = this.t;
    if (OFF_STATUSES.has(s.status) || s.standbyState === "deep_standby") return { standby: true };

    const d = { label: "", color: LCD.white, time: null, timeColor: LCD.white, error: false, showSub: true };
    const phase = phaseLabel(t, s.phase);
    const statusText = this._statusLabel(s.status);

    if (s.failure) {
      Object.assign(d, { label: t("ui.failure"), color: LCD.red, error: true, showSub: false });
    } else if (s.status === "waiting_to_start") {
      Object.assign(d, { label: statusText, color: LCD.amber, timeColor: LCD.amber, time: s.startIn != null ? { min: s.startIn } : null });
    } else if (s.status === "program_ended") {
      Object.assign(d, { label: statusText, color: LCD.green, timeColor: LCD.green, time: { min: 0 } });
    } else if (s.status === "pause") {
      Object.assign(d, { label: statusText, color: LCD.amber, time: s.remaining != null ? { min: s.remaining } : null });
    } else {
      d.label = phase || statusText || "";
      d.color = (s.running && lcdPhaseColor(s.phase)) || (s.running ? LCD.white : LCD.grey);
      if (s.running) {
        const ms = s.finishMs ?? (s.remaining != null ? Date.now() + s.remaining * 60000 : null);
        d.time = ms != null ? { ms } : null;
      } else if (s.remaining) {
        d.time = { min: s.remaining };
      }
    }
    return d;
  }

  _statusLabel(status) {
    if (!status || status === "unknown") return "";
    const key = `statuses.${status}`;
    const v = this.t(key);
    return v === key ? "" : v;
  }

  _programLabel(type) {
    if (!type) return null;
    const key = `program_types.${type}`;
    const v = this.t(key);
    return v === key ? null : v;
  }

  // 3 = strong ... 1 = weak, 0 = no data. Handles both % and dBm readings.
  _wifiBars(v) {
    if (v == null) return 0;
    if (v < 0) return v > -60 ? 3 : v > -75 ? 2 : 1;
    return v > 55 ? 3 : v > 25 ? 2 : 1;
  }

  // Minutes to display for the time block right now.
  _minutes(time, now = Date.now()) {
    if (!time) return null;
    return time.ms != null ? Math.max(0, Math.ceil((time.ms - now) / 60000)) : time.min;
  }

  render(s) {
    const t = this.t, tip = (k) => t(`tooltips.${k}`);
    const d = this.describe(s);
    this._time = d.time || null;
    if (d.standby) return "";

    let o = "";
    let x = X_LEFT;
    if (d.error) {
      o += warn(41, 11.5, tip("fault"));
      x = 47;
    }
    o += text(x, Y_LABEL, d.label, 5.2, d.color);
    const program = this._programLabel(s.programType);
    if (program && !d.error) o += pill(x + d.label.length * 3.2 + 3, 13.6, program, LCD.cyan).svg;

    if (!d.error) o += this._chips(this.params(s));

    const min = this._minutes(d.time);
    o += `<text id="lcd-time" class="lcd-num" x="${X_TIME}" y="22.4" font-size="18" font-weight="600" fill="${d.timeColor}" text-anchor="end">${
      min == null ? "" : timeMarkup(min, d.timeColor, d.time && d.time.ms != null)
    }</text>`;
    this._lastMin = min;

    if (d.showSub) o += this._sub(s);

    o += wifi(WIFI_X, 14.2, this._wifiBars(s.wifi), s.wifi == null ? tip("wifi_unknown") : `${tip("wifi")}: ${s.wifi}${s.wifiUnit ? ` ${s.wifiUnit}` : ""}`);
    o += bell(FLAG_X, 11.6, s.notification, tip("notification"));
    o += smartGrid(WIFI_X, 26.2, s.smartGrid, tip("smart_grid"));
    o += phone(FLAG_X, 22.4, s.mobileStart, tip("mobile_start"));
    return o;
  }

  _chips(params) {
    let o = "", x = X_LEFT;
    for (const p of params) {
      if (p.kind === "tag") {
        o += withTip(text(x, Y_CHIPS + 0.3, p.value, 3.4, LCD.lilac), p.tip, [x - 1, Y_CHIPS - 5, p.value.length * 2.1 + 3, 8]);
        x += p.value.length * 2.1 + 5;
        continue;
      }
      const icon = p.kind === "spin" ? spinIcon(x, 22.4) : thermometer(x, 22.2);
      const off = p.kind === "spin" ? 7 : 6;
      const color = p.kind === "spin" ? LCD.violet : LCD.orange;
      const w = numWidth(p.value, 7.6);
      o += withTip(
        icon + text(x + off, Y_CHIPS, p.value, 7.6, color, { kind: "num", weight: 600 }) + text((x + off + w + 0.8).toFixed(2), Y_CHIPS, p.unit, 2.8, LCD.grey, { weight: 600 }),
        p.tip,
        [x - 1, Y_CHIPS - 7, off + w + 8, 9.5]
      );
      x += off + w + (p.kind === "spin" ? 10 : 7);
    }
    return o;
  }

  // The small line under the time: elapsed on the left, finish time on the right.
  _sub(s) {
    const t = this.t;
    let o = "";
    if (s.elapsed != null) {
      const str = formatMinutes(s.elapsed);
      o += withTip(
        stopwatch(123, 27.4) + text(129.5, Y_SUB, str, 5, LCD.grey, { kind: "num", weight: 600 }),
        t("tooltips.elapsed"),
        [122, 26.5, 8 + numWidth(str, 5), 7.5]
      );
    }
    if (s.finishMs != null && s.status !== "program_ended") {
      const str = new Date(s.finishMs).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
      const w = numWidth(str, 5);
      o += withTip(
        flag(X_TIME - w - 5.6, 27.4) + text(X_TIME, Y_SUB, str, 5, LCD.green, { kind: "num", weight: 600, anchor: "end" }),
        t("tooltips.finish"),
        [X_TIME - w - 6.5, 26.5, w + 7, 7.5]
      );
    }
    return o;
  }

  update(s) {
    if (!this.g) return;
    this.g.innerHTML = this.render(s);
  }

  // Called every second: only the time text can change between state updates.
  tick() {
    if (!this.g || !this._time) return;
    const min = this._minutes(this._time);
    if (min === this._lastMin) return;
    this._lastMin = min;
    const el = this.g.querySelector("#lcd-time");
    if (el) el.innerHTML = timeMarkup(min, el.getAttribute("fill"), this._time.ms != null);
  }
}
