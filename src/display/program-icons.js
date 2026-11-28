// Square thumbnails with rounded corners for the wash / dry programs, drawn as vector
// art on a 24x24 grid: a small line glyph on a tinted dark tile. Many programs share a
// glyph (all the "quick" ones are a bolt, all the "eco" ones a leaf, ...).

const TINT = {
  cotton: "#5aa7ff", delicate: "#ff8fc7", wool: "#ffb04a", sport: "#5ee08a", bedding: "#4fdcf0",
  quick: "#ffc24a", eco: "#5ee08a", water: "#4fdcf0", spin: "#b48cff", care: "#4fe0c0",
  steam: "#ffb04a", special: "#b48cff", air: "#ffc24a", cold: "#7fd0ff", neutral: "#8497b0",
};

// name -> { tint, d: [paths], fill?: true }
export const GLYPHS = {
  tee: { tint: TINT.cotton, d: ["M8.2 4.5 L4 7.2 L5.8 10.4 L8 9.4 V19.5 H16 V9.4 L18.2 10.4 L20 7.2 L15.8 4.5 C15.2 6.4 8.8 6.4 8.2 4.5 Z"] },
  darktee: { tint: TINT.cotton, fill: true, d: ["M8.2 4.5 L4 7.2 L5.8 10.4 L8 9.4 V19.5 H16 V9.4 L18.2 10.4 L20 7.2 L15.8 4.5 C15.2 6.4 8.8 6.4 8.2 4.5 Z"] },
  shirt: { tint: TINT.cotton, d: ["M8.5 4.5 L4 7 L5.8 10.2 L8 9.2 V19.5 H16 V9.2 L18.2 10.2 L20 7 L15.5 4.5 L12 8.5 Z", "M12 8.5 V19.5", "M12 11.5 h.01 M12 14.5 h.01 M12 17.5 h.01"] },
  jeans: { tint: TINT.cotton, d: ["M7 4 H17 L18 20 H13.2 L12 10.5 L10.8 20 H6 Z", "M7 7.2 H17"] },
  heart: { tint: TINT.delicate, d: ["M12 19.8 C4.2 14.2 4.2 7.6 8 6.4 C10 5.8 11.8 7 12 8.4 C12.2 7 14 5.8 16 6.4 C19.8 7.6 19.8 14.2 12 19.8 Z"] },
  bow: { tint: TINT.delicate, d: ["M12 12 C9 8 4.5 8 4.5 11 C4.5 14 9 14 12 12 C15 14 19.5 14 19.5 11 C19.5 8 15 8 12 12 Z", "M12 12 L9.5 19.5 M12 12 L14.5 19.5"] },
  yarn: { tint: TINT.wool, d: ["M12 4.5 A7.5 7.5 0 1 0 12 19.5 A7.5 7.5 0 1 0 12 4.5 Z", "M5 10.2 C9 12.6 15 12.6 19 10.2", "M4.7 14 C9 16.4 15 16.4 19.3 14", "M9 5.3 C11.5 9 11.5 15 9 18.7"] },
  sneaker: { tint: TINT.sport, d: ["M3.5 15.5 C3.5 12.5 6 12.8 8 11.5 L9.6 8 L12 9.2 C13 11.8 15.5 12.2 19.5 13.8 C20.8 14.4 20.8 16.8 19 16.8 H4.5 C3.8 16.8 3.5 16.3 3.5 15.5 Z", "M3.5 18.8 H20", "M10 11.8 L11.2 13.2 M12.4 12.6 L13.6 14"] },
  jacket: { tint: TINT.sport, d: ["M9 4 L5 6.5 V19.5 H19 V6.5 L15 4 L12 7 Z", "M12 7 V19.5", "M8 14 H10.5 M13.5 14 H16"] },
  pillow: { tint: TINT.bedding, d: ["M5.2 7.2 C8.5 5.6 15.5 5.6 18.8 7.2 C19.8 10.8 19.8 13.2 18.8 16.8 C15.5 18.4 8.5 18.4 5.2 16.8 C4.2 13.2 4.2 10.8 5.2 7.2 Z", "M8 10 C9.5 9.2 14.5 9.2 16 10"] },
  duvet: { tint: TINT.bedding, d: ["M4 6 H20 V18 H4 Z", "M4 10 H20 M4 14 H20 M9.3 6 V18 M14.7 6 V18"] },
  bed: { tint: TINT.bedding, d: ["M3.5 18 V8 M3.5 14.5 H20.5 V18 M20.5 14.5 V12 C20.5 10.8 19.7 10 18.5 10 H11 V14.5", "M6.2 12.4 C6.2 11.2 7.2 10.4 8.4 10.4 C9.6 10.4 10.6 11.2 10.6 12.4"] },
  curtains: { tint: TINT.bedding, d: ["M4 4.5 H20", "M5.5 4.5 C5.5 10 8.5 14 8 19.5 M18.5 4.5 C18.5 10 15.5 14 16 19.5 M12 4.5 V19.5"] },
  basket: { tint: TINT.bedding, d: ["M4 10.5 H20 L18 19.5 H6 Z", "M8.3 10.5 L10.3 4.5 M15.7 10.5 L13.7 4.5", "M9 14 V16.5 M12 14 V16.5 M15 14 V16.5"] },
  bolt: { tint: TINT.quick, d: ["M13.2 3.5 L5.5 13.2 H11 L10 20.5 L18.5 10.5 H13 Z"] },
  leaf: { tint: TINT.eco, d: ["M5 19 C5 9.5 10.5 5 19 5 C19 13.5 14.5 19 5 19 Z", "M5 19 L14 10"] },
  drops: { tint: TINT.water, d: ["M9 4.5 C9 4.5 4.5 10 4.5 13 A4.5 4.5 0 0 0 13.5 13 C13.5 10 9 4.5 9 4.5 Z", "M17 11.5 C17 11.5 14 15 14 17 A3 3 0 0 0 20 17 C20 15 17 11.5 17 11.5 Z"] },
  starch: { tint: TINT.water, d: ["M10 7 C10 7 5.5 12 5.5 15 A4.5 4.5 0 0 0 14.5 15 C14.5 12 10 7 10 7 Z", "M18 4 V9 M15.5 6.5 H20.5"] },
  spin: { tint: TINT.spin, d: ["M19 12.5 A7 7 0 1 1 15.5 6.2", "M15.5 6.2 L19.2 5.2 M15.5 6.2 L16.4 9.9"] },
  clean: { tint: TINT.care, d: ["M12 5 A7 7 0 1 0 12 19 A7 7 0 1 0 12 5 Z", "M12 9 A3 3 0 1 0 12 15 A3 3 0 1 0 12 9 Z", "M19.2 2.6 V6 M17.5 4.3 H20.9"] },
  shield: { tint: TINT.care, d: ["M12 3.5 L19 6.2 V12 C19 16.5 16 19.6 12 20.8 C8 19.6 5 16.5 5 12 V6.2 Z", "M8.8 12 L11 14.2 L15.4 9.6"] },
  star: { tint: TINT.care, d: ["M12 3.5 L13.7 9.3 L19.5 11 L13.7 12.7 L12 18.5 L10.3 12.7 L4.5 11 L10.3 9.3 Z"] },
  iron: { tint: TINT.steam, d: ["M4 17.5 H20 L18.4 10.5 C18 8.8 16.6 8 15 8 H10.5 C7 8 5 11 4 17.5 Z", "M8 13.5 H15.5"] },
  steam: { tint: TINT.steam, d: ["M7 19.5 C5 16.5 9 15.5 7 12 C5 8.5 9 7.5 7 4.5", "M12 19.5 C10 16.5 14 15.5 12 12 C10 8.5 14 7.5 12 4.5", "M17 19.5 C15 16.5 19 15.5 17 12 C15 8.5 19 7.5 17 4.5"] },
  tag: { tint: TINT.special, d: ["M4 4 H11.6 L20 12.4 L12.4 20 L4 11.6 Z", "M7.9 7.9 h.01"] },
  teddy: { tint: TINT.special, d: ["M12 8.2 A4 4 0 1 0 12 16.2 A4 4 0 1 0 12 8.2 Z", "M7.4 5 A2 2 0 1 0 7.4 9 A2 2 0 1 0 7.4 5 Z", "M16.6 5 A2 2 0 1 0 16.6 9 A2 2 0 1 0 16.6 5 Z", "M10.3 11.6 h.01 M13.7 11.6 h.01", "M7.5 20.6 C7.5 17.9 16.5 17.9 16.5 20.6"] },
  umbrella: { tint: TINT.cotton, d: ["M4 12.5 C4 7.8 7.6 4.5 12 4.5 C16.4 4.5 20 7.8 20 12.5 Z", "M12 12.5 V18.5 C12 19.8 10.2 20.2 9.5 19.2"] },
  needle: { tint: TINT.special, d: ["M4.5 19.5 L17 7", "M15.2 4.8 A2 2 0 0 1 19.2 8.8", "M4.5 19.5 C8 17.5 9.5 21 13 19"] },
  moon: { tint: TINT.neutral, d: ["M17.5 14.8 A7.4 7.4 0 1 1 9.2 5.6 A5.8 5.8 0 0 0 17.5 14.8 Z"] },
  sun: { tint: TINT.air, d: ["M12 8 A4 4 0 1 0 12 16 A4 4 0 1 0 12 8 Z", "M12 3.5 V5.5 M12 18.5 V20.5 M3.5 12 H5.5 M18.5 12 H20.5 M6 6 L7.4 7.4 M16.6 16.6 L18 18 M18 6 L16.6 7.4 M7.4 16.6 L6 18"] },
  snow: { tint: TINT.cold, d: ["M12 3.5 V20.5 M4.6 7.8 L19.4 16.2 M4.6 16.2 L19.4 7.8", "M9.8 5 L12 7 L14.2 5 M9.8 19 L12 17 L14.2 19"] },
};

