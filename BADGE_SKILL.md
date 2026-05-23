---
name: oikos-badge-creator
description: >
  Skill for Claude/AI agents to create community badges for the Oikos
  dashboard. Badges are JSON-only configs — no build required.
  Load this skill when the user asks to create, export, or package a badge.
---

# Oikos Badge Creator — AI Agent Skill

> **Agent-agnostic.** Works with Claude Code, GitHub Copilot, Cursor, Windsurf, or any
> AI assistant. For non-Claude agents, paste this file into the system prompt.

Badges in Oikos are **small reactive pills** displayed in a horizontal strip above or
below the dashboard pages. Each badge binds to a Home Assistant entity and shows its
live state, optionally with an icon, a label, and a tap action.

Badges are **configuration-only** — no React, no build step, no Vite. You create a
`manifest.json`, package it as a ZIP, and users import it directly from the Oikos Store.

---

## 1. Badge manifest schema

```json
{
  "id":          "my-badge",
  "name":        "My Badge",
  "version":     "1.0.0",
  "author":      "Your Name",
  "description": "One sentence about what it shows.",
  "config": {
    "entity":      "sensor.my_entity",
    "icon":        "mdiThermometer",
    "label":       "TEMP",
    "color":       "blue",
    "size":        "md",
    "displayMode": "full",
    "pulse":       false,
    "template":    "{value}",
    "format":      "auto",
    "decimals":    1,
    "unit":        "°C",
    "tap_action":  { "action": "more-info", "target": "" }
  }
}
```

### `id` rules
- Regex: `^[a-z0-9][a-z0-9_-]{0,63}$`
- Lowercase, hyphens/underscores only. No spaces.
- Must be unique — suggest: `author__badge-name` for published badges.

---

## 2. Config field reference

### `entity` (string, required)
Home Assistant entity ID. Examples:
```
sensor.living_room_temperature
binary_sensor.front_door
light.kitchen
switch.garden_pump
cover.garage_door
climate.thermostat
```

### `icon` (string)
MDI icon name in camelCase. Common icons:
| Concept | Icon name |
|---|---|
| Temperature | `mdiThermometer` |
| Humidity | `mdiWaterPercent` |
| Power / energy | `mdiFlash` |
| Solar / FV | `mdiSolarPower` |
| Battery | `mdiBattery` |
| Light | `mdiLightbulb` |
| Door / window | `mdiDoorOpen` / `mdiWindowOpenVariant` |
| Lock | `mdiLock` / `mdiLockOpen` |
| Thermostat / HVAC | `mdiThermometerAuto` |
| Water / pump | `mdiWater` |
| Motion | `mdiMotionSensor` |
| Smoke | `mdiSmoke` |
| CO2 | `mdiMoleculeCo2` |
| Cover / blind | `mdiBlind` |
| Car | `mdiCar` |
| Washing machine | `mdiWashingMachine` |
| Dishwasher | `mdiDishwasher` |
| Presence | `mdiAccount` |
| WiFi / network | `mdiWifi` |

### `label` (string)
Short uppercase text shown before the value. Max 8 chars.
```
"TEMP"  "UMIDITÀ"  "POTENZA"  "LUCI"  "FV"  "PORTA"
```

### `color` (string)
Pill background color. Choose based on semantics:

| Color | Use for |
|---|---|
| `green` | entity on/active, positive state, low consumption |
| `blue` | temperature, humidity, neutral measurement, info |
| `amber` | energy/power reading, pending state, caution |
| `red` | error, alert, entity off (when off = bad), high threshold |
| `gray` | neutral, unknown, unavailable |
| `purple` | premium metric, advanced sensor |
| `cyan` | water, network, connectivity |
| `indigo` | climate, HVAC zone |
| `lime` | outdoor, solar production |
| `orange` | warming, heating active |
| `pink` | custom/fun sensor |

Also accepted: any hex color (`#3b82f6`).

### `size` (string)
| Value | Result |
|---|---|
| `sm` | Small — 10px font, compact padding |
| `md` | **Default** — 11px font, standard padding |
| `lg` | Large — 13px font, generous padding |

### `displayMode` (string)
Controls what is shown in the pill:

