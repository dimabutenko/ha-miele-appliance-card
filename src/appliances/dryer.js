import { Appliance } from "./appliance.js";
import { DryerDisplay } from "../display/dryer-display.js";

export class Dryer extends Appliance {
  get extraEntities() {
    return [{ name: "drying_step", domain: "sensor", suffix: "drying_step", aliases: ["drying_level"] }];
  }

  createDisplay(t) {
    return new DryerDisplay(t);
  }

  // The same crosspiece drum as the washer, but dry: no water, and steam rises
  // out of the load while it dries.
  drumView({ running, doorOpen }) {
    const turning = running && !doorOpen;
    return {
      water: false,
      steam: turning,
      crosspiece: { spin: turning, fast: false },
    };
  }

  readState(num, str) {
    return { dryingStep: str("drying_step") };
  }
}
