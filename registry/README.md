# Oikos Community Registry

[🇮🇹 Italiano](#-italiano) · [🇬🇧 English](#-english)

---

## 🇮🇹 Italiano

Questo registro elenca i repo GitHub delle card community Oikos.
Il dashboard legge questi file per mostrare le card disponibili nello Store.

### File

| File | Tipo di card |
|---|---|
| [`cards`](./cards) | JAVA (React + Vite) — richiede `manifest.json` alla root + GitHub Release |
| [`html-cards`](./html-cards) | HTML (iframe) — file `.html` accessibili via raw URL |
| [`smart-cards`](./smart-cards) | JSON Smart Card — richiede `repository.json` alla root |

### Come aggiungere il tuo repo

1. Pubblica il tuo repo su GitHub con almeno una Release
2. Fai fork di `Bobsilvio/oikos-card-starter`
3. Aggiungi `tuonome/nome-repo` al file corretto in **ordine alfabetico**
4. Apri una Pull Request — la CI valida formato e ordine automaticamente
5. Una volta approvata, la tua card appare nello Store di tutti gli utenti

### Requisiti minimi

- ✅ Repo pubblico su GitHub
- ✅ Almeno una GitHub Release con i file dist
- ✅ `manifest.json` valido (JAVA) o `repository.json` valido (Smart Card)
- ✅ `sdkVersion` impostato correttamente
- ✅ Testata su dashboard Oikos reale
- ✅ Nessun fetch a host non dichiarati
- ✅ Nessun accesso a `auth.access_token`
- ✅ Nessun CSS globale iniettato nel parent

### Rimozione

Apri una PR rimuovendo la tua riga. In caso di violazioni di sicurezza la
rimozione avviene direttamente dal team Oikos senza preavviso.

---

## 🇬🇧 English

This registry lists GitHub repos of Oikos community cards.
The dashboard reads these files to list available cards in the Store.

### Files

| File | Card type |
|---|---|
| [`cards`](./cards) | JAVA (React + Vite) — requires `manifest.json` at root + GitHub Release |
| [`html-cards`](./html-cards) | HTML (iframe) — `.html` files accessible via raw URL |
| [`smart-cards`](./smart-cards) | JSON Smart Card — requires `repository.json` at root |

### How to add your repo

1. Publish your repo on GitHub with at least one Release
2. Fork `Bobsilvio/oikos-card-starter`
3. Add `yourname/repo-name` to the correct file in **alphabetical order**
4. Open a Pull Request — CI validates format and order automatically
5. Once approved, your card appears in every Oikos user's Store

### Minimum requirements

- ✅ Public repo on GitHub
- ✅ At least one GitHub Release with dist files
- ✅ Valid `manifest.json` (JAVA) or `repository.json` (Smart Card)
- ✅ `sdkVersion` set correctly
- ✅ Tested on a real Oikos dashboard
- ✅ No fetches to undeclared external hosts
- ✅ No `auth.access_token` access
- ✅ No global CSS injection into the parent document

### Removal

Open a PR removing your line. In case of security violations, removal is
done directly by the Oikos team without notice.
