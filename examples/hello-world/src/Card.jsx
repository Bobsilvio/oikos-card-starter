/**
 * Hello World — la card più semplice possibile.
 * Mostra "Ciao, {nome}!" senza interagire con HA.
 */
import { useCardConfig, useDashboard } from '@oikos/sdk'
import { Sparkles } from 'lucide-react'

const DEFAULT = { name: 'mondo' }

export default function HelloWorld({ cardId = 'hello-world' }) {
  const { dark } = useDashboard()
  const [config] = useCardConfig(cardId, DEFAULT)

  return (
    <div style={{
      padding: 24, borderRadius: 16,
      background: dark
        ? 'linear-gradient(135deg, rgba(245,158,11,.15), rgba(239,68,68,.1))'
        : 'linear-gradient(135deg, #fef3c7, #fee2e2)',
      border: `1px solid ${dark ? 'rgba(245,158,11,.3)' : '#fcd34d'}`,
      textAlign: 'center',
    }}>
      <Sparkles size={32} style={{ color: '#f59e0b', marginBottom: 8 }}/>
      <div style={{
        fontSize: 22, fontWeight: 800,
        color: dark ? '#fbbf24' : '#92400e',
        letterSpacing: '-.5px',
      }}>
        Hello, {config.name || 'world'}!
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
        Edit the name from settings
      </div>
    </div>
  )
}
