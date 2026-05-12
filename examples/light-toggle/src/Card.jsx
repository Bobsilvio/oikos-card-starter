/**
 * Light Toggle — on/off toggle for a HA light (or switch).
 *
 * Patterns demonstrated:
 *   - useDashboard().callService to send commands to HA
 *   - Live state reading + reactive UI
 *   - Optimistic UI: shows target state immediately while HA confirms
 *   - .catch() on callService to avoid unhandled promise rejection
 *   - Framer Motion icon animation based on state
 */
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Lightbulb, Loader2 } from 'lucide-react'
import { useCardConfig, useDashboard } from '@oikos/sdk'

const DEFAULT = {
  entityId: '',
  label:    '',
}

export default function LightToggle({ cardId = 'light-toggle' }) {
  const { dark, getState, getAttr, callService } = useDashboard()
  const [config] = useCardConfig(cardId, DEFAULT)
  const [busy, setBusy] = useState(false)

  const cardBg = dark ? 'rgba(255,255,255,.04)' : '#ffffff'
  const border = dark ? 'rgba(255,255,255,.08)' : '#e2e8f0'

  if (!config.entityId) {
    return (
      <div style={{
        padding: 16, borderRadius: 14,
        background: cardBg, border: `1px solid ${border}`,
        color: 'var(--text-muted)', fontSize: 12, fontStyle: 'italic',
      }}>
        Configure a <code>light.*</code> entity in the card settings.
      </div>
    )
  }

  const state = getState(config.entityId)
  const isOn  = state === 'on'
  const friendly = getAttr(config.entityId, 'friendly_name')
  const label = config.label || friendly || config.entityId

  // Extract domain from entity_id to support light.X, switch.X, input_boolean.X
  const domain = config.entityId.split('.')[0]

  const toggle = async () => {
    if (busy) return
    setBusy(true)
    try {
      const service = isOn ? 'turn_off' : 'turn_on'
      await Promise.resolve(
        callService(domain, service, config.entityId)
      ).catch(err => console.error('[LightToggle]', err))
    } finally {
      // Small delay to give visual feedback even on very fast HA responses
      setTimeout(() => setBusy(false), 300)
    }
  }

  const accent = isOn ? '#fbbf24' : (dark ? 'rgba(255,255,255,.3)' : '#94a3b8')

  return (
    <button
      onClick={toggle}
      disabled={busy}
      style={{
        width: '100%',
        padding: '20px 18px', borderRadius: 16,
        background: cardBg,
        border: `1px solid ${isOn ? `${accent}55` : border}`,
        boxShadow: isOn ? `0 0 30px ${accent}22, 0 0 0 1px ${accent}30` : 'none',
        cursor: busy ? 'wait' : 'pointer',
        transition: 'all .25s',
        textAlign: 'left',
        display: 'flex', alignItems: 'center', gap: 14,
      }}
    >
      {/* Light icon with glow animation when ON */}
      <motion.div
        animate={isOn ? {
          scale: [1, 1.1, 1],
          rotate: [0, -5, 5, 0],
        } : { scale: 1, rotate: 0 }}
        transition={{ duration: 2, repeat: isOn ? Infinity : 0, ease: 'easeInOut' }}
        style={{
          width: 48, height: 48, borderRadius: 12,
          background: isOn ? `${accent}25` : (dark ? 'rgba(255,255,255,.05)' : '#f1f5f9'),
          border: `1px solid ${isOn ? `${accent}50` : border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          boxShadow: isOn ? `inset 0 0 18px ${accent}40` : 'none',
        }}
      >
        {busy
          ? <Loader2 size={22} style={{ color: accent, animation: 'spin 1s linear infinite' }}/>
          : <Lightbulb size={22} style={{ color: accent }} fill={isOn ? accent : 'none'}/>}
      </motion.div>

      {/* Label + state text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: 700, color: 'var(--text-primary)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {label}
        </div>
        <div style={{
          fontSize: 11, fontWeight: 600,
          color: isOn ? accent : 'var(--text-muted)',
          textTransform: 'uppercase', letterSpacing: '.06em',
          marginTop: 2,
        }}>
          {state === 'unavailable' ? 'Unavailable' : isOn ? 'On' : 'Off'}
        </div>
      </div>

      {/* Visual toggle switch */}
      <div style={{
        width: 44, height: 24, borderRadius: 99, flexShrink: 0,
        background: isOn ? accent : (dark ? 'rgba(255,255,255,.12)' : '#cbd5e1'),
        position: 'relative',
        transition: 'background .25s',
      }}>
        <motion.span
          animate={{ left: isOn ? 22 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          style={{
            position: 'absolute', top: 2,
            width: 20, height: 20, borderRadius: '50%',
            background: '#fff',
            boxShadow: '0 1px 4px rgba(0,0,0,.25)',
          }}
        />
      </div>
    </button>
  )
}