// Program keys (as the integration reports them) -> glyph
const GROUPS = {
  tee: ["cottons", "normal", "whites", "hand_wash"],
  darktee: ["dark_garments"],
  shirt: ["shirts"],
  jeans: ["denim", "dark_jeans", "gentle_denim"],
  heart: ["delicates"],
  bow: ["silks", "silks_handcare"],
  yarn: ["woollens", "woollens_handcare"],
  sneaker: ["sportswear", "trainers", "trainers_refresh"],
  jacket: ["outerwear", "outdoor_garments"],
  pillow: ["pillows", "standard_pillows", "large_pillows"],
  duvet: ["down_duvets", "downs_duvets", "down_filled_items"],
  bed: ["bed_linen", "table_linen", "towels", "baby_clothes"],
  curtains: ["curtains"],
  basket: ["basket_program"],
  bolt: ["express", "express_20", "quick_power_wash", "quick_power_dry", "quick_intense"],
  leaf: ["eco", "eco_40_60", "cottons_eco"],
  drops: ["rinse"],
  starch: ["starch", "separate_rinse_starch"],
  spin: ["drain_spin"],
  clean: ["clean_machine"],
  shield: ["cottons_hygiene", "quick_hygiene", "hygiene", "pillows_sanitize"],
  star: ["automatic_plus", "automatic", "smartmatic"],
  iron: ["minimum_iron", "easy_care"],
  steam: ["pre_ironing", "steam_finish", "smoothing", "gentle_smoothing", "steam_smoothing", "steam_care", "freshen_up", "refresh", "powerfresh"],
  tag: ["first_wash"],
  teddy: ["stuffed_toys", "game_pieces"],
  umbrella: ["proofing"],
  needle: ["cottonrepair"],
  moon: ["extra_quiet"],
  sun: ["warm_air"],
  snow: ["cool_air"],
};
export const PROGRAM_GROUPS = GROUPS;
const GLYPH_OF = {};
for (const [g, keys] of Object.entries(GROUPS)) for (const k of keys) GLYPH_OF[k] = g;

