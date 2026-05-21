import axios from 'axios'

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000, // 10 segundos de timeout
  headers: {
    'Content-Type': 'application/json',
  },
})

// Almacenar request ID para trazabilidad (opcional)
let requestIdCounter = 0

// Interceptor de solicitud: agregar request_id y token
api.interceptors.request.use(
  (config) => {
    // Generar request_id único para cada solicitud
    config.headers['X-Request-ID'] = `req-${++requestIdCounter}`
    
    // Obtener token del localStorage
    const token = localStorage.getItem('token')
    
    // Agregar token a las cabeceras si existe
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor de respuesta: manejo de errores global
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Manejo de errores específicos
    
    // Error 503: Servicio no disponible
    if (error.response?.status === 503) {
      console.error('Servicio no disponible')
      // El error ya fue manejado en el interceptor global
      return Promise.reject(error)
    }
    
    // Error 401: No autorizado - redirigir a login
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
      return Promise.reject(new Error('Sesión expirada. Por favor, inicie sesión.'))
    }
    
    // Error 403: No autorizado (acceso denegado)
    if (error.response?.status === 403) {
      return Promise.reject(new Error('No tiene permisos para acceder a este recurso.'))
    }
    
    // Error 404: No encontrado
    if (error.response?.status === 404) {
      return Promise.reject(new Error('Recurso no encontrado.'))
    }
    
    // Error 500-599: Errores del servidor
    if (error.response?.status >= 500) {
      return Promise.reject(
        new Error(`Error del servidor (${error.response.status}): ${error.response.data?.message || 'Intente más tarde'}`)
      )
    }
    
    // Error 422: Validación fallida
    if (error.response?.status === 422) {
      return Promise.reject(new Error(error.response.data?.message || 'Datos inválidos'))
    }
    
    // Error 429: Rate limiting
    if (error.response?.status === 429) {
      return Promise.reject(new Error('Demasiadas solicitudes. Por favor, espere un momento.'))
    }
    
    // Timeout (ECONNABORTED)
    if (error.code === 'ECONNABORTED') {
      console.error('Solicitud timeout')
      return Promise.reject(new Error('La solicitud tomó demasiado tiempo. Por favor, intente nuevamente.'))
    }
    
    // Error de red
    if (error.code === 'NETWORK' || error.message === 'Network Error') {
      console.error('Error de red')
      return Promise.reject(new Error('No se pudo conectar con el servidor. Verifique su conexión a internet.'))
    }
    
    // Error genérico
    return Promise.reject(new Error(error.message || 'Ocurrió un error inesperado'))
  }
)

// Exportar instancia de API
export default api
