// Normalisation of what different integrations report into the one vocabulary the card
// (and its translations) speak: snake_case keys.

export function snake(v) {
  return String(v ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

// Machine status words that mean the same thing under different names.
const STATUS_ALIASES = {
  end_of_cycle: "program_ended",
  end_programmed: "program_ended",
  interrupted: "program_interrupted",
  programme_interrupted: "program_interrupted",
  not_connected: "not_connected",
};
export function normStatus(v) {
  const k = snake(v);
  return STATUS_ALIASES[k] || k;
}

// Program names some integrations report differently from the keys in the translations.
const PROGRAM_ALIASES = {
  bed_linens: "bed_linen",
  darks_denim: "dark_jeans",
  quickpowerwash: "quick_power_wash",
  quickpowerdry: "quick_power_dry",
  down_filled: "down_filled_items",
  cotton: "cottons",
  delicate: "delicates",
  wool: "woollens",
  silk: "silks",
  jeans: "denim",
  sports: "sportswear",
  towel: "towels",
  pillow: "pillows",
};
export function normProgram(v) {
  const k = snake(v);
  return PROGRAM_ALIASES[k] || k;
}

// The value of an entity's state is either a key already (`main_wash`) or human text
// (`Main wash`). Integrations that give text can also give the key as an attribute; this
// reads the key from `attrs[keyAttr]` when present and falls back to normalising the state.
export function keyAndText(stateObj, keyAttr, normalise) {
  if (!stateObj) return { key: null, text: null };
  const s = stateObj.state;
  if (s === undefined || s === "unknown" || s === "unavailable" || s === "") return { key: null, text: null };
  const attrKey = stateObj.attributes && stateObj.attributes[keyAttr];
  if (attrKey) return { key: normalise(attrKey), text: s };
  return { key: normalise(s), text: null };
}
