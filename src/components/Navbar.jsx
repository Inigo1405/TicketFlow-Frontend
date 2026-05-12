import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useTheme } from '../contexts/ThemeContext.jsx'

function Navbar() {
  const { user, logout } = useAuth()
  const { isDark, toggle } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navLinks = user?.role === 'Cliente'
    ? [
        { to: '/my-tickets',    label: 'Mis Tickets' },
        { to: '/create-ticket', label: 'Nuevo Ticket' },
      ]
    : [
        { to: '/dashboard', label: 'Dashboard' },
        { to: '/alerts',    label: 'Alertas' },
      ]

  return (
    <nav className="bg-zinc-100 border-b border-zinc-300 dark:bg-zinc-950 dark:border-zinc-800 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center space-x-8">
            <Link to={user?.role === 'Cliente' ? '/my-tickets' : '/dashboard'} className="flex items-center space-x-2.5">
              <div className="w-7 h-7 bg-cyan-400 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-zinc-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">TicketFlow</span>
            </Link>

            {/* Nav links */}
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                    location.pathname === to
                      ? 'text-cyan-600 dark:text-cyan-400'
                      : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Derecha */}
          <div className="flex items-center space-x-2">
            {/* Theme toggle */}
            <button
              onClick={toggle}
              className="p-1.5 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-900 transition-colors"
              title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              aria-label={isDark ? 'Modo claro' : 'Modo oscuro'}
            >
              {isDark ? (
                /* Sun icon — switch to light */
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                /* Moon icon — switch to dark */
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {user && (
              <div className="hidden md:flex items-center space-x-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 bg-zinc-200 border border-zinc-300 dark:bg-zinc-800 dark:border-zinc-700 flex items-center justify-center">
                    <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400">
                      {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="hidden lg:block">
                    <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{user.name || user.email}</p>
                    <p className="text-xs text-zinc-500">{user.role || 'Usuario'}</p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="text-zinc-500 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-900"
              title="Salir"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar

