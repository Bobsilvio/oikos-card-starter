# 05 — Troubleshooting

[🇮🇹 Italiano](#-italiano) · [🇬🇧 English](#-english)

---

## 🇮🇹 Italiano

Soluzioni agli errori più frequenti.

---

### Build

#### `Error: Cannot resolve '@oikos/sdk'`

L'SDK è external — il bundle delle card non lo contiene. Funziona SOLO quando la card gira dentro la dashboard Oikos.

**Verifica:**
- Il file `tools/vite-plugin-oikos-sdk.js` è presente
- `tools/build-card.mjs` lo carica
- `npm install` ha installato `@vitejs/plugin-react` e `vite`

#### `Error: Cannot resolve '../template.yaml?raw'`

```bash
npx vite --version    # deve essere ≥ 5.x
```

Se vecchio: `npm install vite@latest --save-dev`.

#### Build genera bundle ENORME (>200 KB)

Quasi certamente stai bundle-izzando React o lucide-react.

```bash
cat tools/build-card.mjs | grep "oikos-sdk"
# Deve mostrare: import oikosSdk from './vite-plugin-oikos-sdk.js'
```

---

### Runtime nella dashboard

#### Card non appare nello Store dopo upload

Causa più comune: `manifest.id` malformato.

- Solo `[a-z0-9_-]` (no maiuscole, no spazi)
- Può contenere `/` per id namespacati
- Lunghezza 1-60 caratteri
- `entry` punta al filename corretto in `dist/`?
- `manifest.json` è JSON valido (non YAML, non commenti)?

#### Card appare ma è vuota / `Invalid hook call`

Causa: React duplicato. Il plugin SDK non è attivo.

```bash
rm -rf cards/<id>/dist && npm run build cards/<id>/
```

#### `Cannot read properties of undefined (reading 'React')`

La dashboard non è aperta correttamente, o il bundle dashboard è troppo vecchio (SDK 0.x).

**Fix:** aggiorna la dashboard e ricarica con `Ctrl+Shift+R`.

#### `Invalid format / sdkVersion non compatibile`

Abbassa il requirement nel manifest: `"sdkVersion": "^1.0.0"`, o aggiorna la dashboard.

#### Settings non si aprono al click

```bash
ls cards/<id>/dist/    # deve mostrare <id>.js E <id>.settings.js
```

Se manca `<id>.settings.js`: verifica che `src/Settings.jsx` esista e abbia un `default export`.

#### Config persa dopo update card

Hai cambiato lo schema senza bumpare `configVersion` + fornire `migrate`.

```js
const [config, setConfig] = useCardConfig(cardId, DEFAULT, {
  version: 2,
  migrate: (old, fromVersion) => {
    if (fromVersion < 2) {
      old.newField = old.oldField
      delete old.oldField
    }
    return old
  },
})
```

---

### Upload ZIP

#### `manifest.json mancante nello ZIP`

Struttura corretta:
```
mia-card.zip
├── manifest.json
└── dist/
```
NON:
```
mia-card.zip
└── mia-card/          ← cartella extra
    └── manifest.json
```

Usa `npm run pack` invece di creare lo ZIP manualmente.

#### `estensione non ammessa: .ts`

Whitelist: `json | js | css | png | jpg | gif | svg | yaml | yml | md | webp`. Scrivi in `.jsx` — non TypeScript.

#### `ZIP troppo grande` (>10MB)

- `dist/` contiene SOLO bundle build, non sorgenti
- Preview ottimizzata (PNG ≤ 200 KB)
- `template.yaml` ragionevole (< 50 KB)

---

### Package YAML

#### Banner "Aggiornamento package" non appare

Verifica in `template.yaml`:
```yaml
# oikos:package_id: mio_package
# oikos:package_version: 1.0.0    ← bumpa quando aggiorni il YAML
```

#### `usePackageInstaller` non trova il file installato

```js
usePackageInstaller({ name: 'mio_package', yaml: TPL })
// → /config/packages/mio_package.yaml
```

Per card multi-istanza usa `subdir` + `vars`:
```js
usePackageInstaller({
  name: suffix,
  subdir: 'oikos_appliance',
  yaml: TPL,
  vars: { SUFFIX: suffix, NAME: displayName },
})
```

#### Package non viene caricato da HA

Verifica in `configuration.yaml`:
```yaml
homeassistant:
  packages: !include_dir_named packages
```

Dopo aver aggiunto la riga: **riavvia HA**.

---

### Performance

#### Card "scatta" / si re-renderizza troppo

```jsx
const computed = useMemo(() => heavyCalc(haStates), [haStates])
const handler  = useCallback(() => doStuff(), [])
```

#### Rate limit `callService`

Debounce le chiamate (vedi [03-patterns.md](./03-patterns.md#debounce-di-un-valore)).

---

### Debugging

```bash
# Card installate (server-side)
ls /data/cards-store/

# Bundle caricato → Network → cards-store/<id>/<id>.js → 200, application/javascript

# Logs server
tail -f /data/server.log
```

`console.log('[my-card]', ...)` con prefisso univoco per filtrare nella console browser.

---

### Hai un problema non in lista?

1. Console browser (F12) per stack trace
2. Log del server addon Oikos
3. Apri issue su [oikos-cards](https://github.com/Bobsilvio/oikos-cards/issues) con: manifest.json, sintomo, stack trace, versione dashboard

---

## 🇬🇧 English

Solutions to the most common errors.

---

### Build

#### `Error: Cannot resolve '@oikos/sdk'`

The SDK is external — it is NOT bundled in the card. It only works when the card runs inside the Oikos dashboard.

**Check:**
- `tools/vite-plugin-oikos-sdk.js` exists
- `tools/build-card.mjs` loads it
- `npm install` installed `@vitejs/plugin-react` and `vite`

#### `Error: Cannot resolve '../template.yaml?raw'`

```bash
npx vite --version    # must be ≥ 5.x
```

If outdated: `npm install vite@latest --save-dev`.

#### Build produces a HUGE bundle (>200 KB)

Almost certainly you are bundling React or lucide-react.

```bash
cat tools/build-card.mjs | grep "oikos-sdk"
# Must show: import oikosSdk from './vite-plugin-oikos-sdk.js'
```

If missing, copy it from `oikos-cards/tools/`.

---

### Runtime in the dashboard

#### Card does not appear in the Store after upload

Most common cause: malformed `manifest.id`.

- Only `[a-z0-9_-]` (no uppercase, no spaces, no special characters)
- May contain `/` for namespaced IDs (e.g. `my-namespace/my-card`)
- Length 1–60 characters
- Does `entry` point to the correct filename in `dist/`?
- Is `manifest.json` valid JSON (no YAML, no comments)?

#### Card appears but is blank / `Invalid hook call`

Cause: duplicate React. The card is bundling React instead of using the SDK singleton.

```bash
rm -rf cards/<id>/dist && npm run build cards/<id>/
```

Then reinstall in the Store.

#### `Cannot read properties of undefined (reading 'React')`

The dashboard is not opened correctly, or the dashboard bundle is too old (SDK 0.x).

**Fix:** update the dashboard and reload with `Ctrl+Shift+R`.

#### `Invalid format / sdkVersion not compatible`

Lower the requirement in the manifest: `"sdkVersion": "^1.0.0"`, or update the dashboard.

#### Settings panel does not open on click

```bash
ls cards/<id>/dist/    # must show <id>.js AND <id>.settings.js
```

If `<id>.settings.js` is missing: verify that `src/Settings.jsx` exists and has a `default export`.
If you don't need settings, remove `hasSettings` from the manifest.

#### Config lost after card update

You changed the config schema without bumping `configVersion` and providing `migrate`.

```js
const [config, setConfig] = useCardConfig(cardId, DEFAULT, {
  version: 2,
  migrate: (old, fromVersion) => {
    if (fromVersion < 2) {
      old.newField = old.oldField
      delete old.oldField
    }
    return old
  },
})
```

---

### ZIP upload

#### `manifest.json missing from ZIP`

Correct structure:
```
my-card.zip
├── manifest.json
└── dist/
```
NOT:
```
my-card.zip
└── my-card/          ← extra folder
    └── manifest.json
```

Use `npm run pack` instead of creating the ZIP manually with Finder/Explorer.

#### `Disallowed extension: .ts`

Server whitelist: `json | js | css | png | jpg | gif | svg | yaml | yml | md | webp`.
Write in `.jsx` (not TypeScript) to stay compatible with the build pipeline.

#### `ZIP too large` (>10 MB)

Hard server limit. Cards should stay well below. Check:
- `dist/` contains ONLY build bundles, not source files
- Preview image optimized (PNG ≤ 200 KB)
- `template.yaml` reasonable (< 50 KB)

---

### YAML package

#### "Package update" banner does not appear

Check in `template.yaml`:
```yaml
# oikos:package_id: my_package
# oikos:package_version: 1.0.0    ← bump when you update the YAML
```

Without the header, the system does not know the version and disables the banner.

#### `usePackageInstaller` does not find the installed file

The `name` passed to the hook must match the `.yaml` filename on HA (without extension):

```js
usePackageInstaller({ name: 'my_package', yaml: TPL })
// → /config/packages/my_package.yaml
```

For multi-instance cards that produce N different files, use `subdir` + `vars`:

```js
usePackageInstaller({
  name: suffix,
  subdir: 'oikos_appliance',
  yaml: TPL,
  vars: { SUFFIX: suffix, NAME: displayName },
})
// → /config/packages/oikos_appliance/<suffix>.yaml
```

#### Package is not loaded by HA

Check that `configuration.yaml` has:

```yaml
homeassistant:
  packages: !include_dir_named packages
```

Without this, HA ignores `/config/packages/`. The card system shows a pre-check banner when it's missing.

After adding the line: **restart HA**.

---

### Performance

#### Card "stutters" / re-renders too often

Common causes:
- `getState` called inside a loop without memoization
- `useEffect` without a dependency array → runs on every render
- Inline object/array creation as `key`/`style`

```jsx
const computed = useMemo(() => heavyCalc(haStates), [haStates])
const handler  = useCallback(() => doStuff(), [])
useEffect(() => { ... }, [config.entityId])
```

#### `callService unauthorized` / rate limit

`useSafeHass()` limits to 20 calls/sec. If you exceed it (slider sending on every movement), debounce:

```jsx
const debouncedTarget = useDebounced(targetTemp, 400)
useEffect(() => {
  callService('climate', 'set_temperature', id, { temperature: debouncedTarget })
}, [debouncedTarget])
```

---

### Debugging

#### Viewing installed cards (server-side)

```bash
ls /data/cards-store/         # in HA add-on
# or
ls /config/oikos/cards-store/ # if mapped to /config
```

#### Verifying the loaded bundle

In the dashboard, devtools → Network → look for `cards-store/<id>/<id>.js`. Should be 200, not 404. `Content-Type: application/javascript`.

#### Server upload logs

```bash
tail -f /data/server.log
# or: Supervisor → Add-on → Oikos → Log
```

Search for `[cards] upload-zip` for upload attempts.

#### Card console

`console.log('[my-card]', ...)` with a unique prefix to filter in the browser console. Visible when the card is rendered.

#### Silent errors

If the card renders a blank square with no console errors, try:

```jsx
return (
  <ErrorBoundary fallback={<div>Card error</div>}>
    {/* your UI */}
  </ErrorBoundary>
)
```

(The SDK does not export `ErrorBoundary` directly — create it as a component with `componentDidCatch`.)

---

### Problem not in the list?

1. Check the browser console (F12) for a stack trace
2. Check the Oikos add-on server logs
3. Open an issue on [oikos-cards](https://github.com/Bobsilvio/oikos-cards/issues) including: manifest.json, symptom, stack trace, dashboard version
