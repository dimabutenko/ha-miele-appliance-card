// Miele appliance card — washer/dryer styled after the real appliance's own
// front panel. This is the entry point; the code lives in ./src as plain ES
// modules (no build step):
//   src/card.js      the card element
//   src/editor.js    the visual config editor
//   src/template.js  SVG/HTML markup
//   src/styles.js    CSS
//   src/geometry.js  layout constants and SVG paths
//   src/phase.js     phase → ring colour
//   src/i18n/        translations (en.js, ru.js) + language resolution
//
// Config:
//   type: custom:miele-appliance-card
//   appliance: washer | dryer          # picks the silhouette
//   prefix: bathroom_washing_machine   # entity_id prefix shared by this device's entities
//   language: en | ru                  # optional; default follows the Home Assistant language
//   entities:                          # optional, overrides the by-convention ids
//     status, phase, progress, remaining, finish_time, running, failure, door, wifi

import { MieleApplianceCard } from "./src/card.js";
import { MieleApplianceCardEditor } from "./src/editor.js";

customElements.define("miele-appliance-card-editor", MieleApplianceCardEditor);
customElements.define("miele-appliance-card", MieleApplianceCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "miele-appliance-card",
  name: "Miele Appliance Card",
  description: "Washer/dryer card styled after the real appliance panel, with a gauge progress arc, a spinning door hub and an LCD screen showing status and a digital countdown.",
});
