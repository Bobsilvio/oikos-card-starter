# 03 — Patterns

[🇮🇹 Italiano](#-italiano) · [🇬🇧 English](#-english)

---

## 🇮🇹 Italiano

Snippets pronti all'uso per i casi più comuni.

---

### Leggere uno stato HA

```jsx
import { useDashboard } from '@oikos/sdk'

function MyCard() {
  const { getState, getFloat, getAttr } = useDashboard()

  const state = getState('sensor.temperature')               // string | null
  const num   = getFloat('sensor.temperature')               // number, 0 se mancante
  const unit  = getAttr('sensor.temperature', 'unit_of_measurement')

  return <div>{num}{unit}</div>
}
```

---

### Chiamare un servizio HA

```jsx
import { useDashboard } from '@oikos/sdk'

function ToggleButton({ entityId }) {
  const { getState, callService } = useDashboard()
  const isOn = getState(entityId) === 'on'

  const toggle = () => {
    const service = isOn ? 'turn_off' : 'turn_on'
    callService('switch', service, entityId)
      ?.catch(err => console.error(err))
  }

  return <button onClick={toggle}>{isOn ? 'Spegni' : 'Accendi'}</button>
}
```

Firma: `callService(domain, service, entityId, serviceData?)`.

```js
callService('light', 'turn_on', 'light.x', { brightness: 200 })
callService('climate', 'set_temperature', 'climate.x', { temperature: 22 })
callService('input_number', 'set_value', 'input_number.x', { value: 42 })
callService('script', 'turn_on', 'script.morning_routine')
```

---

### Empty state

```jsx
if (!config.entityId) {
  return (
    <div style={{
      padding: 16, borderRadius: 14,
      background: 'var(--bg-secondary)',
      color: 'var(--text-muted)', fontSize: 12, fontStyle: 'italic',
    }}>
      ⚙ Configura un'entità nelle impostazioni della card
    </div>
  )
}
```

---

### Auto-refresh ogni N secondi

```jsx
import { useState, useEffect } from 'react'

function MyCard() {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 30_000)  // 30s
    return () => clearInterval(id)
  }, [])
}
```

> 💡 In genere NON serve auto-refresh: `getState` e `haStates` sono reattivi.
> Usa `setInterval` solo per cose come "tempo trascorso da X".

---

### Popup di dettaglio HA standard

```jsx
const { openMoreInfo } = useDashboard()

return (
  <div onClick={() => openMoreInfo('climate.x')}>
    Click per dettaglio nativo HA
  </div>
)
```

---

### Popup custom (createPortal)

```jsx
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useDashboard, getOverlayRoot } from '@oikos/sdk'

function MyCardWithPopup() {
  const [open, setOpen] = useState(false)
  const { dark } = useDashboard()

  return (
    <>
      <button onClick={() => setOpen(true)}>Apri popup</button>

      <AnimatePresence>
        {open && createPortal(
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 99996,
              background: 'rgba(0,0,0,.65)', backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <motion.div
              initial={{ scale: .9, y: 30 }} animate={{ scale: 1, y: 0 }}
              onClick={e => e.stopPropagation()}
              onMouseDown={e => e.stopPropagation()}   // importante!
              style={{
                width: 'min(420px, 92vw)',
                background: dark ? '#0e111a' : '#fff',
                borderRadius: 18, padding: 22,
              }}
            >
              <button onClick={() => setOpen(false)} style={{ position: 'absolute', top: 12, right: 12 }}>
                <X size={14}/>
              </button>
              <h3>Il mio popup</h3>
            </motion.div>
          </motion.div>,
          getOverlayRoot()
        )}
      </AnimatePresence>
    </>
  )
}
```

> ⚠ **`onMouseDown={stopPropagation}` è critico** per i popup montati via portal.

---

### Card con package YAML installabile

#### `cards/<id>/template.yaml`

```yaml
# oikos:package_id: mio_package
# oikos:package_version: 1.0.0
input_number:
  mio_contatore:
    name: "Contatore"
    min: 0
    max: 1000
```

#### `cards/<id>/src/Settings.jsx`

```jsx
import { useCardConfig, Section, SettingsRow, usePackageInstaller } from '@oikos/sdk'
import { Download } from 'lucide-react'
import TPL from '../template.yaml?raw'

export default function MySettings({ cardId }) {
  const [config, setConfig] = useCardConfig(cardId, { entityId: '' })
  const pkg = usePackageInstaller({ name: 'mio_package', yaml: TPL })

  return (
    <Section title="Package Home Assistant">
      <SettingsRow
        label={pkg.installed ? `Installato v${pkg.installedVersion}` : 'Non installato'}
        hint={pkg.path}
      >
        <button onClick={pkg.install}>
          <Download size={12}/> {pkg.installed ? 'Reinstalla' : 'Installa'}
        </button>
      </SettingsRow>
    </Section>
  )
}
```

---

### Popup auto-driven da stati HA (watcher)

```js
import { registerCardWatcher } from '@oikos/sdk'
import MyPopup from './MyPopup'

registerCardWatcher({
  id: 'my-watcher',
  cardType: 'my-card',
  watch: (cfg) => cfg?.entityId,
  detect: ({ prev, current, cardId, cfg }) => {
    if (prev === 'off' && current === 'on') {
      return { foo: 'bar' }
    }
    return null
  },
  dedupKey: (data, cfg, cardId) => `key-${cardId}-${data.foo}`,
  Popup: MyPopup,
})
```

In `Card.jsx` aggiungi `import './myWatcher'` per auto-registrarlo.

---

### Grafici con recharts

```jsx
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip } from 'recharts'

function ChartCard({ data }) {
  return (
    <div style={{ width: '100%', height: 200 }}>
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid stroke="rgba(255,255,255,.06)" strokeDasharray="2 4" vertical={false}/>
          <XAxis dataKey="time" tick={{ fontSize: 10 }}/>
          <YAxis tick={{ fontSize: 10 }}/>
          <Tooltip/>
          <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2}/>
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
```

Storico HA:

```js
const { fetchHistory } = useDashboard()
useEffect(() => {
  const start = new Date(Date.now() - 24 * 3600_000)
  fetchHistory(['sensor.x'], start, new Date()).then(history => {
    setData(history['sensor.x'].map(p => ({ time: p.lu, value: parseFloat(p.s) })))
  })
}, [])
```

---

### Reagire al tema dark/light

```jsx
const { dark } = useDashboard()
const cardBg = dark ? 'rgba(255,255,255,.04)' : '#ffffff'
```

O usa CSS variables: `var(--bg-secondary)`, `var(--text-primary)`, `var(--border-medium)`.

---

### Animazioni con framer-motion

```jsx
import { motion } from 'framer-motion'

<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
>
  Contenuto
</motion.div>
```

---

### Debounce di un valore

```jsx
import { useEffect, useState } from 'react'

function useDebounced(value, delay = 500) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

const debouncedTarget = useDebounced(target, 400)
useEffect(() => {
  callService('climate', 'set_temperature', id, { temperature: debouncedTarget })
}, [debouncedTarget])
```

---

## 🇬🇧 English

Ready-to-use snippets for the most common cases.

---

### Reading HA state

```jsx
import { useDashboard } from '@oikos/sdk'

function MyCard() {
  const { getState, getFloat, getAttr } = useDashboard()

  const state = getState('sensor.temperature')               // string | null
  const num   = getFloat('sensor.temperature')               // number, 0 if missing
  const unit  = getAttr('sensor.temperature', 'unit_of_measurement')

  return <div>{num}{unit}</div>
}
```

---

### Calling a HA service

```jsx
import { useDashboard } from '@oikos/sdk'

function ToggleButton({ entityId }) {
  const { getState, callService } = useDashboard()
  const isOn = getState(entityId) === 'on'

  const toggle = () => {
    const service = isOn ? 'turn_off' : 'turn_on'
    // ALWAYS .catch() to avoid unhandled promise rejection
    callService('switch', service, entityId)
      ?.catch(err => console.error(err))
  }

  return <button onClick={toggle}>{isOn ? 'Turn off' : 'Turn on'}</button>
}
```

Signature: `callService(domain, service, entityId, serviceData?)`.

```js
callService('light', 'turn_on', 'light.x', { brightness: 200 })
callService('climate', 'set_temperature', 'climate.x', { temperature: 22 })
callService('input_number', 'set_value', 'input_number.x', { value: 42 })
callService('script', 'turn_on', 'script.morning_routine')
```

---

### Empty state

```jsx
if (!config.entityId) {
  return (
    <div style={{
      padding: 16, borderRadius: 14,
      background: 'var(--bg-secondary)',
      color: 'var(--text-muted)', fontSize: 12, fontStyle: 'italic',
    }}>
      ⚙ Configure an entity in the card settings
    </div>
  )
}
```

---

### Auto-refresh every N seconds

```jsx
import { useState, useEffect } from 'react'

function MyCard() {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 30_000)  // 30s
    return () => clearInterval(id)
  }, [])
}
```

> 💡 Generally you do NOT need manual auto-refresh: `getState` and `haStates` are
> reactive and re-render automatically on change. Use `setInterval` only for things
> like "elapsed time since X" that depend on `now()`.

---

### Native HA more-info popup

```jsx
const { openMoreInfo } = useDashboard()

return (
  <div onClick={() => openMoreInfo('climate.x')}>
    Click for native HA detail
  </div>
)
```

---

### Custom popup (createPortal outside shadow DOM)

```jsx
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useDashboard, getOverlayRoot } from '@oikos/sdk'

function MyCardWithPopup() {
  const [open, setOpen] = useState(false)
  const { dark } = useDashboard()

  return (
    <>
      <button onClick={() => setOpen(true)}>Open popup</button>

      <AnimatePresence>
        {open && createPortal(
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 99996,
              background: 'rgba(0,0,0,.65)', backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <motion.div
              initial={{ scale: .9, y: 30 }} animate={{ scale: 1, y: 0 }}
              onClick={e => e.stopPropagation()}
              onMouseDown={e => e.stopPropagation()}   // IMPORTANT: see note below
              style={{
                width: 'min(420px, 92vw)',
                background: dark ? '#0e111a' : '#fff',
                borderRadius: 18, padding: 22,
              }}
            >
              <button onClick={() => setOpen(false)} style={{ position: 'absolute', top: 12, right: 12 }}>
                <X size={14}/>
              </button>
              <h3>My popup</h3>
            </motion.div>
          </motion.div>,
          getOverlayRoot()
        )}
      </AnimatePresence>
    </>
  )
}
```

> ⚠ **`onMouseDown={stopPropagation}` is critical** for portal-mounted popups.
> Without it, `mousedown` listeners at the document level (e.g. close-on-click-outside)
> will close the popup BEFORE the click reaches internal buttons.

---

### Card with installable YAML package

For cards that require HA entities (counters, automations, template sensors).

#### `cards/<id>/template.yaml`

```yaml
# oikos:package_id: my_package
# oikos:package_version: 1.0.0
input_number:
  my_counter:
    name: "Counter"
    min: 0
    max: 1000
```

#### `cards/<id>/src/Settings.jsx`

```jsx
import { useCardConfig, Section, SettingsRow, usePackageInstaller } from '@oikos/sdk'
import { Download } from 'lucide-react'
import TPL from '../template.yaml?raw'

export default function MySettings({ cardId }) {
  const [config, setConfig] = useCardConfig(cardId, { entityId: '' })
  const pkg = usePackageInstaller({ name: 'my_package', yaml: TPL })

  return (
    <Section title="Home Assistant Package">
      <SettingsRow
        label={pkg.installed ? `Installed v${pkg.installedVersion}` : 'Not installed'}
        hint={pkg.path}
      >
        <button onClick={pkg.install}>
          <Download size={12}/> {pkg.installed ? 'Reinstall' : 'Install'}
        </button>
      </SettingsRow>

      {pkg.updateAvailable && (
        <div style={{ padding: 10, background: 'rgba(16,185,129,.1)', borderRadius: 8 }}>
          ⬆ Update available: v{pkg.installedVersion} → v{pkg.bundledVersion}
          <button onClick={pkg.install}>Update</button>
        </div>
      )}
    </Section>
  )
}
```

The user clicks "Install" → the YAML file is written to `/config/packages/my_package.yaml`.
Bumping `# oikos:package_version` in the YAML and rebuilding the card will show
the "Package update available" banner.

---

### HA-state-driven auto popup (watcher)

When you want to show a celebratory popup / notification regardless of whether the
card is visible (e.g. "You have mail!", "Washing machine done").

```js
import { registerCardWatcher } from '@oikos/sdk'
import MyPopup from './MyPopup'

registerCardWatcher({
  id: 'my-watcher',
  cardType: 'my-card',

  watch: (cfg) => cfg?.entityId,

  detect: ({ prev, current, cardId, cfg }) => {
    if (prev === 'off' && current === 'on') {
      return { foo: 'bar' }
    }
    return null
  },

  dedupKey: (data, cfg, cardId) => `key-${cardId}-${data.foo}`,

  Popup: MyPopup,
})
```

In `Card.jsx` add `import './myWatcher'` to auto-register it.

---

### Charts with recharts

```jsx
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip } from 'recharts'

function ChartCard({ data }) {
  return (
    <div style={{ width: '100%', height: 200 }}>
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid stroke="rgba(255,255,255,.06)" strokeDasharray="2 4" vertical={false}/>
          <XAxis dataKey="time" tick={{ fontSize: 10 }}/>
          <YAxis tick={{ fontSize: 10 }}/>
          <Tooltip/>
          <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2}/>
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
```

HA history via `fetchHistory`:

```js
const { fetchHistory } = useDashboard()

useEffect(() => {
  const start = new Date(Date.now() - 24 * 3600_000)  // 24h ago
  const end   = new Date()
  fetchHistory(['sensor.x'], start, end).then(history => {
    // history['sensor.x'] = [{ s: 'state', lu: 'iso-timestamp' }, ...]
    setData(history['sensor.x'].map(p => ({ time: p.lu, value: parseFloat(p.s) })))
  })
}, [])
```

---

### Reacting to dark/light theme

```jsx
const { dark } = useDashboard()

const cardBg = dark ? 'rgba(255,255,255,.04)' : '#ffffff'
const border = dark ? 'rgba(255,255,255,.08)' : '#e2e8f0'
```

Or use dashboard theme CSS variables directly:

```css
background: var(--bg-secondary);
color: var(--text-primary);
border: 1px solid var(--border-medium);
```

Available variables: `--bg-primary`, `--bg-secondary`, `--text-primary`,
`--text-muted`, `--border-medium`, `--amber`, `--amber-light`, `--amber-border`,
`--green`, `--green-light`, `--green-border`, etc.

---

### Animations with framer-motion

```jsx
import { motion } from 'framer-motion'

<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
>
  Content
</motion.div>
```

---

### Debouncing a value

```jsx
import { useEffect, useState } from 'react'

function useDebounced(value, delay = 500) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

// Usage: slider that calls callService only when the user stops moving it
const [target, setTarget] = useState(20)
const debouncedTarget = useDebounced(target, 400)

useEffect(() => {
  callService('climate', 'set_temperature', id, { temperature: debouncedTarget })
}, [debouncedTarget])
```
