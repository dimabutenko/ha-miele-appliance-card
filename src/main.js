// Appliance card: a washer / dryer drawn like a real front panel (animated drum, an opening
// door, a colour LCD). It is not tied to a brand or an integration. Entry point of the sources
// in src/; `npm run build` bundles it into the single miele-appliance-card.js (the file name is
// kept so existing dashboard resources keep working), which CI attaches to each GitHub release
// (what HACS installs). Modules:
//   card.js        the card element (wires Home Assistant state to the parts below)
//   entities.js    which entity plays which role: device, prefix or explicit entities
//   vocabulary.js  normalises what integrations report (status, program, phase) into keys
//   appliances/    abstract Appliance + Washer, Dryer (roles, drum behaviour, LCD)
//   display/       abstract Display + washer / dryer LCDs, drawing primitives
//   editor.js      the visual config editor
//   template.js    SVG/HTML markup
//   styles.js      CSS
//   geometry.js    layout constants and SVG paths
//   phase.js       phase -> ring colour
//   i18n/          translations (en.js, ru.js) + language resolution
//
// Config:
//   type: custom:home-appliance-card   # (custom:miele-appliance-card still works)
//   appliance: washer | dryer          # picks the silhouette
//   device: <device id>                # every entity of the device is picked up by role, or
//   prefix: bathroom_washing_machine   # entity_id prefix shared by the entities, and/or
//   entities:                          # each role on its own (wins over device and prefix)
//     status, phase, program_id, progress, remaining, finish_time, running, finished, failure, door, ...
//   language: en | ru                  # optional; default follows the Home Assistant language
//   debug: true                        # optional; LCD line 2 shows the raw program value
//   program_names:                     # optional; override program texts, e.g. gentle_smoothing: Bed linen

import { ApplianceCard } from "./card.js";
import { ApplianceCardEditor } from "./editor.js";

// Compatibility: the card used to be called miele-appliance-card.
class LegacyApplianceCard extends ApplianceCard {}
class LegacyApplianceCardEditor extends ApplianceCardEditor {}
ApplianceCard.getConfigElement = () => document.createElement("home-appliance-card-editor");
LegacyApplianceCard.getConfigElement = () => document.createElement("miele-appliance-card-editor");

customElements.define("home-appliance-card-editor", ApplianceCardEditor);
customElements.define("home-appliance-card", ApplianceCard);
customElements.define("miele-appliance-card-editor", LegacyApplianceCardEditor);
customElements.define("miele-appliance-card", LegacyApplianceCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "home-appliance-card",
  name: "Appliance Card",
  description: "Washer / dryer card drawn like the real appliance panel: animated drum, an opening door and a colour LCD with program, time, spin speed, temperature and status icons. Pick a device and everything is wired up; or set each entity yourself.",
  preview: true,
  documentationURL: "https://github.com/dimabutenko/ha-miele-appliance-card",
});
