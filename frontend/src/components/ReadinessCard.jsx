export default function ReadinessCard({ score }) {
  const color =
    score >= 70 ? '#16A34A' :
    score >= 40 ? '#EA580C' :
    '#DC2626'

  const label =
    score >= 70 ? '🟢 Strong Match' :
    score >= 40 ? '🟡 Developing' :
    '🔴 Needs Work'

  return (
    <div className="readiness-card">
      <h2>Interview Readiness Score</h2>

      <div className="score-circle" style={{ borderColor: color }}>
        <span className="score-value" style={{ color }}>{score}%</span>
      </div>

      <div style={{ margin: '12px 0' }}>
        <span className="score-label" style={{ background: color }}>
          {label}
        </span>
      </div>

      <p className="score-formula">
        Score = Σ(Confidence × Demand) / Σ(Demand) × 100
      </p>

      <p style={{ fontSize: '0.82rem', color: 'var(--gray4)', marginTop: '8px' }}>
        {score >= 70
          ? 'Your skills closely match what these roles require.'
          : score >= 40
          ? 'Good foundation — focus on the priority skills below.'
          : 'Significant skill gaps identified — review the priority skills list.'}
      </p>
    </div>
  )
}