# 07 — JSON Smart Cards (no-code)

[🇮🇹 Italiano](#-italiano) · [🇬🇧 English](#-english)

---

## 🇮🇹 Italiano

Le **Smart Card** sono card definite da un singolo file `card.json` (schema v1) che la dashboard renderizza come **SVG con widget reattivi** legati a entità Home Assistant. Niente toolchain, niente codice.

> **Vuoi una card React/Vite?** → [`01-quickstart.md`](./01-quickstart.md)
> **Vuoi una card HTML iframe?** → [`06-html-cards.md`](./06-html-cards.md)

### Quando scegliere JSON

| Pro | Contro |
|---|---|
| Zero codice, editor visuale integrato | Solo widget definiti dallo schema |
| Rendering SVG nativo, performante | UI complessa non possibile |
| Distribuzione semplice (singolo JSON) | Niente animazioni custom, niente stato locale |
| L'utente finale può riconfigurarla via UI | Niente componenti riutilizzabili |

### Anatomia minima

```json
{
  "$schema": "/schemas/smart-card-v1.json",
  "id": "my-energy-card",
  "version": "1.0.0",
  "name": "Energia — live",
  "aspectRatio": "2/1",
  "container": {
    "background": "#0f172a",
    "borderRadius": 16,
    "padding": 0
  },
  "widgets": [
    {
      "type": "text",
      "x": 8, "y": 8,
      "text": "Produzione",
      "fontSize": 3, "fill": "#94a3b8"
    },
    {
      "type": "entity-state",
      "entity": "sensor.sm_fv_power",
      "x": 8, "y": 20,
      "format": "number", "decimals": 1, "unit": "kW",
      "fontSize": 8, "fontWeight": 700, "fill": "#fbbf24"
    },
    {
      "type": "sparkline",
      "entity": "sensor.sm_fv_power",
      "x": 55, "y": 10, "width": 40, "height": 30,
      "stroke": "#f59e0b", "fill": "rgba(245,158,11,.15)",
      "hours": 24
    }
  ],
  "actions": {
    "tap": { "type": "more-info", "entity": "sensor.sm_fv_power" }
  }
}
```

**Concetti:**
- `aspectRatio` — rapporto `W/H` (`2/1`, `16/9`, `1/1`, ...). Definisce il `viewBox` SVG.
- Coordinate widget in **unità logiche** del viewBox (non pixel).
- `widgets[]` — array ordinato, render in z-order.

### aspectRatio → viewBox

| aspectRatio | viewBox (W × H) | Uso |
|---|---|---|
| `1/1`  | 100 × 100   | quadrata |
| `2/1`  | 100 × 50    | default, layout orizzontale |
| `3/1`  | 100 × 33.33 | banner largo |
| `4/1`  | 100 × 25    | striscia |
| `3/2`  | 100 × 66.67 | classica |
| `16/9` | 100 × 56.25 | video-style |
| `2/3`  | 66.67 × 100 | verticale |

### Widget disponibili

#### Primitive (no entità)

```json
{ "type": "rect",   "x":0,"y":0,"width":100,"height":50, "fill":"#1e293b", "rx":4 }
{ "type": "circle", "cx":50,"cy":25,"r":20, "fill":"#fbbf24" }
{ "type": "text",   "x":50,"y":25, "text":"Hello", "fontSize":6, "fill":"#fff", "textAnchor":"middle" }
```

#### Agganciate a Home Assistant

```json
// Valore entità formattato
{ "type":"entity-state", "entity":"sensor.temperature", "x":10,"y":10,
  "format":"number","decimals":1,"unit":"°C","fontSize":8,"fill":"#fff" }

// Icona entità
{ "type":"entity-icon", "entity":"light.kitchen", "x":50,"y":25,"size":12, "stateColor":true }

// Sparkline storico
{ "type":"sparkline", "entity":"sensor.power", "x":0,"y":30,"width":100,"height":20,
  "hours":24,"stroke":"#f59e0b","fill":"rgba(245,158,11,.2)" }

// Slider interattivo
{ "type":"range-slider", "entity":"light.kitchen", "attribute":"brightness",
  "x":10,"y":40,"width":80,"height":4,"min":0,"max":255,
  "service":{"domain":"light","service":"turn_on","dataKey":"brightness"} }

// Arco circolare
{ "type":"segmented-arc", "entity":"sensor.battery_soc",
  "cx":50,"cy":25,"r":18,"thickness":4,"startAngle":-120,"endAngle":120,
  "min":0,"max":100,"fill":"#22c55e","bgFill":"rgba(255,255,255,.1)" }

// Horseshoe gauge
{ "type":"horseshoe", "entity":"sensor.fv_power",
  "cx":50,"cy":30,"r":20,"thickness":6,"min":0,"max":6000,"fill":"#fbbf24" }
```

### Threshold — colore condizionale

```json
{
  "type": "circle", "cx":20,"cy":25,"r":8, "fill":"#475569",
  "thresholds": [
    { "entity":"sensor.fv_produzione","op":">","value":30,"fill":"#22c55e" },
    { "entity":"sensor.fv_produzione","op":">","value":15,"fill":"#fbbf24" }
  ]
}
```

Operatori: `>`, `<`, `>=`, `<=`, `==`, `!=`.

### Azioni

```json
"actions": {
  "tap":       { "type": "more-info", "entity": "sensor.x" },
  "doubleTap": { "type": "call-service", "domain":"switch","service":"toggle",
                 "data":{"entity_id":"switch.pump"} },
  "hold":      { "type": "navigate", "path":"/statistics" }
}
```

Tipi: `more-info`, `call-service`, `navigate`, `url`, `none`.

### Pubblicare un repo Smart Card

#### Struttura

```
my-smart-cards/
├── repository.json
└── cards/
    ├── energy-live/
    │   ├── card.json
    │   └── preview.png
    └── battery-status/
        └── card.json
```

#### `repository.json`

```json
{
  "version": "1.0.0",
  "sdkVersion": "1.0.0",
  "cards": [
    {
      "id": "energy-live",
      "name": "Energia Live",
      "version": "1.0.0",
      "author": "Mario Rossi",
      "description": "Produzione FV con sparkline 24h.",
      "sdkVersion": "^1.0.0",
      "path": "cards/energy-live",
      "preview": "preview.png"
    }
  ]
}
```

#### Installazione lato utente

**Store → Comunità → JSON**, incolla:
- `owner/repo`
- `https://github.com/owner/repo`

### Errori comuni

| Errore | Causa | Fix |
|---|---|---|
| "manifest non è JSON valido" | virgola finale, commenti | Valida con `jq` |
| "$schema mancante" | header assente | `"$schema":"/schemas/smart-card-v1.json"` |
| "aspectRatio non valido" | formato `2:1` | Usa `/`: `"2/1"` |
| Widget non appare | coordinate fuori viewBox | `x+width ≤ W`, `y+height ≤ H` |
| Entità non aggiornata | typo entity_id | Copia da HA → Developer Tools |
| Threshold non scatta | `value` come stringa | Numerico: `"value": 20` non `"20"` |
| Sparkline vuota | Recorder HA non registra | Verifica `recorder:` in `configuration.yaml` |

---

## 🇬🇧 English

**Smart Cards** are cards defined by a single `card.json` file (schema v1) that the dashboard renders as **reactive SVG widgets** bound to Home Assistant entities. No toolchain, no coding.

> **Want a React/Vite card?** → [`01-quickstart.md`](./01-quickstart.md)
> **Want an HTML iframe card?** → [`06-html-cards.md`](./06-html-cards.md)

### When to choose JSON

| Pros | Cons |
|---|---|
| Zero code, built-in visual editor | Only schema-defined widgets (no custom logic) |
| Native, performant SVG rendering | Complex UI (forms, multi-tab) not possible |
| Simple distribution (single JSON) | No custom animations, no local state |
| End users can reconfigure via UI | No reusable components |

**Good use case:** dashboard-style cards (big KPIs + sparkline, gauge, battery arc), cards that end users can reconfigure without touching code.

**Bad use case:** complex conditional logic, custom animations, external JS library integrations → use JAVA or HTML.

### Minimal anatomy

```json
{
  "$schema": "/schemas/smart-card-v1.json",
  "id": "my-energy-card",
  "version": "1.0.0",
  "name": "Energy — live",
  "aspectRatio": "2/1",
  "container": {
    "background": "#0f172a",
    "borderRadius": 16,
    "padding": 0
  },
  "widgets": [
    {
      "type": "text",
      "x": 8, "y": 8,
      "text": "Production",
      "fontSize": 3, "fill": "#94a3b8"
    },
    {
      "type": "entity-state",
      "entity": "sensor.sm_fv_power",
      "x": 8, "y": 20,
      "format": "number", "decimals": 1, "unit": "kW",
      "fontSize": 8, "fontWeight": 700, "fill": "#fbbf24"
    },
    {
      "type": "sparkline",
      "entity": "sensor.sm_fv_power",
      "x": 55, "y": 10, "width": 40, "height": 30,
      "stroke": "#f59e0b", "fill": "rgba(245,158,11,.15)",
      "hours": 24
    }
  ],
  "actions": {
    "tap": { "type": "more-info", "entity": "sensor.sm_fv_power" }
  }
}
```

**Key concepts:**
- `aspectRatio` — `W/H` ratio (`2/1`, `16/9`, `1/1`, ...). Defines the SVG `viewBox`.
- Widget coordinates are in **logical units** of the viewBox (not pixels).
- `widgets[]` — ordered array, rendered in z-order (first = bottom, last = top).

### aspectRatio → viewBox

| aspectRatio | viewBox (W × H) | Use |
|---|---|---|
| `1/1`  | 100 × 100   | square |
| `2/1`  | 100 × 50    | default, horizontal layout |
| `3/1`  | 100 × 33.33 | wide banner |
| `4/1`  | 100 × 25    | strip |
| `3/2`  | 100 × 66.67 | classic |
| `16/9` | 100 × 56.25 | video-style |
| `2/3`  | 66.67 × 100 | vertical |

Validation regex: `^\d+(\.\d+)?/\d+(\.\d+)?$`. Use `2/1` **not** `2:1`.

### Available widgets

#### Primitives (no entity)

```json
{ "type": "rect",   "x":0,"y":0,"width":100,"height":50, "fill":"#1e293b", "rx":4 }
{ "type": "circle", "cx":50,"cy":25,"r":20, "fill":"#fbbf24" }
{ "type": "text",   "x":50,"y":25, "text":"Hello", "fontSize":6, "fill":"#fff", "textAnchor":"middle" }
```

#### Bound to Home Assistant

```json
// Formatted entity state
{ "type":"entity-state", "entity":"sensor.temperature",
  "x":10,"y":10,"format":"number","decimals":1,"unit":"°C","fontSize":8,"fill":"#fff" }

// Entity icon (with optional stateColor)
{ "type":"entity-icon", "entity":"light.kitchen", "x":50,"y":25,"size":12,"stateColor":true }

// History sparkline
{ "type":"sparkline", "entity":"sensor.power",
  "x":0,"y":30,"width":100,"height":20,"hours":24,
  "stroke":"#f59e0b","fill":"rgba(245,158,11,.2)" }

// Interactive slider
{ "type":"range-slider", "entity":"light.kitchen","attribute":"brightness",
  "x":10,"y":40,"width":80,"height":4,"min":0,"max":255,
  "service":{"domain":"light","service":"turn_on","dataKey":"brightness"} }

// Circular arc 0–100%
{ "type":"segmented-arc","entity":"sensor.battery_soc",
  "cx":50,"cy":25,"r":18,"thickness":4,"startAngle":-120,"endAngle":120,
  "min":0,"max":100,"fill":"#22c55e","bgFill":"rgba(255,255,255,.1)" }

// Horseshoe gauge
{ "type":"horseshoe","entity":"sensor.fv_power",
  "cx":50,"cy":30,"r":20,"thickness":6,"min":0,"max":6000,"fill":"#fbbf24" }
```

### Threshold — conditional color

Every widget with `fill` / `stroke` accepts `thresholds[]` evaluated against an entity. First match wins:

```json
{
  "type": "circle",
  "cx":20,"cy":25,"r":8,
  "fill": "#475569",
  "thresholds": [
    { "entity":"sensor.fv_produzione","op":">","value":30,"fill":"#22c55e" },
    { "entity":"sensor.fv_produzione","op":">","value":15,"fill":"#fbbf24" },
    { "entity":"sensor.fv_produzione","op":">","value":5, "fill":"#f97316" }
  ]
}
```

Operators: `>`, `<`, `>=`, `<=`, `==`, `!=`. `value` is numeric (parsed as float).

### Actions

```json
"actions": {
  "tap":       { "type": "more-info", "entity": "sensor.x" },
  "doubleTap": { "type": "call-service", "domain":"switch","service":"toggle",
                 "data":{"entity_id":"switch.pump"} },
  "hold":      { "type": "navigate", "path":"/statistics" }
}
```

Types: `more-info`, `call-service`, `navigate`, `url`, `none`.

Card-level (entire card) or per-widget (`action` on a single widget).

### Publishing a Smart Card repo

#### Structure

```
my-smart-cards/
├── repository.json          ← catalog (required)
└── cards/
    ├── energy-live/
    │   ├── card.json
    │   ├── README.md
    │   └── preview.png
    └── battery-status/
        └── card.json
```

#### `repository.json`

```json
{
  "version": "1.0.0",
  "sdkVersion": "1.0.0",
  "cards": [
    {
      "id": "energy-live",
      "name": "Energy Live",
      "version": "1.0.0",
      "author": "Your Name",
      "description": "Solar production with 24h sparkline.",
      "sdkVersion": "^1.0.0",
      "path": "cards/energy-live",
      "preview": "preview.png"
    }
  ]
}
```

#### User-side installation

**Store → Community → JSON**, paste:
- `owner/repo`
- `owner/repo@branch`
- `https://github.com/owner/repo`
- `https://github.com/owner/repo/tree/branch`

The dashboard fetches `repository.json`, shows cards with previews, and allows installation. Fallback branch: `main` → `master`.

### Common errors

| Error | Cause | Fix |
|---|---|---|
| "manifest is not valid JSON" | trailing comma, comments | Validate with `jq` |
| "$schema missing" | missing header | `"$schema":"/schemas/smart-card-v1.json"` |
| "aspectRatio invalid" | `2:1` or `2x1` format | Use `/`: `"2/1"` |
| Widget not visible | coordinates outside viewBox | `x+width ≤ W`, `y+height ≤ H` |
| Entity not updating | entity_id typo | Copy from HA → Developer Tools → States |
| Threshold not triggering | `value` as string | Numeric: `"value": 20` not `"20"` |
| Sparkline empty | HA Recorder not tracking | Check `recorder:` in `configuration.yaml` |
| Slider doesn't change state | Wrong service / expired license | Check `service.domain`, license banner |

### Decision tree

```
Want to create a card for Oikos?
│
├── React/Vite + native Settings panel?
│       → JAVA (01-quickstart.md)
│
├── HTML/CSS/JS without React?
│       → HTML (06-html-cards.md)
│
└── Visual widgets only, no coding?
        → JSON Smart Card (this doc)
```
