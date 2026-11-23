// Abstract appliance model. A concrete appliance (washer, dryer, ...) says which
// entities it has, how its drum behaves and which LCD it carries; the card
// itself only wires Home Assistant state to those pieces.

// Entities every Miele appliance of this integration exposes. `suffix` is the
// part after `<prefix>_` in the entity id.
const COMMON_ENTITIES = [
  { name: "running", domain: "binary_sensor", suffix: "running" },
  { name: "failure", domain: "binary_sensor", suffix: "failure" },
  { name: "door", domain: "binary_sensor", suffix: "door" },
  { name: "notification", domain: "binary_sensor", suffix: "notification" },
  { name: "smart_grid", domain: "binary_sensor", suffix: "smart_grid" },
  { name: "mobile_start", domain: "binary_sensor", suffix: "mobile_start" },
  { name: "status", domain: "sensor", suffix: "status" },
  { name: "phase", domain: "sensor", suffix: "program_phase" },
  { name: "program_id", domain: "sensor", suffix: "program_id" },
  { name: "progress", domain: "sensor", suffix: "progress" },
  { name: "remaining", domain: "sensor", suffix: "remaining" },
  { name: "elapsed", domain: "sensor", suffix: "elapsed" },
  { name: "start_in", domain: "sensor", suffix: "start_in" },
  { name: "finish_time", domain: "sensor", suffix: "finish_time" },
  { name: "target_temperature", domain: "sensor", suffix: "target_temperature" },
  { name: "standby", domain: "sensor", suffix: "standby_state" },
  { name: "wifi", domain: "sensor", suffix: "wifi_signal" },
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

  // Entity ids by convention: `<domain>.<prefix>_<suffix>`.
  defaultEntities(prefix) {
    if (!prefix) return {};
    return Object.fromEntries(this.entityFields.map((f) => [f.name, `${f.domain}.${prefix}_${f.suffix}`]));
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