| Value | Shows |
|---|---|
| `full` | icon + label + value (default) |
| `icon_value` | icon + value only |
| `label_value` | label + value only |
| `value_only` | value only |

### `pulse` (boolean)
When `true`, adds a pulsing animation to the pill. Use for:
- Active state (motion detected, door open)
- Alert / warning
- Something happening right now

### `template` (string)
Controls how the value is displayed. Variables:
- `{value}` — formatted entity state (after `format`/`decimals`/`unit` processing)
- `{label}` — the `label` field value

Examples:
```
"{value}"            → "23.5"
"{value} {unit}"     → "23.5 °C"    (unit from config, not HA)
"{label}: {value}"   → "TEMP: 23.5"
"Ciao"               → static text (no entity needed)
```

### `format` (string)
| Value | Behavior |
|---|---|
| `auto` | Numbers formatted with `decimals`, strings as-is |
| `state` | Raw entity state string |
| `number` | Force numeric format + decimals |

### `decimals` (integer)
Number of decimal places for numeric values. Default: `1`.

### `unit` (string)
Unit appended after the value. Leave `""` to use the HA entity's own unit.

### `tap_action` (object)
```json
{ "action": "ACTION_NAME", "target": "entity_id_if_needed" }
```

| Action | Description | Needs target? |
|---|---|---|
| `none` | No action | No |
| `more-info` | Opens HA more-info modal | No (uses badge entity) |
| `toggle` | Calls `homeassistant.toggle` | Yes (entity_id) |
| `turn_on` | Calls `homeassistant.turn_on` | Yes |
| `turn_off` | Calls `homeassistant.turn_off` | Yes |
| `cover_open` | Opens a cover | Yes |
| `cover_close` | Closes a cover | Yes |
| `cover_stop` | Stops a cover | Yes |
| `lock` | Locks a lock | Yes |
| `unlock` | Unlocks a lock | Yes |
| `script` | Runs a script | Yes (script entity) |
| `automation` | Triggers an automation | Yes |

---

## 3. Templates by entity domain

### Binary sensor (door, window, motion, smoke…)
```json
{
  "entity":      "binary_sensor.front_door",
  "icon":        "mdiDoorOpen",
  "label":       "PORTA",
  "color":       "green",
  "displayMode": "icon_value",
  "template":    "{value}",
  "format":      "state",
  "pulse":       true,
  "tap_action":  { "action": "more-info", "target": "" }
}
```
> `format: state` shows "on"/"off" — the template layer can map this, but
> currently the badge shows the raw HA state. For Italian labels use i18n in
> the dashboard; for custom text, use `template` with static strings.

### Temperature sensor
```json
{
  "entity":      "sensor.living_room_temperature",
  "icon":        "mdiThermometer",
  "label":       "TEMP",
  "color":       "blue",
  "displayMode": "full",
  "template":    "{value}",
  "format":      "number",
  "decimals":    1,
  "unit":        "°C",
  "tap_action":  { "action": "more-info", "target": "" }
}
```

### Power sensor (W / kW)
```json
{
  "entity":      "sensor.house_power",
  "icon":        "mdiFlash",
  "label":       "POTENZA",
  "color":       "amber",
  "displayMode": "full",
  "template":    "{value}",
  "format":      "number",
  "decimals":    0,
  "unit":        "W",
  "tap_action":  { "action": "more-info", "target": "" }
}
```

### Solar production
```json
{
  "entity":      "sensor.fv_power",
  "icon":        "mdiSolarPower",
  "label":       "FV",
  "color":       "lime",
  "displayMode": "full",
  "template":    "{value}",
  "format":      "number",
  "decimals":    2,
  "unit":        "kW",
  "tap_action":  { "action": "more-info", "target": "" }
}
```

### Light (toggle tap)
```json
{
  "entity":      "light.kitchen",
  "icon":        "mdiLightbulb",
  "label":       "CUCINA",
  "color":       "amber",
  "displayMode": "icon_value",
  "format":      "state",
  "pulse":       false,
  "tap_action":  { "action": "toggle", "target": "light.kitchen" }
}
```

