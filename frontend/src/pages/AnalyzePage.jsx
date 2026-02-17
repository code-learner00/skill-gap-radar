import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar         from '../components/Navbar'
import ResumeUploader from '../components/ResumeUploader'
import JDInput        from '../components/JDInput'
import useAxios       from '../hooks/useAxios'

export default function AnalyzePage() {
  const axios    = useAxios()
  const navigate = useNavigate()

  const [resumeId, setResumeId] = useState(null)
  const [jdTexts,  setJdTexts]  = useState([''])
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const handleAnalyze = async () => {
    setError('')

    if (!resumeId) {
      return setError('Please upload or paste your resume first.')
    }

    const validJDs = jdTexts.filter((t) => t.trim().length >= 10)
    if (validJDs.length === 0) {
      return setError('Paste at least one job description (10+ characters).')
    }

    setLoading(true)
    try {
      const res = await axios.post('/analysis', {
        resumeId,
        jdTexts: validJDs,
      })
      navigate(`/results/${res.data.analysis._id}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Analysis failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Navbar />
      <div className="page-container">
        <h1>🔍 Analyze Your Skill Gap</h1>

        {error && <div className="error-alert">{error}</div>}

        {/* Step 1 */}
        <div className="card">
          <h2>
            <span style={{
              background: 'var(--accent)', color: 'white',
              width: '24px', height: '24px', borderRadius: '50%',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.8rem', fontWeight: 700,
            }}>1</span>
            Upload Your Resume
          </h2>
          <ResumeUploader onResumeId={setResumeId} />
        </div>

        {/* Step 2 */}
        <div className="card">
          <h2>
            <span style={{
              background: resumeId ? 'var(--accent)' : 'var(--gray3)', color: 'white',
              width: '24px', height: '24px', borderRadius: '50%',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.8rem', fontWeight: 700,
            }}>2</span>
            Paste Job Descriptions (1–20)
          </h2>
          <p style={{ color: 'var(--gray4)', fontSize: '0.88rem', marginBottom: '16px' }}>
            Paste the full text of each job description. More JDs = more accurate demand weighting.
          </p>
          <JDInput jdTexts={jdTexts} onChange={setJdTexts} />
        </div>

        {/* Analyze Button */}
        <div className="card" style={{ textAlign: 'center', padding: '28px' }}>
          <h2 style={{ justifyContent: 'center', marginBottom: '6px' }}>
            <span style={{
              background: (resumeId && jdTexts.some(t => t.trim().length >= 10))
                ? 'var(--accent)' : 'var(--gray3)',
              color: 'white',
              width: '24px', height: '24px', borderRadius: '50%',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.8rem', fontWeight: 700,
            }}>3</span>
            Run Analysis
          </h2>
          <p style={{ color: 'var(--gray4)', fontSize: '0.88rem', marginBottom: '20px' }}>
            The system will score each skill deterministically using market demand and your resume confidence.
          </p>
          <button
            className="btn-primary"
            onClick={handleAnalyze}
            disabled={loading || !resumeId}
            style={{ width: 'auto', padding: '14px 40px', fontSize: '1rem' }}
          >
            {loading ? '⏳ Analyzing...' : '🚀 Run Analysis'}
          </button>

          {loading && (
            <p style={{ color: 'var(--gray4)', fontSize: '0.85rem', marginTop: '12px' }}>
              Processing skills across all job descriptions...
            </p>
          )}
        </div>
      </div>
    </div>
  )
}