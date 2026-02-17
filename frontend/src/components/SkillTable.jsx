import { useState } from 'react'

export default function SkillTable({ demandMap, confidenceMap, gapScores }) {
  const [sortBy, setSortBy] = useState('gap')

  const rows = Object.entries(demandMap).map(([skill, demand]) => ({
    skill,
    demand:     Math.round(demand * 100),
    confidence: Math.round((confidenceMap[skill] || 0) * 100),
    gap:        Math.round((gapScores[skill]     || 0) * 100),
  }))

  const sorted = [...rows].sort((a, b) => {
    if (sortBy === 'gap')        return b.gap        - a.gap
    if (sortBy === 'demand')     return b.demand     - a.demand
    if (sortBy === 'confidence') return b.confidence - a.confidence
    return 0
  })

  const getStatus = (gap) => {
    if (gap > 20)  return { label: 'Gap',    cls: 'badge-danger'  }
    if (gap < -10) return { label: 'Strong', cls: 'badge-success' }
    return              { label: 'OK',     cls: 'badge-neutral' }
  }

  return (
    <div className="skill-table-wrapper">
      <div className="table-header">
        <h2>Full Skill Breakdown</h2>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="gap">Sort by Gap ↓</option>
          <option value="demand">Sort by Demand ↓</option>
          <option value="confidence">Sort by Confidence ↓</option>
        </select>
      </div>

      <table>
        <thead>
          <tr>
            <th>Skill</th>
            <th>Market Demand</th>
            <th>Your Confidence</th>
            <th>Gap Score</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => {
            const { label, cls } = getStatus(row.gap)
            return (
              <tr key={row.skill}>
                <td>
                  <strong style={{ textTransform: 'capitalize' }}>
                    {row.skill}
                  </strong>
                </td>
                <td>
                  <div className="bar-bg">
                    <div
                      className="bar-fill demand"
                      style={{ width: `${row.demand}%` }}
                    />
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--gray4)' }}>
                    {row.demand}%
                  </span>
                </td>
                <td>
                  <div className="bar-bg">
                    <div
                      className="bar-fill confidence"
                      style={{ width: `${row.confidence}%` }}
                    />
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--gray4)' }}>
                    {row.confidence}%
                  </span>
                </td>
                <td>
                  <span
                    style={{
                      fontWeight: 700,
                      color: row.gap > 0 ? 'var(--red)' : 'var(--green)',
                    }}
                  >
                    {row.gap > 0 ? '+' : ''}{row.gap}%
                  </span>
                </td>
                <td>
                  <span className={`badge ${cls}`}>{label}</span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {sorted.length === 0 && (
        <p style={{ textAlign: 'center', color: 'var(--gray3)', padding: '20px' }}>
          No skills detected. Try adding more detailed job descriptions.
        </p>
      )}
    </div>
  )
}