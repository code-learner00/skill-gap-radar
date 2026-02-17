import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import useAuth from '../hooks/useAuth'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function OAuthCallbackPage() {
  const [params]  = useSearchParams()
  const { login } = useAuth()
  const navigate  = useNavigate()

  useEffect(() => {
    const token = params.get('token')
    const error = params.get('error')

    if (error || !token) {
      navigate('/login?error=oauth_failed')
      return
    }

    // Fetch the user profile with the just-issued access token
    axios
      .get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        login(token, res.data.user)
        navigate('/dashboard', { replace: true })
      })
      .catch(() => {
        navigate('/login?error=oauth_failed')
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="loading-page">
      <div>
        <div className="spinner" />
        <p style={{ textAlign: 'center', color: 'var(--gray4)' }}>
          Completing sign-in...
        </p>
      </div>
    </div>
  )
}