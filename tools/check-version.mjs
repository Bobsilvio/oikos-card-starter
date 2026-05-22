/**
 * Controlla 1 volta al giorno se esiste una versione più recente di
 * oikos-card-starter su GitHub. Non blocca la build in caso di errore/timeout.
 */
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT      = resolve(__dirname, '..')
const SENTINEL  = resolve(ROOT, '.version-check')
const REPO      = 'Bobsilvio/oikos-card-starter'

function semverGt(a, b) {
  const pa = a.replace(/^v/, '').split('.').map(Number)
  const pb = b.replace(/^v/, '').split('.').map(Number)
  for (let i = 0; i < 3; i++) {
    if ((pa[i] ?? 0) > (pb[i] ?? 0)) return true
    if ((pa[i] ?? 0) < (pb[i] ?? 0)) return false
  }
  return false
}

export async function checkStarterVersion() {
  const today = new Date().toISOString().slice(0, 10)

  if (existsSync(SENTINEL)) {
    try {
      const s = JSON.parse(readFileSync(SENTINEL, 'utf-8'))
      if (s.date === today) return
    } catch {}
  }

  try {
    const pkg    = JSON.parse(readFileSync(resolve(ROOT, 'package.json'), 'utf-8'))
    const local  = pkg.version ?? '0.0.0'
    const res    = await fetch(
      `https://api.github.com/repos/${REPO}/releases/latest`,
      { headers: { 'User-Agent': 'oikos-card-starter' }, signal: AbortSignal.timeout(4000) },
    )
    if (!res.ok) { writeFileSync(SENTINEL, JSON.stringify({ date: today })); return }
    const data   = await res.json()
    const latest = (data.tag_name ?? '0.0.0').replace(/^v/, '')
    writeFileSync(SENTINEL, JSON.stringify({ date: today, latest }))
    if (semverGt(latest, local)) {
      console.warn(`\n⚠  oikos-card-starter ${local} → ${latest} disponibile.`)
      console.warn(`   Aggiorna con:  git pull\n`)
    }
  } catch {
    // rete assente o timeout — non blocca build
    try { writeFileSync(SENTINEL, JSON.stringify({ date: today })) } catch {}
  }
}
