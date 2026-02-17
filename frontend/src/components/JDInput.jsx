export default function JDInput({ jdTexts, onChange }) {
  const addJD = () => {
    if (jdTexts.length >= 20) return
    onChange([...jdTexts, ''])
  }

  const removeJD = (index) => {
    onChange(jdTexts.filter((_, i) => i !== index))
  }

  const updateJD = (index, value) => {
    const updated = [...jdTexts]
    updated[index] = value
    onChange(updated)
  }

  return (
    <div className="jd-input">
      {jdTexts.map((text, i) => (
        <div key={i} className="jd-item">
          <div className="jd-header">
            <span>Job Description {i + 1}</span>
            {jdTexts.length > 1 && (
              <button
                type="button"
                className="remove-btn"
                onClick={() => removeJD(i)}
                title="Remove this JD"
              >
                ×
              </button>
            )}
          </div>
          <textarea
            rows={5}
            placeholder={`Paste job description ${i + 1} here — include required skills, responsibilities, and qualifications...`}
            value={text}
            onChange={(e) => updateJD(i, e.target.value)}
          />
        </div>
      ))}

      {jdTexts.length < 20 && (
        <button type="button" className="add-jd-btn" onClick={addJD}>
          + Add Another Job Description ({jdTexts.length} / 20)
        </button>
      )}
    </div>
  )
}