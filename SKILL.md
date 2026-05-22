---
name: oikos-card-starter
description: >
  Skill for Claude/AI agents to create community cards for the Oikos
  dashboard using this starter kit. Cards are React+Vite ESM bundles with
  the SDK injected from window.__OIKOS_SDK__. Load this skill when the user
  is working inside `oikos-card-starter/` and asks to create, modify, or
  package a card.
---

# Oikos Card Starter — AI Agent Skill

> **Agent-agnostic.** This file works with any AI coding assistant:
> Claude Code (auto-loaded via the YAML frontmatter above), GitHub Copilot,
> OpenAI Codex, Cursor, or any agent that reads file context.
> When using a non-Claude agent, paste this file's content into the
> system prompt or project instructions.

This repo is a **starter kit** for creating independent Oikos community cards
outside the official `oikos-cards` repo. The user clones, edits one card at a
time in `cards/<id>/`, builds with Vite, packs into a ZIP, and distributes.

---

## 1. Repo map

```
oikos-card-starter/
├── cards/my-card/          ← user works here
├── examples/               ← 4 complete cards to copy patterns from
│   ├── hello-world/          (no HA, just config persistence)
│   ├── sensor-display/       (reading HA state + attributes)
│   ├── light-toggle/         (callService, optimistic UI)
│   ├── sensor-chart/         (fetchHistory + recharts sparkline)
│   └── html-counter/         (HTML iframe format)
├── tools/                  ← build-card.mjs / pack-card.mjs / vite-plugin
├── docs/                   ← 7 markdown guides
├── package.json
└── README.md
```

When the user says "create a card that does X":
1. Create (or edit) in `cards/my-card/` if it's their first card
2. If they want multiple cards, suggest duplicating → `cards/<new-id>/`
3. After changes → suggest `npm run build:my` (build + pack in one step)

---

## 2. Card anatomy

```
cards/my-card/
├── manifest.json            ← REQUIRED
├── src/
│   ├── Card.jsx             ← REQUIRED — default export
│   └── Settings.jsx         ← OPTIONAL — default export
├── logo.png                 ← opt, icona/brand della card (es. 128×128 px)
│                               Accetta anche: .jpg .gif .webp .svg
│                               Mostrata nell'intestazione del dettaglio e nel grid
├── preview.png              ← opt, screenshot della card in funzione (3:2 ratio, ≤200 KB)
│                               Mostrata nel dettaglio come anteprima separata dal logo
└── template.yaml            ← opt, if the card needs HA packages
```

### Minimal `manifest.json`

```json
{
  "id":            "my-card",
  "name":          "My Card",
  "version":       "1.0.0",
  "author":        "Your Name",
  "description":   "One sentence about what it does.",
  "sdkVersion":    "^1.1.0",
  "hasSettings":   true,
  "entry":         "dist/my-card.js",
  "settings":      "dist/my-card.settings.js",
  "tags":          ["energy", "home"],
  "configVersion": 1,
  "defaultWidth":  "half"
}
```

`defaultWidth`: `"sm" | "half" | "lg" | "full"`.

**Store policy (validated at install time):**
- `id` regex: `^[a-z0-9][a-z0-9_-]{0,63}$` — lowercase, hyphens/underscores only.
  Namespaced IDs use `__` as the filesystem separator (e.g. `owner__card-name`).
- `sdkVersion`: semver range checked by Store (`^1.1.0` for SDK 1.x).
- No fetches to **undeclared** external hosts — every external URL must be declared in
  `manifest.json` under `permissions.hosts` (or the Store will block the card).
- No `auth.access_token` usage — never read the HA long-lived token from the dashboard.
- No global CSS — cards must not inject styles into the parent document.
- `preview.png`: 3:2 ratio, max **600×400 px**, ≤ 200 KB.

### `src/Card.jsx` (template)

Always use `useStyles()` — never hardcode colors, radii, or font sizes.
See **section 3b** for the full design system reference.

