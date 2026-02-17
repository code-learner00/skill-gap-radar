// context/AuthContext.jsx
import { createContext, useState, useEffect, useCallback, useRef } from 'react'
import axios from 'axios'

export const AuthContext = createContext(null)

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export function AuthProvider({ children }) {
  const [user,        setUser]        = useState(null)
  const [accessToken, setAccessToken] = useState(null)
  const [loading,     setLoading]     = useState(true)

  // Keep a ref in sync so callbacks always see the latest token
  // without needing to be recreated
  const accessTokenRef = useRef(accessToken)
  accessTokenRef.current = accessToken

  // ── Restore session on mount via HTTP-only refresh cookie ───────────────
  useEffect(() => {
    ;(async () => {
      try {
        const res = await axios.post(
          `${API}/auth/refresh`,
          {},
          { withCredentials: true }
        )
        const token = res.data.accessToken
        setAccessToken(token)
        accessTokenRef.current = token

        const me = await axios.get(`${API}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setUser(me.data.user)
      } catch {
        // No valid session — user stays null
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  // ── login: called after register/login/oauth ─────────────────────────
  const login = useCallback((token, userData) => {
    accessTokenRef.current = token
    setAccessToken(token)
    setUser(userData)
  }, [])

  // ── logout: clear everything ──────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      const token = accessTokenRef.current
      if (token) {
        await axios.post(
          `${API}/auth/logout`,
          {},
          {
            headers:         { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        )
      }
    } catch {
      // ignore — clear client state regardless
    }
    accessTokenRef.current = null
    setAccessToken(null)
    setUser(null)
  }, [])

  // ── refreshToken: called by useAxios interceptor ──────────────────────
  // IMPORTANT: this must update BOTH the ref and state, and return the token
  // synchronously from the promise so the interceptor can retry immediately.
  const refreshToken = useCallback(async () => {
    const res = await axios.post(
      `${API}/auth/refresh`,
      {},
      { withCredentials: true }
    )
    const newToken = res.data.accessToken
    // Update ref immediately (interceptor reads this synchronously)
    accessTokenRef.current = newToken
    // Update state (triggers re-render, but interceptor doesn't wait for this)
    setAccessToken(newToken)
    return newToken
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, accessToken, loading, login, logout, refreshToken }}
    >
      {children}
    </AuthContext.Provider>
  )
}