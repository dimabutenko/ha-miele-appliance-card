import { phaseLabel } from "../i18n/index.js";
import { lcdPhaseColor } from "../phase.js";
import {
  LCD, text, numWidth, timeMarkup, formatMinutes, withTip, scaled,
  wifi, bell, smartGrid, phone, warn,
  spinIcon, thermometer, stopwatch, flag, pill,
} from "./lcd.js";

// Where things sit on the screen (card coordinates; the screen is x 32..194, y 5..45).
const L = {
  left: 38, // left edge of text and chips
  timeX: 170.5, // right edge of the big time
  label: { y: 17.6, size: 6.2 },
  time: { y: 29.4, size: 22 },
  chips: { y: 35.4, size: 8.6 }, // baseline of the spin / temperature numbers
  sub: { y: 41.6, size: 5.6, iconY: 36.4 }, // elapsed / finish line
  grid: { wifiX: 180.2, flagX: 189, wifiY: 18.4, bellY: 13.8, sgY: 33.8, phoneY: 29.4 },
};

// Statuses where the machine is effectively switched off: the screen goes dark.
const OFF_STATUSES = new Set(["off", "not_connected"]);

// True when the machine is switched off or in deep standby. The LCD is dark
// then, and the power button is red.
export function isPoweredOff(s) {
  return OFF_STATUSES.has(s.status) || s.standbyState === "deep_standby";
}

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
    if (isPoweredOff(s)) return { standby: true };

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
    let x = L.left;
    if (d.error) {
      o += warn(41.5, L.label.y - 3, tip("fault"));
      x = 49;
    }
    o += text(x, L.label.y, d.label, L.label.size, d.color);
    const program = this._programLabel(s.programType);
    if (program && !d.error) o += pill(x + d.label.length * L.label.size * 0.6 + 3.5, L.label.y - 0.4, program, LCD.cyan, 3.3).svg;

    if (!d.error) o += this._chips(this.params(s));

    const min = this._minutes(d.time);
    o += `<text id="lcd-time" class="lcd-num" x="${L.timeX}" y="${L.time.y}" font-size="${L.time.size}" font-weight="600" fill="${d.timeColor}" text-anchor="end">${
      min == null ? "" : timeMarkup(min, d.timeColor, d.time && d.time.ms != null)
    }</text>`;
    this._lastMin = min;

    if (d.showSub) o += this._sub(s);

    const g = L.grid;
    o += wifi(g.wifiX, g.wifiY, this._wifiBars(s.wifi), s.wifi == null ? tip("wifi_unknown") : `${tip("wifi")}: ${s.wifi}${s.wifiUnit ? ` ${s.wifiUnit}` : ""}`);
    o += bell(g.flagX, g.bellY, s.notification, tip("notification"));
    o += smartGrid(g.wifiX, g.sgY, s.smartGrid, tip("smart_grid"));
    o += phone(g.flagX, g.phoneY, s.mobileStart, tip("mobile_start"));
    return o;
  }

  _chips(params) {
    const { y, size } = L.chips;
    let o = "", x = L.left;
    for (const p of params) {
      if (p.kind === "tag") {
        const w = p.value.length * 2.4;
        o += withTip(text(x, y, p.value, 3.9, LCD.lilac), p.tip, [x - 1, y - 6, w + 3, 9]);
        x += w + 5;
        continue;
      }
      const spin = p.kind === "spin";
      const icon = spin ? scaled(spinIcon(x, y - 6.4), x, y - 6.4, 1.2) : scaled(thermometer(x, y - 6.6), x, y - 6.6, 1.15);
      const off = spin ? 8 : 6.8;
      const w = numWidth(p.value, size);
      o += withTip(
        icon + text(x + off, y, p.value, size, spin ? LCD.violet : LCD.orange, { kind: "num", weight: 600 }) + text((x + off + w + 0.8).toFixed(2), y, p.unit, 3.1, LCD.grey, { weight: 600 }),
        p.tip,
        [x - 1, y - 8, off + w + 9, 11]
      );
      x += off + w + (spin ? 11 : 8);
    }
    return o;
  }

  // The small line under the time: elapsed on the left, finish time on the right.
  _sub(s) {
    const t = this.t, { y, size, iconY } = L.sub;
    let o = "";
    if (s.elapsed != null) {
      const str = formatMinutes(s.elapsed);
      o += withTip(
        stopwatch(123, iconY) + text(130, y, str, size, LCD.grey, { kind: "num", weight: 600 }),
        t("tooltips.elapsed"),
        [122, iconY - 1, 9 + numWidth(str, size), 8]
      );
    }
    if (s.finishMs != null && s.status !== "program_ended") {
      const str = new Date(s.finishMs).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
      const w = numWidth(str, size);
      o += withTip(
        flag(L.timeX - w - 6, iconY) + text(L.timeX, y, str, size, LCD.green, { kind: "num", weight: 600, anchor: "end" }),
        t("tooltips.finish"),
        [L.timeX - w - 7, iconY - 1, w + 8, 8]
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