```jsx
import { Thermometer } from 'lucide-react'
import { useStyles, useCardConfig, useDashboard, registerCardTranslations, useT } from '@oikos/sdk'
import it from './i18n/it.json'
import en from './i18n/en.json'

registerCardTranslations('card-my-card', { it, en })

export default function MyCard({ cardId = 'my-card' }) {
  const s = useStyles()
  const { t } = useT('card-my-card')
  const { getState } = useDashboard()
  const [config] = useCardConfig(cardId, { entityId: '' })

  if (!config.entityId) {
    return (
      <div style={{ ...s.card, color: s.tokens.color.muted, fontSize: 12, fontStyle: 'italic' }}>
        {t('noEntity')}
      </div>
    )
  }

  const value = getState(config.entityId)
  return (
    <div style={s.card}>
      <div style={s.row}>
        <Thermometer size={14} color={s.tokens.color.amber} />
        <span style={s.label}>{t('label')}</span>
      </div>
      <div style={s.value}>{value ?? '—'}</div>
    </div>
  )
}
```

### `src/Settings.jsx` (template)

```jsx
import { useCardConfig, EntityField, Section, Field } from '@oikos/sdk'

export default function MySettings({ cardId }) {
  const [config, setConfig] = useCardConfig(cardId, { entityId: '' })
  return (
    <Section title="Configuration">
      <Field label="Entity">
        <EntityField
          field="entityId"
          config={config}
          setConfig={setConfig}
          filterDomain="sensor"
        />
      </Field>
    </Section>
  )
}
```

---

## 3. What `@oikos/sdk` exports

See `docs/02-sdk-reference.md` for the full list with examples. Summary:

```js
// React core (singleton shared with the dashboard — NOT bundled in your card)
import { useState, useEffect, useMemo, useRef, useCallback } from 'react'

// Lucide icons (all available, auto tree-shaken)
import { Sun, Lightbulb, Power, Thermometer } from 'lucide-react'

// Recharts
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'

// Framer Motion
import { motion, AnimatePresence } from 'framer-motion'

// Oikos SDK
import {
  // Hooks
  useCardConfig,        // persistent per-card config (cross-device sync)
  useDashboard,         // HA context: dark, getState, callService, haStates, fetchHistory...
  useSafeHass,          // safe hass wrapper with 20/s rate-limit
  useHaText,            // bind input_text.X as React state
  useHaNumber,          // bind input_number.X
  useHaBool,            // bind input_boolean.X
  usePackageInstaller,  // YAML installer (for cards that create HA entities)
  PackageSection,       // standard install/reinstall/uninstall/update UI — always use this, never roll your own

  // Settings primitives
  Section, Field, SettingsRow,
  TextField, NumberField, Toggle, Slider, Pills, ColorCircles,
  EntityField, MdiIconPicker,
  ACCENT_COLORS,

  // Helpers
  apiUrl,               // add-on backend URL (for custom fetch)
  getOverlayRoot,       // root for createPortal (popups)
  registerCardWatcher,  // HA-state-driven auto popups
  MdiIcon,              // <MdiIcon name="mdi:weather-sunny" size={20}/>
} from '@oikos/sdk'
```

---

## 3b. Design system — visual alignment with Oikos

**Rule: never hardcode colors, radii, or font sizes.** Always use `useStyles()`.
This guarantees the card follows the user's current theme (dark/light) and
future dashboard updates automatically.

```js
const s = useStyles()
```

### Preset styles (`s.*`)

| Key | What it gives you |
|---|---|
| `s.card` | standard card wrapper — padding 16/20 px, radius 16 px, border, bg |
| `s.cardGlass` | same + `backdropFilter: blur(20px)` for overlay use |
| `s.row` | `flex, align-center, gap 8px` — use for header icon+label rows |
| `s.rowBetween` | same + `justify-content: space-between` |
| `s.col` | `flex-direction: column, gap 8px` |
| `s.colTight` | same with `gap 4px` |
| `s.grow` | `flex: 1, minWidth: 0` — fills remaining space |
| `s.label` | 11 px · 700 · UPPERCASE · letter-spacing · muted color · mb 8px |
| `s.title` | 15 px · 700 · primary color |
| `s.value` | **40 px · 800 · tabular-nums · lineHeight 1** — main KPI number |
| `s.valueAmber` | same in amber — energy, power, cost |
| `s.valueGreen` | same in green — state on, positive delta |
| `s.valueBlue` | same in blue — temperature, info metric |
| `s.body` | 13 px · 500 — body text |
| `s.hint` | 11 px · 500 · muted — secondary text, units |
| `s.input` | full-width text input, theme-aware |
| `s.select` | full-width `<select>`, theme-aware |
| `s.slider` | `<input type="range">`, accent-color amber |
| `s.buttonPrimary` | amber filled button (`color: '#000'`) |
| `s.buttonGhost` | ghost button (border + bg-ghost) |
| `s.iconButton` | transparent icon button |
| `s.badgeAmber` | small amber badge (10 px · 700) |
| `s.badgeGreen` | small green badge |

