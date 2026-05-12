#!/usr/bin/env node
/**
 * pack-git.mjs — crea una cartella standalone pronta per essere pubblicata
 * come repo GitHub autonomo per una card community Oikos.
 *
 * Uso:
 *   node tools/pack-git.mjs cards/<id>
 *
 * Output: dist-cards/<id>-git/
 *
 * La cartella prodotta è un repo GitHub completo e autonomo:
 *   .github/workflows/release.yml  ← GitHub Actions (build + release automatica)
 *   .gitignore                     ← senza dist/ (serve per raw.githubusercontent.com)
 *   cards/<id>/manifest.json       ← manifest della card
 *   cards/<id>/src/                ← sorgenti JSX
 *   cards/<id>/dist/               ← bundle già buildata (committata in git)
 *   manifest.json                  ← root manifest leggibile dal dashboard
 *   package.json                   ← dipendenze (name = card id)
 *   package-lock.json              ← lock esatto per npm ci in CI
 *   tools/                         ← build/pack/generate tools
 *   README.md                      ← da card dir oppure autogenerato
 *
 * Passi successivi (mostrati a fine script):
 *   cd dist-cards/<id>-git
 *   git init && git add . && git commit -m "Initial release"
 *   gh repo create <username>/<id> --public --source=. --remote=origin --push
 *   git tag v<version> && git push origin main --tags
 */
import {
  readFileSync, writeFileSync, existsSync, mkdirSync,
  readdirSync, statSync, rmSync, copyFileSync,
} from 'fs'
import { resolve, join, dirname, basename } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT      = resolve(__dirname, '..')

// ─── helpers ────────────────────────────────────────────────────────────────

function readJson(p) {
  try { return JSON.parse(readFileSync(p, 'utf-8')) } catch { return null }
}

/** Copia ricorsiva src → dst (crea dst se non esiste). */
function cpRecursive(src, dst) {
  const st = statSync(src)
  if (st.isDirectory()) {
    mkdirSync(dst, { recursive: true })
    for (const entry of readdirSync(src)) {
      cpRecursive(join(src, entry), join(dst, entry))
    }
  } else {
    mkdirSync(dirname(dst), { recursive: true })
    copyFileSync(src, dst)
  }
}

function writeText(p, content) {
  mkdirSync(dirname(p), { recursive: true })
  writeFileSync(p, content, 'utf-8')
}

// ─── generazione README ──────────────────────────────────────────────────────

function generateReadme(mf) {
  const name = mf.name         ?? mf.id
  const desc = mf.description  ?? ''
  const tags = (mf.tags ?? []).map(t => `\`${t}\``).join(' ')

  return `[🇮🇹 Italiano](#-italiano) · [🇬🇧 English](#-english)

---

## 🇮🇹 Italiano

# ${name}

${desc}

${tags ? `**Tag:** ${tags}\n` : ''}
### Installazione

1. Apri il dashboard Oikos → **Store → Comunità → JAVA**
2. Aggiungi \`tuonome/${mf.id}\`
3. Espandi la sorgente e clicca **Installa**

> Il repo non deve essere nel registry pubblico — puoi tenerlo privato
> e aggiungerlo solo al tuo dashboard.

### Aggiornamenti

Automatici — ogni volta che pubblichi un nuovo tag su GitHub il dashboard
rileva la nuova versione e mostra il pulsante **Aggiorna**.

### Configurazione

Apri le impostazioni della card (icona ⚙) per configurarla.

---

## 🇬🇧 English

# ${name}

${desc}

${tags ? `**Tags:** ${tags}\n` : ''}
### Installation

1. Open Oikos dashboard → **Store → Community → JAVA**
2. Add \`yourname/${mf.id}\`
3. Expand the source and click **Install**

> The repo does not need to be in the public registry — you can keep it
> private and add it only to your own dashboard.

### Updates

Automatic — every time you push a new tag on GitHub the dashboard
detects the new version and shows an **Update** button.

### Configuration

Open the card settings (⚙ icon) to configure it.
`
}

// ─── generazione root manifest ───────────────────────────────────────────────

