import { Appliance } from "./appliance.js";
import { WasherDisplay } from "../display/washer-display.js";

export class Washer extends Appliance {
  get extraEntities() {
    return [{ name: "spin_speed", domain: "sensor", suffix: "spin_speed" }];
  }

  createDisplay(t) {
    return new WasherDisplay(t);
  }

  // The crosspiece itself stands in for the drum: it turns slowly under the
  // water while washing, then fast and bare once spin kicks the water out.
  drumView({ running, doorOpen, phase }) {
    const turning = running && !doorOpen; // an open door means nothing turns
    const spinPhase = /spin|drain/.test((phase || "").toLowerCase());
    return {
      water: turning && !spinPhase,
      crosspiece: { visible: true, spin: turning, fast: turning && spinPhase },
      drum: { visible: false, spin: false, tumble: false },
    };
  }

  readState(num) {
    return { spinSpeed: num("spin_speed") };
  }
}