### Lock (with confirm)
```json
{
  "entity":      "lock.front_door",
  "icon":        "mdiLock",
  "label":       "SERRATURA",
  "color":       "red",
  "displayMode": "icon_value",
  "format":      "state",
  "tap_action":  { "action": "unlock", "target": "lock.front_door" }
}
```

### Static label (no entity)
```json
{
  "entity":      "",
  "icon":        "mdiHome",
  "label":       "",
  "color":       "gray",
  "displayMode": "value_only",
  "template":    "Casa",
  "tap_action":  { "action": "none", "target": "" }
}
```

---

## 4. Questions to ask before generating a badge

When the user says "create a badge that shows X":

1. **Which entity?** `sensor.*` / `binary_sensor.*` / `light.*` / `cover.*` etc.
2. **What to display?** value only / icon + value / full label
3. **Color?** semantic (green=active, amber=energy, blue=temp, red=alert)
4. **Size?** small / medium (default) / large
5. **Tap action?** none / more-info / toggle / service call
6. **Pulse?** for active/alert states → yes
7. **Unit?** from HA or override
8. **Decimals?** for numeric sensors

---

## 5. Output to produce

Generate ONLY `manifest.json`. The user will package it manually or paste it
in the badge editor.

```
manifest.json         ← REQUIRED — paste in editor or package in ZIP
preview.png           ← OPTIONAL — 200×60 px screenshot of the badge
```

### How to install

**Option A — Direct import (no ZIP needed):**
> Dashboard → Store → Distintivi → "Crea distintivo"
> Paste the config fields manually in the editor form.
> This works for quick one-off badges.

**Option B — ZIP import:**
```
my-badge-1.0.0.zip
├── manifest.json
└── preview.png  (optional)
```
> Dashboard → Store → Distintivi → "Importa ZIP"
> Drag-drop the ZIP. No server needed — parsed client-side.

**Option C — GitHub repository:**
```
github.com/user/my-badge/
├── manifest.json
└── README.md
```
> Dashboard → Store → Distintivi → "Aggiungi da git" → `user/my-badge`
> The dashboard fetches `manifest.json` from the default branch.

---

## 6. Complete example — "Temperatura soggiorno"

User request: *"crea un badge che mostra la temperatura del soggiorno con icona termometro, colore blu, con tap su more-info"*

Output `manifest.json`:
```json
{
  "id":          "temperatura-soggiorno",
  "name":        "Temperatura Soggiorno",
  "version":     "1.0.0",
  "author":      "Oikos User",
  "description": "Temperatura live del soggiorno con tap su grafico storico.",
  "config": {
    "entity":      "sensor.soggiorno_temperature",
    "icon":        "mdiThermometer",
    "label":       "SOGGIORNO",
    "color":       "blue",
    "size":        "md",
    "displayMode": "full",
    "pulse":       false,
    "template":    "{value}",
    "format":      "number",
    "decimals":    1,
    "unit":        "°C",
    "tap_action":  { "action": "more-info", "target": "" }
  }
}
```

> After generating: suggest the user verify `entity` matches their actual HA entity ID.

---

## 7. Validation checklist

Before outputting `manifest.json`:
- [ ] `id` matches `^[a-z0-9][a-z0-9_-]{0,63}$`
- [ ] `name` non-empty
- [ ] `config.entity` is a plausible HA entity ID (domain.name format) or `""`
- [ ] `config.color` is one of the named colors or a valid hex
- [ ] `config.displayMode` is one of `full | icon_value | label_value | value_only`
- [ ] `config.size` is `sm | md | lg`
- [ ] `config.tap_action.action` is a valid action name
- [ ] `config.tap_action.target` is set when the action requires an entity
- [ ] `config.decimals` is an integer ≥ 0
- [ ] `version` follows semver (e.g. `"1.0.0"`)

---

## 8. Using this skill with non-Claude agents

**Claude Code**: place this file at `BADGE_SKILL.md` in the project root.
Auto-loaded via YAML frontmatter.

**OpenAI / GitHub Copilot / Cursor**: paste content into system prompt.
Remove the YAML frontmatter block (lines 1–7) if it causes parsing issues.
