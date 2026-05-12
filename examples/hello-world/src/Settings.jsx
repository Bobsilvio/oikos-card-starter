import { useCardConfig, Section, Field, TextField } from '@oikos/sdk'

export default function HelloSettings({ cardId }) {
  const [config, setConfig] = useCardConfig(cardId, { name: 'world' })
  return (
    <Section title="Configuration">
      <Field label="Name">
        <TextField
          value={config.name}
          onChange={v => setConfig(p => ({ ...p, name: v }))}
          placeholder="world"
        />
      </Field>
    </Section>
  )
}
