import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import Button from '../components/Button.jsx'
import Input from '../components/Input.jsx'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import Toast from '../components/Toast.jsx'

function Login() {
  const [email, setEmail] = useState(import.meta.env.VITE_DEV_EMAIL || '')
  const [password, setPassword] = useState(import.meta.env.VITE_DEV_PASSWORD || '')
  const [isLoading, setIsLoading] = useState(false)
  const [toast, setToast] = useState(null)
  
  const { login } = useAuth()
  const navigate = useNavigate()

  // Limpiar toast al cambiar campos
  const handleInputChange = () => {
    if (toast) setToast(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setToast(null)

    try {
      const result = await login(email, password)
      
      if (result.success) {
        // Redirigir según rol
        if (result.user?.role === 'Cliente') {
          navigate('/my-tickets')
        } else {
          navigate('/dashboard')
        }
      } else {
        setToast({ type: 'error', message: result.error || 'Credenciales inválidas' })
      }
    } catch (err) {
      // El error ya fue manejado en AuthContext
      setToast({ type: 'error', message: err.message })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-zinc-50 dark:bg-zinc-950">
      {/* Left — brand panel */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] bg-zinc-100 border-r border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 p-12 shrink-0">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 bg-cyan-400 flex items-center justify-center">
              <svg className="w-5 h-5 text-zinc-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="text-base font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">TicketFlow</span>
          </div>
          <p className="mt-12 text-3xl font-bold text-zinc-900 dark:text-zinc-50 leading-snug">
            Soporte técnico<br />
            <span className="text-cyan-500 dark:text-cyan-400">sin fricciones.</span>
          </p>
          <p className="mt-4 text-sm text-zinc-500 leading-relaxed">
            Gestiona tickets de soporte, prioriza incidencias y mantén a tu equipo alineado en un solo lugar.
          </p>
        </div>
        <div className="space-y-3">
          {[
            { label: 'Priorización automática', sub: 'Por severidad y tiempo de respuesta' },
            { label: 'Multi-rol', sub: 'Admin, Agente y Cliente' },
            { label: 'Tiempo real', sub: 'Actualizaciones cada 30 segundos' },
          ].map(({ label, sub }) => (
            <div key={label} className="flex items-start space-x-3">
              <div className="w-1 h-1 bg-cyan-400 mt-2 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{label}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-600">{sub}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-zinc-400 dark:text-zinc-700">© 2024 TicketFlow</p>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Toast notifications */}
          {toast && (
            <Toast
              type={toast.type}
              message={toast.message}
              onClose={() => setToast(null)}
            />
          )}

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center space-x-2.5 mb-8">
            <div className="w-7 h-7 bg-cyan-400 flex items-center justify-center">
              <svg className="w-4 h-4 text-zinc-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">TicketFlow</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Iniciar sesión</h1>
            <p className="text-sm text-zinc-500 mt-1">Ingresa tus credenciales para continuar</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-2">
                Correo electrónico
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); handleInputChange() }}
                placeholder="nombre@empresa.com"
                disabled={isLoading}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-2">
                Contraseña
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); handleInputChange() }}
                placeholder="••••••••"
                disabled={isLoading}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full justify-center"
              disabled={isLoading || !email || !password}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <LoadingSpinner size="sm" />
                  Iniciando sesión...
                </span>
              ) : (
                'Iniciar sesión'
              )}
            </Button>
          </form>

          {/* Quick-login dev switcher */}
          {import.meta.env.VITE_MOCK_MODE === 'true' && (
            <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800">
              <p className="text-xs text-zinc-400 dark:text-zinc-600 mb-3">Acceso rápido — modo demo</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { email: import.meta.env.VITE_DEV_EMAIL,  pass: import.meta.env.VITE_DEV_PASSWORD,  name: 'Demo User',  role: 'Admin'  },
                  { email: import.meta.env.VITE_DEV_EMAIL2, pass: import.meta.env.VITE_DEV_PASSWORD2, name: 'Carlos L.',  role: 'Agente' },
                  { email: import.meta.env.VITE_DEV_EMAIL3, pass: import.meta.env.VITE_DEV_PASSWORD3, name: 'María G.',   role: 'Cliente'},
                ].map(({ email: e, pass: p, name, role }) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => { setEmail(e); setPassword(p); if (toast) setToast(null) }}
                    className="flex flex-col items-start px-3 py-2.5 border border-zinc-300 dark:border-zinc-800 hover:border-cyan-500 dark:hover:border-cyan-800 hover:bg-cyan-50 dark:hover:bg-cyan-950/30 transition-colors text-left"
                  >
                    <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{name}</span>
                    <span className="text-xs text-zinc-400 dark:text-zinc-600 mt-0.5">{role}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Login
