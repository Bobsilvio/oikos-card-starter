# Oikos Card Starter — istruzioni per Claude Code

Questo è uno starter kit per creare card community per la dashboard
**Oikos** (Home Assistant). Quando l'utente apre Claude Code in questo
folder e chiede di creare/modificare una card, **segui le istruzioni
dettagliate in `SKILL.md`** (root di questo repo).

## Riepilogo per orientarti subito

- L'utente lavora in `cards/my-card/` (template) o crea nuove dir per
  card aggiuntive
- 3 esempi di riferimento in `examples/` (hello-world, sensor-display,
  light-toggle, html-counter)
- Build + pack ZIP: `npm run build:my` oppure
  `npm run build cards/<id>/` + `npm run pack -- cards/<id>`
- Output ZIP → `dist-cards/<id>-<version>.zip` → Store → Comunità → JAVA → Carica ZIP
- Repo GitHub standalone: `npm run pack:git -- cards/<id>`
  → `dist-cards/<id>-git/` pronto per `git init` + push + tag

## Workflow tipico quando l'utente chiede una nuova card

1. **Chiedi solo se necessario** quali entità HA usare, layout, interazione
2. Modifica `cards/my-card/manifest.json` (id, name, version)
3. Scrivi `cards/my-card/src/Card.jsx` usando l'SDK (`@oikos/sdk` +
   `react` + `lucide-react`)
4. Se servono impostazioni: scrivi `cards/my-card/src/Settings.jsx`
5. Lancia `npm install` (solo la prima volta in una sessione)
6. Lancia `npm run build cards/<id>/`
7. Se vuole pubblicare su GitHub: `npm run pack:git -- cards/<id>`
   → mostra `dist-cards/<id>-git/` e i comandi git da eseguire
8. Se vuole solo uno ZIP locale: `npm run pack -- cards/<id>`
   → mostra il path ZIP + **Store → Comunità → JAVA → Carica ZIP**

## Vincoli importanti

- **Mai** importare React/lucide/recharts da `node_modules`: solo via
  `import ... from '@oikos/sdk'` o `import { useState } from 'react'`
  (il vite plugin riscrive a `window.__OIKOS_SDK__`)
- **Mai** fetchare risorse esterne dal codice della card senza
  dichiararle (CSP)
- **Mai** modificare `tools/` (build / vite plugin / pack)

## Per dettagli completi

→ leggi `SKILL.md` (SDK reference, pattern, troubleshooting)
→ vedi `docs/01-quickstart.md` ... `docs/07-json-cards.md`

## Formati card alternativi

L'utente potrebbe chiedere un formato diverso da JAVA (React+Vite):
- **HTML** (singolo `.html`, iframe sandbox) → vedi `docs/06-html-cards.md`
  + esempio `examples/html-counter/counter.html`
- **JSON Smart Card** (no-code, widget visuali) → vedi `docs/07-json-cards.md`

In quei casi il workflow non passa dal build di Vite — produci il file
finale direttamente.
