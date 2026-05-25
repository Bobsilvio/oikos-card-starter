# Oikos Card Starter — istruzioni per Claude Code

## Aggiornamenti SDK — controlla a ogni sessione

All'inizio di ogni sessione di lavoro in questo repo, esegui:

```bash
git fetch origin --quiet && git log HEAD..origin/main --oneline
```

- Se ci sono commit nuovi: avvisa l'utente con il numero di commit disponibili
  e suggerisci `git pull` per aggiornare l'SDK prima di iniziare.
- Se il repo non è un clone git (nessuna directory `.git`): avvisa l'utente
  che ha scaricato uno ZIP e suggerisci di clonare il repo per ricevere
  gli aggiornamenti automatici:
  `git clone https://github.com/Bobsilvio/oikos-card-starter.git`
- Se è già aggiornato: non dire nulla, procedi.

## Pre-create checklist (OBBLIGATORIA)

Prima di scrivere qualsiasi card che usi primitivi SDK (ColorCircles, Pills, EntityField,
recharts, hooks React), esegui questi passi nell'ordine:

1. `grep -i "crash\|MUST\|never\|gotcha\|✗" SKILL.md` — leggi ogni riga trovata
2. Leggi **§3b** (design tokens), **§3d** (hooks rules), **§7** (troubleshooting)
3. Verifica shape prop: `ColorCircles` vuole `{label, value}[]`, mai stringhe plain;
   `useMemo`/`useEffect`/`useState` devono stare PRIMA di qualsiasi `return`

---

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

- **i18n OBBLIGATORIO** — ogni stringa visibile all'utente deve usare `useT()`.
  Crea `src/i18n/it.json` E `src/i18n/en.json`. Mai hardcodare testo in nessuna lingua.
  Pattern: `registerCardTranslations('card-<id>', { it, en })` in cima al file.
- **useStyles() OBBLIGATORIO** — mai hardcodare colori, border-radius o font-size.
  Usa sempre `s.card` / `s.label` / `s.value` / `s.tokens.*`
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
