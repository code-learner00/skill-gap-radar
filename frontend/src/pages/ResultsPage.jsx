import { useEffect, useState } from 'react'
import { useParams, Link }     from 'react-router-dom'
import Navbar          from '../components/Navbar'
import ReadinessCard   from '../components/ReadinessCard'
import PrioritySkills  from '../components/PrioritySkills'
import SkillTable      from '../components/SkillTable'
import MissingSkills   from '../components/MissingSkills'
import RadarChart      from '../charts/RadarChart'
import GapBarChart     from '../charts/GapBarChart'
import useAxios        from '../hooks/useAxios'

// Mongoose Map serializes to { key: value } plain objects when toJSON is called,
// but over the wire we might receive a nested Map-like structure.
// This helper safely converts either format to a plain JS object.
function mapToObj(val) {
  if (!val) return {}
  if (val instanceof Map) return Object.fromEntries(val)
  if (typeof val === 'object') return val
  return {}
}

export default function ResultsPage() {
  const { id }   = useParams()
  const axios    = useAxios()

  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    axios
      .get(`/analysis/${id}`)
      .then((res) => setData(res.data.analysis))
      .catch((err) =>
        setError(err.response?.data?.message || 'Failed to load results')
      )
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading-page" style={{ minHeight: '60vh' }}>
          <div>
            <div className="spinner" />
            <p style={{ textAlign: 'center', color: 'var(--gray4)' }}>Loading results...</p>
          </div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="page-container">
          <div className="error-alert" style={{ marginTop: '40px' }}>
            {error}
          </div>
          <Link to="/analyze">← Run a new analysis</Link>
        </div>
      </>
    )
  }

  if (!data) return null

  const demandMap     = mapToObj(data.skillDemandMap)
  const confidenceMap = mapToObj(data.resumeConfidenceMap)
  const gapScores     = mapToObj(data.gapScores)

  const demandCount   = Object.keys(demandMap).length
  const resumeCount   = Object.keys(confidenceMap).length

  return (
    <div>
      <Navbar />
      <div className="page-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
          <h1 style={{ marginBottom: 0 }}>📊 Skill Gap Analysis Results</h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/analyze">
              <button className="btn-secondary">New Analysis</button>
            </Link>
            <Link to="/dashboard">
              <button className="btn-secondary">Dashboard</button>
            </Link>
          </div>
        </div>

        {/* Meta info */}
        <div style={{
          display: 'flex', gap: '16px', flexWrap: 'wrap',
          marginBottom: '24px', fontSize: '0.85rem', color: 'var(--gray4)',
        }}>
          <span>📋 {data.resumeId?.filename || 'Resume'}</span>
          <span>🔍 {demandCount} skills found in JDs</span>
          <span>✅ {resumeCount} skills detected in resume</span>
          <span>🗓️ {new Date(data.createdAt).toLocaleDateString()}</span>
          {data.cached && <span style={{ color: 'var(--green)' }}>⚡ Cached result</span>}
        </div>

        {/* Readiness Score */}
        <ReadinessCard score={data.readinessScore} />

        {/* Priority Skills */}
        <PrioritySkills
          skills={data.prioritySkills}
          demandMap={demandMap}
          confidenceMap={confidenceMap}
        />

        {/* Charts */}
        <div className="charts-row">
          <div className="chart-card">
            <h2>🎯 Skill Radar — Demand vs Confidence</h2>
            <RadarChart demandMap={demandMap} confidenceMap={confidenceMap} />
          </div>
          <div className="chart-card">
            <h2>📉 Top Skill Gaps</h2>
            <GapBarChart gapScores={gapScores} />
            <p style={{ fontSize: '0.75rem', color: 'var(--gray3)', marginTop: '6px', textAlign: 'center' }}>
              Red = gap (need to improve) · Green = exceeding demand
            </p>
          </div>
        </div>

        {/* Missing high-demand skills */}
        <MissingSkills skills={data.missingHighDemand} />

        {/* Full table */}
        <SkillTable
          demandMap={demandMap}
          confidenceMap={confidenceMap}
          gapScores={gapScores}
        />

        {/* Over-saturated */}
        {data.overSaturated?.length > 0 && (
          <div className="card" style={{ borderLeft: '4px solid var(--gray3)' }}>
            <h2>💤 Over-Saturated Skills (low market demand)</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--gray4)', marginBottom: '12px' }}>
              You have high confidence in these, but the target JDs rarely require them.
            </p>
            <div className="missing-chips">
              {data.overSaturated.map((s) => (
                <span
                  key={s}
                  className="missing-chip"
                  style={{ borderColor: 'var(--gray2)', color: 'var(--gray4)' }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}