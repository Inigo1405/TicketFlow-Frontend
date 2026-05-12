import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Validar autenticación al montar el componente
  useEffect(() => {
    const validateAuth = async () => {
      try {
        const token = localStorage.getItem('token')
        
        if (!token) {
          // No hay token, desautenticar
          setIsLoading(false)
          return
        }

        // Validar token con /auth/me
        const response = await api.get('/auth/me')
        
        if (response.data && response.data.user) {
          setUser(response.data.user)
          localStorage.setItem('user', JSON.stringify(response.data.user))
        } else {
          // Token inválido, limpiar
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        }
      } catch (err) {
        // Error al validar (401, timeout, etc.)
        console.error('Error validando autenticación:', err)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      } finally {
        setIsLoading(false)
      }
    }

    validateAuth()
  }, [])

  // Función para iniciar sesión
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      
      const { token, user } = response.data
      
      if (token && user) {
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        setUser(user)
        setError(null)
        
        return { success: true, user }
      }
      
      return { success: false, error: 'Credenciales inválidas' }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al iniciar sesión'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    }
  }

  // Función para cerrar sesión
  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setError(null)
  }

  // Obtener usuario actual
  const getUser = () => {
    const storedUser = localStorage.getItem('user')
    return storedUser ? JSON.parse(storedUser) : null
  }

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    logout,
    getUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook para usar en componentes
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider')
  }
  return context
}
