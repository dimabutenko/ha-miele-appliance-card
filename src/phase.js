// Ring colour per program phase. Phase keys come from the integration
// (ProgramPhaseWashingMachine / ProgramPhaseTumbleDryer); display text lives in
// the locale files under `phases`.
export function phaseColor(phase) {
  if (!phase) return null;
  const p = phase.toLowerCase();
  if (/spin|drain/.test(p)) return "#8a5fd1";
  if (/rinse|venting|freshen/.test(p)) return "#2bb6c9";
  if (/wash/.test(p)) return "#3f7fd1";
  if (/dry|warm_air|moisten|normal|hygiene|disinfect/.test(p)) return "#e0922b";
  if (/iron|smooth|cool|anti_crease|thermo_spin|starch/.test(p)) return "#a37fe0";
  return null;
}
