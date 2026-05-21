<div align="center">

# Oikos Card Starter

**Template + tooling per creare card community per [Oikos](https://github.com/Bobsilvio/oikos).**

[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)
[![SDK](https://img.shields.io/badge/SDK-1.1+-orange?style=flat-square)](docs/02-sdk-reference.md)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-ready-6366f1?style=flat-square&logo=anthropic)](https://claude.ai/code)

[🇮🇹 Italiano](#-italiano) · [🇬🇧 English](#-english)

</div>

---

## 🇮🇹 Italiano

Una "card community" è un bundle JavaScript ESM che la dashboard Oikos scarica una volta e importa a runtime. Ti dà accesso a tutto Home Assistant (stati, servizi, storico) tramite un SDK condiviso, senza dover ricompilare la dashboard.

> **Dal clone alla card pubblica su GitHub: zero intermediari, aggiornamenti automatici per i tuoi utenti.**

---

### 🤖 Crea la tua card descrivendo cosa vuoi — Claude Code fa il resto

Non devi sapere React, JavaScript o come funziona il build system. Cloni questo repo, apri **Claude Code** nella cartella e descrivi la card che vuoi in italiano:

```
"Crea una card che mostra la temperatura del soggiorno con uno sparkline 24h
e un badge rosso lampeggiante se la finestra è aperta da più di 10 minuti."
```

Claude legge lo `SKILL.md` incluso nello starter (caricato automaticamente), scrive il codice, installa le dipendenze, lancia il build e ti consegna lo ZIP pronto da caricare in Oikos.

```
"Voglio una card con tre bottoni per accendere la luce cucina,
spegnere tutti i dispositivi in standby e attivare la scena 'cinema'."
```

```
"Card che mostra produzione FV istantanea, consumi e percentuale autoconsumo
in una griglia 2×2 con colori che cambiano in base ai valori."
```

Funziona anche per card complesse: grafici storici, controlli interattivi, layout personalizzati, animazioni. **Nessuna conoscenza tecnica richiesta.**

---

Due percorsi a scelta:

- 🤖 **Con Claude Code** (consigliato anche per non-sviluppatori) → descrivi la card a parole, Claude scrive codice + builda
- 🔧 **Manuale** (sviluppatori che conoscono React/Vite) → editi i file e lanci i comandi tu

### 🤖 Quickstart con Claude Code

> Cosa serve: **[Claude Code](https://claude.ai/code)** *(abbonamento Pro richiesto)* + **Node.js 18+** ([nodejs.org](https://nodejs.org/)) + dashboard **Oikos** già installata in HA.

**1. Scarica questo repo come ZIP**

GitHub → **Code → Download ZIP** → estrai la cartella.

**2. Apri Claude Code e seleziona la cartella**

Avvia Claude Code → clicca **Code** → seleziona la cartella estratta.
Lo `SKILL.md` nella root viene caricato automaticamente.

**3. Chiedi la card che vuoi**

> *"Crea una card che mostra la temperatura del soggiorno (`sensor.living_room_temperature`) con uno sparkline 24h."*

> *"Voglio una card per accendere/spegnere `light.cucina` con un bottone grande."*

Claude scrive il codice, lancia il build e produce uno ZIP pronto da caricare in Oikos:
**Store → Comunità → JAVA → Carica ZIP**.

### 🔧 Quickstart manuale

```bash
git clone https://github.com/Bobsilvio/oikos-card-starter
cd oikos-card-starter
npm install

# Modifica cards/my-card/
#   manifest.json  → id, name, description, version
#   src/Card.jsx   → la tua UI
#   src/Settings.jsx → opzionale

npm run build:my
# → produce dist-cards/my-card-1.0.0.zip

# Oikos → Store → Comunità → JAVA → Carica ZIP
```

### Quale formato scegliere?

Oikos supporta tre formati:

```
Cosa vuoi creare?
│
├── Comporre widget visivi senza codice?
│       → JSON Smart Card  → docs/07-json-cards.md
│
├── HTML/CSS/JS senza React, o librerie SVG/Chart.js?
│       → HTML             → docs/06-html-cards.md
│
└── Settings strutturato, componenti React, bundle leggero?
        → JAVA (questo starter)  → docs/01-quickstart.md
```

| | **JAVA** (questo starter) | **HTML** | **JSON Smart Card** |
|---|---|---|---|
| Cosa scrivi | React + Vite | Singolo file `.html` | `card.json` |
| Toolchain | npm + Vite | nessuna | nessuna |
| Pannello Settings nativo | ✅ | ❌ | ✅ visual editor |
| Accesso HA | diretto via SDK | via `postMessage` | binding dichiarativi |
| Animazioni custom | ✅ framer-motion | ✅ JS/CSS libero | ❌ solo transizioni base |
| Bundle size tipico | 5–50 KB | 5–30 KB | < 5 KB |

### Struttura del repo

```
oikos-card-starter/
├── cards/my-card/         ← template pronto da modificare
├── examples/              ← card complete come riferimento
│   ├── hello-world/         (niente HA, solo config)
│   ├── sensor-display/      (lettura stato HA)
│   ├── light-toggle/        (callService, optimistic UI)
│   ├── sensor-chart/        (fetchHistory + recharts)
│   └── html-counter/        (formato HTML iframe)
├── tools/                 ← build / pack / vite plugin
├── docs/                  ← guide passo-passo
└── package.json
```

### Come funziona l'SDK

L'SDK Oikos (`@oikos/sdk`) è iniettato dalla dashboard in `window.__OIKOS_SDK__`. La tua card non bundleizza React, lucide, recharts — li accede tramite l'SDK.

```jsx
import { useState } from 'react'
import { useCardConfig, useDashboard } from '@oikos/sdk'

export default function MyCard({ cardId = 'my-card' }) {
  const { dark, getState } = useDashboard()
  const [config] = useCardConfig(cardId, { entityId: '' })
  // ...
}
```

### Documentazione

| Doc | Contenuto |
|---|---|
| [01 — Quickstart](./docs/01-quickstart.md) | Dal clone alla card in dashboard |
| [02 — SDK Reference](./docs/02-sdk-reference.md) | Tutti gli export di `@oikos/sdk` |
| [03 — Patterns](./docs/03-patterns.md) | Snippets per casi comuni |
| [04 — Distribuzione](./docs/04-distribuzione.md) | GitHub Release vs ZIP manuale |
| [05 — Troubleshooting](./docs/05-troubleshooting.md) | Errori comuni e fix |
| [06 — HTML Cards](./docs/06-html-cards.md) | Formato `.html` in iframe |
| [07 — JSON Smart Cards](./docs/07-json-cards.md) | Formato no-code `card.json` |

### Comandi rapidi

```bash
npm run build cards/<id>/   # build singola card
npm run pack -- cards/<id>  # pack ZIP installabile
npm run build:my            # build + pack della template "my-card"
npm run build:all           # build tutte le card + rigenera manifest.json
npm run manifest            # rigenera solo il manifest.json aggregato
npm run build:examples      # build di tutti gli esempi
```

### Community Registry

Vuoi che la tua card sia visibile nello **Store di tutti gli utenti Oikos**?

Questo repo contiene anche il registro ufficiale delle card community in `registry/`.
Il dashboard legge quei file per listare le sorgenti disponibili nello Store.

**Come aggiungerti:**

1. Pubblica il tuo repo su GitHub con almeno una Release (vedi [docs/04-distribuzione.md](./docs/04-distribuzione.md))
2. Fai fork di questo repo
3. Aggiungi `tuonome/nome-repo` al file corretto (`registry/cards`, `registry/html-cards`, o `registry/smart-cards`) in ordine alfabetico
4. Apri una Pull Request — la CI valida formato e ordine automaticamente
5. Una volta approvata, la tua card appare nello Store

> Vedi [`registry/`](./registry/) per i file e i requisiti di approvazione.

### Compatibilità SDK

```json
{ "sdkVersion": "^1.1.0" }
```

---

## 🇬🇧 English

A community card is a JavaScript ESM bundle that the Oikos dashboard downloads once and imports at runtime. It gives you full access to Home Assistant (states, services, history) via a shared SDK — no need to recompile the dashboard.

> **From clone to a publicly shared card on GitHub — no middlemen, automatic updates for your users.**

---

### 🤖 Build your card by describing what you want — Claude Code does the rest

No React, JavaScript or build toolchain knowledge required. Clone this repo, open **Claude Code** in the folder and describe the card you want in plain language:

```
"Create a card that shows the living room temperature with a 24h sparkline
and a red blinking badge if the window has been open for more than 10 minutes."
```

Claude reads the `SKILL.md` bundled in this starter (loaded automatically), writes the code, installs dependencies, runs the build and delivers a ZIP ready to upload into Oikos.

```
"I want a card with three buttons: turn on the kitchen light,
turn off all standby devices, and activate the 'cinema' scene."
```

```
"Card showing instant solar production, consumption and self-consumption percentage
in a 2×2 grid with colors that change based on values."
```

Works for complex cards too: historical charts, interactive controls, custom layouts, animations. **No technical knowledge required.**

---

Two paths to choose from:

- 🤖 **With Claude Code** (recommended even for non-developers) → describe the card in plain language, Claude writes code + builds
- 🔧 **Manual** (developers comfortable with React/Vite) → edit files and run commands yourself

### 🤖 Quickstart with Claude Code

> Requirements: **[Claude Code](https://claude.ai/code)** *(Pro subscription required)* + **Node.js 18+** ([nodejs.org](https://nodejs.org/)) + **Oikos** dashboard already installed in Home Assistant.

**1. Download this repo as a ZIP**

GitHub → **Code → Download ZIP** → extract the folder.

**2. Open Claude Code and select the folder**

Launch Claude Code → click **Code** → select the extracted folder.
The `SKILL.md` in the root is loaded automatically.

**3. Ask for the card you want**

> *"Create a card that shows the living room temperature (`sensor.living_room_temperature`) with a 24h sparkline."*

> *"I want a card to toggle `light.kitchen` on/off with a large button."*

Claude writes the code, runs the build and produces a ZIP ready to upload into Oikos:
**Store → Community → JAVA → Upload ZIP**.

### 🔧 Manual quickstart

```bash
git clone https://github.com/Bobsilvio/oikos-card-starter
cd oikos-card-starter
npm install

# Edit cards/my-card/
#   manifest.json  → id, name, description, version
#   src/Card.jsx   → your UI
#   src/Settings.jsx → optional settings panel

npm run build:my
# → produces dist-cards/my-card-1.0.0.zip

# Oikos → Store → Community → JAVA → Upload ZIP
```

### Which format should you use?

Oikos supports three card formats:

```
What do you want to build?
│
├── Compose visual widgets (numbers, gauges, sparklines) without coding?
│       → JSON Smart Card  → docs/07-json-cards.md
│
├── Know HTML/CSS/JS but not React, or want SVG/Chart.js inline?
│       → HTML             → docs/06-html-cards.md
│
└── Structured Settings panel, component reuse, light bundle?
        → JAVA (this starter)  → docs/01-quickstart.md
```

| | **JAVA** (this starter) | **HTML** | **JSON Smart Card** |
|---|---|---|---|
| What you write | React + Vite | Single `.html` file | `card.json` |
| Toolchain | npm + Vite | none | none |
| Native Settings panel | ✅ | ❌ | ✅ visual editor |
| HA access | direct via SDK | via `postMessage` | declarative bindings |
| Custom animations | ✅ framer-motion | ✅ free JS/CSS | ❌ basic transitions only |
| Typical bundle size | 5–50 KB | 5–30 KB | < 5 KB |

### Repo structure

```
oikos-card-starter/
├── cards/my-card/         ← TEMPLATE ready to edit (your card)
├── examples/              ← complete cards for reference
│   ├── hello-world/        (JAVA: no HA, just config persistence)
│   ├── sensor-display/     (JAVA: reads a HA sensor)
│   ├── light-toggle/       (JAVA: toggle switch with callService)
│   ├── sensor-chart/       (JAVA: fetchHistory + recharts sparkline)
│   └── html-counter/       (HTML: sensor + 24h sparkline + more-info)
├── tools/                 ← build / pack / vite plugin (don't touch)
├── docs/                  ← step-by-step guides
└── package.json
```

### How the SDK works

The Oikos SDK (`@oikos/sdk`) is a singleton **injected by the dashboard** into `window.__OIKOS_SDK__`. Your card doesn't bundle React, lucide, recharts, framer-motion — it accesses them via the SDK. Result: tiny bundles (5–50 KB).

```jsx
import { useState } from 'react'
import { useCardConfig, useDashboard } from '@oikos/sdk'

export default function MyCard({ cardId = 'my-card' }) {
  const { dark, getState } = useDashboard()
  const [config] = useCardConfig(cardId, { entityId: '' })
  // ...
}
```

The Vite plugin rewrites every `import` as an access to `window.__OIKOS_SDK__`. None of it ends up in your bundle.

### Documentation

| Doc | Contents |
|---|---|
| [01 — Quickstart](./docs/01-quickstart.md) | Step-by-step from clone to card in dashboard |
| [02 — SDK Reference](./docs/02-sdk-reference.md) | All `@oikos/sdk` exports with examples |
| [03 — Patterns](./docs/03-patterns.md) | Snippets for common cases (HA states, popups, YAML packages) |
| [04 — Distribution](./docs/04-distribuzione.md) | GitHub Release vs manual ZIP upload |
| [05 — Troubleshooting](./docs/05-troubleshooting.md) | Common errors and fixes |
| [06 — HTML Cards](./docs/06-html-cards.md) | Alternative format: single `.html` in iframe |
| [07 — JSON Smart Cards](./docs/07-json-cards.md) | No-code format: `card.json` with visual widgets |

See also **[`SKILL.md`](./SKILL.md)** if you're using Claude / AI agents — it contains full context for requesting card development assistance.

### Quick commands

```bash
npm run build cards/<id>/   # build a single card
npm run pack -- cards/<id>  # pack installable ZIP
npm run build:my            # build + pack the "my-card" template
npm run build:all           # build all cards + regenerate manifest.json
npm run manifest            # regenerate root manifest.json only
npm run build:examples      # build all examples (useful as reference)
```

### Distribution

Two options — see [`docs/04-distribuzione.md`](./docs/04-distribuzione.md):

1. **🌍 GitHub Release** ✅ recommended — tag a release, CI builds and publishes automatically; users add your repo URL once and get updates forever
2. **📤 Private ZIP** — share `dist-cards/<id>-<version>.zip` as a file; useful for personal use or users without GitHub

### Community Registry

Want your card visible in **every Oikos user's Store**?

This repo hosts the official community registry in `registry/`.
The dashboard reads those files to list available sources in the Store.

**How to get listed:**

1. Publish your repo on GitHub with at least one Release (see [docs/04-distribuzione.md](./docs/04-distribuzione.md))
2. Fork this repo
3. Add `yourname/repo-name` to the correct file (`registry/cards`, `registry/html-cards`, or `registry/smart-cards`) in alphabetical order
4. Open a Pull Request — CI validates format and order automatically
5. Once approved, your card appears in the Store

> See [`registry/`](./registry/) for the files and approval requirements.

### SDK compatibility

This starter targets **SDK 1.x** of the Oikos dashboard. Check your card's manifest:

```json
{ "sdkVersion": "^1.1.0" }
```

---

## Licenza / License

MIT — see [LICENSE](./LICENSE). You are free to fork and create private or commercial cards.
