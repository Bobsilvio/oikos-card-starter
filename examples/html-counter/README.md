# html-counter

[🇮🇹 Italiano](#-italiano) · [🇬🇧 English](#-english)

---

## 🇮🇹 Italiano

Esempio di **HTML card** per Oikos: contatore di un sensore Home Assistant con sparkline 24h e tap → more-info.

> Formato alternativo a JAVA — vedi [`docs/06-html-cards.md`](../../docs/06-html-cards.md) per la guida completa.

### Cosa mostra

- Etichetta = `friendly_name` dell'entità (con fallback a `entity_id`)
- Valore numerico grande con unità di misura
- Indicatore delta (↑/↓ rispetto all'ultimo update)
- Sparkline SVG dello storico 24h (zero dipendenze)
- Tap sulla card → apre il popup `more-info` di Home Assistant
- Light/dark mode in linea con la dashboard

### Pattern illustrati

| Pattern | Dove guardare |
|---|---|
| Listener `message` per `hass-update` e `history-update` | `addEventListener('message', ...)` |
| Lettura state + attributes | `renderState()` |
| Richiesta storico via `postMessage` | `init()` |
| Sparkline SVG inline (no Chart.js) | `sparkline()` |
| `set-height` per altezza dinamica | `init()` |
| `open-more-info` al tap | listener click su `root` |
| Refresh periodico storico | `setInterval` in `init()` |

### Configurazione

Apri [`counter.html`](./counter.html) e cambia la costante a inizio script:

```js
const ENTITY = 'sensor.living_room_temperature'
```

Funziona con qualsiasi entità numerica HA (temperatura, potenza, umidità, ...).

### Installazione

**Dashboard → Store → Comunità → HTML**, poi:

1. **Upload file** — seleziona `counter.html`
2. **URL pubblico** — se hai forkato su GitHub: `https://raw.githubusercontent.com/<tu>/oikos-card-starter/main/examples/html-counter/counter.html`
3. **Paste inline** — incolla l'intero contenuto del file

Altezza consigliata: 180 px (la card invia già `set-height`).

---

## 🇬🇧 English

Example **HTML card** for Oikos: a HA sensor counter with a 24h sparkline and tap → more-info.

> Alternative format to JAVA — see [`docs/06-html-cards.md`](../../docs/06-html-cards.md) for the full guide.

### What it shows

- Label = entity `friendly_name` (falls back to `entity_id`)
- Large numeric value with unit of measurement
- Delta indicator (↑/↓ vs last update)
- SVG sparkline for 24h history (zero dependencies)
- Tap on card → opens native HA `more-info` popup
- Light/dark mode matching the dashboard

### Patterns demonstrated

| Pattern | Where to look |
|---|---|
| `message` listener for `hass-update` and `history-update` | `addEventListener('message', ...)` |
| Reading state + attributes | `renderState()` |
| Requesting history via `postMessage` | `init()` |
| Inline SVG sparkline (no Chart.js, no D3) | `sparkline()` |
| `set-height` for dynamic height | `init()` |
| `open-more-info` on tap | click listener on `root` |
| Periodic history refresh | `setInterval` in `init()` |

### Configuration

Open [`counter.html`](./counter.html) and change the constant at the top of the script:

```js
const ENTITY = 'sensor.living_room_temperature'
```

Works with any numeric HA entity (temperature, power, humidity, ...).

### Installation

**Dashboard → Store → Community → HTML**, then:

1. **Upload file** — select `counter.html`
2. **Public URL** — if you forked on GitHub: `https://raw.githubusercontent.com/<you>/oikos-card-starter/main/examples/html-counter/counter.html`
3. **Paste inline** — paste the entire file content

Recommended height: 180 px (the card already sends `set-height`).

### Known limitations

- Works only with **numeric** entities (parsed as float). For text states, remove the delta logic and just display `st.state`.
- History requires `recorder:` active in Home Assistant (enabled by default).
- The iframe has a strict sandbox: no external resources (`<link>`, `<img src="https://...">`). Everything must be inline.
