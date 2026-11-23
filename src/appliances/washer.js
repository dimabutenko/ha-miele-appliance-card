import { Appliance } from "./appliance.js";
import { WasherDisplay } from "../display/washer-display.js";

export class Washer extends Appliance {
  get extraEntities() {
    return [
      { name: "spin_speed", domain: "sensor", suffix: "spin_speed" },
      // TwinDos: two bottles, each with a fill level, the dose this wash takes and an "empty" flag
      { name: "twindos_1_level", domain: "sensor", suffix: "twindos_1_level" },
      { name: "twindos_2_level", domain: "sensor", suffix: "twindos_2_level" },
      { name: "twindos_1_dosage", domain: "sensor", suffix: "twindos_1_dosage" },
      { name: "twindos_2_dosage", domain: "sensor", suffix: "twindos_2_dosage" },
      { name: "twindos_1_empty", domain: "binary_sensor", suffix: "twindos_1_empty" },
      { name: "twindos_2_empty", domain: "binary_sensor", suffix: "twindos_2_empty" },
    ];
  }

  createDisplay(t) {
    return new WasherDisplay(t);
  }

  // The crosspiece turns slowly under the water while washing, then fast and
  // bare once spin kicks the water out.
  drumView({ running, doorOpen, phase }) {
    const turning = running && !doorOpen; // an open door means nothing turns
    const spinPhase = /spin|drain/.test((phase || "").toLowerCase());
    return {
      water: turning && !spinPhase,
      steam: false,
      crosspiece: { spin: turning, fast: turning && spinPhase },
    };
  }

  readState(num, str) {
    return {
      spinSpeed: num("spin_speed"),
      twindos: [1, 2].map((i) => ({
        level: num(`twindos_${i}_level`),
        dosage: num(`twindos_${i}_dosage`),
        empty: str(`twindos_${i}_empty`) === "on",
      })),
    };
  }
}
