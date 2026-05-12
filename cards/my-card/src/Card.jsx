/**
 * My Card — starter template.
 *
 * Edit this file to build your card.
 * See `examples/` for more complex patterns (sensor chart, controls, popups).
 *
 * ─────────────────────────────────────────────────────────────────────────
 * RULE: always use useCardConfig to persist card settings.
 * Never write to localStorage directly — data won't sync across the user's
 * devices (PC, phone, tablet). useCardConfig saves to the Oikos add-on
 * server and all devices receive the same config at boot, automatically.
 * ─────────────────────────────────────────────────────────────────────────
 */
import { useCardConfig, useDashboard } from '@oikos/sdk'
import { Sparkles } from 'lucide-react'

const DEFAULT_CONFIG = {
  entityId: '',
  label:    'My Card',
}

export default function MyCard({ cardId = 'my-card' }) {
  const { dark, getState } = useDashboard()
  const [config] = useCardConfig(cardId, DEFAULT_CONFIG)

  const cardBg = dark ? 'rgba(255,255,255,.04)' : '#ffffff'
  const border = dark ? 'rgba(255,255,255,.08)' : '#e2e8f0'

  // Empty state: invite the user to configure an entity
  if (!config.entityId) {
    return (
      <div style={{
        padding: 18, borderRadius: 14,
        background: cardBg, border: `1px solid ${border}`,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <Sparkles size={22} style={{ color: 'var(--amber)' }}/>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
            {config.label}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
            ⚙ Configure an entity in the card settings
          </div>
        </div>
      </div>
    )
  }

  const value = getState(config.entityId)

  return (
    <div style={{
      padding: 18, borderRadius: 14,
      background: cardBg, border: `1px solid ${border}`,
    }}>
      <div style={{
        fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6,
      }}>
        {config.label}
      </div>
      <div style={{
        fontSize: 28, fontWeight: 800, color: 'var(--text-primary)',
        fontVariantNumeric: 'tabular-nums',
      }}>
        {value ?? '—'}
      </div>
      <div style={{
        fontSize: 10, color: 'var(--text-muted)',
        fontFamily: 'monospace', marginTop: 4,
      }}>
        {config.entityId}
      </div>
    </div>
  )
}
