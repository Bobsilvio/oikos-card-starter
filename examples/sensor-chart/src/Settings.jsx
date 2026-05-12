import {
  useCardConfig, EntityField,
  Section, Field, TextField, Pills, ColorCircles, ACCENT_COLORS,
} from '@oikos/sdk'

const DEFAULT = {
  entityId:    '',
  label:       '',
  hours:       24,
  accentColor: '#f59e0b',
}

const HOUR_OPTIONS = [
  { value: 6,   label: '6h'  },
  { value: 12,  label: '12h' },
  { value: 24,  label: '24h' },
  { value: 48,  label: '48h' },
  { value: 168, label: '7d'  },
]

export default function SensorChartSettings({ cardId }) {
  const [config, setConfig] = useCardConfig(cardId, DEFAULT)
  const set = (k, v) => setConfig(p => ({ ...p, [k]: v }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Section title="Source">
        <Field label="Sensor" hint="Any numeric sensor.* — needs HA Recorder enabled">
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

      <Section title="Chart">
        <Field label="History range">
          <Pills
            options={HOUR_OPTIONS}
            value={config.hours}
            onChange={v => set('hours', v)}
          />
        </Field>
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
