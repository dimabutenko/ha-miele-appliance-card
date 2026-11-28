// Abstract appliance model. A concrete appliance (washer, dryer, ...) says which
// roles it has, how its drum behaves and which LCD it carries; the card itself only
// wires Home Assistant state to those pieces. Nothing here is tied to a brand.

// The roles every appliance has. `suffix` is the conventional entity-id tail used with a
// `prefix`; `aliases` are other names integrations give the same kind of entity (matched
// against translation keys and entity-id tails when a `device` is configured).
const COMMON_ENTITIES = [
  { name: "running", domain: "binary_sensor", suffix: "running" },
  // The program is over but the appliance is not released yet (e.g. a dryer in its crease guard).
  { name: "finished", domain: "binary_sensor", suffix: "finished", aliases: ["program_finished"] },
  { name: "failure", domain: "binary_sensor", suffix: "failure" },
  { name: "door", domain: "binary_sensor", suffix: "door" },
  { name: "notification", domain: "binary_sensor", suffix: "notification" },
  { name: "smart_grid", domain: "binary_sensor", suffix: "smart_grid" },
  { name: "mobile_start", domain: "binary_sensor", suffix: "mobile_start" },
  { name: "status", domain: "sensor", suffix: "status" },
  { name: "phase", domain: "sensor", suffix: "program_phase", aliases: ["phase"] },
  { name: "program_id", domain: "sensor", suffix: "program_id", aliases: ["program"] },
  { name: "progress", domain: "sensor", suffix: "progress" },
  { name: "remaining", domain: "sensor", suffix: "remaining", aliases: ["remaining_time"] },
  { name: "elapsed", domain: "sensor", suffix: "elapsed", aliases: ["elapsed_time"] },
  { name: "start_in", domain: "sensor", suffix: "start_in" },
  // The same as `start_in`, as a timestamp instead of minutes.
  { name: "start_time", domain: "sensor", suffix: "start_time", aliases: ["delayed_start"] },
  { name: "finish_time", domain: "sensor", suffix: "finish_time", aliases: ["end_time"] },
  { name: "target_temperature", domain: "sensor", suffix: "target_temperature" },
  { name: "standby", domain: "sensor", suffix: "standby_state", aliases: ["standby"] },
  { name: "wifi", domain: "sensor", suffix: "wifi_signal", aliases: ["wifi"] },
];

export class Appliance {
  constructor() {
    if (new.target === Appliance) throw new TypeError("Appliance is abstract");
  }

  // Entities only this kind of appliance has. Override in subclasses.
  get extraEntities() {
    return [];
  }

  get entityFields() {
    return [...COMMON_ENTITIES, ...this.extraEntities];
  }

  // The concrete LCD for this appliance.
  createDisplay() {
    throw new Error("Appliance.createDisplay() must be implemented");
  }

  // How the drum area should look: { water, steam, crosspiece: {spin, fast} }.
  drumView() {
    throw new Error("Appliance.drumView() must be implemented");
  }

  // Appliance-specific bits of the card's normalised state.
  readState() {
    return {};
  }
}
