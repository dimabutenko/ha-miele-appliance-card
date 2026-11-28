// Phase classification from the (snake_case) phase key; display text lives in the
// locale files under `phases`.
export function phaseKind(phase) {
  if (!phase) return null;
  const p = phase.toLowerCase();
  if (/spin|drain/.test(p)) return "spin";
  if (/rinse|venting|freshen/.test(p)) return "rinse";
  if (/wash/.test(p)) return "wash";
  if (/dry|warm_air|moisten|normal|hygiene|disinfect/.test(p)) return "dry";
  if (/iron|smooth|cool|crease|thermo_spin|starch/.test(p)) return "finish";
  return null;
}

// Colour of the progress ring per phase kind.
const RING_COLORS = { spin: "#8a5fd1", rinse: "#2bb6c9", wash: "#3f7fd1", dry: "#e0922b", finish: "#a37fe0" };
export function phaseColor(phase) {
  return RING_COLORS[phaseKind(phase)] || null;
}

// Brighter variants of the same hues for the LCD, where they sit on near-black.
const LCD_COLORS = { spin: "#b48cff", rinse: "#4fdcf0", wash: "#5aa7ff", dry: "#ffb04a", finish: "#c9a6ff" };
export function lcdPhaseColor(phase) {
  return LCD_COLORS[phaseKind(phase)] || null;
}
