# 01 — Quickstart

[🇮🇹 Italiano](#-italiano) · [🇬🇧 English](#-english)

---

## 🇮🇹 Italiano

Dal clone alla card in dashboard, passo passo.

### Prerequisiti

- **Node.js 18+** ([nodejs.org](https://nodejs.org/))
- **npm** (incluso con Node)
- Un'installazione **Home Assistant** con l'**add-on Oikos** in esecuzione

### 1. Clone

```bash
git clone https://github.com/Bobsilvio/oikos-card-starter my-card
cd my-card
npm install
```

### 2. Modifica la tua card

Il template parte già pronto in `cards/my-card/`:

```
cards/my-card/
├── manifest.json     ← cambia id, name, description
├── src/
│   ├── Card.jsx      ← la tua UI
│   └── Settings.jsx  ← pannello impostazioni (opzionale)
```

#### `manifest.json`

```json
{
  "id":            "la-mia-card",
  "name":          "La Mia Card",
  "version":       "1.0.0",
  "author":        "Tuo Nome",
  "description":   "Descrizione breve di cosa fa.",
  "sdkVersion":    "^1.1.0",
  "hasSettings":   true,
  "entry":         "dist/la-mia-card.js",
  "settings":      "dist/la-mia-card.settings.js",
  "tags":          ["custom", "energia"],
  "configVersion": 1,
  "defaultWidth":  "half"
}
```

> ⚠ `id`, `entry` e `settings` devono coincidere con il filename. Se cambi
> `id` da `my-card` a `la-mia-card`, devi anche cambiare `entry` in
> `dist/la-mia-card.js`. Usa solo lettere minuscole, numeri, trattini e underscore.

#### `src/Card.jsx`

```jsx
import { useCardConfig, useDashboard } from '@oikos/sdk'

export default function LaMiaCard({ cardId = 'la-mia-card' }) {
  const { dark, getState } = useDashboard()
  const [config] = useCardConfig(cardId, { entityId: '' })

  return (
    <div style={{ padding: 16, borderRadius: 14, background: 'var(--bg-secondary)' }}>
      <h3>Hello!</h3>
      <p>{getState(config.entityId) ?? 'Configura un\'entità'}</p>
    </div>
  )
}
```

### 3. Build

```bash
npm run build cards/my-card/
```

Output: `cards/my-card/dist/my-card.js` (e `my-card.settings.js` se hai `Settings.jsx`).

### 4. Crea lo ZIP installabile

```bash
npm run pack -- cards/my-card
```

Output: `dist-cards/my-card-1.0.0.zip` (~5-50 KB).

In alternativa, **shortcut tutto-in-uno**:

```bash
npm run build:my   # build + pack della card "my-card"
```

### 5. Installa nella dashboard

1. Apri **Home Assistant** → pannello **Oikos**
2. **Store** (icona 📦 in alto)
3. Tab **Comunità** → sotto-tab **JAVA**
4. Click **📤 Carica ZIP**
5. Trascina `dist-cards/my-card-1.0.0.zip` nella drop zone
6. Aspetta "✓ Caricamento completato"

La card appare nella categoria specificata in `tags` con badge **💾 Locale**.

### 6. Aggiungi la card a una pagina

1. Vai su una pagina della dashboard
2. Click **matita** (edit mode) → **➕ Aggiungi card**
3. Cerca il `name` della tua card → tap
4. Configura via **⚙ Impostazioni** se hai un `Settings.jsx`
5. Salva

### 7. Iterare

Modifica → build → pack → ricarica ZIP. Lo stesso `manifest.id` con versione bumpata sovrascrive l'installazione esistente:

```bash
# Modifica src/Card.jsx
npm run build:my
# → dist-cards/my-card-1.1.0.zip
```

Riupload nella dashboard → la card è aggiornata.

> 💡 **Tip:** prova subito uno degli esempi per capire i pattern:
>
> ```bash
> npm run build examples/sensor-display/
> npm run pack  -- examples/sensor-display
> # → carica lo ZIP nella dashboard
> ```

---

## 🇬🇧 English

From clone to card in the dashboard, step by step.

### Prerequisites

- **Node.js 18+** ([nodejs.org](https://nodejs.org/))
- **npm** (included with Node)
- A **Home Assistant** installation with the **Oikos add-on** running

### 1. Clone

```bash
git clone https://github.com/Bobsilvio/oikos-card-starter my-card
cd my-card
npm install
```

### 2. Edit your card

The template is ready to go in `cards/my-card/`:

```
cards/my-card/
├── manifest.json     ← change id, name, description
├── src/
│   ├── Card.jsx      ← your UI
│   └── Settings.jsx  ← settings panel (optional)
```

#### `manifest.json`

```json
{
  "id":            "my-card",
  "name":          "My Card",
  "version":       "1.0.0",
  "author":        "Your Name",
  "description":   "Short description of what it does.",
  "sdkVersion":    "^1.1.0",
  "hasSettings":   true,
  "entry":         "dist/my-card.js",
  "settings":      "dist/my-card.settings.js",
  "tags":          ["custom", "energy"],
  "configVersion": 1,
  "defaultWidth":  "half"
}
```

> ⚠ `id`, `entry` and `settings` must match the filename. If you change `id`
> from `my-card` to `my-custom-card`, also change `entry` to `dist/my-custom-card.js`.
> Use only lowercase letters, numbers, hyphens and underscores.

#### `src/Card.jsx`

```jsx
import { useCardConfig, useDashboard } from '@oikos/sdk'

export default function MyCard({ cardId = 'my-card' }) {
  const { dark, getState } = useDashboard()
  const [config] = useCardConfig(cardId, { entityId: '' })

  return (
    <div style={{ padding: 16, borderRadius: 14, background: 'var(--bg-secondary)' }}>
      <h3>Hello!</h3>
      <p>{getState(config.entityId) ?? 'Configure an entity in settings'}</p>
    </div>
  )
}
```

### 3. Build

```bash
npm run build cards/my-card/
```

Output: `cards/my-card/dist/my-card.js` (and `my-card.settings.js` if you have `Settings.jsx`).

### 4. Create the installable ZIP

```bash
npm run pack -- cards/my-card
```

Output: `dist-cards/my-card-1.0.0.zip` (~5–50 KB).

Or use the **all-in-one shortcut**:

```bash
npm run build:my   # build + pack the "my-card" template
```

### 5. Install in the dashboard

1. Open **Home Assistant** → **Oikos** panel
2. **Store** (📦 icon at the top)
3. Tab **Community** → sub-tab **JAVA**
4. Click **📤 Upload ZIP**
5. Drag `dist-cards/my-card-1.0.0.zip` into the drop zone
6. Wait for "✓ Upload complete"

The card appears in the category specified in `tags` with a **💾 Local** badge.

### 6. Add the card to a page

1. Go to a dashboard page
2. Click the **pencil** icon (edit mode) → **➕ Add card**
3. Search for your card's `name` → tap
4. Configure via **⚙ Settings** if you have a `Settings.jsx`
5. Save

### 7. Iterate

Edit → build → pack → re-upload ZIP. The same `manifest.id` with a bumped version overwrites the existing installation:

```bash
# Edit src/Card.jsx
npm run build:my
# → dist-cards/my-card-1.1.0.zip
```

Re-upload to the dashboard → card is updated.

> 💡 **Tip:** try one of the examples immediately to understand the patterns:
>
> ```bash
> npm run build examples/sensor-display/
> npm run pack  -- examples/sensor-display
> # → upload the ZIP to the dashboard
> ```
