import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import useAuth from '../hooks/useAuth'
import useAxios from '../hooks/useAxios'

export default function DashboardPage() {
  const { user }   = useAuth()
  const axios      = useAxios()
  const navigate   = useNavigate()

  const [analyses, setAnalyses] = useState([])
  const [resumes,  setResumes]  = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    Promise.all([
      axios.get('/analysis?limit=5'),
      axios.get('/resume?limit=5'),
    ])
      .then(([aRes, rRes]) => {
        setAnalyses(aRes.data.analyses || [])
        setResumes(rRes.data.resumes   || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    })

  const scoreColor = (s) =>
    s >= 70 ? 'var(--green)' : s >= 40 ? 'var(--orange)' : 'var(--red)'

  return (
    <div>
      <Navbar />
      <div className="page-container">
        <h1>
          Welcome back, {user?.displayName || user?.email?.split('@')[0]} 👋
        </h1>

        {/* Stats row */}
        <div className="dashboard-grid">
          <div className="stat-card">
            <div className="stat-number">{resumes.length}</div>
            <div className="stat-label">Resumes Uploaded</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{analyses.length}</div>
            <div className="stat-label">Analyses Run</div>
          </div>
          {analyses[0] && (
            <div className="stat-card">
              <div
                className="stat-number"
                style={{ color: scoreColor(analyses[0].readinessScore) }}
              >
                {analyses[0].readinessScore}%
              </div>
              <div className="stat-label">Latest Readiness Score</div>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="card" style={{ textAlign: 'center', padding: '36px' }}>
          <h2 style={{ justifyContent: 'center', marginBottom: '8px' }}>
            🚀 Ready to analyze your skills?
          </h2>
          <p style={{ color: 'var(--gray4)', marginBottom: '20px', fontSize: '0.95rem' }}>
            Upload your resume, paste job descriptions, and get your gap analysis in seconds.
          </p>
          <Link to="/analyze">
            <button className="btn-primary" style={{ width: 'auto', padding: '12px 32px' }}>
              Start New Analysis
            </button>
          </Link>
        </div>

        {/* Recent analyses */}
        {!loading && analyses.length > 0 && (
          <div className="card">
            <h2>📊 Recent Analyses</h2>
            <table className="history-table">
              <thead>
                <tr>
                  <th>Resume</th>
                  <th>Readiness</th>
                  <th>Priority Skills</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {analyses.map((a) => (
                  <tr key={a._id}>
                    <td>{a.resumeId?.filename || 'Unknown'}</td>
                    <td>
                      <span style={{ fontWeight: 700, color: scoreColor(a.readinessScore) }}>
                        {a.readinessScore}%
                      </span>
                    </td>
                    <td>
                      {(a.prioritySkills || []).slice(0, 3).join(', ') || '—'}
                    </td>
                    <td style={{ color: 'var(--gray4)', fontSize: '0.85rem' }}>
                      {formatDate(a.createdAt)}
                    </td>
                    <td>
                      <button
                        className="btn-secondary"
                        style={{ padding: '4px 14px', fontSize: '0.82rem' }}
                        onClick={() => navigate(`/results/${a._id}`)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && analyses.length === 0 && (
          <div className="card" style={{ textAlign: 'center', color: 'var(--gray4)', padding: '32px' }}>
            <p>No analyses yet. Run your first one above!</p>
          </div>
        )}
      </div>
    </div>
  )
}