### Tokens (`s.tokens.*`)

```js
s.tokens.color.primary    // var(--text-primary)
s.tokens.color.muted      // var(--text-muted)
s.tokens.color.amber      // var(--amber, #f59e0b)     ← default accent
s.tokens.color.amberLight // var(--amber-light, rgba(245,158,11,.1))
s.tokens.color.green      // var(--green, #22c55e)
s.tokens.color.blue       // var(--blue, #3b82f6)
s.tokens.color.purple     // var(--purple, #8b5cf6)
s.tokens.color.red        // var(--red, #ef4444)
s.tokens.color.border     // var(--border-medium, rgba(255,255,255,.08))

s.tokens.radius.sm        // 8     s.tokens.radius.md // 12
s.tokens.radius.lg        // 16    s.tokens.radius.xl // 20

s.tokens.space.xs         // 4     s.tokens.space.sm  // 8
s.tokens.space.md         // 12    s.tokens.space.lg  // 16
s.tokens.space.xl         // 20    s.tokens.space.xxl // 24

s.tokens.font.label       // { fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em' }
s.tokens.font.value       // { fontSize:40, fontWeight:800, letterSpacing:'-1px', lineHeight:1 }
s.tokens.font.body        // { fontSize:13, fontWeight:500 }
s.tokens.font.hint        // { fontSize:11, fontWeight:500 }
s.tokens.font.title       // { fontSize:15, fontWeight:700 }
```

### Color semantics — when to use which color

| Color | Use for |
|---|---|
| **amber** | primary accent, energy/power values, icons in header rows, loading state |
| **green** | entity on/active, positive trend, success state, import from grid (if FV) |
| **blue** | temperature, humidity, info metrics, neutral measurement |
| **red** | entity off/error, negative delta, alert, export to grid (if FV) |
| **purple** | premium feature, advanced metric |
| **muted** | secondary labels, units, hints, disabled state |

### Standard card anatomy

```
┌─ s.card ───────────────────────────────┐
│ s.row                                  │
│   <Icon size={14} color={amber}/>      │ ← Lucide icon, 14px, amber
│   <span style={s.label}>LABEL</span>   │ ← uppercase, muted
│                                        │
│ <div style={s.value}>42.3</div>        │ ← main number, 40px
│ <span style={s.hint}>kWh</span>        │ ← unit, 11px muted
└────────────────────────────────────────┘
```

### Complete example — sensor display

```jsx
import { Zap } from 'lucide-react'
import { useStyles, useCardConfig, useDashboard, registerCardTranslations, useT } from '@oikos/sdk'
import it from './i18n/it.json'
import en from './i18n/en.json'

registerCardTranslations('card-my-card', { it, en })

export default function MyCard({ cardId = 'my-card' }) {
  const s = useStyles()
  const { t } = useT('card-my-card')
  const { getState, getAttr } = useDashboard()
  const [cfg] = useCardConfig(cardId, { entityId: '' })

  const raw   = getState(cfg.entityId)
  const unit  = getAttr(cfg.entityId, 'unit_of_measurement') ?? ''
  const value = raw != null ? parseFloat(raw).toFixed(1) : '—'

  return (
    <div style={s.card}>
      <div style={s.row}>
        <Zap size={14} color={s.tokens.color.amber} />
        <span style={s.label}>{t('label')}</span>
      </div>
      <div style={{ ...s.row, alignItems: 'baseline', gap: s.tokens.space.xs }}>
        <span style={s.valueAmber}>{value}</span>
        <span style={s.hint}>{unit}</span>
      </div>
    </div>
  )
}
```

### What NOT to do

