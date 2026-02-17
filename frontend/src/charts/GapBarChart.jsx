import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts'

export default function GapBarChart({ gapScores }) {
  const data = Object.entries(gapScores)
    .sort((a, b) => b[1] - a[1])   // highest gap first
    .slice(0, 12)
    .map(([skill, gap]) => ({
      skill: skill.length > 14 ? skill.slice(0, 12) + '…' : skill,
      gap:   parseFloat((gap * 100).toFixed(1)),
    }))

  if (data.length === 0) {
    return (
      <p style={{ color: 'var(--gray3)', textAlign: 'center', padding: '40px 0' }}>
        No gap data to display.
      </p>
    )
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    const val = payload[0].value
    return (
      <div style={{
        background: 'white', border: '1px solid #E2E8F0',
        padding: '8px 12px', borderRadius: '6px', fontSize: '0.85rem',
      }}>
        <p style={{ fontWeight: 600, textTransform: 'capitalize' }}>{label}</p>
        <p style={{ color: val > 0 ? '#DC2626' : '#16A34A' }}>
          Gap: {val > 0 ? '+' : ''}{val}%
        </p>
        <p style={{ color: 'var(--gray4)', fontSize: '0.78rem' }}>
          {val > 0 ? '↑ Skill gap — needs attention' : '↓ You exceed market demand'}
        </p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{ top: 10, right: 16, left: 10, bottom: 70 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
        <XAxis
          dataKey="skill"
          angle={-40}
          textAnchor="end"
          tick={{ fontSize: 11, fill: '#64748B', textTransform: 'capitalize' }}
          interval={0}
        />
        <YAxis
          domain={[-100, 100]}
          tickFormatter={(v) => `${v}%`}
          tick={{ fontSize: 11, fill: '#64748B' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={0} stroke="#94A3B8" strokeWidth={1.5} />
        <Bar dataKey="gap" name="Gap Score" radius={[4, 4, 0, 0]}>
          {data.map((entry, i) => (
            <Cell
              key={i}
              fill={entry.gap > 0 ? '#DC2626' : '#16A34A'}
              fillOpacity={0.85}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}