#!/usr/bin/env node
/**
 * build-card.mjs
 *
 * Builda una card community in bundle ESM auto-contenuto.
 *
 *   node tools/build-card.mjs cards/clock
 *
 * Legge cards/<id>/manifest.json, builda cards/<id>/src/Card.jsx e scrive
 * cards/<id>/dist/<id>.js. Tutti gli import di react, lucide, recharts,
 * framer-motion e @oikos/sdk vengono riscritti in accessi a
 * window.__OIKOS_SDK__ tramite vite-plugin-oikos-sdk.
 *
 * Se esiste Settings.jsx, viene buildato anche quello in dist/<id>.settings.js.
 */
import { build } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve, join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { readFileSync, existsSync } from 'fs'
import oikosSdk from './vite-plugin-oikos-sdk.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

const EXTERNAL = [
  'react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime',
  'lucide-react', 'recharts', 'framer-motion', '@oikos/sdk',
]

async function buildEntry(entryPath, outName, outDir) {
  await build({
    root: ROOT,
    plugins: [react(), oikosSdk()],
    logLevel: 'warn',
    build: {
      lib: {
        entry: entryPath,
        formats: ['es'],
        fileName: () => outName,
      },
      outDir,
      emptyOutDir: false,
      rollupOptions: {
        external: EXTERNAL,
        output: {
          globals: {
            'react':                     'window.__OIKOS_SDK__.React',
            'react-dom':                 'window.__OIKOS_SDK__.ReactDOM',
            'react/jsx-runtime':         'window.__OIKOS_SDK__.jsxRuntime',
            'react/jsx-dev-runtime':     'window.__OIKOS_SDK__.jsxRuntime',
            'lucide-react':              'window.__OIKOS_SDK__.icons',
            'recharts':                  'window.__OIKOS_SDK__.recharts',
            'framer-motion':             'window.__OIKOS_SDK__.framerMotion',
            '@oikos/sdk':                'window.__OIKOS_SDK__',
          },
        },
      },
      minify: 'esbuild',
      sourcemap: false,
    },
  })
}

async function main() {
  const cardDir = process.argv[2]
  if (!cardDir) {
    console.error('Usage: node tools/build-card.mjs cards/<id>')
    process.exit(1)
  }
  const abs = resolve(ROOT, cardDir)
  const manifestPath = join(abs, 'manifest.json')
  if (!existsSync(manifestPath)) {
    console.error(`No manifest.json in ${abs}`)
    process.exit(1)
  }
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'))
  const outDir = join(abs, 'dist')
  // id può essere namespaced (owner/card); filesystem-safe key sostituisce `/` con `__`
  const fsKey = String(manifest.id).replace(/\//g, '__')

  const cardEntry = join(abs, 'src/Card.jsx')
  if (!existsSync(cardEntry)) {
    console.error(`Missing ${cardEntry}`)
    process.exit(1)
  }

  console.log(`→ Building ${manifest.id}@${manifest.version}`)
  await buildEntry(cardEntry, `${fsKey}.js`, outDir)

  const settingsEntry = join(abs, 'src/Settings.jsx')
  if (existsSync(settingsEntry)) {
    console.log(`→ Building ${manifest.id} settings`)
    await buildEntry(settingsEntry, `${fsKey}.settings.js`, outDir)
  }

  console.log(`✓ dist/${fsKey}.js ready`)
}

main().catch(e => { console.error(e); process.exit(1) })
