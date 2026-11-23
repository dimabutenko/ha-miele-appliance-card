import { Appliance } from "./appliance.js";
import { DryerDisplay } from "../display/dryer-display.js";

export class Dryer extends Appliance {
  get extraEntities() {
    return [{ name: "drying_step", domain: "sensor", suffix: "drying_step" }];
  }

  createDisplay(t) {
    return new DryerDisplay(t);
  }

  // No crosspiece, no water: just the plain drum tumbling back and forth.
  drumView({ running, doorOpen }) {
    return {
      water: false,
      crosspiece: { visible: false, spin: false, fast: false },
      drum: { visible: !doorOpen, spin: running && !doorOpen, tumble: true },
    };
  }

  readState(num, str) {
    return { dryingStep: str("drying_step") };
  }
}
