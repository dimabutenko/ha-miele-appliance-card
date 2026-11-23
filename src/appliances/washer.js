import { Appliance } from "./appliance.js";
import { WasherDisplay } from "../display/washer-display.js";

export class Washer extends Appliance {
  get extraEntities() {
    return [{ name: "spin_speed", domain: "sensor", suffix: "spin_speed" }];
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

  readState(num) {
    return { spinSpeed: num("spin_speed") };
  }
}
