# Miele Appliance Card

A Lovelace card for a Miele washer or dryer (tested with the
[`miele_lan`](https://github.com/tiehfood/ha-miele-at-lan) integration), styled after the
real appliance's own front panel instead of a generic "smart card" look:

- A realistic SVG appliance body — door, control strip, vents — with no brand marks.
- An animated drum: a rotating crosspiece under a settling/splashing water pool while washing,
  the same crosspiece spinning fast and bare during spin, or a plain tumbling drum for the dryer.
- A gauge-style progress arc around the door (open 7 o'clock to 5 o'clock), colored per program
  phase, keeping a colored history of each phase instead of repainting it.
- An LCD-style screen showing the translated program phase and a digital countdown clock.
- A power indicator, wifi/door/fault status dots.

## Installation

### Via the Marketplace (formerly HACS)

Settings → Marketplace → Dashboards → ⋮ → *Add from link* → paste this repository's URL.

### Manual

1. Copy `miele-appliance-card.js` to `/config/www/community/miele-appliance-card/`.
2. Add it as a Lovelace resource (Settings → Dashboards → ⋮ → Resources → Add resource):
   `/local/community/miele-appliance-card/miele-appliance-card.js`, type *JavaScript Module*.

## Configuration

The card has a UI editor (name, appliance, prefix, and per-entity overrides). For YAML:

```yaml
type: custom:miele-appliance-card
appliance: washer # or dryer
prefix: bathroom_washing_machine # entity_id prefix shared by the device's entities
name: Стиральная машина # optional
```

By convention, with just `prefix` set the card expects:

| Role         | Entity                           |
|--------------|-----------------------------------|
| running      | `binary_sensor.<prefix>_running`  |
| failure      | `binary_sensor.<prefix>_failure`  |
| door         | `binary_sensor.<prefix>_door`     |
| status       | `sensor.<prefix>_status`          |
| phase        | `sensor.<prefix>_program_phase`   |
| progress     | `sensor.<prefix>_progress`        |
| remaining    | `sensor.<prefix>_remaining`       |
| finish_time  | `sensor.<prefix>_finish_time`     |
| wifi         | `sensor.<prefix>_wifi_signal`     |

Any of these can be overridden explicitly (useful for a non-standard entity layout), either in
the UI editor's "Entity overrides" section or in YAML:

```yaml
type: custom:miele-appliance-card
appliance: washer
prefix: bathroom_washing_machine
entities:
  progress: sensor.some_other_progress_sensor
```
