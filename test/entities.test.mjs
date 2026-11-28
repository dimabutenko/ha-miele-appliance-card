// Plain-assert tests for the entity resolution and the vocabulary (run: node test/entities.test.mjs).
import assert from "node:assert/strict";
import { resolveEntities } from "../src/entities.js";
import { keyAndText, normStatus, normProgram, snake } from "../src/vocabulary.js";
import { createAppliance } from "../src/appliances/index.js";

const fields = createAppliance("washer").entityFields;

// A device whose entities carry translation keys (what a modern integration registers).
const dev = (id, rows) =>
  Object.fromEntries(rows.map(([eid, tk]) => [eid, { entity_id: eid, device_id: id, translation_key: tk }]));
const states = (ids) => Object.fromEntries(ids.map((i) => [i, { state: "x", attributes: {} }]));

{
  const entities = dev("d1", [
    ["sensor.laundry_washer_status", "status"],
    ["sensor.laundry_washer_program", "program"],
    ["sensor.laundry_washer_program_phase", "program_phase"],
    ["sensor.laundry_washer_remaining_time", "remaining_time"],
    ["sensor.laundry_washer_end_time", "end_time"],
    ["sensor.laundry_washer_delayed_start", "start_time"],
    ["sensor.laundry_washer_progress", "progress"],
    ["binary_sensor.laundry_washer_door", "door"],
    ["binary_sensor.laundry_washer_running", "running"],
    ["binary_sensor.laundry_washer_finished", "finished"],
    ["sensor.laundry_washer_push_status", "push_status"], // must not be taken for `status`
  ]);
  const r = resolveEntities({ entities, states: {} }, { device: "d1" }, fields);
  assert.equal(r.status, "sensor.laundry_washer_status");
  assert.equal(r.program_id, "sensor.laundry_washer_program");
  assert.equal(r.phase, "sensor.laundry_washer_program_phase");
  assert.equal(r.remaining, "sensor.laundry_washer_remaining_time");
  assert.equal(r.finish_time, "sensor.laundry_washer_end_time");
  assert.equal(r.start_time, "sensor.laundry_washer_delayed_start");
  assert.equal(r.door, "binary_sensor.laundry_washer_door");
  assert.equal(r.running, "binary_sensor.laundry_washer_running");
  assert.equal(r.finished, "binary_sensor.laundry_washer_finished");
  assert.equal(r.wifi, undefined); // roles without an entity stay unset
  console.log("ok device by translation key");
}

{
  // No translation keys: matched by the tail of the entity id after the shared stem.
  const entities = dev("d2", [
    ["sensor.cellar_dryer_status", null],
    ["sensor.cellar_dryer_push_status", null],
    ["sensor.cellar_dryer_remaining", null],
    ["sensor.cellar_dryer_wifi_signal", null],
    ["binary_sensor.cellar_dryer_door", null],
  ]);
  const r = resolveEntities({ entities, states: {} }, { device: "d2" }, createAppliance("dryer").entityFields);
  assert.equal(r.status, "sensor.cellar_dryer_status");
  assert.equal(r.remaining, "sensor.cellar_dryer_remaining");
  assert.equal(r.wifi, "sensor.cellar_dryer_wifi_signal");
  console.log("ok device by entity id tail");
}

{
  // prefix mode with aliases, explicit overrides win, blank overrides are ignored
  const hass = { states: states(["sensor.p_remaining_time", "sensor.p_status"]) };
  const r = resolveEntities(hass, { prefix: "p", entities: { status: "sensor.mine", door: "" } }, fields);
  assert.equal(r.remaining, "sensor.p_remaining_time");
  assert.equal(r.status, "sensor.mine");
  assert.equal(r.door, "binary_sensor.p_door"); // blank override ignored, convention kept
  console.log("ok prefix + overrides");
}

{
  // entities only
  const r = resolveEntities({ states: {} }, { entities: { status: "sensor.a" } }, fields);
  assert.deepEqual(r, { status: "sensor.a" });
  console.log("ok entities only");
}

assert.equal(snake("Main wash"), "main_wash");
assert.equal(normStatus("End of cycle"), "program_ended");
assert.equal(normStatus("in_use"), "in_use");
assert.equal(normProgram("Bed Linens"), "bed_linen");
assert.deepEqual(
  keyAndText({ state: "Suszenie", attributes: { phase_key: "drying" } }, "phase_key", snake),
  { key: "drying", text: "Suszenie" }
);
assert.deepEqual(keyAndText({ state: "main_wash", attributes: {} }, "phase_key", snake), { key: "main_wash", text: null });
assert.deepEqual(keyAndText({ state: "unknown", attributes: {} }, "phase_key", snake), { key: null, text: null });
console.log("ok vocabulary");
