# 02 — SDK Reference

[🇮🇹 Italiano](#-italiano) · [🇬🇧 English](#-english)

---

## 🇮🇹 Italiano

Tutto ciò che puoi importare da `@oikos/sdk` quando crei una card.

L'SDK è un singleton iniettato dalla dashboard in `window.__OIKOS_SDK__`.
Il plugin Vite del repo riscrive automaticamente `import` in accessi a
quella variabile, quindi nei tuoi file scrivi codice React standard.

---

> **⚠️ Regola fondamentale — sync cross-device**
>
> Non usare mai `localStorage` direttamente nella tua card.
> La config salvata in `localStorage` senza passare per `useCardConfig`
> **non viene sincronizzata** tra dispositivi: l'utente che configura la
> card dal PC vedrà la card vuota sul cellulare (e viceversa).
>
> Usa **sempre e solo `useCardConfig`** per salvare qualsiasi impostazione.

---

### Hooks

#### `useCardConfig(id, defaultConfig, options?)`

Config persistente per istanza di card. Salvata sul server Oikos e sincronizzata su tutti i device.

```js
const [config, setConfig] = useCardConfig(cardId, {
  entityId: '',
  label:    'Default',
}, {
  version:  1,
  migrate: (oldCfg, fromVersion) => {
    if (fromVersion < 1) oldCfg.label = oldCfg.title
    return oldCfg
  },
})
```

#### `useDashboard()`

```js
const {
  dark,            // boolean — tema dark/light attivo
  haStates,        // mappa entityId → { state, attributes, ... }
  getState,        // (id) → state string | null
  getFloat,        // (id) → number, 0 se mancante
  getAttr,         // (id, attr) → valore | null
  callService,     // (domain, service, entityId, data?) → Promise
  fetchHistory,    // (entityIds, start, end) → Promise<map>
  openMoreInfo,    // (id) → apre il more-info nativo HA
  connected,       // boolean — connessione HA WS attiva
} = useDashboard()
```

#### `useSafeHass()`

Wrapper sicuro su `hass` con rate-limit 20/s su callService.

```js
const hass = useSafeHass()
hass?.callService('light', 'turn_on', { entity_id: 'light.x' })
```

NON espone: `auth.access_token`, `connection`, `callApi`, `hassUrl`, `user`.

#### Bind live a entity HA

```js
import { useHaText, useHaNumber, useHaBool } from '@oikos/sdk'

const [text, setText, exists] = useHaText('input_text.my_setting')
const [num, setNum, exists]   = useHaNumber('input_number.threshold')
const [bool, setBool, exists] = useHaBool('input_boolean.notify_enabled')
```

#### `usePackageInstaller(opts)`

Installer YAML per card che richiedono package HA. Vedi [`docs/03-patterns.md`](./03-patterns.md#card-con-package-yaml).

#### `<PackageSection pkg label description? />`

Sezione standard installazione package. **Usare sempre questo componente** — non implementare UI pkg custom.
Va posizionato come **primo elemento** del return in Settings.jsx.
Fornisce automaticamente: status, banner aggiornamento, Installa/Reinstalla/Disinstalla, precheck, feedback.

```jsx
import { usePackageInstaller, PackageSection } from '@oikos/sdk'
const pkg = usePackageInstaller({ name: 'my_pkg', yaml: TPL })
<PackageSection pkg={pkg} label="Package HA" description="Installs HA entities." />
```

#### `registerCardWatcher(descriptor)`

Registra un watcher globale per popup auto-driven da stati HA. Vedi `docs/03-patterns.md`.

---

### Settings primitives

```js
import {
  Section, Field, SettingsRow,
  TextField, NumberField, Toggle, Slider, Pills, ColorCircles,
  EntityField, MdiIconPicker,
  ACCENT_COLORS,
} from '@oikos/sdk'
```

#### `<Section title hint?>`

Container per gruppo di settings.

#### `<Field label hint?>`

Riga settings con label sopra.

#### `<SettingsRow label hint?>`

Variante con label inline a sinistra (per toggle/slider compatti).

#### `<TextField value onChange placeholder? mono? />`

#### `<NumberField value onChange min max step />`

#### `<Toggle value onChange />`

#### `<Slider value onChange min max step format? leftLabel? rightLabel? />`

#### `<Pills options value onChange />`

```jsx
<Pills
  options={[{ value: 'auto', label: 'Auto' }, { value: 'on', label: 'Acceso' }]}
  value={config.mode}
  onChange={v => set('mode', v)}
/>
```

#### `<ColorCircles value onChange colors />`

```jsx
<ColorCircles
  value={config.accentColor}
  onChange={v => set('accentColor', v)}
  colors={ACCENT_COLORS}
/>
```

#### `<EntityField field config setConfig filterDomain? />`

```jsx
<EntityField
  field="entityId"
  config={config}
  setConfig={setConfig}
  filterDomain="climate"
/>
```

#### `<MdiIconPicker value onChange dark />`

Picker icona Material Design Icons (mdi:*).

---

### Helpers

#### `apiUrl(path)`

```js
import { apiUrl } from '@oikos/sdk'
const url = apiUrl('/api/cards')
fetch(url).then(r => r.json())
```

#### `getOverlayRoot()`

Element root per montare popup via `createPortal`.

```js
import { createPortal } from 'react-dom'
import { getOverlayRoot } from '@oikos/sdk'
return createPortal(<MyModal/>, getOverlayRoot())
```

#### `<MdiIcon name size? color? dark? />`

```jsx
import { MdiIcon } from '@oikos/sdk'
<MdiIcon name="mdi:weather-sunny" size={24} dark={dark}/>
```

---

### Design tokens

```js
import { tokens, useStyles, cx, ACCENT_COLORS } from '@oikos/sdk'
```

Usa CSS variables (`var(--text-primary)`, `var(--bg-secondary)`, ecc.) per adattarti automaticamente al dark/light.

---

### Librerie esterne (via SDK)

```js
import { useState, useEffect, useMemo, useRef } from 'react'
import { Sun, Lightbulb, Power } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts'
```

Non vengono bundle-izzate nella tua card — sono singleton condivisi con la dashboard.

---

### Export Tree

```
@oikos/sdk
├── React (singleton)            → useState, useEffect, useMemo, useRef, ...
│
├── Hooks
│   ├── useCardConfig(id, def, opts?)
│   ├── useDashboard()
│   ├── useSafeHass()
│   ├── useHaText(entityId)
│   ├── useHaNumber(entityId)
│   ├── useHaBool(entityId)
│   ├── usePackageInstaller(opts)
│   └── registerCardWatcher(descriptor)
│
├── Settings primitives
│   ├── Section / Field / SettingsRow
│   ├── TextField / NumberField / Toggle / Slider
│   ├── Pills / ColorCircles
│   ├── EntityField
│   ├── MdiIconPicker
│   └── ACCENT_COLORS
│
├── Helpers
│   ├── apiUrl(path)
│   ├── getOverlayRoot()
│   ├── MdiIcon
│   ├── tokens / useStyles / cx
│   └── getEntities / getHAConfig
│
└── External libraries (via singleton)
    ├── lucide-react (all icons)
    ├── recharts
    └── framer-motion
```

---

## 🇬🇧 English

Everything you can import from `@oikos/sdk` when building a card.

The SDK is a singleton injected by the dashboard into `window.__OIKOS_SDK__`.
The repo's Vite plugin automatically rewrites `import` statements as accesses to
that variable, so your files contain standard React code.

---

> **⚠️ Fundamental rule — cross-device sync**
>
> Never write to `localStorage` directly in your card.
> Config saved to `localStorage` outside `useCardConfig`
> **is not synchronized** across devices: a user who configures the card on a PC
> will see an empty card on their phone (and vice versa).
>
> Use **only `useCardConfig`** to persist any setting.

---

### Hooks

#### `useCardConfig(id, defaultConfig, options?)`

Per-instance persistent config. Stored on the Oikos server and synced to all devices at boot.

```js
const [config, setConfig] = useCardConfig(cardId, {
  entityId: '',
  label:    'Default',
}, {
  version:  1,
  migrate: (oldCfg, fromVersion) => {
    if (fromVersion < 1) oldCfg.label = oldCfg.title
    return oldCfg
  },
})
```

When you bump `version`, `migrate` runs once on saved data.

#### `useDashboard()`

```js
const {
  dark,            // boolean — current dark/light theme
  haStates,        // map entityId → { state, attributes, last_changed, ... }
  getState,        // (id) → state string | null
  getFloat,        // (id) → number, 0 if missing
  getAttr,         // (id, attr) → value | null
  callService,     // (domain, service, entityId, data?) → Promise
  fetchHistory,    // (entityIds, start, end) → Promise<map>
  openMoreInfo,    // (id) → opens native HA more-info dialog
  connected,       // boolean — HA WebSocket connection active
} = useDashboard()
```

#### `useSafeHass()`

Safe wrapper over `hass` with rate-limiting at 20/s on callService. Use when you need `states` directly (rare — `useDashboard` covers most cases).

```js
const hass = useSafeHass()
hass?.callService('light', 'turn_on', { entity_id: 'light.x' })
```

Does NOT expose: `auth.access_token`, `connection`, `callApi`, `hassUrl`, `user`.

#### Live HA entity bindings

```js
import { useHaText, useHaNumber, useHaBool } from '@oikos/sdk'

// input_text.X as React state
const [text, setText, exists] = useHaText('input_text.my_setting')

// input_number.X
const [num, setNum, exists] = useHaNumber('input_number.threshold')

// input_boolean.X
const [bool, setBool, exists] = useHaBool('input_boolean.notify_enabled')
```

Setters call `set_value` / `turn_on` / `turn_off`. `exists` indicates whether the entity exists in HA.

#### `usePackageInstaller(opts)`

YAML installer for cards that require HA packages (counters, automations, template sensors). See [`docs/03-patterns.md`](./03-patterns.md#card-con-package-yaml).

#### `<PackageSection pkg label description? />`

Standard package install UI. **Always use this component** — never implement custom pkg UI.
Place it as the **first element** in the Settings.jsx return, before all other Sections.
Handles automatically: install status, update banner, Install/Reinstall/Uninstall buttons, precheck warning, operation feedback.

```jsx
import { usePackageInstaller, PackageSection } from '@oikos/sdk'
const pkg = usePackageInstaller({ name: 'my_pkg', yaml: TPL })
<PackageSection pkg={pkg} label="HA Package" description="Installs HA entities." />
```

#### `registerCardWatcher(descriptor)`

Registers a global watcher for HA-state-driven auto popups. See `docs/03-patterns.md`.

---

### Settings primitives

```js
import {
  Section, Field, SettingsRow,
  TextField, NumberField, Toggle, Slider, Pills, ColorCircles,
  EntityField, MdiIconPicker,
  ACCENT_COLORS,
} from '@oikos/sdk'
```

#### `<Section title hint?>`

Container for a settings group.

#### `<Field label hint?>`

Settings row with label above. Wrapper for any input.

#### `<SettingsRow label hint?>`

Variant with inline label to the left of the control (for compact toggles/sliders).

#### `<TextField value onChange placeholder? mono? />`

#### `<NumberField value onChange min max step />`

#### `<Toggle value onChange />`

#### `<Slider value onChange min max step format? leftLabel? rightLabel? />`

#### `<Pills options value onChange />`

```jsx
<Pills
  options={[{ value: 'auto', label: 'Auto' }, { value: 'on', label: 'On' }]}
  value={config.mode}
  onChange={v => set('mode', v)}
/>
```

#### `<ColorCircles value onChange colors />`

```jsx
<ColorCircles
  value={config.accentColor}
  onChange={v => set('accentColor', v)}
  colors={ACCENT_COLORS}
/>
```

#### `<EntityField field config setConfig filterDomain? />`

HA entity picker with search and domain filter. Saves to `config[field]`.

```jsx
<EntityField
  field="entityId"
  config={config}
  setConfig={setConfig}
  filterDomain="climate"
/>
```

#### `<MdiIconPicker value onChange dark />`

Material Design Icons (mdi:*) picker.

---

### Helpers

#### `apiUrl(path)`

URL of the Oikos add-on backend. Adapts to ingress, panel_custom, or standalone setups.

```js
import { apiUrl } from '@oikos/sdk'
const url = apiUrl('/api/cards')
fetch(url).then(r => r.json())
```

#### `getOverlayRoot()`

Root element for mounting popups via `createPortal`. Always in the light DOM (outside the panel's shadow DOM).

```js
import { createPortal } from 'react-dom'
import { getOverlayRoot } from '@oikos/sdk'
return createPortal(<MyModal/>, getOverlayRoot())
```

#### `<MdiIcon name size? color? dark? />`

Renders a Material Design Icon.

```jsx
import { MdiIcon } from '@oikos/sdk'
<MdiIcon name="mdi:weather-sunny" size={24} dark={dark}/>
```

---

### Design tokens

```js
import { tokens, useStyles, cx, ACCENT_COLORS } from '@oikos/sdk'
```

Cards should preferably use CSS variables (`var(--text-primary)`, `var(--bg-secondary)`, etc.) inherited from the dashboard theme, so they adapt automatically to dark/light mode.

---

### External libraries (via SDK)

Imports that work "magically" — the Vite plugin maps them to the SDK singleton, they are **not** bundled in your card:

```js
import { useState, useEffect, useMemo, useRef } from 'react'
import { Sun, Lightbulb, Power } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts'
```

All are singletons shared with the dashboard.

---

### Export Tree (quick reference)

```
@oikos/sdk
├── React (singleton)            → useState, useEffect, useMemo, useRef, ...
│
├── Hooks
│   ├── useCardConfig(id, def, opts?)
│   ├── useDashboard()
│   ├── useSafeHass()
│   ├── useHaText(entityId)
│   ├── useHaNumber(entityId)
│   ├── useHaBool(entityId)
│   ├── usePackageInstaller(opts)
│   └── registerCardWatcher(descriptor)
│
├── Settings primitives
│   ├── Section / Field / SettingsRow
│   ├── TextField / NumberField / Toggle / Slider
│   ├── Pills / ColorCircles
│   ├── EntityField
│   ├── MdiIconPicker
│   └── ACCENT_COLORS
│
├── Helpers
│   ├── apiUrl(path)
│   ├── getOverlayRoot()
│   ├── MdiIcon
│   ├── tokens / useStyles / cx
│   └── getEntities / getHAConfig
│
└── External libraries (via singleton)
    ├── lucide-react (all icons)
    ├── recharts
    └── framer-motion
```
