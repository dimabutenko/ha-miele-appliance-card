// Entity resolution. The card works with abstract *roles* (`status`, `phase`, `remaining`,
// `door`, ...). Where a role's entity comes from is decided here, in this order:
//
//   1. `entities:` in the config: an explicit entity for a role always wins;
//   2. `device:` in the config: every entity of that device is looked at and matched to roles
//      by its translation key or by the tail of its entity id (see `aliases` of each role);
//   3. `prefix:` in the config: `<domain>.<prefix>_<alias>` by convention.
//
// Nothing here knows about a brand or an integration: a role only lists the names other
// integrations commonly give that kind of entity.

// The part of an entity id after the device's shared stem: the longest run of leading
// `_`-separated words that every entity of the device has in common.
function commonStem(tails) {
  const words = tails.map((t) => t.split("_"));
  const shortest = Math.min(...words.map((w) => w.length));
  let n = 0;
  while (n < shortest - 1 && words.every((w) => w[n] === words[0][n])) n++;
  return words[0].slice(0, n).join("_");
}

function tailOf(entityId, stem) {
  const name = entityId.split(".")[1];
  return stem && name.startsWith(`${stem}_`) ? name.slice(stem.length + 1) : name;
}

// Entities of a device from Home Assistant's entity registry (the frontend's display copy).
export function deviceEntities(hass, deviceId) {
  if (!hass || !deviceId || !hass.entities) return [];
  return Object.values(hass.entities).filter((e) => e.device_id === deviceId);
}

export function resolveEntities(hass, config, fields) {
  const out = {};
  const cands = deviceEntities(hass, config.device);
  const stem = cands.length ? commonStem(cands.map((c) => c.entity_id.split(".")[1])) : "";

  for (const f of fields) {
    const aliases = [f.suffix, ...(f.aliases || [])];
    let id = null;
    if (cands.length) {
      const inDomain = cands.filter((c) => c.entity_id.startsWith(`${f.domain}.`));
      for (const a of aliases) {
        const hit =
          inDomain.find((c) => c.translation_key === a) || inDomain.find((c) => tailOf(c.entity_id, stem) === a);
        if (hit) {
          id = hit.entity_id;
          break;
        }
      }
    } else if (config.prefix) {
      id =
        aliases.map((a) => `${f.domain}.${config.prefix}_${a}`).find((i) => hass && hass.states && hass.states[i]) ||
        `${f.domain}.${config.prefix}_${f.suffix}`;
    }
    if (id) out[f.name] = id;
  }

  // Explicit overrides (empty values, e.g. a blank UI picker, are ignored).
  for (const [role, id] of Object.entries(config.entities || {})) if (id) out[role] = id;
  return out;
}
