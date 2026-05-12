# 06 — HTML Cards (formato alternativo / alternative format)

[🇮🇹 Italiano](#-italiano) · [🇬🇧 English](#-english)

---

## 🇮🇹 Italiano

Le **HTML card** sono un formato di card **alternativo** alle JAVA card (JSX/React). Una HTML card è un **singolo file `.html`** con CSS e JS inline, montato in un `<iframe sandbox>` dalla dashboard. Comunica con Oikos via `postMessage`.

> **Vuoi una card React/Vite?** → [`01-quickstart.md`](./01-quickstart.md)
> **Vuoi una card senza codice?** → [`07-json-cards.md`](./07-json-cards.md)

### Quando scegliere HTML

| Pro | Contro |
|---|---|
| Zero setup, zero build, zero toolchain | Solo via bridge per stati HA |
| CSS/JS a piacere, librerie SVG/Canvas inline | CSP stringente: niente `<link>` o `<script src>` esterni |
| Distribuibile come singolo URL/file | Niente pannello Settings nativo Oikos |
| Niente React richiesto | Niente `useCardConfig`, niente migration |

**Buon caso d'uso:** visualizzazioni custom (Chart.js, SVG animati, D3) che non richiedono integrazione profonda con il layout Oikos.

### Anatomia minima

```html
<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8">
<meta name="version" content="1.0.0">
<title>My Card</title>
<style>
  html, body { margin: 0; padding: 0; font-family: system-ui, sans-serif; }
  .card { padding: 16px; color: #e2e8f0; background: #0f172a; }
  .card.light { color: #0f172a; background: #f8fafc; }
  .value { font-size: 32px; font-weight: 700; }
</style>
</head>
<body>
  <div class="card" id="root">
    <div class="label">Temperatura</div>
    <div class="value" id="val">—</div>
  </div>

<script>
  const ENTITY = 'sensor.living_room_temperature'
  const root = document.getElementById('root')
  const val  = document.getElementById('val')

  window.addEventListener('message', ev => {
    const msg = ev.data
    if (!msg || typeof msg !== 'object') return
    if (msg.type === 'hass-update') {
      const st = msg.states?.[ENTITY]
      val.textContent = st ? (parseFloat(st.state).toFixed(1) + '°C') : '—'
      root.className = 'card' + (msg.dark ? '' : ' light')
    }
  })

  window.parent.postMessage({ type: 'set-height', height: 120 }, '*')

  root.addEventListener('click', () => {
    window.parent.postMessage({ type: 'open-more-info', entityId: ENTITY }, '*')
  })
</script>
</body>
</html>
```

Un esempio completo è in [`../examples/html-counter/`](../examples/html-counter/).

### Regole obbligatorie

1. **Versione esposta**: `<meta name="version" content="x.y.z">` nel `<head>`.
2. **Tutto inline**: niente `<link rel="stylesheet">` o `<script src>` esterni.
3. **Comunicazione via postMessage**: no accesso diretto agli stati HA.

### Protocollo postMessage

#### Dashboard → iframe

```js
// Stato HA aggiornato (debounced)
{ type: 'hass-update', states: {...}, dark: true, connected: true, editMode: false }

// Config cambiata
{ type: 'config-update', title: 'My Card', icon: 'mdi:thermometer' }

// Risposta a request-history
{ type: 'history-update', entityId: 'sensor.x', data: [{ x: ts, y: 21.5 }, ...] }

// Risposta a request-weather-forecast
{ type: 'weather-forecast-update', data: [...] }
```

#### iframe → Dashboard

```js
// Chiama un servizio HA
window.parent.postMessage({ type: 'call-service', domain: 'light', service: 'toggle',
  data: { entity_id: 'light.kitchen' } }, '*')

// Apri more-info
window.parent.postMessage({ type: 'open-more-info', entityId: 'climate.x' }, '*')

// Richiedi storico
window.parent.postMessage({ type: 'request-history', entityId: 'sensor.power', hours: 24 }, '*')

// Richiedi forecast meteo
window.parent.postMessage({ type: 'request-weather-forecast', entityId: 'weather.home' }, '*')

// Cambia altezza
window.parent.postMessage({ type: 'set-height', height: 320 }, '*')
```

### Pattern utili

#### Lettura entità

```js
let states = {}
window.addEventListener('message', ev => {
  if (ev.data?.type === 'hass-update') { states = ev.data.states; render() }
})
const getState = id => states[id]?.state
const getAttr  = (id, attr) => states[id]?.attributes?.[attr]
const getFloat = id => { const v = parseFloat(states[id]?.state); return Number.isFinite(v) ? v : null }
```

#### Sparkline SVG (zero dipendenze)

```js
function sparkline(data, w = 200, h = 40) {
  if (!data?.length) return ''
  const xs = data.map(p => p.x), ys = data.map(p => p.y)
  const xMin = Math.min(...xs), xMax = Math.max(...xs)
  const yMin = Math.min(...ys), yMax = Math.max(...ys)
  const points = data.map(p => {
    const x = ((p.x - xMin) / (xMax - xMin)) * w
    const y = h - ((p.y - yMin) / (yMax - yMin || 1)) * h
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
  return `<svg viewBox="0 0 ${w} ${h}"><polyline points="${points}" fill="none" stroke="#f59e0b" stroke-width="2"/></svg>`
}
```

### Installazione lato utente

Store → Comunità → HTML:
1. **Upload file** — `.html` da disco
2. **URL pubblico** — es. GitHub raw
3. **Paste inline** — incolla l'HTML nel form

### Errori comuni

| Sintomo | Causa | Fix |
|---|---|---|
| Card bianca, JS non parte | `<script src>` esterno bloccato | Inline tutto il JS |
| `Refused to load stylesheet` | `<link>` esterno | Inline il CSS in `<style>` |
| Altezza non si adatta | Nessun `set-height` mandato | `postMessage({type:'set-height', height})` |
| `hass-update` non arriva | Listener registrato troppo tardi | Registra inline nel body o in `DOMContentLoaded` |
| Card non si aggiorna dopo edit | Cache dashboard | Bump `<meta name="version">` |

---

## 🇬🇧 English

**HTML cards** are an **alternative** card format to JAVA cards (JSX/React). An HTML card is a **single `.html` file** with inline CSS and JS, mounted in an `<iframe sandbox>` by the dashboard. It communicates with Oikos via `postMessage`.

> **Want a React/Vite card?** → [`01-quickstart.md`](./01-quickstart.md)
> **Want a no-code card?** → [`07-json-cards.md`](./07-json-cards.md)

### When to choose HTML

| Pros | Cons |
|---|---|
| Zero setup, zero build, zero toolchain | HA state access only via bridge |
| Free CSS/JS, inline SVG/Canvas libraries | Strict CSP: no external `<link>` or `<script src>` |
| Distributable as a single URL/file | No native Oikos Settings panel |
| No React required | No `useCardConfig`, no schema migration |

**Good use case:** custom visualizations (Chart.js inline, animated SVGs, D3 inline, infographic-style dashboards) that don't need deep integration with the Oikos layout.

**Bad use case:** complex forms, structured settings panel, component reuse, multi-card logic → use JAVA.

### Minimal anatomy

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="version" content="1.0.0">
<meta name="author" content="Your Name">
<title>My Card</title>
<style>
  html, body { margin: 0; padding: 0; font-family: system-ui, sans-serif; }
  .card { padding: 16px; color: #e2e8f0; background: #0f172a; }
  .card.light { color: #0f172a; background: #f8fafc; }
  .value { font-size: 32px; font-weight: 700; }
  .label { font-size: 11px; opacity: .6; text-transform: uppercase; }
</style>
</head>
<body>
  <div class="card" id="root">
    <div class="label">Temperature</div>
    <div class="value" id="val">—</div>
  </div>

<script>
  const ENTITY = 'sensor.living_room_temperature'
  const root = document.getElementById('root')
  const val  = document.getElementById('val')

  window.addEventListener('message', ev => {
    const msg = ev.data
    if (!msg || typeof msg !== 'object') return
    if (msg.type === 'hass-update') {
      const st = msg.states?.[ENTITY]
      val.textContent = st ? (parseFloat(st.state).toFixed(1) + '°C') : '—'
      root.className = 'card' + (msg.dark ? '' : ' light')
    }
  })

  window.parent.postMessage({ type: 'set-height', height: 120 }, '*')

  root.addEventListener('click', () => {
    window.parent.postMessage({ type: 'open-more-info', entityId: ENTITY }, '*')
  })
</script>
</body>
</html>
```

A complete working example is in [`../examples/html-counter/`](../examples/html-counter/).

### Mandatory rules

1. **Exposed version**: `<meta name="version" content="x.y.z">` in the `<head>` (or comment `<!-- oikos:version 1.0.0 -->`). Required for the dashboard to track updates.
2. **Everything inline**: no `<link rel="stylesheet">` or external `<script src>`. The iframe sandbox is `sandbox="allow-scripts allow-same-origin allow-forms"` but the CSP blocks non-inline resources.
3. **Communication via postMessage**: the card has no direct access to HA states or the dashboard's React store.

### postMessage protocol

#### Dashboard → iframe

```js
// HA state updated (debounced)
{
  type: 'hass-update',
  states: { 'sensor.x': { state, attributes, entity_id, ... }, ... },
  dark: true,
  connected: true,
  editMode: false
}

// User changed card title/icon
{ type: 'config-update', title: 'My Card', icon: 'mdi:thermometer' }

// Response to request-history
{ type: 'history-update', entityId: 'sensor.x', data: [{ x: ts, y: 21.5 }, ...] }

// Response to request-weather-forecast
{ type: 'weather-forecast-update', data: [{ datetime, temperature, ... }, ...] }
```

#### iframe → Dashboard

```js
// Call a HA service
window.parent.postMessage({
  type: 'call-service', domain: 'light', service: 'toggle',
  data: { entity_id: 'light.kitchen' },
}, '*')

// Open more-info popup
window.parent.postMessage({ type: 'open-more-info', entityId: 'climate.x' }, '*')

// Request history (response via history-update)
window.parent.postMessage({ type: 'request-history', entityId: 'sensor.power', hours: 24 }, '*')

// Request weather forecast
window.parent.postMessage({ type: 'request-weather-forecast', entityId: 'weather.home' }, '*')

// Change height dynamically
window.parent.postMessage({ type: 'set-height', height: 320 }, '*')
```

`set-height` is essential when content changes size: without it the height stays fixed (default 280 px).

### Useful patterns

#### Reading entities

```js
let states = {}
window.addEventListener('message', ev => {
  if (ev.data?.type === 'hass-update') {
    states = ev.data.states
    render()
  }
})

const getState = id => states[id]?.state
const getAttr  = (id, attr) => states[id]?.attributes?.[attr]
const getFloat = id => {
  const v = parseFloat(states[id]?.state)
  return Number.isFinite(v) ? v : null
}
```

#### SVG sparkline (zero dependencies)

```js
function sparkline(data, w = 200, h = 40) {
  if (!data?.length) return ''
  const xs = data.map(p => p.x), ys = data.map(p => p.y)
  const xMin = Math.min(...xs), xMax = Math.max(...xs)
  const yMin = Math.min(...ys), yMax = Math.max(...ys)
  const points = data.map(p => {
    const x = ((p.x - xMin) / (xMax - xMin)) * w
    const y = h - ((p.y - yMin) / (yMax - yMin || 1)) * h
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
  return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
    <polyline points="${points}" fill="none" stroke="#f59e0b" stroke-width="2"/>
  </svg>`
}
```

#### Throttling service calls

The dashboard rate-limits `call-service` to 20/sec on the bridge. For smooth UX, also throttle client-side:

```js
let last = 0
function callService(domain, service, data) {
  const now = Date.now()
  if (now - last < 200) return
  last = now
  window.parent.postMessage({ type: 'call-service', domain, service, data }, '*')
}
```

### User-side installation

Three options in **Store → Community → HTML**:

1. **Upload file** — `.html` from disk
2. **Public URL** — e.g. GitHub raw
3. **Paste inline** — paste the HTML into the form

Required fields: **Name**, **Category**.
Optional: **Author**, **Description**, **Height** (default 280 px).

Auto-detected: version from `<meta name="version">`, entity IDs found in the HTML text.

### Distribution

No aggregated manifest (unlike JAVA cards). The file just needs to be reachable via a public URL:

```
my-html-cards/
├── README.md
└── cards/
    ├── clock.html
    └── energy-flow.html
```

Reference the raw URL:
`https://raw.githubusercontent.com/owner/repo/main/cards/clock.html`

### Common errors

| Symptom | Cause | Fix |
|---|---|---|
| Blank card, JS doesn't start | External `<script src>` blocked | Inline all JS |
| `Refused to load stylesheet` | External `<link>` | Inline CSS in `<style>` |
| Height doesn't adapt | No `set-height` sent | `postMessage({type:'set-height', height})` |
| `hass-update` never arrives | Listener registered too late | Register inline in body or in `DOMContentLoaded` |
| `call-service` doesn't execute | Expired license / domain not allowed | Check license banner in Store |
| Click opens link in new tab | `<a href>` not blocked; sandbox denies top-navigation | Use `onclick` + `postMessage` |
| Card doesn't update after edit | Dashboard cache | Bump `<meta name="version">` |

### Decision tree

```
Want to create a card for Oikos?
│
├── Comfortable with React/Vite + want a native Settings panel?
│       → JAVA (this starter, go to 01-quickstart.md)
│
├── Know HTML/CSS/JS but not React, want something lightweight?
│       → HTML (this doc)
│
└── No coding needed, just want to compose visual widgets?
        → JSON Smart Card (07-json-cards.md)
```