```jsx
// ✗ hardcoded colors — breaks dark/light theme
<div style={{ background: '#1e293b', border: '1px solid #334155', color: '#f8fafc' }}>

// ✗ inline font sizes
<div style={{ fontSize: 24, fontWeight: 700, color: '#f59e0b' }}>

// ✓ always useStyles()
<div style={s.card}>
<div style={s.value}>
<div style={{ color: s.tokens.color.amber }}>
```

---

## 3c. Mobile — designing cards that work on phones

Oikos has an optional auto-scale system for mobile. Understanding how it works lets you build cards that look good **with or without scaling**.

### How the scaling system works

The dashboard scales cards only when **two or more cards are placed side by side in the same cell** (`cardCols > 1`). Single-column cards are **never scaled** — they must adapt to whatever width the container gives them.

| Situation | Behaviour |
|---|---|
| `cardCols = 1` (single card) | No scale. Card fills container width. Must be fluid. |
| `cardCols > 1` + scale ON | Probe render at full width → scale down proportionally. |
| `cardCols > 1` + scale OFF | No scale. Card fills its grid slot (may overflow). |

### Rules for fluid cards (cardCols = 1)

Always write cards as if they own 100% of an unknown width. Never assume a fixed pixel width.

```jsx
// ✓ fluid container — adapts to any column width
<div style={{ width: '100%', minWidth: 0 }}>

// ✗ fixed width — breaks on narrow screens
<div style={{ width: 320 }}>
```

**Recharts** — always use `ResponsiveContainer`, never set a fixed `width` on the chart:

```jsx
// ✓
<ResponsiveContainer width="100%" height={120}>
  <LineChart data={data}>...</LineChart>
</ResponsiveContainer>

// ✗ — recharts scrollWidth > containerW → triggers unwanted scale
<LineChart width={300} height={120} data={data}>...</LineChart>
```

**Text** — use `overflow: hidden; textOverflow: ellipsis; whiteSpace: nowrap` on labels that can be long. Never let text force the container to grow.

**Flex layouts** — always add `minWidth: 0` to flex children that contain text or charts:

```jsx
<div style={{ display: 'flex', gap: 8 }}>
  <div style={{ flex: 1, minWidth: 0 }}>  {/* ✓ */}
    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
      {longEntityName}
    </span>
  </div>
</div>
```

### Rules for multi-card cells (cardCols > 1)

When the user places two cards side by side and scale is ON, the card is first rendered at its "natural" full-column width, then scaled down. The card should:

- Have a sensible **minimum width** in its design (the probe renders at `containerW × cardCols`)
- Not rely on `overflow: hidden` at the card root — scaling clips content otherwise
- Use `useStyles()` sizes (`s.value`, `s.label`) so font sizes scale with the transform

### What NOT to do on mobile

```jsx
// ✗ fixed pixel width on any inner element
<div style={{ width: 300, height: 200 }}>

// ✗ recharts with static width prop (causes false overflow detection)
<BarChart width={280} height={100} />

// ✗ position: absolute without a bounded parent — escapes the scaled container
<div style={{ position: 'absolute', right: -10 }}>

// ✓ all containers fluid, recharts via ResponsiveContainer
```

---

## 4. Procedures — when the user asks "create a card that..."

Oikos supports three card formats. Pick the right one based on the user's request:

| Format | When to use |
|---|---|
| **JAVA** (React + Vite) | Settings panel, component reuse, HA hooks, light bundle |
| **HTML** (iframe) | Zero toolchain; plain HTML/CSS/JS; SVG/Chart.js; URL-hosted |
| **JSON Smart Card** | No code; visual widgets (KPI, gauge, sparkline); visual editor |

---

### 4a. JAVA card (React + Vite) — default format

Questions to ask (or infer from context):

1. **What does it show?** live value, chart, state, control
2. **Which HA entities?** `sensor.X` / `climate.X` / `light.X` etc.
3. **Interaction?** read-only, toggle, slider, popup, tap → more-info
4. **Settings?** entity picker + extra parameters
5. **Icon?** Lucide (`Sun`, `Thermometer`, `Lightbulb`...)
6. **Width?** `sm` / `half` / `lg` / `full`
7. **Store tags?** `energy`, `home`, `climate`, etc.
8. **HA package needed?** Does it need to create counters/automations on HA?
   If yes → `template.yaml` with `# oikos:package_version: 1.0.0` header +
   `usePackageInstaller` in Settings + `<PackageSection pkg={pkg} .../>` as the
   **first element** in the Settings return (before all other Sections).
   `PackageSection` provides install/reinstall/uninstall/update UI automatically.
