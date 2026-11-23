import { LANGUAGES, resolveLanguage, makeTranslator } from "./i18n/index.js";

// UI config editor via HA's own <ha-form> — appliance/prefix/language plus every
// entity override, grouped in a collapsed "Entity overrides" section. Any
// override left empty falls back to the `prefix`-derived default (the card's
// setConfig drops empty entries before merging).
const ENTITY_FIELDS = [
  { name: "running", domain: "binary_sensor" },
  { name: "failure", domain: "binary_sensor" },
  { name: "door", domain: "binary_sensor" },
  { name: "status", domain: "sensor" },
  { name: "phase", domain: "sensor" },
  { name: "progress", domain: "sensor" },
  { name: "remaining", domain: "sensor" },
  { name: "finish_time", domain: "sensor" },
  { name: "wifi", domain: "sensor" },
];

export class MieleApplianceCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = config;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  connectedCallback() {
    this._render();
  }

  _schema(t) {
    return [
      {
        name: "appliance",
        selector: {
          select: {
            mode: "dropdown",
            options: [
              { value: "washer", label: t("editor.appliance_washer") },
              { value: "dryer", label: t("editor.appliance_dryer") },
            ],
          },
        },
      },
      { name: "prefix", selector: { text: {} } },
      {
        name: "language",
        selector: {
          select: {
            mode: "dropdown",
            options: [
              { value: "", label: t("editor.language_auto") },
              ...Object.entries(LANGUAGES).map(([value, l]) => ({ value, label: l.meta.name })),
            ],
          },
        },
      },
      {
        name: "entities",
        type: "expandable",
        title: t("editor.entities"),
        schema: ENTITY_FIELDS.map(({ name, domain }) => ({
          name,
          selector: { entity: { domain } },
        })),
      },
    ];
  }

  _render() {
    if (!this._hass || !this._config) return;
    if (!this._form) {
      this._form = document.createElement("ha-form");
      this._form.addEventListener("value-changed", (ev) => {
        ev.stopPropagation();
        const value = { ...ev.detail.value };
        if (!value.language) delete value.language; // "auto" = no key
        this._config = value;
        this.dispatchEvent(
          new CustomEvent("config-changed", { detail: { config: this._config }, bubbles: true, composed: true })
        );
      });
      this.appendChild(this._form);
    }
    const t = makeTranslator(resolveLanguage(this._config.language, this._hass));
    this._form.hass = this._hass;
    this._form.data = { language: "", ...this._config };
    this._form.schema = this._schema(t);
    this._form.computeLabel = (s) => t(`editor.${s.name}`);
  }
}
