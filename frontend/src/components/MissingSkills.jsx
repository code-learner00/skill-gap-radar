export default function MissingSkills({ skills }) {
  if (!skills || skills.length === 0) return null

  return (
    <div className="missing-skills">
      <h2>⚠️ High-Demand Skills Missing from Your Resume</h2>
      <p style={{ fontSize: '0.85rem', color: 'var(--orange)', marginBottom: '12px' }}>
        These skills appear in &gt;60% of the job descriptions but are not present in your resume at all.
      </p>
      <div className="missing-chips">
        {skills.map((skill) => (
          <span key={skill} className="missing-chip">
            {skill}
          </span>
        ))}
      </div>
    </div>
  )
}