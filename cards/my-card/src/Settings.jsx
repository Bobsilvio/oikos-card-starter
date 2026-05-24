/**
 * MyCard Settings — settings panel.
 *
 * Add the fields the user can configure here. Primitives
 * (Section, Field, EntityField, Toggle, Slider, ColorCircles, ...)
 * are imported from `@oikos/sdk` and match the dashboard style.
 *
 * useCardConfig automatically syncs config across all user devices
 * via the add-on server. Never write to localStorage directly.
 *
 * i18n: all user-visible strings must use useT(). Never hardcode text.
 */
import {
  useCardConfig, EntityField,
  Section, Field,
  registerCardTranslations, useT,
} from '@oikos/sdk'
import it from './i18n/it.json'
import en from './i18n/en.json'

registerCardTranslations('card-my-card', { it, en })

const DEFAULT_CONFIG = {
  entityId: '',
}

export default function MySettings({ cardId }) {
  const { t } = useT('card-my-card')
  const [config, setConfig] = useCardConfig(cardId, DEFAULT_CONFIG)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      <Section title={t('settings.general')}>
        <Field label={t('settings.entity')} hint={t('settings.entityHint')}>
          <EntityField
            field="entityId"
            config={config}
            setConfig={setConfig}
            filterDomain="sensor"
          />
        </Field>
      </Section>

    </div>
  )
}