9. **Distribution?** GitHub Release or private ZIP?

Output to produce:
- `cards/<id>/manifest.json`
- `cards/<id>/src/Card.jsx`
- `cards/<id>/src/Settings.jsx` (if `hasSettings: true`)
- `cards/<id>/template.yaml` (if HA package needed)

Then suggest:
```bash
npm run build cards/<id>/
npm run pack  -- cards/<id>
```

---

### 4b. HTML card (iframe format)

A single self-contained `.html` file (inline CSS + JS) mounted in a sandboxed
`<iframe>` by the dashboard. Communicates via `postMessage`. No Vite, no React,
no SDK — just plain HTML.

**When to choose:** no build toolchain wanted; needs Chart.js / D3 / SVG; author
doesn't know React; distribution via raw GitHub URL or paste.

Questions to ask: which HA entities, desired interaction (tap? toggle? slider?),
desired height, whether 24h history or weather forecast is needed.

Output to produce — a **single `.html` file** with:

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="version" content="1.0.0">
<title>My Card</title>
<style>
  html, body { margin: 0; padding: 0; font-family: system-ui, sans-serif; }
  .card { padding: 16px; color: #e2e8f0; background: #0f172a; border-radius: 12px; }
  .card.light { color: #0f172a; background: #f8fafc; }
</style>
</head>
<body>
  <div class="card" id="root">…</div>
<script>
  const ENTITY = 'sensor.living_room_temperature'

  window.addEventListener('message', ev => {
    const msg = ev.data
    if (!msg || typeof msg !== 'object') return
    if (msg.type === 'hass-update') {
      const st = msg.states?.[ENTITY]
      document.getElementById('root').className = 'card' + (msg.dark ? '' : ' light')
      // render st.state / st.attributes …
    }
    if (msg.type === 'history-update' && msg.entityId === ENTITY) {
      // msg.data = [{ x: timestamp, y: numericValue }, ...]
    }
  })

  // Set iframe height (default 280 px)
  window.parent.postMessage({ type: 'set-height', height: 180 }, '*')

  // Request 24h history (optional)
  window.parent.postMessage({ type: 'request-history', entityId: ENTITY, hours: 24 }, '*')

  // Tap → native HA more-info
  document.getElementById('root').addEventListener('click', () => {
    window.parent.postMessage({ type: 'open-more-info', entityId: ENTITY }, '*')
  })

  // Call a HA service (optional)
  // window.parent.postMessage({ type: 'call-service', domain: 'light', service: 'toggle',
  //   data: { entity_id: 'light.kitchen' } }, '*')
</script>
</body>
</html>
```

**Strict rules:**
- All CSS in `<style>`, all JS inline — no `<link>`, no `<script src="https://...">`,
  no external `<img>` (the iframe sandbox blocks external loads).
- No `localStorage` for critical data — the iframe may run in a different origin.
- `<meta name="version" content="x.y.z">` is required for Store update detection.

Installation: **Store → Community → HTML** → Upload file / Paste URL / Paste inline.
See `docs/06-html-cards.md` for the full protocol reference.

---

### 4c. JSON Smart Card (no-code)

A single `card.json` file that the dashboard renders as a reactive SVG tree.
No build, no code — just JSON with widget declarations and HA entity bindings.

**When to choose:** dashboard-style KPI/gauge card; the user wants to reconfigure
it from the visual editor; rendering must be deterministic and lightweight.

Questions to ask: which HA entities, desired layout (KPI + sparkline? gauge?
arc + value?), preferred `aspectRatio`, desired tap action.

**Choose `aspectRatio`:**
- 1–2 large values → `"2/1"`
- KPI + sparkline → `"3/1"`
- Dominant gauge → `"1/1"`
- Wide banner → `"4/1"`

Output to produce — `card.json`:

```json
{
  "$schema": "/schemas/smart-card-v1.json",
  "id": "my-energy-card",
  "version": "1.0.0",
  "name": "Energy — live",
  "aspectRatio": "2/1",
  "container": { "background": "#0f172a", "borderRadius": 16 },
  "widgets": [
    { "type": "text",         "x": 8, "y": 8, "text": "Production",
      "fontSize": 3, "fill": "#94a3b8" },
    { "type": "entity-state", "entity": "sensor.fv_power",
      "x": 8, "y": 20, "format": "number", "decimals": 1, "unit": "kW",
      "fontSize": 8, "fontWeight": 700, "fill": "#fbbf24" },
    { "type": "sparkline",    "entity": "sensor.fv_power",
      "x": 55, "y": 10, "width": 40, "height": 30,
      "stroke": "#f59e0b", "fill": "rgba(245,158,11,.15)", "hours": 24 }
  ],
  "actions": { "tap": { "type": "more-info", "entity": "sensor.fv_power" } }
}
```

Widget types: `rect`, `circle`, `text`, `entity-state`, `entity-icon`,
`sparkline`, `range-slider`, `segmented-arc`, `horseshoe`.

Coordinates are in **logical units** of the viewBox — for `"2/1"` the viewBox
is `0 0 100 50`, so a full-width widget has `width: 100`.

**Validate before output:** `$schema`, `id`, `version`, `name`, `aspectRatio`,
`widgets` all present; all `entity` values plausible; coordinates inside viewBox;
`aspectRatio` uses `/` not `:` (e.g. `"2/1"` not `"2:1"`).

If a GitHub repo is needed, also generate `repository.json`:
```json
{
  "version": "1.0.0",
  "sdkVersion": "1.0.0",
  "cards": [{ "id": "my-energy-card", "name": "Energy — live",
              "version": "1.0.0", "author": "You",
              "description": "…", "sdkVersion": "^1.0.0",
              "path": "cards/my-energy-card" }]
}
```

Installation: **Store → Community → JSON** → paste `owner/repo`.
See `docs/07-json-cards.md` for the full schema reference.

---

## 5. Common patterns

### Read HA state

```js
const { getState, getFloat, getAttr } = useDashboard()
const state = getState('sensor.temperature')      // string | null
const num   = getFloat('sensor.temperature')       // number, 0 if missing
const unit  = getAttr('sensor.temperature', 'unit_of_measurement')
```

### Call a HA service

```js
const { callService } = useDashboard()
callService('switch', 'turn_on', 'switch.x')
  ?.catch(err => console.error(err))
```

Signature: `callService(domain, service, entityId, serviceData?)`.
Always `.catch()` to avoid unhandled promise rejection.

### Open HA more-info popup

```js
const { openMoreInfo } = useDashboard()
openMoreInfo('climate.x')
```

### Fetch 24h history (for charts)

```js
const { fetchHistory } = useDashboard()
useEffect(() => {
  const start = new Date(Date.now() - 24 * 3600_000)
  fetchHistory([config.entityId], start, new Date()).then(history => {
    const raw = history[config.entityId] ?? []
    setData(raw.map(p => ({ t: new Date(p.lu).getTime(), v: parseFloat(p.s) }))
              .filter(p => Number.isFinite(p.v)))
  })
}, [config.entityId])
```

### Card with installable YAML package

```jsx
import { usePackageInstaller } from '@oikos/sdk'
import TPL from '../template.yaml?raw'

const pkg = usePackageInstaller({ name: 'my_package', yaml: TPL })
// pkg.installed | pkg.bundledVersion | pkg.installedVersion | pkg.updateAvailable
// pkg.install() | pkg.uninstall()
```

`template.yaml` must start with:
```yaml
# oikos:package_id: my_package
# oikos:package_version: 1.0.0
```

---

## 6. Build, pack & publish

```bash
npm install                    # first time only
npm run build cards/<id>/      # → cards/<id>/dist/<id>.js + <id>.settings.js
npm run pack  -- cards/<id>    # → dist-cards/<id>-<version>.zip  (installazione manuale)
npm run pack:git -- cards/<id> # → dist-cards/<id>-git/           (repo GitHub standalone)
npm run build:my               # shortcut: build + pack ZIP "my-card"
npm run build:all              # build all cards/* + regenerate root manifest.json
npm run manifest               # regenerate root manifest.json only
```

Build requires only a valid `manifest.json` + `src/Card.jsx` with a default export.
`Settings.jsx` is optional. `preview.png` and `template.yaml` are automatically
included in the ZIP if present.

---

### Opzione A — ZIP (installazione manuale, nessun GitHub richiesto)

```bash
npm run build cards/<id>/
npm run pack  -- cards/<id>
# → dist-cards/<id>-<version>.zip
```

Dashboard → **Store → Comunità → JAVA → Carica ZIP**.
Nessun account GitHub necessario. Aggiornamenti manuali (ricarica ZIP ad ogni versione).
Perfetto per test locali o card private.

---

### Opzione B — Repo GitHub standalone (aggiornamenti automatici)

```bash
npm run build cards/<id>/
npm run pack:git -- cards/<id>
# → dist-cards/<id>-git/  (repo pronto per GitHub)
```

`pack:git` genera una cartella autonoma con: tools, release workflow, manifest root,
`.gitignore` corretto (senza `dist/`), README bilingue autogenerato.

**Pubblica su GitHub:**
```bash
cd dist-cards/<id>-git
git init && git checkout -b main
git add .
git commit -m "feat: <nome card> v1.0.0 — initial release"
gh repo create <username>/<id> --public --source=. --remote=origin --push
git tag v1.0.0 && git push origin main --tags
```

**Aggiungi al tuo dashboard:**
Dashboard → Store → Comunità → JAVA → Aggiungi → `<username>/<id>`

Il repo **non deve essere nel registry pubblico** per funzionare — puoi tenerlo
privato (visibile solo a chi ha il link) e aggiungerlo solo al tuo dashboard.

**Per renderla visibile a tutti (opzionale):**
Apri una PR su `Bobsilvio/oikos-card-starter` → `registry/cards`
e aggiungi `<username>/<id>` in ordine alfabetico.

**Aggiornamenti:**
```bash
# bump version in cards/<id>/manifest.json, poi:
npm run build cards/<id>/
npm run pack:git -- cards/<id>
cd dist-cards/<id>-git
git add . && git commit -m "release v1.1.0"
git tag v1.1.0 && git push origin main --tags
```
Il dashboard rileva la nuova versione e mostra il pulsante **Aggiorna**.

See `docs/04-distribuzione.md` for the full guide.

---

## 7. Common errors (details in `docs/05-troubleshooting.md`)

| Symptom | Cause | Fix |
|---|---|---|
| `Invalid hook call` | Duplicate React in bundle | Don't `import React from 'react'` — the SDK provides it |
| `Cannot resolve '../template.yaml?raw'` | Vite `?raw` unsupported | Run `npm install` to ensure Vite ≥ 5.x |
| Card not in Store after upload | Malformed `manifest.id` | Only `[a-z0-9_-]` + `/` for namespaced IDs |
| `Cannot read properties of undefined (reading 'React')` | Card loaded outside dashboard | Cards run ONLY inside the Oikos dashboard, not standalone |
| Bundle >200 KB | React/lucide being bundled | Verify the SDK plugin is active in `tools/build-card.mjs` |

---

## 8. Difference from `oikos-cards` repo

`oikos-cards` (Bobsilvio) = official Oikos cards (appliance, thermostat, vacuum...).
Has `npm run build:all`, aggregated manifest, GitHub Action.

This `oikos-card-starter` = template for anyone building their OWN card.
Simpler, one card at a time, focused on ZIP + private distribution.

---

## 9. Using this skill with non-Claude agents

**Claude Code**: place this file at `SKILL.md` in the project root. Claude Code
auto-loads it when you run `claude` in the directory. The YAML frontmatter above
controls the skill name and description.

**OpenAI Codex / o3**: paste the content of this file into the System Prompt or
project instructions in the Codex interface. Remove the YAML frontmatter block
(lines 1–10) if it causes parsing issues.

**GitHub Copilot (Workspace)**: add this file to `.github/copilot-instructions.md`
or reference it explicitly: *"follow the instructions in SKILL.md"*.

**Cursor / Windsurf**: add to `.cursor/rules` or paste into the "Project Rules" field.

**Any other agent**: paste the content directly into context. The markdown
structure is self-explanatory — the agent will understand the repo layout, SDK
exports, and build commands without any special tooling.
