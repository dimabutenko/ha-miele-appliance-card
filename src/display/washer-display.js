import { Display } from "./display.js";

// The washer's screen: spin speed and temperature.
export class WasherDisplay extends Display {
  params(s) {
    const t = this.t, out = [];
    if (s.spinSpeed != null) out.push({ kind: "spin", value: String(Math.round(s.spinSpeed)), unit: s.spinUnit || "rpm", tip: t("tooltips.spin") });
    if (s.targetTemp != null) out.push({ kind: "temp", value: String(Math.round(s.targetTemp)), unit: s.tempUnit || "°C", tip: t("tooltips.temperature") });
    return out;
  }
}
