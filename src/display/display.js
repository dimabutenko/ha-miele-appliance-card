import { phaseLabel } from "../i18n/index.js";
import { lcdPhaseColor } from "../phase.js";
import { programThumb } from "./program-icons.js";
import {
  LCD, text, clockText, numWidth, timeMarkup, formatMinutes, withTip, scaled,
  wifi, bell, smartGrid, phone, warn, statusTile, dropTile, dropIcon, divider,
  spinIcon, thermometer, stopwatch, flag, valueColor,
} from "./lcd.js";

// Where things sit on the screen (card coordinates; the screen is x 32..194, y 5..45).
const L = {
  left: 38, // left edge of the text
  right: 191, // right edge of the time and of the bottom row
  title: { y: 18.8, size: 7.8, maxX: 150 }, // line 1: the program (stops before the tiles)
  phase: { y: 27.4, size: 5.8, maxX: 146 }, // line 2: the phase
  time: { y: 33.4, size: 20 },
  row: { y: 41.8, size: 6.4, minSize: 5.2, gap: 6 }, // bottom row: chips separated by thin vertical bars
  tiles: { y: 11.6, right: 187.6, pitch: 8.8 }, // status tiles above the time, right-aligned
};
const LOW_LEVEL = 20; // a TwinDos bottle at or below this fill level (%) counts as low

// Statuses where the machine is effectively switched off: the screen goes dark.
const OFF_STATUSES = new Set(["off", "not_connected"]);

// Which status glyph goes with which machine status.
const STATUS_ICON = {
  in_use: "play",
  pause: "pause",
  rinse_hold: "pause",
  waiting_to_start: "wait",
  program_ended: "done",
};

// True when the machine is switched off or in deep standby. The LCD is dark
// then, and the power button is red.
export function isPoweredOff(s) {
  return OFF_STATUSES.has(s.status) || s.standbyState === "deep_standby";
}

