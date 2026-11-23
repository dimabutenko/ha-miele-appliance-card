import { Display } from "./display.js";
import { phaseLabel } from "../i18n/index.js";

// The dryer's screen: the drying step (dryness level) and temperature. A dryer
// has no spin speed.
export class DryerDisplay extends Display {
  params(s) {
    const t = this.t, out = [];
    const step = s.dryingStep && s.dryingStep !== "unknown" ? phaseLabel(t, s.dryingStep) : null;
    if (step) out.push({ kind: "tag", value: step, tip: t("tooltips.drying_step") });
    if (s.targetTemp != null) out.push({ kind: "temp", value: String(Math.round(s.targetTemp)), unit: s.tempUnit || "°C", tip: t("tooltips.temperature") });
    return out;
  }
}