function buildRootManifest(mf, cardName, outDir) {
  const key     = mf.id.replace(/\//g, '__')
  const cardOut = join(outDir, 'cards', cardName)

  const hasSettings = existsSync(join(cardOut, 'dist', `${key}.settings.js`))
  const hasPreview  = existsSync(join(cardOut, 'preview.png'))
  const hasReadme   = existsSync(join(cardOut, 'README.md'))

  // Logo (logo.png / logo.jpg / logo.gif / logo.webp / logo.svg)
  const LOGO_EXTS = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg']
  const logoFile  = LOGO_EXTS.map(e => join(cardOut, `logo.${e}`)).find(existsSync)
  const logoExt   = logoFile ? logoFile.split('.').pop() : null

  // Raccoglie preview aggiuntive (preview-2.png, preview-3.gif, …)
  const previews = []
  if (hasPreview) previews.push(`cards/${cardName}/preview.png`)
  for (let i = 2; i < 20; i++) {
    const png = join(cardOut, `preview-${i}.png`)
    const gif = join(cardOut, `preview-${i}.gif`)
    if      (existsSync(png)) previews.push(`cards/${cardName}/preview-${i}.png`)
    else if (existsSync(gif)) previews.push(`cards/${cardName}/preview-${i}.gif`)
    else break
  }

  return {
    repo:       mf.id,
    version:    mf.version    ?? '1.0.0',
    sdkVersion: mf.sdkVersion ?? '1.0.0',
    updated:    new Date().toISOString().slice(0, 10),
    cards: [{
      id:          mf.id,
      name:        mf.name        ?? mf.id,
      version:     mf.version     ?? '1.0.0',
      author:      mf.author      ?? null,
      description: mf.description ?? '',
      sdkVersion:  mf.sdkVersion  ?? null,
      hasSettings,
      path:        `cards/${cardName}`,
      entry:       `cards/${cardName}/dist/${key}.js`,
      settings:    hasSettings ? `cards/${cardName}/dist/${key}.settings.js` : null,
      manifest:    `cards/${cardName}/manifest.json`,
      preview:     hasPreview ? `cards/${cardName}/preview.png` : null,
      previews:    previews.length > 1 ? previews : null,
      thumbnail:   existsSync(join(cardOut, 'preview-thumb.png'))
                     ? `cards/${cardName}/preview-thumb.png` : null,
      logo:        logoFile ? `cards/${cardName}/logo.${logoExt}` : null,
      tags:        mf.tags    ?? [],
      package:     mf.package ?? null,
      tier:        mf.tier    ?? 'free',
      readme:      hasReadme
                     ? `cards/${cardName}/README.md`
                     : (existsSync(join(outDir, 'README.md')) ? 'README.md' : null),
    }],
  }
}

// ─── main ────────────────────────────────────────────────────────────────────

function main() {
  const cardArg = process.argv[2]
  if (!cardArg) {
    console.error('Uso: node tools/pack-git.mjs cards/<id>')
    process.exit(1)
  }

  const cardDir = resolve(ROOT, cardArg)
  if (!existsSync(cardDir) || !statSync(cardDir).isDirectory()) {
    console.error(`Cartella non trovata: ${cardDir}`)
    process.exit(1)
  }

  const manifestPath = join(cardDir, 'manifest.json')
  if (!existsSync(manifestPath)) {
    console.error('manifest.json mancante — esegui prima: npm run build ' + cardArg)
    process.exit(1)
  }

  const mf = readJson(manifestPath)
  if (!mf?.id || !mf?.version) {
    console.error('manifest.json deve contenere `id` e `version`')
    process.exit(1)
  }

  const key      = mf.id.replace(/\//g, '__')
  const cardName = basename(cardDir)
  const distJs   = join(cardDir, 'dist', `${key}.js`)

  if (!existsSync(distJs)) {
    console.error(`dist/${key}.js non trovato — esegui prima: npm run build ${cardArg}`)
    process.exit(1)
  }

  // Output dir: dist-cards/<id>-git/
  const outDir = join(ROOT, 'dist-cards', `${key}-git`)
  if (existsSync(outDir)) {
    rmSync(outDir, { recursive: true, force: true })
  }
  mkdirSync(outDir, { recursive: true })

  console.log(`→ Creazione repo git per ${mf.id}@${mf.version}`)

  // 1. cards/<id>/ → copia completa (manifest + src + dist + preview + readme)
  const cardOutDir = join(outDir, 'cards', cardName)
  cpRecursive(cardDir, cardOutDir)
  console.log(`  ✓ cards/${cardName}/`)

  // 2. tools/
  cpRecursive(join(ROOT, 'tools'), join(outDir, 'tools'))
  console.log('  ✓ tools/')

  // 3. .github/workflows/release.yml
  const releaseYml = join(ROOT, '.github', 'workflows', 'release.yml')
  if (existsSync(releaseYml)) {
    const dst = join(outDir, '.github', 'workflows', 'release.yml')
    mkdirSync(dirname(dst), { recursive: true })
    copyFileSync(releaseYml, dst)
    console.log('  ✓ .github/workflows/release.yml')
  } else {
    console.warn('  ⚠  .github/workflows/release.yml non trovato nello starter — saltato')
  }

  // 4. package.json (name = card id, stesse devDependencies)
  const pkgSrc = readJson(join(ROOT, 'package.json')) ?? {}
  const pkg = {
    name:         mf.id,
    version:      mf.version,
    private:      true,
    type:         'module',
    description:  mf.description ?? '',
    scripts:      pkgSrc.scripts       ?? {},
    devDependencies: pkgSrc.devDependencies ?? {},
  }
  writeText(join(outDir, 'package.json'), JSON.stringify(pkg, null, 2) + '\n')
  console.log('  ✓ package.json')

  // 5. package-lock.json (garantisce npm ci deterministico in CI)
  const lockSrc = join(ROOT, 'package-lock.json')
  if (existsSync(lockSrc)) {
    copyFileSync(lockSrc, join(outDir, 'package-lock.json'))
    console.log('  ✓ package-lock.json')
  }

  // 6. .gitignore — senza "dist/" (la dist deve essere in git per raw.githubusercontent.com)
  writeText(join(outDir, '.gitignore'), [
    'node_modules/',
    'dist-cards/',
    '.DS_Store',
    '*.log',
    '.env',
    '.env.local',
    '.vscode/',
    '.idea/',
    '',
  ].join('\n'))
  console.log('  ✓ .gitignore')

  // 7. root manifest.json
  const rootMf = buildRootManifest(mf, cardName, outDir)
  writeText(join(outDir, 'manifest.json'), JSON.stringify(rootMf, null, 2) + '\n')
  console.log('  ✓ manifest.json (root)')

  // 8. README.md — usa quello della card se esiste, altrimenti genera
  const cardReadme = join(cardDir, 'README.md')
  if (existsSync(cardReadme)) {
    copyFileSync(cardReadme, join(outDir, 'README.md'))
    console.log('  ✓ README.md (dalla card)')
  } else {
    writeText(join(outDir, 'README.md'), generateReadme(mf))
    console.log('  ✓ README.md (autogenerato)')
  }

  // ─── Riepilogo ────────────────────────────────────────────────────────────

  const relOut = `dist-cards/${key}-git`
  console.log()
  console.log(`✅  ${relOut}/  pronto!`)
  console.log()
  console.log('══════════════════════════════════════════════════════')
  console.log(' Opzione A — Pubblica su GitHub (aggiornamenti auto)')
  console.log('══════════════════════════════════════════════════════')
  console.log(`  cd ${relOut}`)
  console.log('  git init && git checkout -b main')
  console.log('  git add .')
  console.log(`  git commit -m "feat: ${mf.name ?? mf.id} v${mf.version} — initial release"`)
  console.log(`  gh repo create <username>/${mf.id} --public --source=. --remote=origin --push`)
  console.log(`  git tag v${mf.version} && git push origin main --tags`)
  console.log()
  console.log('  Poi nel dashboard:')
  console.log('    Store → Comunità → JAVA → Aggiungi → <username>/' + mf.id)
  console.log()
  console.log('  Per renderla visibile a tutti (opzionale):')
  console.log('    PR su Bobsilvio/oikos-card-starter → registry/cards')
  console.log('    Aggiungi: <username>/' + mf.id)
  console.log()
  console.log('══════════════════════════════════════════════════════')
  console.log(' Opzione B — Usa lo ZIP (installazione manuale)')
  console.log('══════════════════════════════════════════════════════')
  console.log(`  npm run pack -- ${cardArg}`)
  console.log(`  → dist-cards/${key}-${mf.version}.zip`)
  console.log('  Dashboard → Store → Comunità → JAVA → Carica ZIP')
  console.log()
}

main()
