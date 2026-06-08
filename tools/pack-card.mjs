#!/usr/bin/env node
/**
 * pack-card.mjs — crea uno ZIP installabile manualmente per una card community.
 *
 * Uso:
 *   node tools/pack-card.mjs cards/<id>
 *
 * Output: dist-cards/<id>-<version>.zip
 *
 * Lo ZIP è progettato per l'endpoint `/api/cards/upload-zip` dell'addon Oikos.
 * Contiene SOLO i file runtime necessari (niente sources, niente node_modules).
 *
 * Whitelist contenuto:
 *   manifest.json
 *   dist/<id>.js              (richiesto)
 *   dist/<id>.settings.js     (opzionale)
 *   preview.png               (opzionale)
 *   preview-thumb.png         (opzionale)
 *   preview-N.{png,gif}       (opzionale, multi-screenshot)
 *   template.yaml             (opzionale, per card con package HA)
 *   README.md                 (opzionale)
 */
import { readFileSync, readdirSync, writeFileSync, existsSync, mkdirSync, statSync } from 'fs'
import { resolve, join, dirname, basename } from 'path'
import { fileURLToPath } from 'url'
import { zipSync, strToU8 } from 'fflate'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

function fsKey(id) {
  return String(id).replace(/\//g, '__')
}

// Parsa un CHANGELOG.md "Keep a Changelog" → [{version,date,changes[]}] (max 10).
function parseChangelog(cardDir, max = 10) {
  const p = join(cardDir, 'CHANGELOG.md')
  if (!existsSync(p)) return null
  let text
  try { text = readFileSync(p, 'utf-8') } catch { return null }
  const entries = []
  let cur = null
  for (const raw of text.split('\n')) {
    const line = raw.trim()
    const h = line.match(/^##\s+\[?v?([0-9][0-9A-Za-z.\-]*)\]?\s*(?:[-–—]\s*(.+))?$/)
    if (h) {
      if (cur) entries.push(cur)
      cur = { version: h[1], date: (h[2] || '').trim() || null, changes: [] }
      continue
    }
    if (!cur) continue
    const b = line.match(/^[-*]\s+(.+)$/)
    if (b) {
      const txt = b[1].replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1').replace(/`(.+?)`/g, '$1').trim()
      if (txt) cur.changes.push(txt)
    }
  }
  if (cur) entries.push(cur)
  const filtered = entries.filter(e => e.changes.length > 0).slice(0, max)
  return filtered.length ? filtered : null
}

function main() {
  const cardArg = process.argv[2]
  if (!cardArg) {
    console.error('Usage: node tools/pack-card.mjs cards/<id>')
    process.exit(1)
  }

  const cardDir = resolve(ROOT, cardArg)
  if (!existsSync(cardDir) || !statSync(cardDir).isDirectory()) {
    console.error(`Cartella non trovata: ${cardDir}`)
    process.exit(1)
  }

  const manifestPath = join(cardDir, 'manifest.json')
  if (!existsSync(manifestPath)) {
    console.error(`manifest.json mancante in ${cardDir}`)
    process.exit(1)
  }

  const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'))
  if (!manifest.id || !manifest.version) {
    console.error('manifest.json deve contenere `id` e `version`')
    process.exit(1)
  }

  const key = fsKey(manifest.id)
  const distDir = join(cardDir, 'dist')
  const entry = join(distDir, `${key}.js`)
  if (!existsSync(entry)) {
    console.error(`Bundle non trovato: ${entry}`)
    console.error('Esegui prima: node tools/build-card.mjs ' + cardArg)
    process.exit(1)
  }

  // Costruisci la mappa file → contenuto per fflate.zipSync
  const files = {}
  const addFile = (relPath, abs) => {
    const buf = readFileSync(abs)
    files[relPath] = new Uint8Array(buf)
    return buf.byteLength
  }

  const addBytes = (relPath, buf) => { files[relPath] = new Uint8Array(buf); return buf.byteLength }

  // Se la card ha un CHANGELOG.md, lo parsiamo e iniettiamo `changelog` nel
  // manifest.json dentro lo ZIP — così la cronologia versioni viaggia con la
  // card ed è visibile nello store. Il file .md grezzo è incluso a parte.
  const changelog = parseChangelog(cardDir)
  let totalBytes = 0
  if (changelog) {
    const augmented = { ...manifest, changelog }
    totalBytes += addBytes('manifest.json', strToU8(JSON.stringify(augmented, null, 2) + '\n'))
  } else {
    totalBytes += addFile('manifest.json', manifestPath)
  }
  totalBytes += addFile(`dist/${key}.js`, entry)

  const settingsFile = join(distDir, `${key}.settings.js`)
  if (existsSync(settingsFile)) {
    totalBytes += addFile(`dist/${key}.settings.js`, settingsFile)
  }

  // Logo (logo.png / jpg / gif / webp / svg)
  for (const ext of ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg']) {
    const p = join(cardDir, `logo.${ext}`)
    if (existsSync(p)) { totalBytes += addFile(`logo.${ext}`, p); break }
  }

  // Preview principale + alternative numerate
  for (const name of ['preview.png', 'preview-thumb.png']) {
    const p = join(cardDir, name)
    if (existsSync(p)) totalBytes += addFile(name, p)
  }
  for (let i = 2; i < 20; i++) {
    for (const ext of ['png', 'gif']) {
      const p = join(cardDir, `preview-${i}.${ext}`)
      if (existsSync(p)) totalBytes += addFile(`preview-${i}.${ext}`, p)
    }
  }

  // Asset opzionali
  for (const name of ['template.yaml', 'README.md', 'CHANGELOG.md']) {
    const p = join(cardDir, name)
    if (existsSync(p)) totalBytes += addFile(name, p)
  }

  // Output dir
  const outDir = join(ROOT, 'dist-cards')
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })
  const outFile = join(outDir, `${key}-${manifest.version}.zip`)

  const zipped = zipSync(files, { level: 9 })
  writeFileSync(outFile, Buffer.from(zipped))

  const ratio = ((zipped.length / Math.max(totalBytes, 1)) * 100).toFixed(0)
  const kb = (zipped.length / 1024).toFixed(1)

  console.log(`✓ ${basename(outFile)} (${kb} KB, compressione ${ratio}%, ${Object.keys(files).length} file)`)
  console.log(`  → ${outFile}`)
}

main()
