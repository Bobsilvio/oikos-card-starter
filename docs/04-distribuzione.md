[🇮🇹 Italiano](#-italiano) · [🇬🇧 English](#-english)

---

## 🇮🇹 Italiano

# 04 — Distribuzione

Due strade per consegnare la tua card agli utenti finali.

---

### A — GitHub Release ✅ consigliato

Pubblichi il repo della card su GitHub. Gli utenti incollano il tuo URL nel
dashboard → la card appare nello Store con notifica di aggiornamento automatica.

**Non devi inviare nulla a nessuno: ogni aggiornamento che pusha una nuova
Release è disponibile automaticamente per tutti i tuoi utenti.**

#### Setup una volta sola

1. Crea un repo GitHub pubblico (fork di questo starter o nuovo).
2. Sviluppa la card in `cards/<id>/`.
3. Aggiungi il file `.github/workflows/release.yml` già incluso in questo
   starter — non serve modificarlo.

#### Pubblicare una versione

```bash
# 1. Bumpa la versione in cards/<id>/manifest.json
#    (es. "version": "1.1.0")

# 2. Tagga e pusha
git add cards/<id>/manifest.json
git commit -m "release <id> v1.1.0"
git tag v1.1.0
git push origin main --tags
```

La GitHub Action:
- Builda tutte le card in `cards/*/`
- Rigenera il `manifest.json` aggregato alla root
- Crea la GitHub Release con tutti i dist + manifest

#### Come l'utente installa

1. Dashboard Oikos → **Store → Comunità → JAVA**
2. Incolla `https://github.com/TUO_USERNAME/TUO_REPO`
3. Click **Aggiungi repo** → **Installa**

#### Aggiornamenti automatici

Il dashboard controlla i manifest ogni ~30s dal boot. Quando trova una
versione più alta di quella installata, mostra il badge **↑ Aggiorna** sulla card.
L'utente clicca Installa e scarica la nuova versione. **Tu non fai nulla.**

#### Essere listato nel Registry (opzionale ma consigliato)

Per far scoprire la tua card a tutti gli utenti Oikos, apri una PR in
[`Bobsilvio/oikos-card-starter`](https://github.com/Bobsilvio/oikos-card-starter)
aggiungendo il tuo repo al file corretto in `registry/`:

```
registry/cards          ← JAVA card
registry/html-cards     ← HTML card
registry/smart-cards    ← JSON Smart Card
```

**Procedura:**
1. Fai fork di `Bobsilvio/oikos-card-starter`
2. Aggiungi `tuonome/nome-repo` in ordine alfabetico nel file corretto
3. Apri la PR — la CI valida formato e ordine
4. Approvata la PR → la card appare nello Store di tutti

---

### B — ZIP privato (semplice, per uso personale)

Genera lo ZIP e condividilo come file. L'utente lo installa via
Store → Comunità → JAVA → Carica ZIP.

```bash
npm run build:my
# → dist-cards/my-card-1.0.0.zip
```

**Quando usarlo:** test personale, card privata, utenti senza GitHub.

**Limiti:** nessuna notifica di aggiornamento, distribuzione manuale ad ogni versione.

#### Cosa contiene lo ZIP

```
my-card-1.0.0.zip
├── manifest.json
├── dist/
│   ├── my-card.js
│   └── my-card.settings.js
├── preview.png
└── template.yaml      (se presente)
```

---

### Versioning

Segui [SemVer](https://semver.org/lang/it/):

- **Major** → rompe `configVersion` (vecchie config non compatibili)
- **Minor** → nuove feature retrocompatibili
- **Patch** → solo bugfix

Bumpa `version` in `cards/<id>/manifest.json` PRIMA di buildare.

Se la card ha `template.yaml`, bumpa anche l'header:

```yaml
# oikos:package_version: 1.1.0
```

---

### Compatibilità SDK

```json
{ "sdkVersion": "^1.1.0" }
```

Usa `^1.1.0` solo se usi feature 1.1+. Altrimenti `^1.0.0` per supportare
più versioni di dashboard.

---

## 🇬🇧 English

# 04 — Distribution

Two ways to deliver your card to end users.

---

### A — GitHub Release ✅ recommended

Publish your card repo on GitHub. Users paste your URL in the dashboard →
the card appears in the Store with automatic update notifications.

**You never send anything to anyone: every new Release you push is
immediately available to all your users.**

#### One-time setup

1. Create a public GitHub repo (fork of this starter or new).
2. Develop your card in `cards/<id>/`.
3. The `.github/workflows/release.yml` file already included in this starter
   handles everything — no changes needed.

#### Publishing a release

```bash
# 1. Bump the version in cards/<id>/manifest.json
#    (e.g. "version": "1.1.0")

# 2. Tag and push
git add cards/<id>/manifest.json
git commit -m "release <id> v1.1.0"
git tag v1.1.0
git push origin main --tags
```

The GitHub Action will:
- Build all cards in `cards/*/`
- Regenerate the root `manifest.json`
- Create a GitHub Release with all dist files + manifest

#### How users install

1. Oikos dashboard → **Store → Community → JAVA**
2. Paste `https://github.com/YOUR_USERNAME/YOUR_REPO`
3. Click **Add repo** → **Install**

#### Automatic updates

The dashboard checks manifests every ~30s from boot. When it finds a higher
version than what's installed, it shows an **↑ Update** badge on the card.
The user clicks Install to download the new version. **You do nothing.**

#### Getting listed in the Registry (optional but recommended)

To make your card discoverable by all Oikos users, open a PR in
[`Bobsilvio/oikos-card-starter`](https://github.com/Bobsilvio/oikos-card-starter)
adding your repo to the correct file under `registry/`:

```
registry/cards          ← JAVA card
registry/html-cards     ← HTML card
registry/smart-cards    ← JSON Smart Card
```

**Steps:**
1. Fork `Bobsilvio/oikos-card-starter`
2. Add `yourname/repo-name` in alphabetical order in the correct file
3. Open the PR — CI validates format and order automatically
4. Once approved → your card appears in every user's Store

---

### B — Private ZIP (simple, for personal use)

Generate the ZIP and share it as a file. Users install via
Store → Community → JAVA → Upload ZIP.

```bash
npm run build:my
# → dist-cards/my-card-1.0.0.zip
```

**When to use:** personal testing, private cards, users without GitHub.

**Limitations:** no update notifications, manual redistribution for every version.

#### What the ZIP contains

```
my-card-1.0.0.zip
├── manifest.json
├── dist/
│   ├── my-card.js
│   └── my-card.settings.js
├── preview.png
└── template.yaml      (if present)
```

---

### Versioning

Follow [SemVer](https://semver.org/):

- **Major** (`1.0.0` → `2.0.0`): breaks `configVersion` (old configs incompatible)
- **Minor** (`1.0.0` → `1.1.0`): new backward-compatible features
- **Patch** (`1.0.0` → `1.0.1`): bug fixes only

Bump `version` in `cards/<id>/manifest.json` BEFORE building.

If the card creates HA entities via `template.yaml`, also bump the header:

```yaml
# oikos:package_version: 1.1.0
```

---

### SDK compatibility

```json
{ "sdkVersion": "^1.1.0" }
```

Use `^1.1.0` only if you use 1.1+ features. Otherwise `^1.0.0` to support
more dashboard versions.
