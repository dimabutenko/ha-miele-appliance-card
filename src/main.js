// Miele appliance card — washer/dryer styled after the real appliance's own
// front panel. Entry point of the sources in src/. The installable single file
// miele-appliance-card.js in the repo root is generated from this with `npm run build`
// (HACS downloads only that one file). Modules:
//   card.js      the card element
//   editor.js    the visual config editor
//   template.js  SVG/HTML markup
//   styles.js    CSS
//   geometry.js  layout constants and SVG paths
//   phase.js     phase → ring colour
//   i18n/        translations (en.js, ru.js) + language resolution
//
// Config:
//   type: custom:miele-appliance-card
//   appliance: washer | dryer          # picks the silhouette
//   prefix: bathroom_washing_machine   # entity_id prefix shared by this device's entities
//   language: en | ru                  # optional; default follows the Home Assistant language
//   entities:                          # optional, overrides the by-convention ids
//     status, phase, progress, remaining, finish_time, running, failure, door, wifi

import { MieleApplianceCard } from "./card.js";
import { MieleApplianceCardEditor } from "./editor.js";

customElements.define("miele-appliance-card-editor", MieleApplianceCardEditor);
customElements.define("miele-appliance-card", MieleApplianceCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "miele-appliance-card",
  name: "Miele Appliance Card",
  description: "Washer/dryer card styled after the real appliance panel, with a gauge progress arc, a spinning door hub and an LCD screen showing status and a digital countdown.",
});
