/**
 * Sensor Chart — current sensor value + 24h history sparkline.
 *
 * Patterns demonstrated:
 *   - fetchHistory() to load HA recorder history
 *   - useEffect to trigger history fetch when entityId changes
 *   - recharts LineChart + ResponsiveContainer (no bundle overhead)
 *   - Loading skeleton while data is being fetched
 *   - Configurable time range (hours) from settings
 *   - Tap on card → openMoreInfo() native HA popup
 */
import { useState, useEffect } from 'react'
import { useCardConfig, useDashboard } from '@oikos/sdk'
import {
  ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts'
import { TrendingUp, AlertCircle } from 'lucide-react'

const DEFAULT = {
  entityId:    '',
  label:       '',
  hours:       24,
  accentColor: '#f59e0b',
}

// Format a timestamp for the X axis (HH:MM or day/MM if > 24h)
function fmtTime(ts, hours) {
  const d = new Date(ts)
  if (hours <= 24) {
    return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0')
  }
  return `${d.getDate()}/${d.getMonth() + 1}`
}

export default function SensorChart({ cardId = 'sensor-chart' }) {
  const { dark, getState, getAttr, haStates, fetchHistory, openMoreInfo } = useDashboard()
  const [config] = useCardConfig(cardId, DEFAULT)
  const [chartData, setChartData]   = useState([])
  const [loading, setLoading]       = useState(false)

  const cardBg = dark ? 'rgba(255,255,255,.04)' : '#ffffff'
  const border = dark ? 'rgba(255,255,255,.08)' : '#e2e8f0'
  const gridColor = dark ? 'rgba(255,255,255,.06)' : '#f1f5f9'

  const accent = config.accentColor || '#f59e0b'

  // Fetch history whenever entity or time range changes
  useEffect(() => {
    if (!config.entityId) { setChartData([]); return }

    setLoading(true)
    const hours = Math.max(1, Number(config.hours) || 24)
    const start = new Date(Date.now() - hours * 3600_000)
    const end   = new Date()

    fetchHistory([config.entityId], start, end)
      .then(history => {
        const raw = history[config.entityId] ?? []
        const data = raw
          .map(p => ({ t: new Date(p.lu).getTime(), v: parseFloat(p.s) }))
          .filter(p => Number.isFinite(p.v))
        setChartData(data)
      })
      .catch(err => console.error('[SensorChart] fetchHistory error:', err))
      .finally(() => setLoading(false))
  }, [config.entityId, config.hours])

  // ── Empty state ────────────────────────────────────────────────────────
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
  const label    = config.label || friendly || config.entityId
  const hours    = Number(config.hours) || 24

  // ── Main card ──────────────────────────────────────────────────────────
  return (
    <div
      onClick={() => openMoreInfo(config.entityId)}
      style={{
        padding: '14px 16px 10px', borderRadius: 14,
        background: cardBg, border: `1px solid ${border}`,
        cursor: 'pointer', transition: 'border-color .2s',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = `${accent}60`}
      onMouseLeave={e => e.currentTarget.style.borderColor = border}
    >
      {/* Header row: label + current value */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <div style={{
              width: 24, height: 24, borderRadius: 7,
              background: `${accent}20`, border: `1px solid ${accent}40`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <TrendingUp size={12} style={{ color: accent }}/>
            </div>
            <span style={{
              fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
              textTransform: 'uppercase', letterSpacing: '.05em',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              maxWidth: 140,
            }}>
              {label}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{
              fontSize: 28, fontWeight: 800, color: 'var(--text-primary)',
              fontVariantNumeric: 'tabular-nums', letterSpacing: '-1px', lineHeight: 1,
            }}>
              {state ?? '—'}
            </span>
            {unit && (
              <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
                {unit}
              </span>
            )}
          </div>
        </div>

        {/* Min / max from chart data */}
        {chartData.length > 1 && (
          <div style={{ textAlign: 'right', fontSize: 10, color: 'var(--text-muted)' }}>
            <div>↑ {Math.max(...chartData.map(d => d.v)).toFixed(1)}{unit}</div>
            <div style={{ marginTop: 2 }}>↓ {Math.min(...chartData.map(d => d.v)).toFixed(1)}{unit}</div>
          </div>
        )}
      </div>

      {/* Chart area */}
      <div style={{ height: 64, marginLeft: -4, marginRight: -4 }}>
        {loading ? (
          // Loading skeleton
          <div style={{
            height: '100%', borderRadius: 6,
            background: dark ? 'rgba(255,255,255,.04)' : '#f1f5f9',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}/>
        ) : chartData.length > 1 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 2, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`grad-${cardId}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={accent} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={accent} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 4"
                stroke={gridColor}
                vertical={false}
              />
              <XAxis
                dataKey="t"
                type="number"
                domain={['dataMin', 'dataMax']}
                tickFormatter={ts => fmtTime(ts, hours)}
                tick={{ fontSize: 9, fill: 'var(--text-muted)' }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis hide domain={['auto', 'auto']}/>
              <Tooltip
                contentStyle={{
                  background: dark ? '#1a1f2e' : '#fff',
                  border: `1px solid ${dark ? 'rgba(255,255,255,.1)' : '#e2e8f0'}`,
                  borderRadius: 8, fontSize: 11,
                }}
                labelFormatter={ts => fmtTime(ts, hours)}
                formatter={v => [`${v.toFixed(2)} ${unit ?? ''}`, label]}
              />
              <Area
                type="monotone"
                dataKey="v"
                stroke={accent}
                strokeWidth={2}
                fill={`url(#grad-${cardId})`}
                dot={false}
                activeDot={{ r: 3, fill: accent }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div style={{
            height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, color: 'var(--text-muted)', fontStyle: 'italic',
          }}>
            No history available (check HA Recorder)
          </div>
        )}
      </div>

      {/* Footer: time range label */}
      <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 4, textAlign: 'right' }}>
        {hours}h history
      </div>
    </div>
  )
}