// Abstract LCD. It owns everything the washer and the dryer screens share and
// asks the concrete display for the appliance-specific chips via `params()`.
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

  // What to show for this state: the two text lines, the big time and how it ticks.
  describe(s) {
    const t = this.t;
    if (isPoweredOff(s)) return { standby: true };

    const program = this._programName(s.programId);
    const phase = phaseLabel(t, s.phase);
    const statusText = this._statusLabel(s.status);
    const d = { title: "", phase: "", color: LCD.white, time: null, timeColor: LCD.white, error: false, showRow: true, icon: STATUS_ICON[s.status] || null, blink: false };
    // Line 1 is the program when it is known, otherwise the state itself; line 2 is the state.
    const lines = (state) => {
      d.title = program || state || "";
      d.phase = program ? state || "" : "";
    };

    if (s.failure) {
      Object.assign(d, { title: t("ui.failure"), color: LCD.red, error: true, showRow: false, icon: null });
    } else if (s.status === "waiting_to_start") {
      lines(statusText);
      Object.assign(d, { color: LCD.amber, timeColor: LCD.amber, time: s.startIn != null ? { min: s.startIn } : null });
    } else if (s.status === "program_ended") {
      lines(statusText);
      Object.assign(d, { color: LCD.green, timeColor: LCD.green, time: { min: 0 } });
    } else if (s.status === "pause") {
      lines(statusText);
      Object.assign(d, { color: LCD.amber, time: s.remaining != null ? { min: s.remaining } : null });
    } else {
      lines(phase || statusText);
      d.color = (s.running && lcdPhaseColor(s.phase)) || (s.running ? LCD.white : LCD.grey);
      if (s.running) {
        const ms = s.finishMs ?? (s.remaining != null ? Date.now() + s.remaining * 60000 : null);
        d.time = ms != null ? { ms } : null;
        d.blink = true; // the current phase pulses while the program runs
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

  // "cottons" -> "Cottons". (Translated names come from the locale files.)
  _programName(key) {
    if (!key || key === "no_program" || key === "unknown") return "";
    const k = `programs.${key}`;
    const v = this.t(k);
    if (v !== k) return v;
    const w = String(key).replace(/_/g, " ");
    return w.charAt(0).toUpperCase() + w.slice(1);
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

  // Fit a line into the room it has: shrink the font a little, then cut with an ellipsis.
  _fit(str, size, room, minSize) {
    const w = (n) => str.length * n * 0.6;
    if (w(size) <= room) return { str, size };
    const shrunk = Math.max(minSize, room / (str.length * 0.6));
    if (w(shrunk) <= room) return { str, size: shrunk };
    const max = Math.max(1, Math.floor(room / (minSize * 0.6)) - 1);
    return { str: str.slice(0, max) + "…", size: minSize };
  }

  // The status tiles: only those that have something to say are drawn, packed
  // against the right edge. Each entry draws itself at a tile centre.
  _tiles(s, d) {
    const t = this.t, tip = (k) => t(`tooltips.${k}`);
    const out = [];
    if (d.icon) out.push((cx, cy) => statusTile(d.icon, cx, cy, d.color, this._statusLabel(s.status) || tip("status")));
    (s.twindos || []).forEach((c, i) => {
      const empty = c.empty, low = !empty && c.level != null && c.level <= LOW_LEVEL;
      if (!empty && !low) return;
      const what = empty ? tip("twindos_empty") : `${tip("twindos_low")} (${c.level} %)`;
      out.push((cx, cy) => dropTile(i + 1, cx, cy, empty ? LCD.red : LCD.amber, `${tip("twindos")} ${i + 1}: ${what}`));
    });
    const wifiTip = s.wifi == null ? tip("wifi_unknown") : `${tip("wifi")}: ${s.wifi}${s.wifiUnit ? ` ${s.wifiUnit}` : ""}`;
    out.push((cx, cy) => wifi(cx, cy, this._wifiBars(s.wifi), wifiTip));
    if (s.notification) out.push((cx, cy) => bell(cx, cy, true, tip("notification")));
    if (s.smartGrid) out.push((cx, cy) => smartGrid(cx, cy, true, tip("smart_grid")));
    if (s.mobileStart) out.push((cx, cy) => phone(cx, cy, true, tip("mobile_start")));
    return out;
  }

  render(s) {
    const t = this.t, tip = (k) => t(`tooltips.${k}`);
    const d = this.describe(s);
    this._time = d.time || null;
    if (d.standby) return "";

    const tiles = this._tiles(s, d);
    const tilesLeft = L.tiles.right - (tiles.length - 1) * L.tiles.pitch - 4.6;

    let o = "";
    let x = L.left;
    if (d.error) {
      o += warn(41.5, L.title.y - 3.4, tip("fault"));
      x = 49;
    }

    // The program thumbnail sits in front of the two text lines.
    const thumb = !d.error && s.programId ? programThumb(s.programId, x, 12.6, 16.6) : "";
    if (thumb) {
      o += thumb;
      x += 20;
    }

    // Line 1: the program (or the state).
    const title = this._fit(d.title, L.title.size, Math.min(L.title.maxX, tilesLeft - 3) - x, 6);
    o += text(x, L.title.y, title.str, title.size, d.color);

    // Line 2: the phase; it pulses while the program runs.
    if (d.phase) {
      const ph = this._fit(d.phase, L.phase.size, L.phase.maxX - x, 4.6);
      o += `<g class="${d.blink ? "lcd-pulse" : ""}">${text(x, L.phase.y, ph.str, ph.size, d.color === LCD.white ? "#b8c4d6" : d.color, { kind: "num", weight: 500 })}</g>`;
    }

    const min = this._minutes(d.time);
    o += `<text id="lcd-time" class="lcd-num" x="${L.right}" y="${L.time.y}" font-size="${L.time.size}" font-weight="600" fill="${d.timeColor}" text-anchor="end">${
      min == null ? "" : timeMarkup(min, d.timeColor, d.time && d.time.ms != null)
    }</text>`;
    this._lastMin = min;

    if (d.showRow) o += this._row(s, this.params(s));

    tiles.forEach((draw, i) => {
      o += draw(L.tiles.right - (tiles.length - 1 - i) * L.tiles.pitch, L.tiles.y);
    });
    return o;
  }

  // ---- the bottom row: groups separated by thin vertical bars ---------------
  // Each group is { w, draw(x) } for a given font size; the row shrinks the size
  // a little when everything does not fit.

  _chip(p, size) {
    const y = L.row.y, k = size / L.row.size;
    if (p.kind === "tag") {
      const w = p.value.length * size * 0.5;
      return { w, draw: (x) => withTip(text(x, y, p.value, size * 0.84, LCD.lilac, { kind: "num", weight: 600 }), p.tip, [x - 1, y - 6.5, w + 2, 9]) };
    }
    const spin = p.kind === "spin";
    const color = valueColor(spin ? "spin" : "temp", Number(p.value));
    const off = (spin ? 6.8 : 5.6) * k, vw = numWidth(p.value, size), uw = p.unit.length * 3.0 * k * 0.62 + 0.7;
    const w = off + vw + uw;
    return {
      w,
      draw: (x) => {
        const iy = y - (spin ? 5.1 : 5.0) * k;
        const icon = spin ? scaled(spinIcon(x, iy, color), x, iy, k) : scaled(thermometer(x, iy, color), x, iy, 0.8 * k);
        return withTip(
          icon + text(x + off, y, p.value, size, color, { kind: "num", weight: 600 }) + text((x + off + vw + 0.7).toFixed(2), y, p.unit, 3.0 * k, LCD.grey, { weight: 600 }),
          p.tip, [x - 1, y - 7, w + 2, 9.5]
        );
      },
    };
  }

  // One TwinDos bottle: a drop and how many ml this wash takes from it.
  _twindosChip(i, c, size) {
    const t = this.t, y = L.row.y, k = size / L.row.size;
    const color = i === 0 ? LCD.cyan : LCD.lilac;
    const val = String(Math.round(c.dosage));
    const vw = numWidth(val, size), off = 5.5 * k, uw = 2 * 3.0 * k * 0.62 + 0.7;
    const w = off + vw + uw;
    const tip = `${t("tooltips.twindos")} ${i + 1}: ${val} ml${c.level != null ? ` (${c.level} %)` : ""}`;
    return {
      w,
      draw: (x) => withTip(
        scaled(dropIcon(x, y - 5.5 * k, color, i + 1), x, y - 5.5 * k, k) + text(x + off, y, val, size, color, { kind: "num", weight: 600 }) + text((x + off + vw + 0.7).toFixed(2), y, "ml", 3.0 * k, LCD.grey, { weight: 600 }),
        tip, [x - 1, y - 7, w + 2, 9.5]
      ),
    };
  }

  _timeChip(kind, str, size) {
    const t = this.t, y = L.row.y, k = size / L.row.size;
    const off = (kind === "elapsed" ? 6.6 : 6.4) * k, vw = numWidth(str, size), w = off + vw;
    return {
      w,
      draw: (x) => withTip(
        (kind === "elapsed" ? stopwatch(x, y - 5.1 * k) : flag(x, y - 5.1 * k)) + clockText(x + w, y, str, size, kind === "elapsed" ? LCD.grey : LCD.green, { anchor: "end" }),
        t(kind === "elapsed" ? "tooltips.elapsed" : "tooltips.finish"), [x - 1, y - 7, w + 2, 9.5]
      ),
    };
  }

  _row(s, params) {
    const { gap, minSize } = L.row;
    const finishStr = s.finishMs != null && s.status !== "program_ended" && !s.failure
      ? new Date(s.finishMs).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }) : null;
    const dosing = (s.twindos || []).map((c, i) => [i, c]).filter(([, c]) => c.dosage != null && c.dosage > 0);

    // One sequence of groups, packed from the left edge.
    const build = (size) => [
      ...params.map((p) => this._chip(p, size)),
      ...dosing.map(([i, c]) => this._twindosChip(i, c, size)),
      ...(s.elapsed != null ? [this._timeChip("elapsed", formatMinutes(s.elapsed), size)] : []),
      ...(finishStr ? [this._timeChip("finish", finishStr, size)] : []),
    ];
    const total = (gs) => gs.reduce((a, c) => a + c.w, 0) + gap * Math.max(0, gs.length - 1);
    let size = L.row.size, gs = build(size);
    while (total(gs) > L.right - L.left && size > minSize) {
      size = Math.max(minSize, size - 0.2);
      gs = build(size);
    }
    const y = L.row.y;
    let x = L.left;
    let o = "";
    gs.forEach((c, i) => {
      o += c.draw(x);
      x += c.w;
      if (i < gs.length - 1) o += divider(x + gap / 2, y);
      x += gap;
    });
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
