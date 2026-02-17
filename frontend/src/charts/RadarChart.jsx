import {
  Radar,
  RadarChart as RC,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts'

export default function RadarChart({ demandMap, confidenceMap }) {
  // Take top 8 skills by demand for a readable chart
  const data = Object.entries(demandMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([skill, demand]) => ({
      skill:      skill.charAt(0).toUpperCase() + skill.slice(1),
      Demand:     Math.round(demand * 100),
      Confidence: Math.round((confidenceMap[skill] || 0) * 100),
    }))

  if (data.length === 0) {
    return (
      <p style={{ color: 'var(--gray3)', textAlign: 'center', padding: '40px 0' }}>
        No skill data to display.
      </p>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={360}>
      <RC data={data} outerRadius="75%">
        <PolarGrid stroke="#E2E8F0" />
        <PolarAngleAxis
          dataKey="skill"
          tick={{ fontSize: 11, fill: '#64748B' }}
        />
        <PolarRadiusAxis
          angle={30}
          domain={[0, 100]}
          tick={{ fontSize: 10, fill: '#94A3B8' }}
          tickFormatter={(v) => `${v}%`}
        />
        <Radar
          name="Market Demand"
          dataKey="Demand"
          stroke="#2563EB"
          fill="#2563EB"
          fillOpacity={0.25}
        />
        <Radar
          name="Your Confidence"
          dataKey="Confidence"
          stroke="#16A34A"
          fill="#16A34A"
          fillOpacity={0.25}
        />
        <Legend iconType="circle" wrapperStyle={{ fontSize: '0.85rem' }} />
        <Tooltip formatter={(value) => `${value}%`} />
      </RC>
    </ResponsiveContainer>
  )
}