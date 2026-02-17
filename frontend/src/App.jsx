import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider }      from './context/AuthContext'
import ProtectedRoute        from './components/ProtectedRoute'
import LoginPage             from './pages/LoginPage'
import RegisterPage          from './pages/RegisterPage'
import OAuthCallbackPage     from './pages/OAuthCallbackPage'
import DashboardPage         from './pages/DashboardPage'
import AnalyzePage           from './pages/AnalyzePage'
import ResultsPage           from './pages/ResultsPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Public routes ────────────────────────────────────── */}
          <Route path="/login"          element={<LoginPage />} />
          <Route path="/register"       element={<RegisterPage />} />
          <Route path="/oauth-callback" element={<OAuthCallbackPage />} />

          {/* ── Protected routes (requires auth) ─────────────────── */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard"   element={<DashboardPage />} />
            <Route path="/analyze"     element={<AnalyzePage />} />
            <Route path="/results/:id" element={<ResultsPage />} />
          </Route>

          {/* ── Default redirect ──────────────────────────────────── */}
          <Route path="/"  element={<Navigate to="/dashboard" replace />} />
          <Route path="*"  element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}