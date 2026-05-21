import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext.jsx'
import MainLayout from './layouts/MainLayout.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import CreateTicket from './pages/CreateTicket.jsx'
import Alerts from './pages/Alerts.jsx'
import MyTickets from './pages/MyTickets.jsx'
import AgentAdmin from './pages/AgentAdmin.jsx'
import './App.css'

// Redirect authenticated users to their home based on role
function RoleHome() {
  const { user } = useAuth()
  if (user?.role === 'Cliente') return <Navigate to="/my-tickets" replace />
  return <Navigate to="/dashboard" replace />
}

// Guard: requires authentication; optionally restricts by role
function Protected({ roles, children }) {
  const { isAuthenticated, user } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user?.role)) return <RoleHome />
  return (
    <MainLayout>
      {children}
    </MainLayout>
  )
}

function App() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-zinc-500">Cargando TicketFlow...</p>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Login — redirige al inicio de rol si ya autenticado */}
        <Route
          path="/login"
          element={isAuthenticated ? <RoleHome /> : <Login />}
        />

        {/* Admin + Agente */}
        <Route path="/dashboard"
          element={<Protected roles={['Admin', 'Agente']}><Dashboard /></Protected>}
        />
        <Route path="/alerts"
          element={<Protected roles={['Admin', 'Agente']}><Alerts /></Protected>}
        />

        {/* Todos los roles autenticados */}
        <Route path="/create-ticket"
          element={<Protected><CreateTicket /></Protected>}
        />

        {/* Solo Admin */}
        <Route path="/agent-admin"
          element={<Protected roles={['Admin']}><AgentAdmin /></Protected>}
        />

        {/* Solo Cliente */}
        <Route path="/my-tickets"
          element={<Protected roles={['Cliente']}><MyTickets /></Protected>}
        />

        {/* Raíz → inicio de rol */}
        <Route path="/" element={isAuthenticated ? <RoleHome /> : <Navigate to="/login" replace />} />
        <Route path="*" element={isAuthenticated ? <RoleHome /> : <Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

