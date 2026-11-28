import { LANGUAGES, resolveLanguage, makeTranslator } from "./i18n/index.js";
import { createAppliance } from "./appliances/index.js";

// UI config editor via HA's own <ha-form>: the appliance, then either a device (every entity
// is picked up by role) or a prefix, language and hinge, and, in a collapsed section, one
// entity picker per role. A role left empty is resolved from the device/prefix.

export class ApplianceCardEditor extends HTMLElement {
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
      { name: "device", selector: { device: {} } },
      { name: "prefix", selector: { text: {} } },
      {
        name: "door_hinge",
        selector: {
          select: {
            mode: "dropdown",
            options: [
              { value: "left", label: t("editor.hinge_left") },
              { value: "right", label: t("editor.hinge_right") },
            ],
          },
        },
      },
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
        schema: createAppliance(this._config.appliance).entityFields.map(({ name, domain }) => ({
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
        if (!value.device) delete value.device;
        if (!value.prefix) delete value.prefix;
        this._config = value;
        this.dispatchEvent(
          new CustomEvent("config-changed", { detail: { config: this._config }, bubbles: true, composed: true })
        );
      });
      this.appendChild(this._form);
    }
    const t = makeTranslator(resolveLanguage(this._config.language, this._hass));
    this._form.hass = this._hass;
    this._form.data = { language: "", door_hinge: "left", ...this._config };
    this._form.schema = this._schema(t);
    this._form.computeLabel = (s) => t(`editor.${s.name}`);
  }
}
