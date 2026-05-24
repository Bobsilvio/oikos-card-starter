/**
 * My Card — starter template.
 *
 * Edit this file to build your card.
 * See `examples/` for more complex patterns (sensor chart, controls, popups).
 *
 * ─────────────────────────────────────────────────────────────────────────
 * RULES:
 * 1. i18n MANDATORY — every user-visible string must come from useT().
 *    Add keys to src/i18n/it.json AND src/i18n/en.json.
 *    Never hardcode text in any language.
 *
 * 2. useStyles() — never hardcode colors, radii or font sizes.
 *    Always use s.card / s.label / s.value / s.tokens.*
 *
 * 3. useCardConfig — never write to localStorage directly.
 *    Data syncs across all user devices automatically.
 * ─────────────────────────────────────────────────────────────────────────
 */
import { useCardConfig, useDashboard, useStyles, registerCardTranslations, useT } from '@oikos/sdk'
import { Sparkles } from 'lucide-react'
import it from './i18n/it.json'
import en from './i18n/en.json'

registerCardTranslations('card-my-card', { it, en })

const DEFAULT_CONFIG = {
  entityId: '',
}

export default function MyCard({ cardId = 'my-card' }) {
  const s = useStyles()
  const { t } = useT('card-my-card')
  const { getState } = useDashboard()
  const [config] = useCardConfig(cardId, DEFAULT_CONFIG)

  // Empty state — entity not configured yet
  if (!config.entityId) {
    return (
      <div style={s.card}>
        <div style={s.row}>
          <Sparkles size={14} color={s.tokens.color.amber}/>
          <span style={s.label}>{t('configure')}</span>
        </div>
      </div>
    )
  }

  const value = getState(config.entityId)

  return (
    <div style={s.card}>
      <div style={s.row}>
        <Sparkles size={14} color={s.tokens.color.amber}/>
        <span style={s.label}>{t('label')}</span>
      </div>
      <div style={{ ...s.row, alignItems: 'baseline', gap: s.tokens.space.xs }}>
        <span style={s.value}>{value ?? '—'}</span>
      </div>
      <div style={s.hint}>{config.entityId}</div>
    </div>
  )
}
