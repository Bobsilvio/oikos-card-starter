# AGENTS.md — Oikos Card Starter

Questo repo contiene la guida autorevole per creare/modificare **card, chip e
distintivi** della dashboard Oikos.

**Istruzioni**: segui `./SKILL.md` (ignora il blocco frontmatter YAML in cima,
righe 1–10 — è solo per l'auto-attivazione su Claude). Il resto del file è
self-contained: layout repo, export di `@oikos/sdk`, regole hooks, design system,
mobile, packaging, procedure per card/chip/badge.

Promemoria rapidi (dettagli in SKILL.md):
- Tutti gli hook (`useState/useEffect/useMemo/useCardConfig/useStyles/useT…`)
  PRIMA di qualsiasi `return`.
- Mai colori/raggi/font hardcoded → usa `useStyles()`.
- i18n bilingue minimo (it+en) via `registerCardTranslations`/`useT`; chiavi alla
  radice del namespace, niente wrapper se poi non lo prefissi in `t()`.
- `manifest.type: "chip" | "badge"` per pacchetti chip/distintivo.
- Build card: `node tools/build-card.mjs cards/<id>`.
