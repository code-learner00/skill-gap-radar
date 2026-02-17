import { NavLink, useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate         = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <NavLink to="/dashboard" className="navbar-brand">
        📡 Skill Gap Radar
      </NavLink>

      <div className="navbar-links">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/analyze"
          className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
        >
          Analyze
        </NavLink>

        {user && (
          <span className="nav-user">
            {user.displayName || user.email}
          </span>
        )}

        <button className="btn-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  )
}