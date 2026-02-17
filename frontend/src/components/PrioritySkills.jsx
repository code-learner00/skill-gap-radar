export default function PrioritySkills({ skills, demandMap, confidenceMap }) {
  if (!skills || skills.length === 0) return null

  return (
    <div className="priority-section">
      <h2>🎯 Top Priority Skills to Learn</h2>
      <div className="priority-grid">
        {skills.map((skill, i) => {
          const demand     = Math.round((demandMap[skill]     || 0) * 100)
          const confidence = Math.round((confidenceMap[skill] || 0) * 100)
          const priority   = Math.round(demand * (1 - confidence / 100))

          return (
            <div key={skill} className="priority-card">
              <div className="priority-rank">#{i + 1}</div>
              <div className="priority-skill">{skill}</div>
              <div className="priority-stats">
                <span>Demand: {demand}%</span>
                <span>You: {confidence}%</span>
              </div>
              <div className="priority-score">
                Priority score: {priority}
              </div>
            </div>
          )
        })}
      </div>

      <p style={{ marginTop: '16px', fontSize: '0.82rem', color: 'var(--gray4)' }}>
        Priority = Market Demand × (1 − Your Confidence). Higher = more impactful to learn.
      </p>
    </div>
  )
}