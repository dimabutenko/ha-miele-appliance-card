import en from "./en.js";
import ru from "./ru.js";

// Register new languages here: import the file and add it to this map.
export const LANGUAGES = { en, ru };
export const DEFAULT_LANGUAGE = "en";

// Language choice: explicit `language` in the card config wins; otherwise the
// Home Assistant UI language (if we have a translation for it); otherwise English.
export function resolveLanguage(configLang, hass) {
  const pick = (code) => {
    if (!code) return null;
    const short = String(code).toLowerCase().split(/[-_]/)[0];
    return LANGUAGES[short] ? short : null;
  };
  return pick(configLang) || pick(hass && (hass.locale?.language || hass.language)) || DEFAULT_LANGUAGE;
}

function lookup(dict, path) {
  return path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), dict);
}

// Returns t("section.key"), falling back to English, then to the key itself.
export function makeTranslator(lang) {
  const dict = LANGUAGES[lang] || LANGUAGES[DEFAULT_LANGUAGE];
  const fallback = LANGUAGES[DEFAULT_LANGUAGE];
  return (path) => lookup(dict, path) ?? lookup(fallback, path) ?? path;
}

// Phase label from the integration's snake_case enum key; unknown keys are
// shown as readable text rather than dropped.
export function phaseLabel(t, key) {
  if (!key || key === "unknown" || key === "off" || key === "on") return null;
  const label = t(`phases.${key}`);
  return label === `phases.${key}` ? key.replace(/_/g, " ") : label;
}
