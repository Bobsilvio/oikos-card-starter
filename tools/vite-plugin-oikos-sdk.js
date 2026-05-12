/**
 * vite-plugin-oikos-sdk
 *
 * Riscrive gli import delle librerie condivise in destrutturazioni da
 * `window.__OIKOS_SDK__`. Funziona a livello sorgente prima che Vite bundla
 * il codice, così il bundle finale non contiene più bare imports.
 *
 * Esempi di trasformazione:
 *   import React, { useState, useEffect } from 'react'
 *   →
 *   const React = window.__OIKOS_SDK__.React.default ?? window.__OIKOS_SDK__.React
 *   const { useState, useEffect } = window.__OIKOS_SDK__.React
 *
 *   import { Zap, Home } from 'lucide-react'
 *   →
 *   const { Zap, Home } = window.__OIKOS_SDK__.icons
 *
 *   import { jsx as _jsx } from 'react/jsx-runtime'
 *   →
 *   const { jsx: _jsx } = window.__OIKOS_SDK__.jsxRuntime
 *
 * Tutti gli import di moduli SDK vengono segnalati come external a Rollup,
 * così non prova a risolverli — la trasformazione li ha già sostituiti.
 */

// Moduli con namespace dedicato in __OIKOS_SDK__
const SDK_MAP = {
  'react':                     'React',
  'react-dom':                 'ReactDOM',
  'react/jsx-runtime':         'jsxRuntime',
  'react/jsx-dev-runtime':     'jsxRuntime',
  'lucide-react':              'icons',
  'recharts':                  'recharts',
  'framer-motion':             'framerMotion',
}

// Moduli destrutturati direttamente dalla root di __OIKOS_SDK__
// `import { useDashboard, useCardConfig, Field } from '@oikos/sdk'`
// → `const { useDashboard, useCardConfig, Field } = window.__OIKOS_SDK__`
const SDK_ROOT = new Set(['@oikos/sdk'])

// Regex per matchare import statements ES
// Cattura:
//   1: default import (es. `React`)
//   2: namespace import (es. `* as M`)
//   3: named imports (es. `{ useState, useEffect as eff }`)
//   4: source
const IMPORT_RE =
  /import\s+(?:([a-zA-Z_$][\w$]*)\s*,?\s*)?(?:\*\s+as\s+([a-zA-Z_$][\w$]*)\s*)?(?:\{([^}]*)\}\s*)?from\s+["']([^"']+)["'];?/g

// Parse un "named specifier" come `useState, useEffect as eff`
// Ritorna array di { imported, local }
function parseNamed(spec) {
  if (!spec) return []
  return spec.split(',').map(s => s.trim()).filter(Boolean).map(s => {
    const m = s.match(/^(\w+)(?:\s+as\s+(\w+))?$/)
    if (!m) return null
    return { imported: m[1], local: m[2] || m[1] }
  }).filter(Boolean)
}

export default function oikosSdkPlugin(options = {}) {
  const globalName = options.globalName || '__OIKOS_SDK__'

  function transformImports(code) {
    let changed = false
    const newCode = code.replace(IMPORT_RE, (match, defaultImp, nsImp, namedSpec, source) => {
      const ns = SDK_MAP[source]
      const isRoot = SDK_ROOT.has(source)
      if (!ns && !isRoot) return match // non è un modulo SDK, lascia invariato

      changed = true
      const access = isRoot ? `window.${globalName}` : `window.${globalName}.${ns}`
      const lines = []

      if (defaultImp) {
        // `import React from 'react'` → React è `.default` se il modulo global
        // ha un default, altrimenti è il namespace stesso (es. lucide non ha default).
        lines.push(`const ${defaultImp} = ${access}.default ?? ${access};`)
      }

      if (nsImp) {
        // `import * as M from 'react'` → M è l'intero namespace
        lines.push(`const ${nsImp} = ${access};`)
      }

      const named = parseNamed(namedSpec)
      if (named.length > 0) {
        // `import { useState, useEffect as eff } from 'react'`
        // → const { useState, useEffect: eff } = window.__OIKOS_SDK__.React
        const parts = named.map(n =>
          n.imported === n.local ? n.imported : `${n.imported}: ${n.local}`
        )
        lines.push(`const { ${parts.join(', ')} } = ${access};`)
      }

      return lines.join('\n')
    })

    return { code: newCode, changed }
  }

  return {
    name: 'vite-plugin-oikos-sdk',
    enforce: 'pre',

    // Trasforma il sorgente .js/.jsx dell'utente PRIMA che Vite lo processi.
    transform(code, id) {
      // Salta node_modules e file non-JS
      if (id.includes('node_modules')) return null
      if (!/\.(jsx?|tsx?|mjs)$/.test(id)) return null

      const result = transformImports(code)
      if (!result.changed) return null
      return { code: result.code, map: null }
    },

    // Trasforma anche il codice emesso da @vitejs/plugin-react (JSX runtime imports)
    // Questi vengono aggiunti DOPO la fase di transform, quindi dobbiamo
    // catturarli in renderChunk.
    renderChunk(code) {
      const result = transformImports(code)
      return result.changed ? { code: result.code, map: null } : null
    },
  }
}
