/**
 * Sensor Display — reads a HA sensor and shows value + unit + last_changed.
 *
 * Patterns demonstrated:
 *   - useDashboard() to access getState / getAttr / haStates
 *   - Reading unit_of_measurement from HA attributes
 *   - Reactive updates: getState re-renders automatically on change
 *   - Empty state when entityId is not configured
 *   - Unavailable / unknown state handling
 */
import { useCardConfig, useDashboard } from '@oikos/sdk'
import { Activity, AlertCircle } from 'lucide-react'

const DEFAULT = {
  entityId:    '',
  label:       '',
  accentColor: '#3b82f6',
}

function formatRelative(iso) {
  if (!iso) return ''
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60)    return `${Math.floor(diff)}s ago`
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function SensorDisplay({ cardId = 'sensor-display' }) {
  const { dark, getState, getAttr, haStates } = useDashboard()
  const [config] = useCardConfig(cardId, DEFAULT)

  const cardBg = dark ? 'rgba(255,255,255,.04)' : '#ffffff'
  const border = dark ? 'rgba(255,255,255,.08)' : '#e2e8f0'

  // Empty state
  if (!config.entityId) {
    return (
      <div style={{
        padding: 16, borderRadius: 14,
        background: cardBg, border: `1px solid ${border}`,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <AlertCircle size={20} style={{ color: 'var(--text-muted)' }}/>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
          Configure a sensor in the card settings
        </span>
      </div>
    )
  }

  const state    = getState(config.entityId)
  const unit     = getAttr(config.entityId, 'unit_of_measurement')
  const friendly = getAttr(config.entityId, 'friendly_name')
  const meta     = haStates?.[config.entityId]
  const lastChanged = meta?.last_changed
  const unavailable = state === 'unavailable' || state === 'unknown' || state == null

  const accent = config.accentColor || '#3b82f6'
  const label  = config.label || friendly || config.entityId

  return (
    <div style={{
      padding: 16, borderRadius: 14,
      background: cardBg, border: `1px solid ${unavailable ? border : `${accent}40`}`,
      transition: 'border-color .25s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 9,
          background: unavailable ? (dark ? 'rgba(255,255,255,.05)' : '#f1f5f9') : `${accent}18`,
          border: `1px solid ${unavailable ? border : `${accent}40`}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: unavailable ? 'var(--text-muted)' : accent,
        }}>
          <Activity size={16}/>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 12, fontWeight: 700, color: 'var(--text-primary)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {label}
          </div>
          {lastChanged && (
            <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>
              updated {formatRelative(lastChanged)}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span style={{
          fontSize: 32, fontWeight: 800,
          color: unavailable ? 'var(--text-muted)' : 'var(--text-primary)',
          fontVariantNumeric: 'tabular-nums', letterSpacing: '-1px',
          lineHeight: 1,
        }}>
          {unavailable ? '—' : state}
        </span>
        {unit && !unavailable && (
          <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 600 }}>
            {unit}
          </span>
        )}
      </div>

      {unavailable && (
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 6, fontStyle: 'italic' }}>
          {state === 'unavailable' ? 'Sensor unavailable' : 'Unknown state'}
        </div>
      )}
    </div>
  )
}