const mix = (hex, k) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return "#" + c.map((v) => Math.round(v + (255 - v) * k).toString(16).padStart(2, "0")).join("");
};

// A square thumbnail with rounded corners at (x, y), `size` wide. "" when the program has no glyph.
export function programThumb(key, x, y, size) {
  const name = GLYPH_OF[key];
  if (!name) return "";
  const def = GLYPHS[name], tint = def.tint, ink = mix(tint, 0.35);
  const R = (size * 0.24).toFixed(2), s = (size / 24) * 0.74, off = size * 0.13;
  const paths = def.d.map((d) => `<path d="${d}" fill="${def.fill ? ink : "none"}" fill-opacity="${def.fill ? 0.35 : 0}"/>`).join("");
  return (
    `<g>` +
    `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${R}" fill="#0e1626"/>` +
    `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${R}" fill="${tint}" fill-opacity=".2"/>` +
    `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${R}" fill="none" stroke="${tint}" stroke-opacity=".55" stroke-width="${Math.max(0.4, size * 0.03).toFixed(2)}"/>` +
    `<g transform="translate(${(x + off).toFixed(2)} ${(y + off).toFixed(2)}) scale(${s.toFixed(4)})" fill="none" stroke="${ink}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${paths}</g>` +
    `</g>`
  );
}
