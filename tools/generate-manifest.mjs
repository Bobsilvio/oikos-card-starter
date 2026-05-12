#!/usr/bin/env node
/**
 * generate-manifest.mjs
 *
 * Scans cards/<id>/manifest.json and regenerates the root manifest.json
 * so the dashboard can discover and install cards from this repo.
 *
 *   node tools/generate-manifest.mjs
 *
 * Run this before tagging a release, or let the CI workflow call it.
 * Cards starting with _ or . are skipped (templates / hidden).
 */
import { readdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'fs'
import { resolve, dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

function fsKey(id) {
  return String(id).replace(/\//g, '__')
}

function readJson(path) {
  try { return JSON.parse(readFileSync(path, 'utf8')) } catch { return null }
}

function collectCards() {
  const cardsDir = join(ROOT, 'cards')
  if (!existsSync(cardsDir)) return []
  const entries = readdirSync(cardsDir).filter(name => {
    if (name.startsWith('_') || name.startsWith('.')) return false
    try { return statSync(join(cardsDir, name)).isDirectory() } catch { return false }
  })

  const out = []
  for (const name of entries) {
    const dir = join(cardsDir, name)
    const mf = readJson(join(dir, 'manifest.json'))
    if (!mf?.id) {
      console.warn(`⚠  cards/${name}: manifest.json missing or has no id, skipping`)
      continue
    }
    const key    = fsKey(mf.id)
    const distJs  = join(dir, 'dist', `${key}.js`)
    const distSet = join(dir, 'dist', `${key}.settings.js`)
    const preview = join(dir, 'preview.png')
    const thumb   = join(dir, 'preview-thumb.png')

    // Collect additional previews: preview-2.{png,gif}, preview-3.{png,gif}, …
    // Stops at the first gap in the sequence.
    const previews = []
    if (existsSync(preview)) previews.push(`cards/${name}/preview.png`)
    for (let i = 2; i < 20; i++) {
      const png = join(dir, `preview-${i}.png`)
      const gif = join(dir, `preview-${i}.gif`)
      if      (existsSync(png)) previews.push(`cards/${name}/preview-${i}.png`)
      else if (existsSync(gif)) previews.push(`cards/${name}/preview-${i}.gif`)
      else break
    }

    if (!existsSync(distJs)) {
      console.warn(`⚠  ${mf.id}: dist/${key}.js not found — did you run npm run build?`)
    }

    out.push({
      id:          mf.id,
      name:        mf.name        ?? mf.id,
      version:     mf.version     ?? '0.0.0',
      author:      mf.author      ?? null,
      description: mf.description ?? '',
      sdkVersion:  mf.sdkVersion  ?? null,
      hasSettings: existsSync(distSet),
      path:        `cards/${name}`,
      entry:       `cards/${name}/dist/${key}.js`,
      settings:    existsSync(distSet) ? `cards/${name}/dist/${key}.settings.js` : null,
      manifest:    `cards/${name}/manifest.json`,
      preview:     existsSync(preview) ? `cards/${name}/preview.png` : null,
      previews:    previews.length > 0 ? previews : null,
      thumbnail:   existsSync(thumb)   ? `cards/${name}/preview-thumb.png` : null,
      tags:        mf.tags ?? [],
      package:     mf.package ?? null,
      tier:        mf.tier ?? 'free',
      readme:      existsSync(join(dir, 'README.md')) ? `cards/${name}/README.md` : null,
    })
  }
  return out.sort((a, b) => a.id.localeCompare(b.id))
}

function main() {
  const rootMfPath = join(ROOT, 'manifest.json')
  const existing   = readJson(rootMfPath) ?? {}
  const cards      = collectCards()

  const manifest = {
    repo:       existing.repo ?? 'my-oikos-cards',
    version:    existing.version ?? '1.0.0',
    sdkVersion: existing.sdkVersion ?? '1.0.0',
    updated:    new Date().toISOString().slice(0, 10),
    cards,
  }
  writeFileSync(rootMfPath, JSON.stringify(manifest, null, 2) + '\n')
  console.log(`✓ manifest.json updated: ${cards.length} card(s)`)
}

main()
