// hooks/useAxios.js
import { useRef, useEffect } from 'react'
import axios from 'axios'
import useAuth from './useAuth'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Create ONE axios instance for the entire app lifetime — never recreated
const axiosInstance = axios.create({
  baseURL:         API,
  withCredentials: true,
})

export default function useAxios() {
  const { accessToken, refreshToken, logout } = useAuth()

  // Mutable refs so interceptor closures always read the latest values
  // without needing to be recreated when token changes
  const tokenRef        = useRef(accessToken)
  const refreshTokenRef = useRef(refreshToken)
  const logoutRef       = useRef(logout)
  const isRefreshing    = useRef(false)
  const failedQueue     = useRef([])

  // Keep refs in sync on every render — no re-registration of interceptors
  tokenRef.current        = accessToken
  refreshTokenRef.current = refreshToken
  logoutRef.current       = logout

  useEffect(() => {
    // ── Request interceptor: always attach the current token ──────────────
    const reqId = axiosInstance.interceptors.request.use((config) => {
      const token = tokenRef.current
      if (token) {
        config.headers = config.headers || {}
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })

    // ── Response interceptor: handle 401 TOKEN_EXPIRED ────────────────────
    const resId = axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const original = error.config

        // Only intercept token-expired 401s, and only once per request
        if (
          error.response?.status === 401 &&
          error.response?.data?.code === 'TOKEN_EXPIRED' &&
          !original._retry
        ) {
          original._retry = true

          // If a refresh is already in flight, queue this request
          if (isRefreshing.current) {
            return new Promise((resolve, reject) => {
              failedQueue.current.push({ resolve, reject })
            })
              .then((newToken) => {
                original.headers.Authorization = `Bearer ${newToken}`
                return axiosInstance(original)
              })
              .catch((err) => Promise.reject(err))
          }

          // Start refreshing
          isRefreshing.current = true

          try {
            const newToken = await refreshTokenRef.current()

            // Flush the queue — all waiting requests get the new token
            failedQueue.current.forEach(({ resolve }) => resolve(newToken))
            failedQueue.current = []

            // Retry the original request with new token
            original.headers.Authorization = `Bearer ${newToken}`
            return axiosInstance(original)

          } catch (refreshErr) {
            // Refresh failed → flush queue with error, force logout
            failedQueue.current.forEach(({ reject }) => reject(refreshErr))
            failedQueue.current = []
            logoutRef.current()
            return Promise.reject(refreshErr)

          } finally {
            isRefreshing.current = false
          }
        }

        return Promise.reject(error)
      }
    )

    // Cleanup interceptors when component unmounts
    return () => {
      axiosInstance.interceptors.request.eject(reqId)
      axiosInstance.interceptors.response.eject(resId)
    }
  }, []) // Empty deps: register once, refs handle live values

  return axiosInstance
}