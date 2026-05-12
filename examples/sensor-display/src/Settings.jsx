import {
  useCardConfig, EntityField,
  Section, Field, TextField, ColorCircles, ACCENT_COLORS,
} from '@oikos/sdk'

const DEFAULT = {
  entityId:    '',
  label:       '',
  accentColor: '#3b82f6',
}

export default function SensorDisplaySettings({ cardId }) {
  const [config, setConfig] = useCardConfig(cardId, DEFAULT)
  const set = (k, v) => setConfig(p => ({ ...p, [k]: v }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Section title="Source">
        <Field label="Sensor" hint="Any sensor.* / binary_sensor.* / number.*">
          <EntityField
            field="entityId"
            config={config}
            setConfig={setConfig}
            filterDomain="sensor"
          />
        </Field>
        <Field label="Custom label" hint="Leave empty to use the entity's friendly_name">
          <TextField
            value={config.label}
            onChange={v => set('label', v)}
            placeholder="e.g. Living room temperature"
          />
        </Field>
      </Section>

      <Section title="Appearance">
        <Field label="Accent color">
          <ColorCircles
            value={config.accentColor}
            onChange={v => set('accentColor', v)}
            colors={ACCENT_COLORS}
          />
        </Field>
      </Section>
    </div>
  )
}
