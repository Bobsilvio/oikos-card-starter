import {
  useCardConfig, EntityField,
  Section, Field, TextField,
} from '@oikos/sdk'

const DEFAULT = { entityId: '', label: '' }

export default function LightToggleSettings({ cardId }) {
  const [config, setConfig] = useCardConfig(cardId, DEFAULT)
  const set = (k, v) => setConfig(p => ({ ...p, [k]: v }))

  return (
    <Section title="Configuration">
      <Field label="Entity" hint="light.* or switch.* or input_boolean.*">
        <EntityField
          field="entityId"
          config={config}
          setConfig={setConfig}
          filterDomain="light"
        />
      </Field>
      <Field label="Label" hint="Leave empty to use the entity's friendly_name">
        <TextField
          value={config.label}
          onChange={v => set('label', v)}
          placeholder="e.g. Living room light"
        />
      </Field>
    </Section>
  )
}
