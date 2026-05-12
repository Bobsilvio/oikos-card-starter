/**
 * MyCard Settings — settings panel.
 *
 * Add the fields the user can configure here. Primitives
 * (Section, Field, EntityField, Toggle, Slider, ColorCircles, ...)
 * are imported from `@oikos/sdk` and match the dashboard style.
 *
 * useCardConfig automatically syncs config across all user devices
 * via the add-on server. Never write to localStorage directly — data
 * would not propagate to other devices.
 */
import {
  useCardConfig, EntityField,
  Section, Field, TextField,
} from '@oikos/sdk'

const DEFAULT_CONFIG = {
  entityId: '',
  label:    'My Card',
}

export default function MySettings({ cardId }) {
  const [config, setConfig] = useCardConfig(cardId, DEFAULT_CONFIG)
  const set = (k, v) => setConfig(p => ({ ...p, [k]: v }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      <Section title="General">
        <Field label="Label">
          <TextField
            value={config.label}
            onChange={v => set('label', v)}
            placeholder="My Card"
          />
        </Field>
        <Field label="Entity" hint="Any sensor.* / binary_sensor.* / climate.* etc.">
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
